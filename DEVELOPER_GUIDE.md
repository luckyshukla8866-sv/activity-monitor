# 🛠️ Developer Guide — Activity Monitor

This guide covers everything you need to develop, build, test, and deploy the Activity Monitor platform.

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Local Development (Quick Start)](#2-local-development-quick-start)
3. [Cloud Deployment](#3-cloud-deployment)
4. [Creating a Standalone Executable](#4-creating-a-standalone-executable)
5. [Monitoring Diagnostics](#5-monitoring-diagnostics)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites

Before running this project, ensure you have the following installed:
- **Python**: 3.9 or higher (Ensure "Add Python to PATH" is checked during installation)
- **Node.js**: 16 or higher (v18+ LTS recommended)
- **Git**: For cloud deployment

---

## 2. Local Development (Quick Start)

You need to run the backend API and the frontend web server concurrently in two separate terminals.

### Terminal 1: Backend Server

```powershell
# 1. Navigate to backend directory
cd E:\Lucky\Projects\activity-monitor\backend

# 2. Setup Virtual Environment (Recommended)
python -m venv venv
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure Environment Secrets
copy .env.example .env
# Generate encryption key and add it to your .env file:
python -c "from api.utils.encryption import EncryptionManager; print(EncryptionManager.generate_key())"

# 5. Initialize Database
python api/database.py

# 6. Start Backend API
# (Setting PYTHONIOENCODING prevents Windows Unicode crashes)
$env:PYTHONIOENCODING="utf-8"; python main.py --mode headless
```
*Note: The backend starts at `http://localhost:8000` but does not auto-start monitoring. You trigger it via the dashboard.*

### Terminal 2: Frontend Dashboard

```powershell
# 1. Navigate to frontend directory
cd E:\Lucky\Projects\activity-monitor\frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
*Note: The frontend will be available at `http://localhost:3000`.*

---

## 3. Cloud Deployment

To share your dashboard publicly without requiring local setup for your team or clients:

### 3.1 Push Code to GitHub
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/activity-monitor.git
git push -u origin main
```

### 3.2 Deploy Backend API (Render)
1. Go to [render.com](https://render.com) > **New Web Service**.
2. Connect your repository.
3. Configure settings:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements-cloud.txt` (Excludes desktop hooks like pynput)
   - Start Command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `PYTHON_VERSION`: `3.11.8`
   - `CORS_ORIGINS`: `http://localhost:3000` (Update later with Vercel URL)
   - `ENCRYPTION_KEY`: *(paste output of your generated key)*
   - `SECRET_KEY`: *(random secure string)*

### 3.3 Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) > **Add New Project**.
2. Import repository, Root Directory: `frontend`.
3. Environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Render URL (e.g., `https://api-xxx.onrender.com`)
   - `NEXT_PUBLIC_WS_URL`: Your Render WS URL (e.g., `wss://api-xxx.onrender.com/ws`)
4. Deploy.

**Don't forget to update the `CORS_ORIGINS` on Render with your new Vercel app URL!**

---

## 4. Creating a Standalone Executable

To distribute the desktop monitoring client cleanly, you can compile it using **PyInstaller**.

### Step-by-Step Build:
```powershell
cd E:\Lucky\Projects\activity-monitor\backend
venv\Scripts\activate
pip install pyinstaller==6.3.0

# Execute the built-in PyInstaller script
python build_exe.py
```
**Output:** The executable evaluates into `backend\dist\ActivityMonitor.exe`.

### Distribution Modes:
- **Single File (`--onefile`)**: Default. Easy to share, slightly slower startup due to extraction.
- **Directory (`--onedir`)**: Modify `build_exe.py` to use `--onedir` for faster startup times.

### Customizations in `build_exe.py`:
- **Icon**: Replace `'--icon=NONE'` with `'--icon=your_icon.ico'`.
- **Debug Console**: Comment out `'--windowed'` to preserve standard output in the terminal if the app crashes on launch.
- **File Reduction**: Use `--exclude-module=numpy` and consider installing UPX compressor.

---

## 5. Monitoring Diagnostics

If the backend runs but `Sessions` and `Screenshots` read `0`:

### Step 1: Run Diagnostic Script
```powershell
cd E:\Lucky\Projects\activity-monitor\backend
python test_monitoring.py
```
This tests **Window Detection** and **Idle Detection timers**.

### Step 2: Permissions
If you cannot detect windows belonging to elevated user applications (like Task Manager), you must run your script or `.exe` as **Administrator**.

### Step 3: Missing System Hooks
If `pywin32` or `pygetwindow` fails to grab context silently:
```powershell
pip install pywin32 pygetwindow
```

---

## 6. Troubleshooting

- **`python: command not found`**: Ensure Python was checked to "Add to PATH" in the installer.
- **Unicode/Encoding crash (`charmap` error)**: Run backend with `$env:PYTHONIOENCODING="utf-8"`.
- **Port 8000 in use**:
  ```powershell
  netstat -ano | findstr :8000
  taskkill /PID <PROCESS_ID> /F
  ```
- **Render Build Error (pillow/pynput failed)**: Ensure Render uses `requirements-cloud.txt`, not local `requirements.txt`.
