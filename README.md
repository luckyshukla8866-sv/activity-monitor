# Activity Monitor & ML Analytics Platform

A comprehensive full-stack desktop activity monitoring system and intelligent analytics platform. It automatically tracks user interactions, captures context, and—most importantly—uses **Machine Learning to provide productivity insights, peak hour forecasting, and burnout risk analysis**.

![Activity Monitor](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌐 Live Deployment
The application is fully deployed and accessible online! Check out the live version:
- **Frontend (Vercel)**: [https://activity-monitor-seven.vercel.app](https://activity-monitor-seven.vercel.app)
- **Backend API (Render)**: [https://activity-monitor-qmx3.onrender.com/docs](https://activity-monitor-qmx3.onrender.com/docs) *(Swagger UI)*

## ✨ Core Features

### 🧠 ML-Powered Analytics
- **Smart CSV Data Import**: Upload historical activity data in *any* CSV format. The intelligent column-mapping engine automatically detects column names (`app_name`, timestamps, and durations) bridging the gap between external data and internal analytics.
- **Productivity Scoring**: AI-driven categorization of apps into Deep Work, Communication, and Distraction to generate an overall productivity score.
- **Burnout Risk Detection**: Analyzes working hours, session lengths, and overtime to calculate a burnout risk score and provide actionable health recommendations.
- **Peak Hour Forecasting**: Predictive algorithms analyze your daily patterns to highlight your most productive hours.

### 🕵️‍♂️ Monitoring Engine
- **Real-time Activity Tracking**: Mouse and keyboard input detection.
- **Window Detection**: Automatically identifies active applications and window titles.
- **Idle Detection**: Configurable timeout to detect user inactivity.
- **Backend Service**: Runs silently in the background (system tray integration available).

### 📊 Modern Web Dashboard
- **Sleek UI/UX**: State-of-the-art dark theme, glassmorphism UI, and smooth Framer Motion animations.
- **Interactive Charts**: Rendered with Recharts for App Distribution, Activity Timelines, and Top Applications.
- **Session Browser**: Filter, manage, and bulk-delete recorded activity sessions.
- **Data Export**: Export your processed analytics and sessions to CSV.

## 🛠️ Technology Stack

**Frontend:**
- **Next.js 14** (App Router)
- **React & TypeScript**
- **Tailwind CSS** (with Glassmorphism design system)
- **Framer Motion** (Animations)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)

**Backend:**
- **Python 3.9+**
- **FastAPI** (High-performance REST API toolkit)
- **SQLAlchemy** (Database ORM)
- **Pandas / Built-in logic** (Data processing & ML Insights)
- **Pynput & Cryptography** (Monitoring & Security)

## 📋 Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 16 or higher (v18+ recommended)
- **npm**: 8 or higher
- **Windows**: Windows 10/11 (required for the desktop tracking engine modules)

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd activity-monitor
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # On Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env

# Initialize the database
python api/database.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Point to your local backend API
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
```

### 4. Run the Application

**Terminal 1 (Backend - API & Monitor):**
```bash
cd backend
venv\Scripts\activate

# Start the full application (Monitoring + API + Tray module)
python main.py --mode tray

# OR start just the API for testing the dashboard/upload flow without tracking:
# python main.py --mode api-only
```

**Terminal 2 (Frontend - Dashboard):**
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:3000`** in your browser. You will initially be greeted by the **Smart Upload Landing Page** where you can drag-and-drop a CSV file to instantly generate your dashboard metrics!

## 📖 Application Workflow

1. **Landing & Upload (`/`)**: Drop your activity CSV here safely. The smart endpoint parses it, maps the columns automatically, and handles data ingestion.
2. **Dashboard (`/dashboard`)**: Post-upload, you are swiftly redirected to the metrics dashboard showing an overview of Top Apps, Activity Timelines, and App Usage Distribution.
3. **ML Insights (`/insights`)**: Dive deep into app categorizations (Deep Work vs. Distraction) and view your overall mathematical Productivity Score.
4. **Forecast & Burnout (`/forecast`)**: Check your workload health, view predicted peak productivity hours, and get system warnings if you are at risk of burnout.
5. **Sessions (`/sessions`)**: View a raw log of all tracked/uploaded intervals, select rows to bulk-delete, or export your full history.

## 📂 Project Structure

```
activity-monitor/
├── backend/
│   ├── monitoring_engine/      # Background desktop tracking components
│   ├── api/                    # FastAPI routes, models, and ML calculation logic
│   │   ├── routes/             # Feature logic (insights.py, sessions.py, analytics.py)
│   │   ├── database.py         # SQLite connection setup
│   │   └── schemas.py          # Pydantic schemas for data validation
│   ├── config.py               # Environment configuration
│   └── main.py                 # Backend entry point
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing/Upload Page
│   │   ├── dashboard/          # Analytics Dashboard
│   │   ├── insights/           # ML Insights
│   │   └── forecast/           # Burnout & Peak Hours
│   ├── components/             # Reusable React components (Charts, AppShell, Sidebar)
│   ├── lib/                    # API client logic (Axios configuration)
│   └── public/                 # Static web assets
└── README.md
```

## 🔐 Security & Privacy

**Data Privacy First**: This application tracks sensitive user activity (`app_name`, `window_title`, timestamps).
- All desktop data is tracked locally and stored in a local SQLite database (unexposed externally by default).
- If deploying to a wider group/team, ensure you have explicit consent from users being tracked.
- The web frontend proxies requests locally (via Next.js rewrites natively or API routes) ensuring CORS safety and keeping internal services sealed.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
