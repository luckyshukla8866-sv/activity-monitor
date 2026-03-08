# PyInstaller Build Guide - Activity Monitor

Complete step-by-step guide for creating a standalone Windows executable of the Activity Monitor application.

## Prerequisites

### Required Software

1. **Python 3.9 or higher**
   ```bash
   python --version
   # Should show: Python 3.9.x or higher
   ```

2. **All project dependencies installed**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **PyInstaller** (included in requirements.txt)
   ```bash
   pip install pyinstaller==6.3.0
   ```

### Optional (Recommended)

- **UPX** for better compression (optional)
  - Download from: https://upx.github.io/
  - Add to PATH

---

## Step-by-Step Build Process

### Step 1: Prepare Environment

```bash
# Navigate to backend directory
cd E:\Lucky\Projects\activity-monitor\backend

# Activate virtual environment (if using one)
venv\Scripts\activate

# Verify all dependencies are installed
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create or verify your `.env` file:

```bash
# Copy example if needed
copy .env.example .env

# Edit .env and ensure these are set:
# - SECRET_KEY (generate with: openssl rand -hex 32)
# - ENCRYPTION_KEY (generate with: python -c "from api.utils.encryption import EncryptionManager; print(EncryptionManager.generate_key())")
```

### Step 3: Run the Build Script

```bash
# Execute the build script
python build_exe.py
```

**Expected Output:**
```
============================================================
Building Activity Monitor Executable
============================================================

[PyInstaller output...]

============================================================
Build completed successfully!
============================================================

Executable location: E:\Lucky\Projects\activity-monitor\backend\dist\ActivityMonitor.exe

To run the executable:
  1. Navigate to the 'dist' folder
  2. Double-click ActivityMonitor.exe
  3. The application will start in system tray mode

Note: First run may take longer as files are extracted
```

### Step 4: Test the Executable

```bash
# Navigate to dist folder
cd dist

# Run the executable
.\ActivityMonitor.exe
```

**What to expect:**
1. A system tray icon should appear
2. The application starts monitoring activity
3. API server starts on http://localhost:8000
4. Database file created in `data/` folder
5. Screenshots saved to `screenshots/` folder (if enabled)

---

## Build Options Explained

The `build_exe.py` script uses these PyInstaller options:

| Option | Purpose |
|--------|---------|
| `--onefile` | Creates a single executable file |
| `--windowed` | No console window (runs in background) |
| `--name=ActivityMonitor` | Executable name |
| `--hidden-import` | Includes modules not auto-detected |
| `--add-data` | Bundles data files (.env.example) |
| `--exclude-module` | Excludes unnecessary modules |
| `--clean` | Cleans previous build artifacts |

---

## Customizing the Build

### Adding an Icon

1. Create or obtain an `.ico` file
2. Place it in the `backend` directory (e.g., `icon.ico`)
3. Edit `build_exe.py`:
   ```python
   '--icon=icon.ico',  # Change from '--icon=NONE'
   ```

### Console Mode (for debugging)

To see console output:

1. Edit `build_exe.py`
2. Remove or comment out the `--windowed` option:
   ```python
   # '--windowed',  # Comment this line
   ```
3. Rebuild

### Including Additional Files

To bundle additional files:

```python
'--add-data=path/to/file;destination',
```

Example:
```python
'--add-data=config/settings.json;config',
```

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution:** Add hidden imports to `build_exe.py`:

```python
'--hidden-import=module_name',
```

### Issue: Executable is too large

**Solutions:**
1. Install UPX for compression
2. Exclude unnecessary modules:
   ```python
   '--exclude-module=matplotlib',
   '--exclude-module=numpy',
   ```

### Issue: Antivirus flags the executable

**Explanation:** This is common with PyInstaller executables.

**Solutions:**
1. Add exception in antivirus software
2. Sign the executable with a code signing certificate
3. Use `--onedir` instead of `--onefile` (creates folder instead of single file)

### Issue: Application crashes on startup

**Debug steps:**
1. Build with console mode (remove `--windowed`)
2. Run from command line to see error messages
3. Check for missing dependencies
4. Verify .env file is properly configured

### Issue: Database/Screenshots not created

**Solution:** The executable creates these in the same directory as the .exe file. Ensure write permissions.

---

## Distribution

### Packaging for Distribution

**Option 1: Single File** (current default)
- Pros: Easy to distribute, single .exe file
- Cons: Slower startup (extracts to temp), larger file size

**Option 2: Directory Mode**
- Change `build_exe.py`: Replace `--onefile` with `--onedir`
- Pros: Faster startup, smaller individual files
- Cons: Multiple files to distribute

### Creating an Installer

Use **Inno Setup** to create a professional installer:

1. Download Inno Setup: https://jrsoftware.org/isinfo.php
2. Create an installer script (`.iss` file)
3. Include the executable and required files
4. Build the installer

**Example Inno Setup script:**
```iss
[Setup]
AppName=Activity Monitor
AppVersion=1.0.0
DefaultDirName={pf}\ActivityMonitor
DefaultGroupName=Activity Monitor
OutputDir=installer
OutputBaseFilename=ActivityMonitor_Setup

