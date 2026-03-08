"""Script to replace authentication in all route files."""
import os
from pathlib import Path

# Files to update
files = [
    r"E:\Lucky\Projects\activity-monitor\backend\api\routes\analytics.py",
    r"E:\Lucky\Projects\activity-monitor\backend\api\routes\sessions.py",
    r"E:\Lucky\Projects\activity-monitor\backend\api\routes\screenshots.py",
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace all occurrences
        content = content.replace('get_current_active_user', 'get_optional_user')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated {Path(file_path).name}")
    else:
        print(f"✗ File not found: {file_path}")

print("\n✓ All route files updated to use optional authentication")
