"""
PyInstaller build script for creating standalone Windows executable.
Creates a single-file executable with all dependencies bundled.
"""

import PyInstaller.__main__
import sys
from pathlib import Path

# Get the current directory
current_dir = Path(__file__).parent

# Define the main script
main_script = str(current_dir / "main.py")

# Define the build options
build_options = [
    main_script,
    '--name=ActivityMonitor',
    '--onefile',
    '--windowed',  # No console window
    '--icon=NONE',  # Add your icon path here if you have one
    
    # Hidden imports (modules not automatically detected)
    '--hidden-import=pynput.keyboard._win32',
    '--hidden-import=pynput.mouse._win32',
    '--hidden-import=PIL._tkinter_finder',
    '--hidden-import=sqlalchemy.sql.default_comparator',
    '--hidden-import=uvicorn.logging',
    '--hidden-import=uvicorn.loops',
    '--hidden-import=uvicorn.loops.auto',
    '--hidden-import=uvicorn.protocols',
    '--hidden-import=uvicorn.protocols.http',
    '--hidden-import=uvicorn.protocols.http.auto',
    '--hidden-import=uvicorn.protocols.websockets',
    '--hidden-import=uvicorn.protocols.websockets.auto',
    '--hidden-import=uvicorn.lifespan',
    '--hidden-import=uvicorn.lifespan.on',
    
    # Add data files
    '--add-data=.env.example;.',
    
    # Exclude unnecessary modules
    '--exclude-module=matplotlib',
    '--exclude-module=numpy',
    '--exclude-module=pandas',
    
    # Clean build
    '--clean',
    
    # Output directory
    '--distpath=dist',
    '--workpath=build',
    '--specpath=build',
]

def build():
    """Build the executable."""
    print("=" * 60)
    print("Building Activity Monitor Executable")
    print("=" * 60)
    print()
    
    try:
        PyInstaller.__main__.run(build_options)
        
        print()
        print("=" * 60)
        print("Build completed successfully!")
        print("=" * 60)
        print()
        print(f"Executable location: {current_dir / 'dist' / 'ActivityMonitor.exe'}")
        print()
        print("To run the executable:")
        print("  1. Navigate to the 'dist' folder")
        print("  2. Double-click ActivityMonitor.exe")
        print("  3. The application will start in system tray mode")
        print()
        print("Note: First run may take longer as files are extracted")
        print()
        
    except Exception as e:
        print(f"Error during build: {e}")
        sys.exit(1)


if __name__ == "__main__":
    build()
