"""
Seed data for cloud deployments.
Populates the database with realistic demo data so the dashboard
and ML features show meaningful insights when accessed online.
"""

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from api.models import User, ActivitySession
from api.auth import get_password_hash


# Realistic app names and window titles
DEMO_APPS = [
    # Deep Work apps (high productivity)
    ("Visual Studio Code", [
        "main.py - activity-monitor",
        "api.ts - frontend",
        "database.py - backend",
        "README.md - Preview",
        "settings.json",
        "classifier.py - ml_engine",
    ]),
    ("Google Chrome", [
        "GitHub - Pull Request #42",
        "Stack Overflow - Python async",
        "Google Docs - Project Plan",
        "MDN Web Docs - Fetch API",
        "FastAPI Documentation",
    ]),
    ("Terminal", [
        "PowerShell - npm run dev",
        "PowerShell - python main.py",
        "Git Bash - git status",
    ]),
    ("Postman", [
        "Activity Monitor API",
        "GET /api/sessions",
        "POST /api/insights/upload",
    ]),
    ("Figma", [
        "Dashboard Redesign",
        "Mobile App Mockup",
        "Component Library",
    ]),
    ("Notepad++", [
        "notes.txt",
        "config.yaml",
        "todo.md",
    ]),

    # Communication apps (medium productivity)
    ("Microsoft Teams", [
        "Team Chat - Engineering",
        "Meeting: Sprint Planning",
        "Call with Client",
        "General Channel",
    ]),
    ("Slack", [
        "#dev-discussion",
        "#general",
        "DM: Project Update",
        "#random",
    ]),

    # Distraction apps (low productivity)
    ("Google Chrome", [
        "YouTube - Tech Talk",
        "YouTube - Music Mix",
        "Reddit - r/programming",
        "Twitter - Feed",
    ]),
    ("Spotify", [
        "Lo-fi Beats - Playlist",
        "Focus Flow",
    ]),
    ("File Explorer", [
        "Downloads",
        "Documents > Projects",
        "Desktop",
    ]),
]

# App weight profiles: (app_name, window_title, duration_range, weight)
# Higher weight = appears more often
WORK_PROFILES = {
    "productive": [
        ("Visual Studio Code", 0.30),
        ("Google Chrome", 0.20),     # Will get productive Chrome titles
        ("Terminal", 0.10),
        ("Postman", 0.08),
        ("Figma", 0.05),
        ("Notepad++", 0.02),
        ("Microsoft Teams", 0.10),
        ("Slack", 0.08),
        ("Spotify", 0.05),
        ("File Explorer", 0.02),
    ],
    "distracted": [
        ("Visual Studio Code", 0.10),
        ("Google Chrome", 0.35),     # Will get distraction Chrome titles
        ("Terminal", 0.03),
        ("Postman", 0.02),
        ("Microsoft Teams", 0.05),
        ("Slack", 0.15),
        ("Spotify", 0.15),
        ("File Explorer", 0.10),
        ("Figma", 0.03),
        ("Notepad++", 0.02),
    ],
}


def _pick_app_and_title(profile: str, hour: int) -> tuple:
    """Pick an app and window title based on profile and time of day."""
    weights = WORK_PROFILES[profile]
    apps, probs = zip(*weights)
    app_name = random.choices(apps, weights=probs, k=1)[0]

    # Find matching titles for this app
    for name, titles in DEMO_APPS:
        if name == app_name:
            # For Chrome, differentiate productive vs distraction
            if app_name == "Google Chrome":
                if profile == "distracted" or hour >= 17:
                    # Pick from distraction titles
                    distraction_titles = [t for t in titles if any(
                        kw in t.lower() for kw in ["youtube", "reddit", "twitter"]
                    )]
                    if distraction_titles:
                        return app_name, random.choice(distraction_titles)
                else:
                    # Pick from productive titles
                    productive_titles = [t for t in titles if not any(
                        kw in t.lower() for kw in ["youtube", "reddit", "twitter"]
                    )]
                    if productive_titles:
                        return app_name, random.choice(productive_titles)
            return app_name, random.choice(titles)

    return app_name, "Unknown"


def seed_demo_data(db: Session) -> bool:
    """
    Populate the database with realistic demo data.
    Returns True if data was seeded, False if data already exists.
    """
    existing_sessions = db.query(ActivitySession).count()
    if existing_sessions > 0:
        return False

    user = db.query(User).filter(User.username == "cloud_user").first()
    if not user:
        user = User(
            username="cloud_user",
            password_hash=get_password_hash("default_password"),
            device_name="Cloud Server",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    now = datetime.utcnow()
    sessions_created = 0

    for days_ago in range(14):
        day = now - timedelta(days=days_ago)
        day_of_week = day.weekday()  # 0=Mon, 6=Sun

        # Skip some weekends (less activity)
        if day_of_week >= 5 and random.random() < 0.5:
            continue

        # Vary work hours to create interesting patterns
        # Days 0-4 (recent): slightly longer hours (simulates increasing workload)
        # Days 5-9: normal hours
        # Days 10-13: lighter hours
        if days_ago <= 4:
            work_start = random.randint(8, 9)
            work_end = random.randint(18, 21)   # Some late nights recently
            profile = random.choice(["productive", "productive", "distracted"])
        elif days_ago <= 9:
            work_start = random.randint(9, 10)
            work_end = random.randint(17, 18)
            profile = random.choice(["productive", "productive", "productive"])
        else:
            work_start = random.randint(9, 10)
            work_end = random.randint(16, 17)
            profile = "productive"

        current_time = day.replace(
            hour=work_start, minute=random.randint(0, 30),
            second=0, microsecond=0,
        )
        day_end = day.replace(hour=work_end, minute=0, second=0)

        while current_time < day_end:
            hour = current_time.hour
            app_name, window_title = _pick_app_and_title(profile, hour)

            # Duration based on app type
            if app_name in ("Visual Studio Code", "Google Chrome", "Figma"):
                duration = random.randint(120, 2700)  # 2-45 min
            elif app_name in ("Microsoft Teams", "Slack"):
                duration = random.randint(60, 1200)   # 1-20 min
            elif app_name in ("Spotify", "File Explorer"):
                duration = random.randint(30, 300)    # 30s-5 min
            else:
                duration = random.randint(60, 900)    # 1-15 min

            end_time = current_time + timedelta(seconds=duration)
            if end_time > day_end:
                end_time = day_end
                duration = int((end_time - current_time).total_seconds())

            if duration <= 0:
                break

            # Input density varies: VS Code gets high inputs, Spotify gets low
            if app_name in ("Visual Studio Code", "Terminal", "Notepad++"):
                clicks = random.randint(20, 200)
                keys = random.randint(100, 2000)
            elif app_name in ("Spotify", "File Explorer"):
                clicks = random.randint(1, 20)
                keys = random.randint(0, 10)
            else:
                clicks = random.randint(10, 300)
                keys = random.randint(5, 500)

            session = ActivitySession(
                user_id=user.id,
                app_name=app_name,
                window_title=window_title,
                process_id=random.randint(1000, 50000),
                start_time=current_time,
                end_time=end_time,
                duration_seconds=duration,
                mouse_clicks=clicks,
                key_presses=keys,
            )
            db.add(session)
            sessions_created += 1

            # Gap between sessions
            gap = random.randint(0, 300)
            current_time = end_time + timedelta(seconds=gap)

    db.commit()
    print(f"[OK] Seeded {sessions_created} demo sessions for the past 14 days")
    return True
