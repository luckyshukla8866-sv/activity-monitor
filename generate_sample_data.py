"""
Generate a realistic 30-day activity CSV for the Activity Monitor app.
Produces ~1,500-2,000 rows of believable productivity data.
"""

import csv
import random
from datetime import datetime, timedelta

random.seed(42)

# ── App Profiles ──────────────────────────────────────────────────────
# Each app has realistic window titles and usage patterns
APPS = {
    "VS Code": {
        "weight": 30,  # percentage of total sessions
        "titles": [
            "main.py - activity-monitor",
            "database.py - activity-monitor",
            "page.tsx - frontend",
            "api.ts - frontend/lib",
            "styles.css - frontend",
            "README.md - activity-monitor",
            "config.py - backend",
            "models.py - backend/api",
            "insights.py - backend/api/routes",
            "package.json - frontend",
            "Untitled-1 - VS Code",
            "settings.json - User Settings",
        ],
        "duration_range": (120, 5400),   # 2 min – 90 min
        "peak_hours": list(range(9, 18)),  # 9 AM – 5 PM
        "clicks_range": (5, 200),
        "keys_range": (50, 3000),
    },
    "Google Chrome": {
        "weight": 25,
        "titles": [
            "Stack Overflow - How to fix CORS error",
            "GitHub - luckyshukla8866-sv/activity-monitor",
            "Render Dashboard",
            "Vercel – activity-monitor",
            "ChatGPT",
            "Google Search - python sqlalchemy postgresql",
            "MDN Web Docs - CSS Grid",
            "Tailwind CSS - Utility-First CSS Framework",
            "Next.js Documentation",
            "FastAPI - Swagger UI",
            "localhost:3000 - Activity Monitor",
            "Gmail - Inbox (3)",
            "Google Calendar - Week View",
            "Hacker News",
        ],
        "duration_range": (30, 3600),   # 30 sec – 60 min
        "peak_hours": list(range(8, 22)),  # broader range
        "clicks_range": (10, 300),
        "keys_range": (5, 500),
    },
    "Slack": {
        "weight": 15,
        "titles": [
            "#general - Team Workspace",
            "#dev-backend - Team Workspace",
            "#random - Team Workspace",
            "Direct Message - Sarah K.",
            "Direct Message - Project Lead",
            "#standup - Team Workspace",
            "#code-review - Team Workspace",
            "Huddle - Team Sync",
            "#deployment - Team Workspace",
        ],
        "duration_range": (30, 1800),   # 30 sec – 30 min
        "peak_hours": list(range(9, 19)),
        "clicks_range": (3, 50),
        "keys_range": (10, 400),
    },
    "Notion": {
        "weight": 12,
        "titles": [
            "Sprint Planning - Q1 2026",
            "Project Roadmap",
            "Meeting Notes - Weekly Sync",
            "API Documentation",
            "Bug Tracker",
            "Personal Journal",
            "Learning Resources",
            "Architecture Decisions",
            "Deployment Checklist",
        ],
        "duration_range": (60, 2400),   # 1 min – 40 min
        "peak_hours": list(range(9, 17)),
        "clicks_range": (5, 80),
        "keys_range": (20, 800),
    },
    "YouTube": {
        "weight": 8,
        "titles": [
            "Fireship - 100 seconds of PostgreSQL",
            "Theo - Next.js 14 deep dive",
            "Traversy Media - FastAPI crash course",
            "3Blue1Brown - Neural networks",
            "Lofi Girl - beats to study to",
            "TechWorld with Nana - Docker Tutorial",
            "Web Dev Simplified - React hooks",
            "Coding Train - Creative coding",
        ],
        "duration_range": (120, 3600),  # 2 min – 60 min
        "peak_hours": [8, 12, 13, 18, 19, 20, 21, 22],  # breaks + evening
        "clicks_range": (1, 15),
        "keys_range": (0, 10),
    },
    "Terminal": {
        "weight": 5,
        "titles": [
            "PowerShell - npm run dev",
            "PowerShell - python main.py",
            "PowerShell - git push origin main",
            "PowerShell - alembic upgrade head",
            "PowerShell - pip install -r requirements.txt",
            "PowerShell - docker compose up",
        ],
        "duration_range": (10, 600),    # 10 sec – 10 min
        "peak_hours": list(range(9, 18)),
        "clicks_range": (1, 20),
        "keys_range": (5, 200),
    },
    "Figma": {
        "weight": 3,
        "titles": [
            "Activity Monitor - Dashboard Redesign",
            "Component Library v2",
            "Mobile Responsive Layouts",
            "Icon Set - Custom",
        ],
        "duration_range": (300, 3600),  # 5 min – 60 min
        "peak_hours": [10, 11, 14, 15, 16],
        "clicks_range": (20, 400),
        "keys_range": (5, 100),
    },
    "Spotify": {
        "weight": 2,
        "titles": [
            "Chill Coding Playlist",
            "Deep Focus - Spotify",
            "Lo-Fi Beats",
            "Discover Weekly",
        ],
        "duration_range": (600, 7200),  # 10 min – 2 hrs (background)
        "peak_hours": list(range(9, 22)),
        "clicks_range": (1, 5),
        "keys_range": (0, 2),
    },
}


