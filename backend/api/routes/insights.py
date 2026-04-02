"""
ML Insights API routes.
Provides endpoints for productivity classification, burnout detection,
and productivity forecasting.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple
import csv
import io
import re
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from api.database import get_db
from api.models import User, ActivitySession
from api.auth import get_current_user
from api.schemas import DEMO_USERNAMES
from api.ml_engine.classifier import get_productivity_summary
from api.ml_engine.anomaly import detect_burnout
from api.ml_engine.forecasting import predict_peak_hours

router = APIRouter(prefix="/api/insights", tags=["insights"])


# ---------------------------------------------------------------------------
# Smart column-mapping configuration
# ---------------------------------------------------------------------------
# Maps each internal field to a list of possible column name patterns (lowercase).
# The mapper checks if any pattern is found *within* the normalised column header.
# Order matters: more specific patterns first to avoid false positives.
COLUMN_ALIASES: Dict[str, List[str]] = {
    "app_name": [
        "app_name", "app name", "appname",
        "application_name", "application name", "applicationname",
        "application", "program_name", "program name", "program",
        "software", "app", "process_name", "process name",
    ],
    "window_title": [
        "window_title", "window title", "windowtitle",
        "title", "tab_title", "tab title", "tab",
        "window", "page_title", "page title",
    ],
    "start_time": [
        "start_time", "start time", "starttime",
        "start_date", "start date", "startdate",
        "started_at", "started at", "begin_time", "begin time",
        "begin", "from_time", "from time", "from",
        "start_datetime", "start datetime",
        "start", "timestamp",
    ],
    "end_time": [
        "end_time", "end time", "endtime",
        "end_date", "end date", "enddate",
        "ended_at", "ended at", "finish_time", "finish time",
        "to_time", "to time", "to",
        "end_datetime", "end datetime",
        "stop_time", "stop time", "stop",
        "finish", "end",
    ],
    # NOTE: duration_minutes and duration_hours must come BEFORE
    # duration_seconds so the broad "duration" alias in duration_seconds
    # doesn't steal columns like "Duration Minutes".
    "duration_minutes": [
        "duration_minutes", "duration minutes",
        "duration_min", "duration min",
        "minutes", "mins", "time_minutes", "time minutes",
        "elapsed_minutes", "elapsed minutes",
    ],
    "duration_hours": [
        "duration_hours", "duration hours",
        "duration_hr", "duration hr",
        "hours", "hrs", "time_hours", "time hours",
        "elapsed_hours", "elapsed hours",
    ],
    "duration_seconds": [
        "duration_seconds", "duration seconds",
        "duration_sec", "duration sec",
        "duration_s", "durationseconds",
        "time_seconds", "time seconds",
        "elapsed_seconds", "elapsed seconds",
        "total_seconds", "total seconds",
        "seconds",
        "time_spent", "time spent", "timespent",
        "elapsed", "length",
        "duration",  # broad fallback — must be last
    ],
    "mouse_clicks": [
        "mouse_clicks", "mouse clicks", "mouseclicks",
        "clicks", "click_count", "click count",
        "mouse_click_count", "mouse click count",
        "total_clicks", "total clicks",
    ],
    "key_presses": [
        "key_presses", "key presses", "keypresses",
        "keystrokes", "key_strokes", "key strokes",
        "key_count", "key count", "keys",
        "key_press_count", "key press count",
        "total_keys", "total keys",
        "total_keystrokes", "total keystrokes",
    ],
}

# Fields the system absolutely needs (at minimum) to create a session.
# duration is soft-required: we can compute it from start + end times.
REQUIRED_FIELDS = {"app_name", "start_time"}

# Common datetime formats to try when ISO parsing fails
DATETIME_FORMATS = [
    "%Y-%m-%dT%H:%M:%S",        # 2026-03-10T09:00:00
    "%Y-%m-%dT%H:%M:%S.%f",     # 2026-03-10T09:00:00.000
    "%Y-%m-%d %H:%M:%S",        # 2026-03-10 09:00:00
    "%Y-%m-%d %H:%M:%S.%f",     # 2026-03-10 09:00:00.000
    "%Y-%m-%d %H:%M",           # 2026-03-10 09:00
    "%Y-%m-%d",                  # 2026-03-10
    "%m/%d/%Y %H:%M:%S",        # 03/10/2026 09:00:00
    "%m/%d/%Y %H:%M",           # 03/10/2026 09:00
    "%m/%d/%Y %I:%M:%S %p",     # 03/10/2026 09:00:00 AM
    "%m/%d/%Y %I:%M %p",        # 03/10/2026 09:00 AM
    "%m/%d/%Y",                  # 03/10/2026
    "%d/%m/%Y %H:%M:%S",        # 10/03/2026 09:00:00
    "%d/%m/%Y %H:%M",           # 10/03/2026 09:00
    "%d/%m/%Y",                  # 10/03/2026
    "%d-%m-%Y %H:%M:%S",        # 10-03-2026 09:00:00
    "%d-%m-%Y %H:%M",           # 10-03-2026 09:00
    "%d-%m-%Y",                  # 10-03-2026
    "%b %d, %Y %H:%M:%S",       # Mar 10, 2026 09:00:00
    "%b %d, %Y %H:%M",          # Mar 10, 2026 09:00
    "%b %d, %Y",                 # Mar 10, 2026
    "%B %d, %Y %H:%M:%S",       # March 10, 2026 09:00:00
    "%B %d, %Y",                 # March 10, 2026
    "%Y%m%d%H%M%S",             # 20260310090000  (compact)
    "%Y%m%d",                    # 20260310         (compact)
]


def _normalise(name: str) -> str:
    """Normalise a column header for fuzzy matching."""
    return re.sub(r"[^a-z0-9 ]", " ", name.lower()).strip()


def _build_column_map(csv_headers: List[str]) -> Dict[str, str]:
    """
    Build a mapping from internal field name → actual CSV column header.
    Returns only fields that could be matched.
    """
    mapping: Dict[str, str] = {}
    used_headers: set = set()

    for field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            for header in csv_headers:
                if header in used_headers:
                    continue
                norm = _normalise(header)
                if norm == alias or alias in norm:
                    mapping[field] = header
                    used_headers.add(header)
                    break
            if field in mapping:
                break

    return mapping


def _parse_datetime(value: str) -> Optional[datetime]:
    """Try to parse a datetime string using multiple formats."""
    value = value.strip()
    if not value:
        return None

    # Try ISO format first (fastest path)
    try:
        return datetime.fromisoformat(value)
    except (ValueError, TypeError):
        pass

    # Try all known formats
    for fmt in DATETIME_FORMATS:
        try:
            return datetime.strptime(value, fmt)
        except (ValueError, TypeError):
            continue

    # Last resort: try to parse as a Unix timestamp
    try:
        ts = float(value)
        if ts > 1e12:      # milliseconds
            ts = ts / 1000
        if 0 < ts < 4e9:   # reasonable range
            return datetime.fromtimestamp(ts)
    except (ValueError, TypeError):
        pass

    return None


def _parse_duration(row: dict, col_map: Dict[str, str]) -> Optional[float]:
    """
    Extract duration in seconds from the row.
    Tries duration_seconds, then duration_minutes, then duration_hours.
    """
    # Seconds
    if "duration_seconds" in col_map:
        raw = row.get(col_map["duration_seconds"], "").strip()
        if raw:
            try:
                return float(raw)
            except ValueError:
                pass

    # Minutes → convert to seconds
    if "duration_minutes" in col_map:
        raw = row.get(col_map["duration_minutes"], "").strip()
        if raw:
            try:
                return float(raw) * 60
            except ValueError:
                pass

    # Hours → convert to seconds
    if "duration_hours" in col_map:
        raw = row.get(col_map["duration_hours"], "").strip()
        if raw:
            try:
                return float(raw) * 3600
            except ValueError:
                pass

    return None


@router.get("/productivity")
async def get_productivity_insights(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get productivity classification and scoring.

    Returns category breakdown (Deep Work, Communication, Distraction),
    overall productivity score (0-100), and per-app scores.
    """
    return get_productivity_summary(db, current_user.id, days)


