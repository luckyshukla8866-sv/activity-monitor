# Complete Guide: Running Activity Monitor

**A step-by-step beginner guide for running and deploying the Activity Monitor project.**

---

## Table of Contents

1. [What is this project?](#what-is-this-project)
2. [Prerequisites](#prerequisites)
3. [Running Locally (on your PC)](#running-locally-on-your-pc)
4. [Using the Dashboard](#using-the-dashboard)
5. [Deploying Online (Public Link)](#deploying-online-public-link)
6. [Local vs Cloud Mode](#local-vs-cloud-mode)
7. [Troubleshooting](#troubleshooting)
8. [Quick Reference](#quick-reference)

---

## What is this project?

Activity Monitor tracks your computer usage — which apps you use, how long you spend on each, mouse clicks, key presses, and screenshots. It has two parts:

| Part | What it does | Built with |
|------|-------------|-----------|
| **Backend** | Tracks activity, stores data, serves API | Python + FastAPI |
| **Frontend** | Web dashboard to view stats, sessions, charts | Next.js (React) |

---

## Prerequisites

Before running this project, install these tools:

### 1. Python (for the backend)

```powershell
# Check if Python is installed
python --version
```

If not installed, download from [python.org](https://www.python.org/downloads/) (version 3.9 or higher). During installation, **check "Add Python to PATH"**.

### 2. Node.js (for the frontend)

```powershell
# Check if Node.js is installed
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/) (version 18 or higher). Select the **LTS** version.

### 3. Git (for deployment)

```powershell
# Check if Git is installed
git --version
```

If not installed, download from [git-scm.com](https://git-scm.com/downloads).

---

## Running Locally (on your PC)

You need **two terminals** running side by side — one for backend, one for frontend.

### Terminal 1 — Start the Backend

```powershell
# Step 1: Go to the backend folder
cd E:\Lucky\Projects\activity-monitor\backend

# Step 2: Install Python packages (only the first time)
pip install -r requirements.txt

# Step 3: Start the backend server
# The PYTHONIOENCODING part prevents a Unicode crash on Windows
$env:PYTHONIOENCODING="utf-8"; python main.py --mode headless
```

**You should see:**
```
[OK] Database initialized successfully

==================================================
  Activity Monitor v1.0.0
  Headless Mode
==================================================

API server started on http://127.0.0.1:8000
Monitoring is NOT running - start it from the website
```


> **Note:** The backend starts but does NOT auto-start monitoring. You'll start monitoring from the website dashboard.

**Keep this terminal open!** Don't close it.

### Terminal 2 — Start the Frontend

Open a **new/second terminal** (don't close the first one):

```powershell
# Step 1: Go to the frontend folder
cd E:\Lucky\Projects\activity-monitor\frontend

# Step 2: Install packages (only the first time)
npm install

# Step 3: Start the frontend
npm run dev
```

**You should see:**
```
  Next.js 14.x.x
  - Local:   http://localhost:3000

  Ready in 2.3s
```

**Keep this terminal open too!**

---

## Using the Dashboard

### Open the Dashboard

1. Make sure **both terminals** are running (backend + frontend)
2. Open your browser
3. Go to: **http://localhost:3000**

### Dashboard Pages

| Page | URL | What it shows |
|------|-----|--------------|
| **Home** | `/` | Overview stats, charts, top apps |
| **Monitor Control** | `/monitoring` | Start/stop monitoring, live status |
| **Sessions** | `/sessions` | Detailed session history |
| **Screenshots** | `/screenshots` | Captured screenshots |
| **Live Input** | `/live-input` | Real-time mouse/keyboard activity |

### How to Start Monitoring

1. Go to the **Monitor Control** page (`/monitoring`)
2. Click the green **"Start Monitoring"** button
3. The status should change to **"MONITORING ACTIVE"** with a green pulsing dot
4. Now use your computer normally — the tracker records which apps you use
5. Check the **Home** page to see your stats update in real-time

### API Documentation

You can also explore the API directly:
- **Swagger Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Stopping the Application

1. Press `Ctrl+C` in the **frontend terminal** to stop the website
2. Press `Ctrl+C` in the **backend terminal** to stop the server
3. Your data is automatically saved — nothing is lost

---

## Deploying Online (Public Link)

To share your Activity Monitor website publicly, you deploy the backend and frontend to free cloud services.

### Architecture

```
Your PC (local)                    Cloud (public)
-----------------                  -------------------------
Backend (Python)  ----push---->    Render.com (backend API)
Frontend (Next.js) ---push---->    Vercel.com (website)
```

### Step 1 — Push Code to GitHub

```powershell
# Navigate to the project root
cd E:\Lucky\Projects\activity-monitor

# Initialize git (skip if already done)
git init
git remote add origin https://github.com/YOUR-USERNAME/activity-monitor.git

# Push the code
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** > **"Web Service"**
3. Connect your `activity-monitor` repository
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `activity-monitor-api` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements-cloud.txt` |
| Start Command | `uvicorn api.main:app --host 0.0.0.0 --port $PORT` |

5. Add **Environment Variables:**

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.8` |
| `SECRET_KEY` | *(any random string)* |
| `ENCRYPTION_KEY` | `PisnzIEzr393gw-DykmpxEO81G2s6gRZVjs0GyoEwFY=` |
| `DEBUG` | `false` |
| `CORS_ORIGINS` | `http://localhost:3000` |

6. Click **"Create Web Service"**
7. Wait for deployment — you'll get a URL like `https://activity-monitor-xxxx.onrender.com`

> **Important:** We use `requirements-cloud.txt` (not `requirements.txt`) because cloud servers don't have screens/keyboards, so desktop libraries like `pynput` are excluded.

### Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New" > "Project"**
3. Import your `activity-monitor` repository
4. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | `Next.js` |
| Root Directory | `frontend` (click "Edit" to change) |
| Build Command | *(leave default)* |
| Output Directory | *(leave default)* |

5. Add **Environment Variables:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://activity-monitor-xxxx.onrender.com` *(your Render URL)* |
| `NEXT_PUBLIC_WS_URL` | `wss://activity-monitor-xxxx.onrender.com/ws` *(same URL with wss:// and /ws)* |

6. Click **"Deploy"**
7. You'll get a URL like `https://activity-monitor-xxxx.vercel.app`

### Step 4 — Update CORS on Render

After getting your Vercel URL, go back to Render:

1. Open your service > **Environment**
2. Update `CORS_ORIGINS` to:
   ```
   http://localhost:3000,https://YOUR-APP.vercel.app
   ```
3. Save — Render will redeploy automatically

### Step 5 — Test!

Open your Vercel URL in any browser. The website should load, showing the dashboard with data from the Render backend.

---

## Local vs Cloud Mode

| Feature | Local (your PC) | Cloud (Render + Vercel) |
|---------|----------------|----------------------|
| View dashboard | Yes | Yes |
| View sessions/analytics | Yes | Yes |
| View screenshots | Yes | Yes |
| **Start/Stop monitoring** | **Yes** | **No** (shows "Cloud Mode" message) |
| Track keyboard/mouse | Yes | No |
| Capture screenshots | Yes | No |

**Why?** Cloud servers have no physical screen, keyboard, or mouse. Monitoring only works on your local computer. The cloud deployment is for **viewing** your data from anywhere.

The monitoring page automatically detects cloud mode and shows a helpful banner explaining this, instead of an error.

---

## Troubleshooting

### "python: command not found"

Python isn't in your PATH. Reinstall Python and **check "Add Python to PATH"** during installation.

### "Module not found" errors (backend)

```powershell
cd E:\Lucky\Projects\activity-monitor\backend
pip install -r requirements.txt
```

### Unicode/encoding crash on Windows

Use this command to start the backend:
```powershell
$env:PYTHONIOENCODING="utf-8"; python main.py --mode headless
```

### Port 8000 already in use

```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill that process (replace 1234 with the actual PID)
taskkill /PID 1234 /F
```

### "Cannot connect to API" in the frontend

1. Make sure the backend terminal is running
2. Check http://localhost:8000/docs loads
3. Restart both backend and frontend

### Vercel build fails with "Can't resolve '@/lib/api'"

The `.gitignore` might be blocking the `frontend/lib/` folder. Check that `lib/` in `.gitignore` is changed to `backend/lib/` so it doesn't affect the frontend.

### Render build fails with "Failed to build pillow/pynput"

Make sure the **Build Command** on Render is:
```
pip install -r requirements-cloud.txt
```
(NOT `requirements.txt`)

### Render build fails with "metadata-generation-failed" for pandas

Add an environment variable on Render:
- **Key:** `PYTHON_VERSION`
- **Value:** `3.11.8`

---

## Quick Reference

### Commands

```powershell
# Start backend locally
cd E:\Lucky\Projects\activity-monitor\backend
$env:PYTHONIOENCODING="utf-8"; python main.py --mode headless

# Start frontend locally
cd E:\Lucky\Projects\activity-monitor\frontend
npm run dev

# Push changes to GitHub (auto-deploys to Vercel & Render)
cd E:\Lucky\Projects\activity-monitor
git add .
git commit -m "your message"
git push
```

### URLs

| Service | Local | Cloud |
|---------|-------|-------|
| Backend API | http://localhost:8000 | https://activity-monitor-qmx3.onrender.com |
| API Docs | http://localhost:8000/docs | https://activity-monitor-qmx3.onrender.com/docs |
| Frontend | http://localhost:3000 | https://activity-monitor-seven.vercel.app |

### Project Structure

```
activity-monitor/
  backend/
    main.py                    # Backend entry point
    requirements.txt           # Local dependencies
    requirements-cloud.txt     # Cloud dependencies (no pynput/pystray)
    .env                       # Configuration
    api/                       # API routes
    monitoring_engine/         # Activity tracker
    data/                      # SQLite database (auto-created)
    screenshots/               # Captured screenshots
  frontend/
    app/                       # Next.js pages
    lib/                       # API client, WebSocket hook
    components/                # React components
    package.json               # Node dependencies
```

---

*Last updated: March 10, 2026*
