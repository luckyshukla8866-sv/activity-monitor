# Monitoring System Diagnostic Guide

## Issue Identified

The monitoring system is running but not creating sessions or capturing screenshots.

**Symptoms:**
- `Sessions: 0` - No activity sessions being created
- `Screenshots: 0` - No screenshots being captured  
- `Idle: False` - Idle detection not working properly

## Diagnostic Steps

### Step 1: Test Window Detection

Run the diagnostic script:

```powershell
cd E:\Lucky\Projects\activity-monitor\backend
python test_monitoring.py
```

This will test:
1. **Window Detection** - Can the system detect active windows?
2. **Idle Detection** - Is the idle timer working?

### Step 2: Check for Missing Dependencies

The window detection requires `pywin32`:

```powershell
pip install pywin32
```

### Step 3: Verify Monitoring is Starting

Check the backend logs for:
- ✅ "Starting activity monitoring..."
- ✅ "✓ Activity monitoring started"
- ✅ "Monitor loop started"

If you don't see these, the monitoring threads aren't starting.

## Common Issues & Fixes

### Issue 1: pywin32 Not Installed

**Symptom:** Window detection returns `None`

**Fix:**
```powershell
pip install pywin32
```

### Issue 2: Permissions

**Symptom:** Can't detect windows from elevated applications

**Fix:** Run PowerShell as Administrator

### Issue 3: Idle Detector Not Resetting

**Symptom:** Always shows `Idle: False` but no sessions

**Fix:** The idle detector needs mouse/keyboard input to reset. The pynput listeners should be running.

### Issue 4: Window Detection Failing Silently

**Symptom:** No error messages, but no windows detected

**Fix:** Check if `pygetwindow` is installed:
```powershell
pip install pygetwindow
```

## Expected Behavior

When working correctly, you should see:

```
Session started: chrome.exe - Google Chrome
Screenshot captured: screenshots/2026-02-17/screenshot_20260217_201234.jpg
Session ended: chrome.exe (45.2s)
Session started: Code.exe - Visual Studio Code
```

## Manual Test

Run this in Python to test window detection:

```python
import pygetwindow as gw

# Get active window
window = gw.getActiveWindow()
print(f"Active window: {window.title if window else 'None'}")

# List all windows
windows = gw.getAllWindows()
print(f"\nTotal windows: {len(windows)}")
for w in windows[:5]:
    print(f"  - {w.title}")
```

## Next Steps

1. Run `test_monitoring.py` to diagnose
2. Install missing dependencies
3. Restart the backend
4. Check logs for session creation

If the test script shows windows are being detected, but the main application still doesn't work, there may be an issue with the monitoring loop or callbacks.
