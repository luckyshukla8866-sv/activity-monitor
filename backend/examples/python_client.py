"""
Python client example for Activity Monitor API.
Demonstrates how to interact with the API programmatically.
"""

import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, List


class ActivityMonitorClient:
    """Python client for Activity Monitor API."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.token: Optional[str] = None
    
    def register(self, username: str, password: str, device_name: str = None) -> Dict:
        """Register a new user."""
        response = requests.post(
            f"{self.base_url}/api/users/register",
            json={
                "username": username,
                "password": password,
                "device_name": device_name
            }
        )
        response.raise_for_status()
        return response.json()
    
    def login(self, username: str, password: str) -> str:
        """Login and get access token."""
        response = requests.post(
            f"{self.base_url}/api/users/login",
            data={
                "username": username,
                "password": password
            }
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["access_token"]
        return self.token
    
    def _get_headers(self) -> Dict:
        """Get headers with authentication."""
        if not self.token:
            raise ValueError("Not authenticated. Call login() first.")
        return {"Authorization": f"Bearer {self.token}"}
    
    def get_overview(self) -> Dict:
        """Get dashboard overview statistics."""
        response = requests.get(
            f"{self.base_url}/api/analytics/overview",
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()
    
    def get_sessions(self, page: int = 1, page_size: int = 20, 
                     app_name: str = None, date_from: str = None, 
                     date_to: str = None) -> Dict:
        """Get activity sessions with optional filters."""
        params = {
            "page": page,
            "page_size": page_size
        }
        if app_name:
            params["app_name"] = app_name
        if date_from:
            params["date_from"] = date_from
        if date_to:
            params["date_to"] = date_to
        
        response = requests.get(
            f"{self.base_url}/api/sessions",
            headers=self._get_headers(),
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_app_distribution(self, days: int = 7) -> List[Dict]:
        """Get application usage distribution."""
        response = requests.get(
            f"{self.base_url}/api/analytics/app-distribution",
            headers=self._get_headers(),
            params={"days": days}
        )
        response.raise_for_status()
        return response.json()
    
    def get_top_apps(self, limit: int = 5, days: int = 7) -> List[Dict]:
        """Get top N most used applications."""
        response = requests.get(
            f"{self.base_url}/api/analytics/top-apps",
            headers=self._get_headers(),
            params={"limit": limit, "days": days}
        )
        response.raise_for_status()
        return response.json()
    
    def export_csv(self, date_from: str = None, date_to: str = None) -> bytes:
        """Export activity data as CSV."""
        params = {}
        if date_from:
            params["date_from"] = date_from
        if date_to:
            params["date_to"] = date_to
        
        response = requests.get(
            f"{self.base_url}/api/analytics/export/csv",
            headers=self._get_headers(),
            params=params
        )
        response.raise_for_status()
        return response.content


def main():
    """Main example demonstrating API usage."""
    print("=" * 60)
    print("Activity Monitor API - Python Client Example")
    print("=" * 60)
    print()
    
    # Initialize client
    client = ActivityMonitorClient()
    
    try:
        # Login
        print("🔐 Logging in...")
        token = client.login("default_user", "default_password")
        print(f"✓ Logged in successfully!")
        print(f"   Token: {token[:30]}...")
        print()
        
        # Get overview statistics
        print("📊 Fetching overview statistics...")
        overview = client.get_overview()
        print(f"✓ Overview retrieved:")
        print(f"   Active hours today: {overview['total_active_hours_today']:.2f}")
        print(f"   Sessions today: {overview['total_sessions_today']}")
        print(f"   Apps tracked: {overview['total_apps_tracked']}")
        print()
        
        # Get recent sessions
        print("📝 Fetching recent sessions...")
        sessions = client.get_sessions(page=1, page_size=10)
        print(f"✓ Found {sessions['total']} total sessions")
        if sessions['items']:
            print(f"   Recent sessions:")
            for session in sessions['items'][:5]:
                duration = session['duration_seconds']
                print(f"   - {session['app_name']}: {duration:.0f}s")
        else:
            print("   No sessions found yet. Use the application to generate activity data.")
        print()
        
        # Get app distribution
        print("📈 Fetching app usage distribution (last 7 days)...")
        apps = client.get_app_distribution(days=7)
        if apps:
            print(f"✓ Top applications:")
            for app in apps[:5]:
                print(f"   - {app['app_name']}: {app['total_duration']:.0f}s ({app['percentage']:.1f}%)")
        else:
            print("   No app data available yet.")
        print()
        
        # Get top apps
        print("🏆 Fetching top 5 applications...")
        top_apps = client.get_top_apps(limit=5, days=7)
        if top_apps:
            print(f"✓ Top apps by usage:")
            for i, app in enumerate(top_apps, 1):
                print(f"   {i}. {app['app_name']}: {app['total_duration']:.0f}s ({app['session_count']} sessions)")
        else:
            print("   No app data available yet.")
        print()
        
        # Export CSV
        print("💾 Exporting data to CSV...")
        csv_data = client.export_csv()
        output_file = "activity_export.csv"
        with open(output_file, "wb") as f:
            f.write(csv_data)
        print(f"✓ Exported {len(csv_data)} bytes to {output_file}")
        print()
        
        print("=" * 60)
        print("✅ All API calls completed successfully!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("   Make sure the backend is running:")
        print("   cd backend && python main.py --mode headless")
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        print(f"   Response: {e.response.text}")
        
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()
