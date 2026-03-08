# Complete Guide: Running Activity Monitor

**A step-by-step guide for running the Activity Monitor project on your PC.**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Recommended)](#quick-start-recommended)
3. [Detailed Setup](#detailed-setup)
4. [Running the Application](#running-the-application)
5. [Accessing the Dashboard](#accessing-the-dashboard)
6. [Testing the API](#testing-the-api)
7. [Stopping the Application](#stopping-the-application)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

✅ **Python 3.9 or higher**
- Check if installed: Open PowerShell and run `python --version`
- If not installed: Download from [python.org](https://www.python.org/downloads/)

✅ **Node.js 18 or higher** (for frontend)
- Check if installed: Run `node --version`
- If not installed: Download from [nodejs.org](https://nodejs.org/)

✅ **Git** (optional, for cloning)
- Check if installed: Run `git --version`

---

## Quick Start (Recommended)

### Option 1: Backend Only (Headless Mode)

**Perfect for testing the monitoring engine and API.**

```powershell
# 1. Navigate to backend directory
cd E:\Lucky\Projects\activity-monitor\backend

# 2. Activate virtual environment (if you have one)
.\venv\Scripts\activate

# 3. Install dependencies (first time only)
pip install -r requirements.txt

# 4. Run the backend
python main.py --mode headless
```

**Expected Output:**
```
✓ Security configuration validated for production mode
✓ Database initialized successfully

==================================================
  Activity Monitor v1.0.0
  Headless Mode
==================================================

✓ API server started on http://127.0.0.1:8000
✓ Activity monitoring started
✓ API: http://127.0.0.1:8000
✓ API Docs: http://127.0.0.1:8000/docs

Press Ctrl+C to stop
```

**What happens:**
- ✅ Activity tracking starts (mouse, keyboard, windows)
- ✅ API server runs on http://localhost:8000
- ✅ Database created in `backend/data/`
- ✅ Screenshots saved to `backend/screenshots/` (if enabled)

---

### Option 2: Full Application (Backend + Frontend)

**Perfect for using the web dashboard.**

#### Terminal 1 - Backend

```powershell
# Navigate to backend
cd E:\Lucky\Projects\activity-monitor\backend

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run backend
python main.py --mode headless
```

#### Terminal 2 - Frontend

```powershell
# Navigate to frontend
cd E:\Lucky\Projects\activity-monitor\frontend

# Install dependencies (first time only)
npm install

# Run frontend
npm run dev
```

**Expected Output (Frontend):**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

**Access the dashboard:** Open browser to http://localhost:3000

---

## Detailed Setup

### Step 1: Verify Prerequisites

```powershell
# Check Python version (should be 3.9+)
python --version

# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version
```

### Step 2: Set Up Backend

```powershell
# Navigate to project
cd E:\Lucky\Projects\activity-monitor\backend

# Create virtual environment (recommended, first time only)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Your prompt should now show (venv)

# Install all dependencies
pip install -r requirements.txt
```

**This installs:**
- FastAPI (API framework)
- SQLAlchemy (database)
- Pynput (activity tracking)
- Pillow (screenshots)
- Cryptography (encryption)
- And more...

### Step 3: Configure Environment

The `.env` file is already configured for development. You can verify:

```powershell
# View current configuration
type .env
```

**Should show:**
```env
DATABASE_URL=sqlite:///./data/activity_monitor.db
IDLE_TIMEOUT_SECONDS=120
SCREENSHOT_INTERVAL_SECONDS=300
SCREENSHOT_ENABLED=true
SECRET_KEY=your-secret-key
ENCRYPTION_KEY=PisnzIEzr393gw-DykmpxEO81G2s6gRZVjs0GyoEwFY=
DEBUG=true
```

**Configuration explained:**
- `DEBUG=true` - Development mode (no authentication required)
- `IDLE_TIMEOUT_SECONDS=120` - Idle after 2 minutes of inactivity
- `SCREENSHOT_INTERVAL_SECONDS=300` - Screenshot every 5 minutes
- `SCREENSHOT_ENABLED=true` - Screenshots are enabled

### Step 4: Set Up Frontend (Optional)

```powershell
# Navigate to frontend
cd E:\Lucky\Projects\activity-monitor\frontend

# Install dependencies
npm install
```

**This installs:**
- Next.js (React framework)
- Tailwind CSS (styling)
- Recharts (charts)
- Axios (API client)
- And more...

---

## Running the Application

### Method 1: Backend Only

**Use this if you only want to track activity and use the API.**

```powershell
cd E:\Lucky\Projects\activity-monitor\backend
.\venv\Scripts\activate
python main.py --mode headless
```

**Available modes:**
- `--mode headless` - No GUI, runs in background
- `--mode tray` - System tray icon (Windows only)

### Method 2: Backend + Frontend

**Use this for the full experience with web dashboard.**

**Terminal 1 (Backend):**
```powershell
cd E:\Lucky\Projects\activity-monitor\backend
.\venv\Scripts\activate
python main.py --mode headless
```

**Terminal 2 (Frontend):**
```powershell
cd E:\Lucky\Projects\activity-monitor\frontend
npm run dev
```

**Keep both terminals running!**

---

## Accessing the Dashboard

### Web Dashboard (Frontend)

1. Make sure both backend and frontend are running
2. Open browser to: **http://localhost:3000**

**Features:**
- 📊 Real-time activity statistics
- 📈 Charts (app distribution, timeline, top apps)
- 📝 Session history with filters
- 📸 Screenshot viewer
- 💾 CSV export

### API Documentation

1. Make sure backend is running
2. Open browser to: **http://localhost:8000/docs**

**Features:**
- Interactive API documentation
- Test endpoints directly
- View request/response schemas
- Try out authentication

---

## Testing the API

### Using the Python Client Example

```powershell
# Make sure backend is running first!

# In a new terminal
cd E:\Lucky\Projects\activity-monitor\backend
.\venv\Scripts\activate

# Install requests library (if not already installed)
pip install requests

# Run the example
python examples\python_client.py
```

**Expected Output:**
```
============================================================
Activity Monitor API - Python Client Example
============================================================

🔐 Logging in...
✓ Logged in successfully!

📊 Fetching overview statistics...
✓ Overview retrieved:
   Active hours today: 0.00
   Sessions today: 0
   Apps tracked: 0

📝 Fetching recent sessions...
✓ Found 0 total sessions

💾 Exporting data to CSV...
✓ Exported 59 bytes to activity_export.csv

============================================================
✅ All API calls completed successfully!
============================================================
```

### Using cURL

```powershell
# Get overview statistics
curl http://localhost:8000/api/analytics/overview

# Get sessions
curl http://localhost:8000/api/sessions?page=1&page_size=10

# Get app distribution
curl http://localhost:8000/api/analytics/app-distribution?days=7
```

---

## Stopping the Application

### Stop Backend

In the terminal running the backend:
1. Press `Ctrl+C`
2. Wait for graceful shutdown

**Expected Output:**
```
^C
Shutting down...
✓ Activity monitoring stopped
✓ API server stopped
```

### Stop Frontend

In the terminal running the frontend:
1. Press `Ctrl+C`
2. Confirm with `Y` if prompted

### Stop System Tray (if running)

1. Right-click the system tray icon
2. Select "Exit"

---

## Troubleshooting

### Issue: "python: command not found"

**Solution:**
```powershell
# Try python3 instead
python3 --version

# Or check if Python is in PATH
where python
```

### Issue: "Module not found" errors

**Solution:**
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Port 8000 already in use

**Solution:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env
# Add: API_PORT=8001
```

### Issue: Port 3000 already in use (Frontend)

**Solution:**
```powershell
# Next.js will automatically suggest port 3001
# Press 'y' to use it

# Or manually specify port
$env:PORT=3001
npm run dev
```

### Issue: "Cannot connect to API" in frontend

**Solution:**
1. Verify backend is running: http://localhost:8000/docs
2. Check CORS settings in `backend/.env`
3. Restart both backend and frontend

### Issue: No activity being tracked

**Solution:**
1. Check if monitoring started (look for "Activity monitoring started")
2. Use your computer normally (move mouse, type, switch windows)
3. Wait 2-3 minutes for first session
4. Check database: `backend/data/activity_monitor.db`

### Issue: Screenshots not being captured

**Solution:**
1. Check `SCREENSHOT_ENABLED=true` in `.env`
2. Verify `SCREENSHOT_INTERVAL_SECONDS` (default: 300 = 5 minutes)
3. Check `backend/screenshots/` folder
4. Ensure you have screen capture permissions

### Issue: 500 Internal Server Error

**Solution:**
1. Check backend logs for error details
2. Verify `DEBUG=true` in `.env`
3. Restart backend
4. Check database exists: `backend/data/activity_monitor.db`

---

## File Locations

### Important Directories

```
E:\Lucky\Projects\activity-monitor\
├── backend/
│   ├── data/                    # Database files
│   │   └── activity_monitor.db  # SQLite database
│   ├── screenshots/             # Captured screenshots
│   ├── logs/                    # Application logs (if logging enabled)
│   ├── .env                     # Configuration file
│   └── main.py                  # Entry point
├── frontend/
│   ├── app/                     # Next.js pages
│   ├── components/              # React components
│   └── package.json             # Dependencies
└── README.md                    # Project documentation
```

### Configuration Files

- **Backend config:** `backend/.env`
- **Frontend config:** `frontend/.env.local` (if exists)
- **Python dependencies:** `backend/requirements.txt`
- **Node dependencies:** `frontend/package.json`

---

## Daily Usage

### Starting Your Day

```powershell
# Terminal 1 - Backend
cd E:\Lucky\Projects\activity-monitor\backend
.\venv\Scripts\activate
python main.py --mode headless

# Terminal 2 - Frontend (optional)
cd E:\Lucky\Projects\activity-monitor\frontend
npm run dev
```

### Viewing Your Activity

1. Open http://localhost:3000
2. Check dashboard for today's stats
3. View sessions page for detailed history
4. Export data as CSV if needed

### Ending Your Day

1. Press `Ctrl+C` in both terminals
2. Your data is automatically saved to the database
3. Screenshots are encrypted and stored

---

## Next Steps

### Learn More

- 📖 **API Documentation:** http://localhost:8000/docs
- 📖 **API Integration Examples:** `API_INTEGRATION_EXAMPLES.md`
- 📖 **PyInstaller Guide:** `PYINSTALLER_GUIDE.md`
- 📖 **Development Mode Guide:** `DEVELOPMENT_MODE.md`
- 📖 **Technical Audit Report:** See artifacts folder

### Advanced Features

- **Build Executable:** See `PYINSTALLER_GUIDE.md`
- **Production Deployment:** Set `DEBUG=false` and generate strong keys
- **Custom Configuration:** Edit `.env` file
- **API Integration:** Use examples in `backend/examples/`

---

## Quick Reference

### Common Commands

```powershell
# Start backend
cd backend && .\venv\Scripts\activate && python main.py --mode headless

# Start frontend
cd frontend && npm run dev

# Install backend dependencies
cd backend && pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install

# Run Python client example
cd backend && python examples\python_client.py

# View API docs
# Open: http://localhost:8000/docs

# View dashboard
# Open: http://localhost:3000
```

### Default URLs

| Service | URL |
|---------|-----|
| **API Server** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc |
| **Web Dashboard** | http://localhost:3000 |

### Default Credentials (Development)

- **Username:** `default_user`
- **Password:** `default_password`

*(Auto-created in development mode)*

---

## Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review `README.md` in project root
3. Check `QUICKSTART.md` for quick setup
4. Review technical documentation in artifacts folder

---

**Happy Monitoring! 📊**

*Last updated: February 17, 2026*
