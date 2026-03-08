"""
Quick fix script to reset the database.
This removes the old database with corrupted password hash
and allows it to be recreated with proper bcrypt hashing.
"""

import os
from pathlib import Path

# Database path
db_path = Path(__file__).parent / "data" / "activity_monitor.db"

if db_path.exists():
    print(f"Found database at: {db_path}")
    print("Deleting old database with corrupted hash...")
    os.remove(db_path)
    print("✓ Database deleted successfully!")
    print("\nThe database will be automatically recreated when you start the backend.")
    print("Run: python main.py --mode headless")
else:
    print("No database found. Nothing to delete.")
