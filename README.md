# Activity Monitor & ML Analytics Platform

A comprehensive full-stack desktop activity monitoring system and intelligent analytics platform. It automatically tracks user interactions, captures context, and uses **Machine Learning to provide productivity insights, peak hour forecasting, and burnout risk analysis**.

![Activity Monitor](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌐 Live Deployment
The application is fully deployed and accessible online! Check out the live version:
- **Frontend (Vercel)**: [https://activity-monitor-seven.vercel.app](https://activity-monitor-seven.vercel.app)
- **Backend API (Render)**: [https://activity-monitor-qmx3.onrender.com/docs](https://activity-monitor-qmx3.onrender.com/docs) *(Swagger UI)*

## 📚 Documentation
- **[User Guide](USER_GUIDE.md)**: A non-technical guide to understanding productivity scores, uploading data, and using the web platform.
- **[Developer Guide](DEVELOPER_GUIDE.md)**: Comprehensive technical documentation covering local setup, PyInstaller building, cloud deployment, and system diagnostics.

## ✨ Core Features

### 🧠 ML-Powered Analytics
- **Smart CSV Data Import**: Upload historical activity data in *any* CSV format. The intelligent column-mapping engine automatically detects column names.
- **Productivity Scoring**: AI-driven categorization of apps into Deep Work, Communication, and Distraction.
- **Burnout Risk Detection**: Analyzes working hours, session lengths, and overtime.
- **Peak Hour Forecasting**: Predictive algorithms analyze your daily patterns to highlight your most productive hours.

### 🕵️‍♂️ Monitoring Engine
- **Real-time Activity Tracking**: Mouse and keyboard input detection.
- **Window Detection**: Automatically identifies active applications and window titles.
- **Idle Detection**: Configurable timeout to detect user inactivity.
- **Backend Service**: Runs silently in the background.

### 📊 Modern Web Dashboard
- **Sleek UI/UX**: State-of-the-art dark theme, glassmorphism UI, and smooth Framer Motion animations.
- **Interactive Charts**: Rendered with Recharts for App Distribution, Activity Timelines, and Top Applications.
- **Data Export**: Export your processed analytics and sessions to CSV.

## 🚀 Quick Start (Local Setup)

For full development setup, please read the **[Developer Guide](DEVELOPER_GUIDE.md)**.

**1. Clone the repository**
```bash
git clone <repository-url>
cd activity-monitor
```

**2. Start Backend (Terminal 1)**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py --mode headless
```

**3. Start Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:3000`** to access the dashboard!

## 🔐 Security & Privacy

**Data Privacy First**: This application tracks sensitive user activity (`app_name`, `window_title`, timestamps).
- All desktop data is tracked locally and stored in a local SQLite database (unexposed externally by default).
- If deploying to a wider group/team, ensure you have explicit consent from users being tracked.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