def pick_app() -> str:
    """Weighted random app selection."""
    apps = list(APPS.keys())
    weights = [APPS[a]["weight"] for a in apps]
    return random.choices(apps, weights=weights, k=1)[0]


def generate_sessions(start_date: datetime, num_days: int = 30) -> list:
    """Generate realistic activity sessions over num_days."""
    sessions = []

    for day_offset in range(num_days):
        current_date = start_date + timedelta(days=day_offset)
        weekday = current_date.weekday()  # 0=Mon, 6=Sun

        # Weekends have fewer sessions
        if weekday >= 5:  # Saturday/Sunday
            num_sessions = random.randint(5, 15)
            work_start = random.randint(10, 13)
            work_end = random.randint(16, 20)
        else:
            # Weekdays — vary by "energy" of the day
            if weekday == 0:  # Monday — ramp up
                num_sessions = random.randint(30, 50)
            elif weekday == 4:  # Friday — wind down
                num_sessions = random.randint(25, 45)
            else:  # Tue-Thu — peak productivity
                num_sessions = random.randint(40, 65)
            work_start = random.randint(8, 10)
            work_end = random.randint(17, 21)

        # Generate sessions throughout the day
        current_time = current_date.replace(
            hour=work_start,
            minute=random.randint(0, 30),
            second=0,
            microsecond=0,
        )
        end_of_day = current_date.replace(
            hour=work_end, minute=0, second=0, microsecond=0
        )

        for _ in range(num_sessions):
            if current_time >= end_of_day:
                break

            app = pick_app()
            profile = APPS[app]

            # Bias towards peak hours for this app
            hour = current_time.hour
            if hour in profile["peak_hours"]:
                dur_min, dur_max = profile["duration_range"]
            else:
                # Shorter sessions outside peak hours
                dur_min, dur_max = profile["duration_range"]
                dur_max = max(dur_min, dur_max // 3)

            duration = random.randint(dur_min, dur_max)
            title = random.choice(profile["titles"])
            clicks = random.randint(*profile["clicks_range"])
            keys = random.randint(*profile["keys_range"])

            end_time = current_time + timedelta(seconds=duration)

            sessions.append({
                "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "app_name": app,
                "window_title": title,
                "duration_seconds": duration,
                "end_time": end_time.strftime("%Y-%m-%d %H:%M:%S"),
                "mouse_clicks": clicks,
                "key_presses": keys,
            })

            # Gap between sessions (1-15 min, sometimes longer)
            gap = random.randint(60, 900)
            # Occasional lunch break (longer gap around noon)
            if 12 <= current_time.hour <= 13 and random.random() < 0.3:
                gap = random.randint(1800, 3600)  # 30-60 min lunch

            current_time = end_time + timedelta(seconds=gap)

    return sessions


def main():
    # Start 30 days ago from "today"
    start_date = datetime(2026, 2, 15)  # Feb 15 – Mar 16, 2026
    sessions = generate_sessions(start_date, num_days=30)

    # Sort by timestamp
    sessions.sort(key=lambda s: s["timestamp"])

    output_path = "sample_data.csv"
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "timestamp", "app_name", "window_title",
            "duration_seconds", "end_time",
            "mouse_clicks", "key_presses",
        ])
        writer.writeheader()
        writer.writerows(sessions)

    print(f"[OK] Generated {len(sessions)} sessions over 30 days")
    print(f"Saved to: {output_path}")

    # Quick stats
    apps_count = {}
    total_hours = 0
    for s in sessions:
        apps_count[s["app_name"]] = apps_count.get(s["app_name"], 0) + 1
        total_hours += s["duration_seconds"] / 3600

    print(f"\nStats:")
    print(f"   Total tracked time: {total_hours:.1f} hours")
    print(f"   Date range: {sessions[0]['timestamp'][:10]} -> {sessions[-1]['timestamp'][:10]}")
    print(f"\n   App breakdown:")
    for app, count in sorted(apps_count.items(), key=lambda x: -x[1]):
        pct = count / len(sessions) * 100
        print(f"     {app:20s}  {count:4d} sessions  ({pct:.1f}%)")


if __name__ == "__main__":
    main()
