# API Client Examples

This directory contains example client implementations for the Activity Monitor API.

## Python Client

### Prerequisites

```bash
pip install requests
```

### Usage

Make sure the backend is running first:

```bash
# Terminal 1 - Start the backend
cd backend
python main.py --mode headless
```

Then run the example:

```bash
# Terminal 2 - Run the example
cd backend
python examples/python_client.py
```

### What it does

The Python client example demonstrates:
- Authentication (login)
- Getting overview statistics
- Fetching sessions with pagination
- Getting app usage distribution
- Getting top applications
- Exporting data to CSV

### Expected Output

```
============================================================
Activity Monitor API - Python Client Example
============================================================

🔐 Logging in...
✓ Logged in successfully!
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6...

📊 Fetching overview statistics...
✓ Overview retrieved:
   Active hours today: 2.45
   Sessions today: 12
   Apps tracked: 5

📝 Fetching recent sessions...
✓ Found 12 total sessions
   Recent sessions:
   - chrome.exe: 1234s
   - code.exe: 987s
   ...

📈 Fetching app usage distribution (last 7 days)...
✓ Top applications:
   - chrome.exe: 5432s (45.2%)
   - code.exe: 3210s (26.7%)
   ...

🏆 Fetching top 5 applications...
✓ Top apps by usage:
   1. chrome.exe: 5432s (23 sessions)
   2. code.exe: 3210s (18 sessions)
   ...

💾 Exporting data to CSV...
✓ Exported 2048 bytes to activity_export.csv

============================================================
✅ All API calls completed successfully!
============================================================
```

## More Examples

For examples in other languages (JavaScript, C#, cURL), see:
- `../API_INTEGRATION_EXAMPLES.md`
