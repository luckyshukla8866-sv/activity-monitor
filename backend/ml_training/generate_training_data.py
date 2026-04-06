"""
Generate training data for productivity classifier.
Creates 500+ labeled examples as (app_name, window_title, category)
Categories: deep_work, communication, distraction, neutral

Run: python generate_training_data.py
"""

import pandas as pd
import random
import os

# ──────────────────────────────────────────────────────────────────────
# 1. Core app → category mapping with realistic window titles
# ──────────────────────────────────────────────────────────────────────

DEEP_WORK_APPS = {
    "Visual Studio Code": [
        "main.py — activity-monitor — Visual Studio Code",
        "index.tsx — frontend — Visual Studio Code",
        "utils.py — backend — Visual Studio Code",
        "docker-compose.yml — Visual Studio Code",
        "README.md — activity-monitor — Visual Studio Code",
        "settings.json — Visual Studio Code",
        "api_routes.py — Visual Studio Code",
        "models.py — backend — Visual Studio Code",
        "schema.prisma — Visual Studio Code",
        "tailwind.config.js — Visual Studio Code",
        "Untitled-1 — Visual Studio Code",
        ".env — Visual Studio Code",
        "app.py — Visual Studio Code",
        "test_api.py — Visual Studio Code",
        "database.py — Visual Studio Code",
    ],
    "PyCharm": [
        "main.py — activity-monitor — PyCharm",
        "PyCharm — Run: pytest",
        "PyCharm — Debug: main.py",
        "models.py — PyCharm Professional",
        "requirements.txt — PyCharm",
        "alembic.ini — PyCharm",
        "PyCharm — Project Structure",
        "views.py — PyCharm Professional",
    ],
    "IntelliJ IDEA": [
        "IntelliJ IDEA — Main.java",
        "IntelliJ IDEA — pom.xml",
        "IntelliJ IDEA — Build Running",
        "IntelliJ IDEA — ApplicationService.java",
    ],
    "Sublime Text": [
        "config.yaml — Sublime Text",
        "notes.md — Sublime Text",
        "script.sh — Sublime Text",
        "Sublime Text — Find in Files",
    ],
    "Terminal": [
        "Terminal — python main.py",
        "Terminal — npm run dev",
        "Terminal — git push origin main",
        "Terminal — docker-compose up",
        "Terminal — ssh user@server",
        "Terminal — pip install -r requirements.txt",
        "Terminal — pytest -v",
        "Terminal — alembic upgrade head",
        "Terminal — uvicorn app:app --reload",
        "zsh — Terminal",
        "bash — Terminal",
        "PowerShell",
    ],
    "Windows Terminal": [
        "Windows Terminal — PowerShell",
        "Windows Terminal — Ubuntu",
        "Windows Terminal — Command Prompt",
        "Windows Terminal — git log",
    ],
    "iTerm2": [
        "iTerm2 — python manage.py runserver",
        "iTerm2 — docker ps",
        "iTerm2 — npm test",
    ],
    "Figma": [
        "Figma — Dashboard Redesign",
        "Figma — Mobile App Wireframes",
        "Figma — Design System v2",
        "Figma — Landing Page Mockup",
        "Figma — User Flow Diagram",
        "Figma — Component Library",
        "Figma — Prototype Review",
    ],
    "Notion": [
        "Notion — Sprint Planning Q2",
        "Notion — API Documentation",
        "Notion — Technical Spec: Auth System",
        "Notion — Meeting Notes — Backend Sync",
        "Notion — Roadmap 2026",
        "Notion — Architecture Decision Records",
        "Notion — Bug Tracker",
        "Notion — Onboarding Guide",
    ],
    "Obsidian": [
        "Obsidian — Research Notes",
        "Obsidian — System Design Notes",
        "Obsidian — Daily Log",
        "Obsidian — Learning Kubernetes",
    ],
    "Jupyter Notebook": [
        "Jupyter Notebook — data_analysis.ipynb",
        "Jupyter Notebook — model_training.ipynb",
        "Jupyter Notebook — EDA.ipynb",
        "Jupyter Notebook — feature_engineering.ipynb",
        "Jupyter Notebook — visualization.ipynb",
    ],
    "JupyterLab": [
        "JupyterLab — experiment_01.ipynb",
        "JupyterLab — data_cleaning.ipynb",
    ],
    "Postman": [
        "Postman — GET /api/users",
        "Postman — POST /api/auth/login",
        "Postman — Activity Monitor API Collection",
        "Postman — PUT /api/sessions/123",
        "Postman — Testing Environment",
    ],
    "Docker Desktop": [
        "Docker Desktop — Containers",
        "Docker Desktop — Images",
        "Docker Desktop — Volumes",
        "Docker Desktop — activity-monitor-backend",
    ],
    "GitKraken": [
        "GitKraken — activity-monitor",
        "GitKraken — Merge Branch",
        "GitKraken — Commit History",
    ],
    "Linear": [
        "Linear — BACKEND-142: Fix auth middleware",
        "Linear — Sprint 14 Board",
        "Linear — FRONTEND-89: Dashboard charts",
        "Linear — Backlog",
        "Linear — My Issues",
    ],
    "Jira": [
        "Jira — PROJ-456 Fix login bug",
        "Jira — Sprint Board",
        "Jira — Backlog Grooming",
        "Jira — PROJ-789 API rate limiting",
    ],
    "Xcode": [
        "Xcode — MyApp — ContentView.swift",
        "Xcode — Build Succeeded",
        "Xcode — Debug Navigator",
    ],
    "Android Studio": [
        "Android Studio — MainActivity.kt",
        "Android Studio — Build: Gradle sync",
        "Android Studio — Layout Editor",
    ],
    "DBeaver": [
        "DBeaver — PostgreSQL — activity_monitor",
        "DBeaver — SQL Editor — Query 1",
        "DBeaver — ER Diagram",
    ],
    "pgAdmin": [
        "pgAdmin 4 — activity_monitor_db",
        "pgAdmin 4 — Query Tool",
    ],
    "TablePlus": [
        "TablePlus — production_db",
        "TablePlus — Query Editor",
    ],
}

