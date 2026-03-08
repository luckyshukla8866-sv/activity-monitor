# Activity Monitoring and Analytics Web Application

A comprehensive full-stack desktop activity monitoring system that tracks user interactions, detects active applications, captures screenshots, and provides powerful analytics through a modern web dashboard.

![Activity Monitor](https://img.shields.io/badge/Python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

### Monitoring Engine
- **Real-time Activity Tracking**: Mouse and keyboard input detection
- **Window Detection**: Automatically identifies active applications and window titles
- **Idle Detection**: Configurable timeout to detect user inactivity
- **Screenshot Capture**: Periodic screenshots during active sessions with compression and encryption
- **Session Management**: Tracks application usage sessions with timestamps and duration
- **System Tray Integration**: Background service with start/stop controls

### Web Dashboard
- **Modern UI**: Dark theme with glassmorphism effects and smooth animations
- **Analytics Overview**: Total active hours, sessions, and app distribution
- **Interactive Charts**: Pie charts, line graphs, and bar charts for data visualization
- **Session Browser**: Filterable, paginated list of all activity sessions
- **Screenshot Viewer**: Grid view with modal zoom functionality
- **Data Export**: CSV export for external analysis
- **Responsive Design**: Works on desktop, tablet, and mobile

### Security & Privacy
- **Screenshot Encryption**: Fernet symmetric encryption for stored screenshots
- **Password Hashing**: bcrypt for secure user authentication
- **JWT Authentication**: Secure API access with token-based auth
- **RBAC**: Role-based access control for multi-user scenarios

### API & Interoperability
- **RESTful API**: Complete FastAPI backend with OpenAPI documentation
- **WebSocket Support**: Real-time updates for dashboard
- **Cross-language Compatible**: JSON API accessible from any programming language

## 📋 Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 16 or higher
- **npm**: 8 or higher
- **Windows**: Windows 10/11 (for full functionality)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd activity-monitor
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy .env.example .env

# Generate encryption key
python -c "from api.utils.encryption import EncryptionManager; print(EncryptionManager.generate_key())"

# Add the generated key to .env file as ENCRYPTION_KEY
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
```

### 4. Initialize Database

```bash
cd backend
python api/database.py
```

## 🚀 Running the Application

### Option 1: Full Application (Recommended)

Run the complete application with monitoring, API, and system tray:

```bash
cd backend
python main.py --mode tray
```

This starts:
- Activity monitoring engine
- FastAPI server on `http://localhost:8000`
- System tray icon for controls

### Option 2: Headless Mode (Testing)

Run without system tray (useful for testing):

```bash
cd backend
python main.py --mode headless
```

### Option 3: API Only

Run just the API server:

```bash
cd backend
python main.py --mode api-only
```

Or using uvicorn directly:

```bash
cd backend
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Development Server

In a separate terminal:

```bash
cd frontend
npm run dev
```

Access the dashboard at `http://localhost:3000`

## 📖 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/me` - Get current user info

#### Sessions
- `GET /api/sessions` - List sessions (paginated, filterable)
- `GET /api/sessions/{id}` - Get session details
- `DELETE /api/sessions/{id}` - Delete session

#### Screenshots
- `GET /api/screenshots` - List screenshots
- `GET /api/screenshots/{id}` - Get screenshot image
- `DELETE /api/screenshots/{id}` - Delete screenshot

#### Analytics
- `GET /api/analytics/overview` - Dashboard overview stats
- `GET /api/analytics/app-distribution` - App usage distribution
- `GET /api/analytics/timeline` - Hourly activity timeline
- `GET /api/analytics/top-apps` - Top N most used apps
- `GET /api/analytics/export/csv` - Export data as CSV

## 🔧 Configuration

Edit `backend/.env` to customize settings:

```env
# Database
DATABASE_URL=sqlite:///./data/activity_monitor.db

# Monitoring
IDLE_TIMEOUT_SECONDS=120
SCREENSHOT_INTERVAL_SECONDS=300
SCREENSHOT_QUALITY=85
SCREENSHOT_ENABLED=true

# Security
SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here

# API
API_HOST=127.0.0.1
API_PORT=8000
```

## 📦 Building Standalone Executable

Create a standalone Windows executable using PyInstaller:

```bash
cd backend
python build_exe.py
```

The executable will be created in `backend/dist/ActivityMonitor.exe`

### Executable Features
- Single-file bundle
- No Python installation required
- Includes all dependencies
- Auto-extracts to temp directory
- Background service mode

## 🏗️ Project Structure

```
activity-monitor/
├── backend/
│   ├── monitoring_engine/      # Activity tracking components
│   │   ├── activity_tracker.py # Main orchestrator
│   │   ├── window_detector.py  # Window tracking
│   │   ├── screenshot_manager.py
│   │   ├── idle_detector.py
│   │   └── system_tray.py
│   ├── api/                    # FastAPI application
│   │   ├── main.py            # FastAPI app
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # DB connection
│   │   ├── auth.py            # Authentication
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Utilities
│   ├── config.py              # Configuration
│   ├── main.py                # Application entry point
│   └── requirements.txt
├── frontend/
│   ├── app/                   # Next.js app directory
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard
│   │   ├── sessions/
│   │   └── screenshots/
│   ├── components/            # React components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── charts/
│   ├── lib/                   # Utilities
│   │   ├── api.ts            # API client
│   │   └── utils.ts
│   └── package.json
└── README.md
```

## 🎨 Technology Stack

### Backend
- **Python 3.9+**
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database
- **Pynput** - Input detection
- **Pillow** - Screenshot capture
- **Cryptography** - Encryption
- **PyInstaller** - Executable creation

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Axios** - HTTP client

## 🔒 Privacy & Legal

**IMPORTANT**: This application tracks user activity including:
- Mouse and keyboard inputs
- Active application windows
- Screenshots of user's screen

**Before deployment:**
1. Ensure users are fully informed and provide explicit consent
2. Comply with local privacy laws (GDPR, CCPA, etc.)
3. Implement proper data retention policies
4. Secure all stored data appropriately
5. Provide clear opt-out mechanisms

**This tool is intended for:**
- Personal productivity tracking
- Authorized workplace monitoring (with consent)
- Research purposes (with IRB approval)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Backend Issues

**Database errors:**
```bash
cd backend
python api/database.py  # Reinitialize database
```

**Import errors:**
```bash
pip install -r requirements.txt --upgrade
```

### Frontend Issues

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/config.py`
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with FastAPI, Next.js, and modern web technologies
- Inspired by productivity tracking and time management tools
- Thanks to the open-source community

---

**Made with ❤️ for productivity enthusiasts**
