# Quick Start Guide - Activity Monitor

Get up and running in 5 minutes!

## Prerequisites
- Python 3.9+
- Node.js 16+
- Windows 10/11

## Step 1: Clone and Setup (2 minutes)

```bash
# Navigate to project
cd activity-monitor

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

## Step 2: Configure (1 minute)

```bash
# Generate encryption key
cd backend
python -c "from api.utils.encryption import EncryptionManager; print(EncryptionManager.generate_key())"

# Copy the output and create .env file
copy .env.example .env
# Edit .env and paste the encryption key as ENCRYPTION_KEY
```

## Step 3: Initialize Database (30 seconds)

```bash
cd backend
python api/database.py
```

## Step 4: Run Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
python main.py --mode headless
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 5: Access Dashboard

Open browser: `http://localhost:3000`

API Docs: `http://localhost:8000/docs`

## Default Login

Since this is a local application, a default user is created automatically.

For API testing:
- Username: `default_user`
- Password: `default_password`

## What to Expect

1. **Backend Console**: Shows activity tracking in real-time
   - Session started/ended messages
   - Screenshot capture notifications
   - Stats updates every 5 seconds

2. **Dashboard**: 
   - Stats cards showing today's activity
   - Charts (may be empty initially - use your computer for a few minutes)
   - Sessions and screenshots pages

3. **Activity Tracking**:
   - Switch between applications
   - Type and move mouse
   - Screenshots captured every 5 minutes (if enabled)
   - Idle after 2 minutes of inactivity

## Testing the System

1. **Generate Activity**:
   - Open different applications (browser, notepad, etc.)
   - Switch between them
   - Type and click around
   - Wait a few minutes

2. **View Results**:
   - Refresh dashboard to see stats
   - Check Sessions page for tracked activity
   - View Screenshots page (if enabled)

3. **Export Data**:
   - Click "Export CSV" button in header
   - Download your activity report

## Troubleshooting

**Backend won't start:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

**Frontend won't start:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

**No data showing:**
- Wait a few minutes for activity to be tracked
- Switch between applications
- Check backend console for errors

**Screenshots not working:**
- Ensure `SCREENSHOT_ENABLED=true` in .env
- Check `ENCRYPTION_KEY` is set
- Verify screenshots folder exists

## Next Steps

- Read full [README.md](README.md) for detailed documentation
- Check [walkthrough.md](walkthrough.md) for feature overview
- Build executable: `python backend/build_exe.py`
- Customize settings in `backend/.env`

## Support

For issues or questions, check:
1. Backend console for error messages
2. Browser console (F12) for frontend errors
3. README.md troubleshooting section

---

**Enjoy tracking your productivity! 🚀**