COMMUNICATION_APPS = {
    "Slack": [
        "Slack — #backend-team",
        "Slack — #general",
        "Slack — Direct Message — John",
        "Slack — #code-review",
        "Slack — #random",
        "Slack — Huddle — Backend Sync",
        "Slack — #deployments",
        "Slack — Thread — API discussion",
        "Slack — #help-desk",
    ],
    "Microsoft Teams": [
        "Microsoft Teams — Daily Standup",
        "Microsoft Teams — Chat — Project Alpha",
        "Microsoft Teams — Meeting — Sprint Review",
        "Microsoft Teams — General Channel",
        "Microsoft Teams — Files — Shared Documents",
        "Microsoft Teams — Call with Design Team",
    ],
    "Zoom": [
        "Zoom Meeting — Weekly Sync",
        "Zoom — 1:1 with Manager",
        "Zoom — Team Retrospective",
        "Zoom — Client Demo",
        "Zoom — Interview: Senior Developer",
        "Zoom — Waiting Room",
    ],
    "Google Meet": [
        "Google Meet — Design Review",
        "Google Meet — Team Standup",
        "Google Meet — 1:1 Catchup",
        "Google Meet — All Hands Meeting",
    ],
    "Gmail": [
        "Gmail — Inbox (42)",
        "Gmail — Re: Project Update",
        "Gmail — Draft: Quarterly Report",
        "Gmail — Sent — Deployment notification",
        "Gmail — Code Review Request",
        "Gmail — Starred — Important threads",
    ],
    "Outlook": [
        "Outlook — Inbox — Microsoft Outlook",
        "Outlook — Calendar — Sprint Planning",
        "Outlook — RE: Budget Approval",
        "Outlook — New Email",
        "Outlook — Meeting Request — Architecture Review",
    ],
    "Discord": [
        "Discord — #dev-help — Python Server",
        "Discord — Voice — Study Group",
        "Discord — #open-source — Contributions",
        "Discord — DM — Pair Programming",
    ],
    "WhatsApp": [
        "WhatsApp",
        "WhatsApp — Work Group",
        "WhatsApp — Chat — Team Updates",
        "WhatsApp Web",
    ],
    "Telegram": [
        "Telegram — Tech Channel",
        "Telegram — Group Chat — Friends",
        "Telegram — Saved Messages",
        "Telegram Desktop",
    ],
    "Thunderbird": [
        "Thunderbird — Inbox",
        "Thunderbird — Compose: Re: Meeting",
    ],
    "Apple Mail": [
        "Mail — Inbox (12)",
        "Mail — Compose — Project Update",
    ],
}

