"""
Seed data for cloud deployments.
Populates the database with realistic demo data so the dashboard
looks fully functional when accessed online.
"""

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from api.models import User, ActivitySession
from api.auth import get_password_hash


# Realistic app names and window titles
DEMO_APPS = [
    ("Google Chrome", [
        "GitHub - Pull Request #42",
        "Stack Overflow - Python async",
        "ChatGPT",
        "YouTube - Tech Talk",
        "Gmail - Inbox",
        "Google Docs - Project Plan",
    ]),
    ("Visual Studio Code", [
        "main.py - activity-monitor",
        "api.ts - frontend",
        "database.py - backend",
        "README.md - Preview",
        "settings.json",
    ]),
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
    ("File Explorer", [
        "Downloads",
        "Documents > Projects",
        "Desktop",
    ]),
    ("Notepad++", [
        "notes.txt",
        "config.yaml",
        "todo.md",
    ]),
    ("Terminal", [
        "PowerShell - npm run dev",
        "PowerShell - python main.py",
        "Git Bash - git status",
    ]),
    ("Figma", [
        "Dashboard Redesign",
        "Mobile App Mockup",
        "Component Library",
    ]),
    ("Spotify", [
        "Lo-fi Beats - Playlist",
        "Focus Flow",
    ]),
    ("Postman", [
        "Activity Monitor API",
        "GET /api/sessions",
        "POST /api/monitoring/start",
    ]),
]


def seed_demo_data(db: Session) -> bool:
    """
    Populate the database with realistic demo data.
    Returns True if data was seeded, False if data already exists.
    """
    # Check if demo data already exists
    existing_sessions = db.query(ActivitySession).count()
    if existing_sessions > 0:
        return False  # Already has data

    # Get or create the cloud user
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

    # Generate sessions for the past 7 days
    now = datetime.utcnow()
    sessions_created = 0

    for days_ago in range(7):
        day = now - timedelta(days=days_ago)

        # Work day: 9 AM to 6 PM with varying intensity
        work_start_hour = 9
        work_end_hour = 18

        current_time = day.replace(
            hour=work_start_hour,
            minute=random.randint(0, 30),
            second=0,
            microsecond=0,
        )
        day_end = day.replace(hour=work_end_hour, minute=0, second=0)

        while current_time < day_end:
            # Pick a random app
            app_name, window_titles = random.choice(DEMO_APPS)
            window_title = random.choice(window_titles)

            # Random duration: 30 seconds to 45 minutes
            duration = random.randint(30, 2700)

            # More coding / browsing, less Spotify
            if app_name in ("Spotify", "File Explorer"):
                duration = random.randint(30, 300)
            elif app_name in ("Visual Studio Code", "Google Chrome"):
                duration = random.randint(120, 2700)

            end_time = current_time + timedelta(seconds=duration)
            if end_time > day_end:
                end_time = day_end
                duration = int((end_time - current_time).total_seconds())

            session = ActivitySession(
                user_id=user.id,
                app_name=app_name,
                window_title=window_title,
                process_id=random.randint(1000, 50000),
                start_time=current_time,
                end_time=end_time,
                duration_seconds=duration,
                mouse_clicks=random.randint(5, 500),
                key_presses=random.randint(10, 2000),
            )
            db.add(session)
            sessions_created += 1

            # Gap between sessions: 0–5 minutes
            gap = random.randint(0, 300)
            current_time = end_time + timedelta(seconds=gap)

    db.commit()
    print(f"[OK] Seeded {sessions_created} demo sessions for the past 7 days")
    return True