[Files]
Source: "dist\ActivityMonitor.exe"; DestDir: "{app}"
Source: ".env.example"; DestDir: "{app}"

[Icons]
Name: "{group}\Activity Monitor"; Filename: "{app}\ActivityMonitor.exe"
Name: "{group}\Uninstall"; Filename: "{uninstallexe}"
```

---

## Platform-Specific Notes

### Windows

- **Tested on:** Windows 10, Windows 11
- **Requirements:** No additional runtime needed
- **Startup:** Can be added to Windows Startup folder for auto-start

### Cross-Platform Building

**Important:** PyInstaller creates platform-specific executables.

- Windows executable: Must be built on Windows
- Linux executable: Must be built on Linux
- macOS executable: Must be built on macOS

**For Linux:**
```bash
# Same process, but use:
python build_exe.py

# Output: dist/ActivityMonitor (no .exe extension)
```

**For macOS:**
```bash
# Same process
python build_exe.py

# Output: dist/ActivityMonitor.app (application bundle)
```

---

## Advanced Configuration

### Optimizing Build Size

1. **Use virtual environment** with only required packages
2. **Exclude test/dev dependencies:**
   ```python
   '--exclude-module=pytest',
   '--exclude-module=pytest-asyncio',
   '--exclude-module=httpx',
   ```

3. **Enable UPX compression:**
   ```python
   '--upx-dir=/path/to/upx',
   ```

### Multi-File Builds

For better startup performance:

```python
# Change in build_exe.py
'--onedir',  # Instead of --onefile
```

This creates a folder with the executable and dependencies.

---

## Verification Checklist

After building, verify:

- [ ] Executable runs without errors
- [ ] System tray icon appears
- [ ] API accessible at http://localhost:8000/docs
- [ ] Database file created
- [ ] Activity tracking works
- [ ] Screenshots captured (if enabled)
- [ ] Can stop from system tray
- [ ] No console errors (if windowed mode)

---

## Performance Considerations

### Startup Time

- **Single-file mode:** 5-10 seconds (extracts to temp)
- **Directory mode:** 1-2 seconds (no extraction)

### File Size

- **Typical size:** 40-60 MB (single file)
- **With UPX:** 25-35 MB
- **Directory mode:** 50-70 MB total (multiple files)

---

## Security Considerations

### Code Signing

For production distribution:

1. Obtain a code signing certificate
2. Sign the executable:
   ```bash
   signtool sign /f certificate.pfx /p password /t http://timestamp.server.com ActivityMonitor.exe
   ```

### Antivirus False Positives

- Common with PyInstaller executables
- Submit to antivirus vendors for whitelisting
- Use VirusTotal to check detection rates

---

## Automated Build Script

Create `build_and_package.bat` for automated builds:

```batch
@echo off
echo Building Activity Monitor...

REM Activate virtual environment
call venv\Scripts\activate

REM Install/update dependencies
pip install -r requirements.txt

REM Run build
python build_exe.py

REM Create distribution folder
mkdir release
copy dist\ActivityMonitor.exe release\
copy .env.example release\
copy ..\README.md release\

echo Build complete! Check release\ folder
pause
```

---

## Support

For build issues:

1. Check this guide's troubleshooting section
2. Review PyInstaller documentation: https://pyinstaller.org/
3. Check project README.md
4. Open an issue on GitHub

---

## Appendix: Complete Build Command

If you prefer to build manually without the script:

```bash
pyinstaller --name=ActivityMonitor \
    --onefile \
    --windowed \
    --hidden-import=pynput.keyboard._win32 \
    --hidden-import=pynput.mouse._win32 \
    --hidden-import=PIL._tkinter_finder \
    --hidden-import=sqlalchemy.sql.default_comparator \
    --hidden-import=uvicorn.logging \
    --hidden-import=uvicorn.loops \
    --hidden-import=uvicorn.loops.auto \
    --hidden-import=uvicorn.protocols \
    --hidden-import=uvicorn.protocols.http \
    --hidden-import=uvicorn.protocols.http.auto \
    --hidden-import=uvicorn.protocols.websockets \
    --hidden-import=uvicorn.protocols.websockets.auto \
    --hidden-import=uvicorn.lifespan \
    --hidden-import=uvicorn.lifespan.on \
    --add-data=.env.example;. \
    --exclude-module=matplotlib \
    --exclude-module=numpy \
    --exclude-module=pandas \
    --clean \
    --distpath=dist \
    --workpath=build \
    --specpath=build \
    main.py
```

---

**Happy Building! 🚀**