DISTRACTION_APPS = {
    "YouTube": [
        "YouTube — How to mass produce a song in 5 minutes",
        "YouTube — Funny Cat Compilation 2026",
        "YouTube — Mr Beast — Last to Leave Circle Wins",
        "YouTube — Lofi Hip Hop Radio — beats to study to",
        "YouTube — Home",
        "YouTube — Shorts",
        "YouTube — Subscriptions",
        "YouTube — Watch Later",
        "YouTube — Top 10 Netflix Shows 2026",
    ],
    "Netflix": [
        "Netflix — Stranger Things S5",
        "Netflix — Browse",
        "Netflix — Continue Watching",
        "Netflix — The Night Agent",
        "Netflix — My List",
        "Netflix — Trending Now",
    ],
    "Prime Video": [
        "Prime Video — The Boys S4",
        "Prime Video — Browse",
        "Prime Video — Watch Party",
    ],
    "Disney+": [
        "Disney+ — The Mandalorian",
        "Disney+ — Home",
    ],
    "Twitter": [
        "Twitter — Home",
        "Twitter / X — Trending",
        "X — Home / X",
        "X — Notifications",
        "X — For You",
        "Twitter — @elonmusk",
    ],
    "Reddit": [
        "Reddit — r/programming",
        "Reddit — r/funny — Top Posts",
        "Reddit — r/AskReddit",
        "Reddit — Home",
        "Reddit — r/memes",
        "Reddit — r/wallstreetbets",
        "Reddit — r/gaming",
    ],
    "Instagram": [
        "Instagram",
        "Instagram — Feed",
        "Instagram — Reels",
        "Instagram — Explore",
        "Instagram — Stories",
        "Instagram — Direct Messages",
    ],
    "Facebook": [
        "Facebook",
        "Facebook — News Feed",
        "Facebook — Marketplace",
        "Facebook — Groups",
        "Facebook — Watch",
    ],
    "TikTok": [
        "TikTok — For You",
        "TikTok — Following",
        "TikTok — Discover",
        "TikTok — Live",
    ],
    "Twitch": [
        "Twitch — Shroud playing Valorant",
        "Twitch — Browse — Just Chatting",
        "Twitch — Following",
        "Twitch — xQc Live",
    ],
    "Amazon": [
        "Amazon.com — Shopping Cart",
        "Amazon — Today's Deals",
        "Amazon — Your Orders",
        "Amazon — Search: mechanical keyboard",
    ],
    "Flipkart": [
        "Flipkart — Big Billion Days",
        "Flipkart — Electronics Sale",
        "Flipkart — Cart",
    ],
    "Spotify": [
        "Spotify — Discover Weekly",
        "Spotify — Daily Mix 1",
        "Spotify — Liked Songs",
    ],
    "Apple Music": [
        "Apple Music — For You",
        "Apple Music — Browse",
    ],
    "Steam": [
        "Steam — Store",
        "Steam — Library",
        "Steam — Community Market",
    ],
    "Epic Games": [
        "Epic Games Launcher",
        "Epic Games — Store — Free Games",
    ],
}