@router.get("/burnout")
async def get_burnout_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get burnout risk analysis.

    Returns risk level (LOW/MEDIUM/HIGH), warnings, daily work data,
    and recommendations.
    """
    return detect_burnout(db, current_user.id)


@router.get("/forecast")
async def get_forecast(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get productivity forecast.

    Returns predicted peak hours, hourly heatmap data,
    and a human-readable insight summary.
    """
    return predict_peak_hours(db, current_user.id, days)


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a CSV file of activity data.

    Accepts CSV files in **any column format**. The system will
    automatically detect and map columns as long as the required
    fields are present:

    Required: app_name (or similar), start_time (or similar)
    Soft-required: duration_seconds (can be computed from start/end times)
    Optional: window_title, end_time, mouse_clicks, key_presses,
              duration_minutes, duration_hours

    Supports multiple datetime formats (ISO, US, EU, Excel, Unix timestamps).
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    # Block demo users from uploading data
    if current_user.username in DEMO_USERNAMES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo accounts cannot upload data. Please register your own account to upload and analyze your activity data.",
        )

    try:
        contents = await file.read()
        # Use utf-8-sig to strip BOM that Windows apps (Excel) add
        text = contents.decode("utf-8-sig")

        # Auto-detect delimiter (comma, semicolon, tab, pipe)
        first_line = text.split("\n", 1)[0]
        delimiter = ","
        for sep in ["\t", ";", "|"]:
            if sep in first_line and first_line.count(sep) > first_line.count(","):
                delimiter = sep
                break

        reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
        csv_headers = list(reader.fieldnames or [])

        if not csv_headers:
            raise HTTPException(
                status_code=400,
                detail="CSV file appears to be empty or has no header row.",
            )

        # Build smart column map
        col_map = _build_column_map(csv_headers)

        # Check required fields are mapped
        missing = REQUIRED_FIELDS - set(col_map.keys())
        if missing:
            friendly = ", ".join(sorted(missing))
            found = ", ".join(csv_headers)
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Could not find required fields: {friendly}. "
                    f"Your CSV columns: {found}. "
                    f"Please ensure your file has columns for: "
                    f"application name and start time."
                ),
            )

        # Check that we have *some* way to determine duration
        has_duration_col = any(
            k in col_map
            for k in ("duration_seconds", "duration_minutes", "duration_hours")
        )
        has_end_time = "end_time" in col_map

        if not has_duration_col and not has_end_time:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not find a duration or end-time column. "
                    "Please include at least one of: duration (seconds/minutes/hours) "
                    "or an end-time column so the system can calculate session length. "
                    f"Your CSV columns: {', '.join(csv_headers)}"
                ),
            )

        # Process rows
        created = 0
        skipped = 0
        skipped_reasons: Dict[str, int] = {}

        for row_num, row in enumerate(reader, start=2):  # row 1 is header
            try:
                # --- App name (required) ---
                app_name = row.get(col_map["app_name"], "").strip()
                if not app_name:
                    skipped += 1
                    skipped_reasons["empty app_name"] = skipped_reasons.get("empty app_name", 0) + 1
                    continue

                # --- Start time (required) ---
                start_raw = row.get(col_map["start_time"], "").strip()
                start_time = _parse_datetime(start_raw)
                if not start_time:
                    skipped += 1
                    skipped_reasons["unparseable start_time"] = skipped_reasons.get("unparseable start_time", 0) + 1
                    continue

                # --- End time (optional) ---
                end_time = None
                if "end_time" in col_map:
                    end_raw = row.get(col_map["end_time"], "").strip()
                    end_time = _parse_datetime(end_raw)

                # --- Duration ---
                duration = _parse_duration(row, col_map)

                # Compute duration from start/end if not directly available
                if duration is None and end_time and start_time:
                    delta = (end_time - start_time).total_seconds()
                    if delta > 0:
                        duration = delta

                if duration is None or duration < 0:
                    skipped += 1
                    skipped_reasons["invalid/missing duration"] = skipped_reasons.get("invalid/missing duration", 0) + 1
                    continue

                # Compute end_time from start_time + duration if missing
                if end_time is None:
                    end_time = start_time + timedelta(seconds=duration)

                # --- Window title (optional) ---
                window_title = ""
                if "window_title" in col_map:
                    window_title = row.get(col_map["window_title"], "").strip()

                # --- Mouse clicks & key presses (optional) ---
                mouse_clicks = 0
                if "mouse_clicks" in col_map:
                    try:
                        mouse_clicks = int(float(row.get(col_map["mouse_clicks"], 0) or 0))
                    except (ValueError, TypeError):
                        pass

                key_presses = 0
                if "key_presses" in col_map:
                    try:
                        key_presses = int(float(row.get(col_map["key_presses"], 0) or 0))
                    except (ValueError, TypeError):
                        pass

                # --- Create session ---
                session = ActivitySession(
                    user_id=current_user.id,
                    app_name=app_name,
                    window_title=window_title,
                    process_id=None,
                    start_time=start_time,
                    end_time=end_time,
                    duration_seconds=duration,
                    mouse_clicks=mouse_clicks,
                    key_presses=key_presses,
                )
                db.add(session)
                created += 1

            except Exception:
                skipped += 1
                skipped_reasons["unexpected error"] = skipped_reasons.get("unexpected error", 0) + 1
                continue

        db.commit()

        # Build user-friendly column mapping report
        mapped_cols = {
            field: col_map[field]
            for field in col_map
            if field not in ("duration_minutes", "duration_hours")
        }
        # Show duration source
        for dur_field in ("duration_seconds", "duration_minutes", "duration_hours"):
            if dur_field in col_map:
                mapped_cols[dur_field] = col_map[dur_field]
                break

        response = {
            "success": True,
            "message": f"Successfully imported {created} session{'s' if created != 1 else ''}.",
            "sessions_created": created,
            "column_mapping": mapped_cols,
        }

        if skipped > 0:
            response["rows_skipped"] = skipped
            response["skip_reasons"] = skipped_reasons

        return response

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
