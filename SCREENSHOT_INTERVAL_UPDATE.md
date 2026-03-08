# Screenshot Interval Update

## Change Summary

**Date:** February 17, 2026  
**Change:** Updated screenshot capture interval

### Previous Configuration
```env
SCREENSHOT_INTERVAL_SECONDS=300  # 5 minutes
```

### New Configuration
```env
SCREENSHOT_INTERVAL_SECONDS=60   # 1 minute
```

---

## Files Modified

1. **`.env`** - Active configuration file
   - Changed from 300 to 60 seconds
   
2. **`.env.example`** - Example configuration file
   - Changed from 300 to 60 seconds

---

## Impact

### ✅ Benefits
- **More frequent monitoring** - Screenshots captured every minute
- **Better activity tracking** - More granular timeline of user activity
- **Improved accountability** - Less time between captures

### ⚠️ Considerations
- **Storage usage** - 5x more screenshots will be generated
  - Previous: ~12 screenshots/hour
  - New: ~60 screenshots/hour
- **Performance** - Slightly higher CPU usage for captures
- **Disk space** - Ensure adequate storage for increased screenshot volume

---

## Storage Estimation

**Assumptions:**
- Average screenshot size: ~500 KB (compressed JPEG)
- Working hours: 8 hours/day
- Retention: 30 days (default)

**Previous (5-minute interval):**
- Screenshots per day: ~96
- Storage per day: ~48 MB
- Storage per month: ~1.4 GB

**New (1-minute interval):**
- Screenshots per day: ~480
- Storage per day: ~240 MB
- Storage per month: ~7.2 GB

---

## How to Apply Changes

### If Backend is Running
1. **Stop the backend** (Ctrl+C)
2. **Restart the backend**:
   ```powershell
   python main.py --mode headless
   ```

The new interval will be applied automatically on restart.

### Verification

Check the logs after restart:
```
✓ Screenshot interval: 60 seconds
```

Screenshots will now be captured every 1 minute during active sessions.

---

## Adjusting the Interval

You can change the interval anytime by editing `.env`:

```env
# Common intervals:
SCREENSHOT_INTERVAL_SECONDS=30   # 30 seconds (very frequent)
SCREENSHOT_INTERVAL_SECONDS=60   # 1 minute (current)
SCREENSHOT_INTERVAL_SECONDS=120  # 2 minutes
SCREENSHOT_INTERVAL_SECONDS=300  # 5 minutes (previous default)
SCREENSHOT_INTERVAL_SECONDS=600  # 10 minutes
```

**Recommended:** 60-120 seconds for most use cases

---

## Disabling Screenshots

If you want to disable screenshots entirely:

```env
SCREENSHOT_ENABLED=false
```

---

## Storage Management

### Automatic Cleanup
Screenshots older than 30 days are automatically deleted (configurable).

### Manual Cleanup
Delete old screenshots:
```powershell
# Delete screenshots older than 7 days
python -c "from monitoring_engine.screenshot_manager import ScreenshotManager; ScreenshotManager().cleanup_old_screenshots(days=7)"
```

### Check Storage Usage
```powershell
# Windows
Get-ChildItem -Path .\screenshots -Recurse | Measure-Object -Property Length -Sum

# Or view in File Explorer
explorer .\screenshots
```

---

## Configuration Reference

All monitoring settings in `.env`:

```env
# Monitoring Settings
IDLE_TIMEOUT_SECONDS=120           # Idle after 2 minutes
SCREENSHOT_INTERVAL_SECONDS=60     # Screenshot every 1 minute
SCREENSHOT_QUALITY=85              # JPEG quality (1-100)
SCREENSHOT_ENABLED=true            # Enable/disable screenshots
```

---

## Troubleshooting

### Screenshots not being captured
1. Check `SCREENSHOT_ENABLED=true` in `.env`
2. Verify backend is running
3. Check logs for errors
4. Ensure `screenshots/` directory exists

### Too many screenshots
- Increase interval (e.g., 120 or 300 seconds)
- Reduce retention days
- Disable screenshots if not needed

### Storage full
- Clean up old screenshots manually
- Reduce retention period
- Increase `SCREENSHOT_INTERVAL_SECONDS`

---

**Change Applied Successfully** ✅