NEUTRAL_APPS = {
    "File Explorer": [
        "File Explorer — Documents",
        "File Explorer — Downloads",
        "File Explorer — This PC",
        "File Explorer — Desktop",
        "File Explorer — Projects",
    ],
    "Finder": [
        "Finder — Applications",
        "Finder — Documents",
        "Finder — Downloads",
    ],
    "Settings": [
        "Settings — System",
        "Settings — Display",
        "Settings — Network & Internet",
        "Settings — Privacy & Security",
        "Settings — Windows Update",
    ],
    "System Preferences": [
        "System Preferences — General",
        "System Preferences — Network",
    ],
    "Calculator": [
        "Calculator",
        "Calculator — Standard",
        "Calculator — Scientific",
    ],
    "Notepad": [
        "Notepad — Untitled",
        "Notepad — notes.txt",
        "Notepad — todo.txt",
    ],
    "TextEdit": [
        "TextEdit — Untitled",
        "TextEdit — quick_notes.txt",
    ],
    "Preview": [
        "Preview — screenshot.png",
        "Preview — document.pdf",
    ],
    "Photos": [
        "Photos — Library",
        "Photos — Recent",
    ],
    "Snipping Tool": [
        "Snipping Tool",
        "Snip & Sketch",
    ],
    "Task Manager": [
        "Task Manager",
        "Task Manager — Performance",
    ],
    "Activity Monitor (macOS)": [
        "Activity Monitor — CPU",
        "Activity Monitor — Memory",
    ],
    "Calendar": [
        "Calendar — April 2026",
        "Calendar — Week View",
    ],
    "Clock": [
        "Clock — Alarm",
        "Clock — Timer",
    ],
    "Microsoft Word": [
        "Document1 — Word",
        "Report_Q1.docx — Word",
        "Resume.docx — Microsoft Word",
    ],
    "Microsoft Excel": [
        "Book1 — Excel",
        "Budget_2026.xlsx — Excel",
        "Data.xlsx — Microsoft Excel",
    ],
    "Microsoft PowerPoint": [
        "Presentation1 — PowerPoint",
        "Quarterly Review.pptx — PowerPoint",
    ],
    "Google Docs": [
        "Google Docs — Untitled Document",
        "Google Docs — Meeting Notes",
    ],
    "Google Sheets": [
        "Google Sheets — Budget Tracker",
        "Google Sheets — Untitled spreadsheet",
    ],
    "1Password": [
        "1Password — Vault",
        "1Password — Login",
    ],
    "Bitwarden": [
        "Bitwarden — Vault",
    ],
}

# ──────────────────────────────────────────────────────────────────────
# 2. Ambiguous / noisy browser-based examples
#    (Chrome/Firefox/Edge with context-dependent titles)
# ──────────────────────────────────────────────────────────────────────

BROWSER_TITLES = {
    "deep_work": [
        "GitHub — luckyshukla8866-sv/activity-monitor",
        "GitHub — Pull Request #42: Fix auth middleware",
        "GitHub — Issues — activity-monitor",
        "GitHub — Actions — CI/CD Pipeline",
        "GitHub — Code Review — main.py",
        "GitLab — Merge Request !15",
        "GitLab — Pipeline #4521 passed",
        "Stack Overflow — How to fix CORS in FastAPI",
        "Stack Overflow — SQLAlchemy async session best practices",
        "Stack Overflow — React useEffect cleanup",
        "Stack Overflow — Python typing: Optional vs Union",
        "MDN Web Docs — Fetch API",
        "MDN Web Docs — CSS Grid Layout",
        "React Documentation — Hooks at a Glance",
        "Next.js Docs — App Router",
        "FastAPI — Request Body — Documentation",
        "FastAPI — Dependency Injection — Docs",
        "Python Docs — asyncio",
        "TypeScript Handbook — Generics",
        "Tailwind CSS — Documentation",
        "Vercel — Deployments — activity-monitor",
        "Render — Dashboard — Backend Service",
        "AWS Console — EC2 Instances",
        "Google Cloud Console — Cloud Run",
        "Docker Hub — python:3.11-slim",
        "npm — axios package",
        "PyPI — SQLAlchemy",
        "Dev.to — Building REST APIs with FastAPI",
        "Medium — System Design Interview Prep",
        "Hashnode — Understanding JWT Authentication",
        "ChatGPT — Debug Python error",
        "Claude — Explain async/await",
        "LeetCode — Two Sum — Python",
        "LeetCode — Binary Tree Level Order",
        "HackerRank — Python Challenges",
        "Kaggle — Titanic Dataset",
        "Coursera — Machine Learning Specialization",
        "Udemy — Complete Python Bootcamp",
        "freeCodeCamp — JavaScript Algorithms",
        "W3Schools — SQL Tutorial",
        "GeeksforGeeks — Dynamic Programming",
        "Codeforces — Round 900",
        "Confluence — Backend Architecture",
        "Trello — Sprint Board",
        "Asana — Project Tasks",
        "ClickUp — Development Tasks",
    ],
    "communication": [
        "Gmail — Inbox (42) — Google Chrome",
        "Outlook — Mail — Microsoft Edge",
        "Google Meet — Team Standup",
        "Slack — App — Google Chrome",
        "Discord — Web App",
        "WhatsApp Web",
        "Telegram Web — Chat",
        "LinkedIn — Messages",
        "LinkedIn — Feed",
        "Microsoft Teams — Web App",
    ],
    "distraction": [
        "YouTube — Trending Videos",
        "YouTube — Music — Chill Playlist",
        "Netflix — Watch Party",
        "Twitter / X — Home Timeline",
        "Reddit — r/memes — Hot",
        "Reddit — r/todayilearned",
        "Instagram — Web",
        "Facebook — News Feed",
        "9GAG — Trending",
        "Imgur — Most Viral",
        "Amazon — Deal of the Day",
        "eBay — Search: vintage watches",
        "Flipkart — Mobile Phones",
        "Myntra — Men's Fashion",
        "Pinterest — Home Feed",
        "Tumblr — Dashboard",
        "Hacker News — Show HN" ,  # borderline but categorized as distraction for browsing
        "Product Hunt — Today's Top Products",
        "BuzzFeed — Trending",
        "ESPN — Scores",
        "cricbuzz — Live Score",
    ],
    "neutral": [
        "Google — Search",
        "Google — Maps",
        "Google Drive — My Drive",
        "Google Calendar — Week View",
        "Wikipedia — Python (programming language)",
        "Wikipedia — Machine Learning",
        "New Tab",
        "about:blank",
        "Downloads",
        "Chrome Web Store",
        "Firefox Add-ons",
        "Speedtest by Ookla",
        "Weather.com — Forecast",
        "Google Translate",
    ],
}

BROWSERS = ["Google Chrome", "Firefox", "Microsoft Edge", "Brave", "Safari", "Arc"]


def generate_data() -> list[tuple[str, str, str]]:
    """Generate all training examples."""
    data: list[tuple[str, str, str]] = []

    # ── Native app examples ──────────────────────────────────────────
    for category, apps in [
        ("deep_work", DEEP_WORK_APPS),
        ("communication", COMMUNICATION_APPS),
        ("distraction", DISTRACTION_APPS),
        ("neutral", NEUTRAL_APPS),
    ]:
        for app_name, titles in apps.items():
            for title in titles:
                data.append((app_name, title, category))

    # ── Browser-based examples (ambiguous by app, clear by title) ───
    for category, titles in BROWSER_TITLES.items():
        for title in titles:
            browser = random.choice(BROWSERS)
            # Sometimes the title includes the browser, sometimes not
            if random.random() < 0.4:
                window_title = f"{title} — {browser}"
            else:
                window_title = title
            data.append((browser, window_title, category))

    # ── Extra ambiguous / edge cases ─────────────────────────────────
    edge_cases = [
        # Chrome with deep_work context
        ("Google Chrome", "localhost:3000 — Dashboard", "deep_work"),
        ("Google Chrome", "localhost:8000/docs — Swagger UI", "deep_work"),
        ("Google Chrome", "127.0.0.1:5173 — Vite App", "deep_work"),
        ("Google Chrome", "Figma — Dashboard Redesign — Google Chrome", "deep_work"),
        ("Firefox", "CodePen — CSS Animation Experiment", "deep_work"),
        ("Firefox", "JSFiddle — API Test", "deep_work"),
        ("Google Chrome", "Replit — Python Project", "deep_work"),
        ("Google Chrome", "CodeSandbox — React App", "deep_work"),
        ("Microsoft Edge", "Azure DevOps — Pipeline Runs", "deep_work"),
        ("Google Chrome", "Supabase — Database", "deep_work"),
        ("Google Chrome", "Firebase Console — Authentication", "deep_work"),

        # Chrome with communication context
        ("Google Chrome", "mail.google.com — Inbox", "communication"),
        ("Google Chrome", "teams.microsoft.com — Chat", "communication"),
        ("Firefox", "web.whatsapp.com", "communication"),
        ("Google Chrome", "meet.google.com — Meeting", "communication"),
        ("Microsoft Edge", "outlook.office.com — Mail", "communication"),
        ("Brave", "discord.com — Server — #general", "communication"),

        # Chrome with distraction context
        ("Google Chrome", "youtube.com — Home", "distraction"),
        ("Google Chrome", "reddit.com — r/funny", "distraction"),
        ("Firefox", "twitter.com — For You", "distraction"),
        ("Google Chrome", "netflix.com — Browse", "distraction"),
        ("Google Chrome", "twitch.tv — Browse", "distraction"),
        ("Microsoft Edge", "amazon.com — Today's Deals", "distraction"),
        ("Google Chrome", "instagram.com — Feed", "distraction"),
        ("Brave", "tiktok.com — For You", "distraction"),
        ("Google Chrome", "facebook.com — Notifications", "distraction"),
        ("Firefox", "9gag.com — Trending", "distraction"),

        # Chrome with neutral context
        ("Google Chrome", "Google Search — weather today", "neutral"),
        ("Google Chrome", "drive.google.com — My Drive", "neutral"),
        ("Firefox", "google.com — Search", "neutral"),
        ("Google Chrome", "docs.google.com — Untitled Document", "neutral"),
        ("Microsoft Edge", "bing.com — Search", "neutral"),
        ("Google Chrome", "calendar.google.com — This Week", "neutral"),
        ("Google Chrome", "translate.google.com", "neutral"),

        # Music while working (neutral — background activity)
        ("Spotify", "Spotify — Deep Focus Playlist", "neutral"),
        ("Spotify", "Spotify — Coding Music", "neutral"),
        ("Apple Music", "Apple Music — Lo-fi Beats", "neutral"),

        # Miscellaneous edge cases
        ("Zoom", "Zoom — Screen Share — VS Code", "communication"),
        ("Slack", "Slack — #code-review — PR #42 Discussion", "communication"),
        ("Notion", "Notion — Personal Journal", "neutral"),
        ("Notion", "Notion — Grocery List", "neutral"),
        ("Google Chrome", "ChatGPT — Help me write a regex", "deep_work"),
        ("Google Chrome", "Perplexity — How does CORS work?", "deep_work"),
        ("Google Chrome", "Claude — Explain Python decorators", "deep_work"),

        # Games (distraction)
        ("Valorant", "Valorant", "distraction"),
        ("Minecraft", "Minecraft 1.20.4", "distraction"),
        ("League of Legends", "League of Legends", "distraction"),
        ("Fortnite", "Fortnite — Battle Royale", "distraction"),
        ("Counter-Strike 2", "Counter-Strike 2", "distraction"),
        ("Apex Legends", "Apex Legends — Lobby", "distraction"),

        # System utilities (neutral)
        ("Windows Security", "Windows Security — Virus & Threat Protection", "neutral"),
        ("Disk Cleanup", "Disk Cleanup — C:", "neutral"),
        ("Control Panel", "Control Panel — Programs and Features", "neutral"),
        ("System Information", "System Information", "neutral"),
        ("Device Manager", "Device Manager", "neutral"),
        ("Paint", "Paint — Untitled", "neutral"),
        ("Clipboard", "Clipboard History", "neutral"),
    ]
    data.extend(edge_cases)

    # ── Duplicate some common patterns with slight variation ─────────
    variations = [
        ("Visual Studio Code", "app.tsx — my-project — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "server.js — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "styles.css — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "Dockerfile — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "package.json — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "Welcome — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "Extensions — Visual Studio Code", "deep_work"),
        ("PyCharm", "settings.py — django-app — PyCharm", "deep_work"),
        ("PyCharm", "urls.py — PyCharm Professional", "deep_work"),
        ("Terminal", "Terminal — cargo build", "deep_work"),
        ("Terminal", "Terminal — go run main.go", "deep_work"),
        ("Terminal", "Terminal — kubectl get pods", "deep_work"),
        ("Terminal", "Terminal — terraform plan", "deep_work"),
        ("Slack", "Slack — #incident-response", "communication"),
        ("Slack", "Slack — #standup", "communication"),
        ("Slack", "Slack — #design", "communication"),
        ("Microsoft Teams", "Microsoft Teams — Call — Architecture Review", "communication"),
        ("Microsoft Teams", "Microsoft Teams — #engineering", "communication"),
        ("Zoom", "Zoom — Webinar: Tech Talk", "communication"),
        ("Zoom", "Zoom — Breakout Room 1", "communication"),
        ("Gmail", "Gmail — Compose — Weekly Update", "communication"),
        ("Gmail", "Gmail — RE: Deployment Status", "communication"),
        ("YouTube", "YouTube — How to grow on social media", "distraction"),
        ("YouTube", "YouTube — Best fails compilation", "distraction"),
        ("YouTube", "YouTube — ASMR cooking", "distraction"),
        ("Reddit", "Reddit — r/relationship_advice", "distraction"),
        ("Reddit", "Reddit — r/tifu — HOT", "distraction"),
        ("Twitter", "X — Trending — #WorldCup", "distraction"),
        ("Instagram", "Instagram — @username Stories", "distraction"),
        ("Netflix", "Netflix — Squid Game S2", "distraction"),
        ("File Explorer", "File Explorer — C:\\Users\\Lucky\\Projects", "neutral"),
        ("File Explorer", "File Explorer — Recycle Bin", "neutral"),
        ("Settings", "Settings — Bluetooth & Devices", "neutral"),
        ("Settings", "Settings — Apps & Features", "neutral"),
        ("Calculator", "Calculator — Programmer", "neutral"),
        ("Microsoft Word", "Thesis_Chapter3.docx — Word", "neutral"),
        ("Microsoft Excel", "Expense_Tracker.xlsx — Excel", "neutral"),
        ("Microsoft PowerPoint", "Team_Offsite.pptx — PowerPoint", "neutral"),
        ("Google Chrome", "Notion — API Docs — Google Chrome", "deep_work"),
        ("Google Chrome", "Linear — Sprint Board — Google Chrome", "deep_work"),
        ("Google Chrome", "Jira — PROJ-101 — Google Chrome", "deep_work"),
        ("Firefox", "GitHub — Pull Requests — Firefox", "deep_work"),
        ("Google Chrome", "YouTube — JavaScript Tutorial for Beginners", "deep_work"),
        ("Google Chrome", "YouTube — FastAPI Full Course 2026", "deep_work"),
        ("Firefox", "Udemy — Docker Mastery — Firefox", "deep_work"),

        # ── Extra entries to reach 500+ ──────────────────────────────
        # More deep_work
        ("Visual Studio Code", "tsconfig.json — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "jest.config.ts — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "middleware.ts — Visual Studio Code", "deep_work"),
        ("Visual Studio Code", "layout.tsx — app — Visual Studio Code", "deep_work"),
        ("Terminal", "Terminal — make build", "deep_work"),
        ("Terminal", "Terminal — yarn install", "deep_work"),
        ("Terminal", "Terminal — python -m pytest --cov", "deep_work"),
        ("Terminal", "Terminal — git rebase -i HEAD~5", "deep_work"),
        ("Postman", "Postman — DELETE /api/sessions/42", "deep_work"),
        ("Postman", "Postman — PATCH /api/users/me", "deep_work"),
        ("Figma", "Figma — Icon Set v3", "deep_work"),
        ("Figma", "Figma — Onboarding Screens", "deep_work"),
        ("Google Chrome", "Vercel — Logs — activity-monitor", "deep_work"),
        ("Google Chrome", "Netlify — Deploy Preview #87", "deep_work"),
        ("Firefox", "MDN — Array.prototype.map() — Firefox", "deep_work"),

        # More communication
        ("Slack", "Slack — #frontend-team", "communication"),
        ("Slack", "Slack — DM — Sarah — File shared", "communication"),
        ("Microsoft Teams", "Microsoft Teams — Whiteboard Session", "communication"),
        ("Zoom", "Zoom — All-Hands Q2 Kickoff", "communication"),
        ("Zoom", "Zoom — Pair Programming Session", "communication"),
        ("Gmail", "Gmail — Forwarded: CI Pipeline Failed", "communication"),
        ("Discord", "Discord — #help — React Server", "communication"),
        ("Google Chrome", "LinkedIn — Job Alerts — Google Chrome", "communication"),

        # More distraction
        ("YouTube", "YouTube — Top 10 Anime Fights", "distraction"),
        ("YouTube", "YouTube — Reacting to Old Videos", "distraction"),
        ("Reddit", "Reddit — r/pics — Best of 2026", "distraction"),
        ("Reddit", "Reddit — r/movies — Oscar Predictions", "distraction"),
        ("Twitter", "X — #TechTwitter — Trending", "distraction"),
        ("Facebook", "Facebook — Events — Weekend Party", "distraction"),
        ("TikTok", "TikTok — Trending Sounds", "distraction"),
        ("Twitch", "Twitch — Pokimane — Just Chatting", "distraction"),
        ("Netflix", "Netflix — New Releases — April 2026", "distraction"),
        ("Steam", "Steam — Wishlist", "distraction"),

        # More neutral
        ("File Explorer", "File Explorer — Network", "neutral"),
        ("Settings", "Settings — Time & Language", "neutral"),
        ("Settings", "Settings — Personalization", "neutral"),
        ("Notepad", "Notepad — scratch.txt", "neutral"),
        ("Microsoft Word", "Cover_Letter.docx — Word", "neutral"),
        ("Microsoft Excel", "Attendance.xlsx — Excel", "neutral"),
        ("Google Sheets", "Google Sheets — Team Schedule", "neutral"),
        ("Google Docs", "Google Docs — Project Brief", "neutral"),
        ("Photos", "Photos — Screenshots", "neutral"),
        ("Calendar", "Calendar — Today's Agenda", "neutral"),
    ]
    data.extend(variations)

    return data


def main():
    random.seed(42)

    print("[*] Generating training data for productivity classifier...\n")

    data = generate_data()
    random.shuffle(data)

    df = pd.DataFrame(data, columns=["app_name", "window_title", "category"])

    # Save to CSV
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "training_data.csv")
    df.to_csv(output_path, index=False)

    # Print summary
    print(f"[OK] Generated {len(df)} training examples")
    print(f"[>>] Saved to: {output_path}\n")
    print("[#] Examples per category:")
    print("-" * 35)
    category_counts = df["category"].value_counts().sort_index()
    for category, count in category_counts.items():
        pct = count / len(df) * 100
        print(f"   {category:<20} {count:>4}  ({pct:.1f}%)")
    print("-" * 35)
    print(f"   {'TOTAL':<20} {len(df):>4}")

    # Show a few random examples
    print("\n[?] Sample entries:")
    print("-" * 80)
    for _, row in df.sample(8, random_state=42).iterrows():
        print(f"   [{row['category']:<15}] {row['app_name']:<25} | {row['window_title']}")


if __name__ == "__main__":
    main()
