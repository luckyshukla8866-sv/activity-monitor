# API Integration Examples - Activity Monitor

This document demonstrates how to integrate with the Activity Monitor API from different programming languages, showcasing the cross-language interoperability of the REST API.

## Table of Contents

- [Authentication](#authentication)
- [Python Examples](#python-examples)
- [JavaScript/Node.js Examples](#javascriptnodejs-examples)
- [C# Examples](#c-examples)
- [cURL Examples](#curl-examples)
- [Common Patterns](#common-patterns)

---

## Authentication

All protected endpoints require JWT authentication. The authentication flow is:

1. **Register a user** (one-time)
2. **Login** to get an access token
3. **Use the token** in subsequent requests

### Authentication Headers

```
Authorization: Bearer <your-jwt-token>
```

---

## Python Examples

### Setup

```bash
pip install requests
```

### Complete Python Client

```python
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

# Usage Example
if __name__ == "__main__":
    client = ActivityMonitorClient()
    
    # Login
    token = client.login("default_user", "default_password")
    print(f"Logged in successfully! Token: {token[:20]}...")
    
    # Get overview
    overview = client.get_overview()
    print(f"\nActive hours today: {overview['total_active_hours_today']:.2f}")
    print(f"Sessions today: {overview['total_sessions_today']}")
    
    # Get sessions
    sessions = client.get_sessions(page=1, page_size=10)
    print(f"\nTotal sessions: {sessions['total']}")
    for session in sessions['items'][:5]:
        print(f"  - {session['app_name']}: {session['duration_seconds']:.0f}s")
    
    # Get app distribution
    apps = client.get_app_distribution(days=7)
    print("\nTop applications (last 7 days):")
    for app in apps[:5]:
        print(f"  - {app['app_name']}: {app['total_duration']:.0f}s ({app['percentage']:.1f}%)")
    
    # Export CSV
    csv_data = client.export_csv()
    with open("activity_export.csv", "wb") as f:
        f.write(csv_data)
    print("\n✓ Exported data to activity_export.csv")
```

---

## JavaScript/Node.js Examples

### Setup

```bash
npm install axios
```

### Complete Node.js Client

```javascript
const axios = require('axios');

class ActivityMonitorClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async register(username, password, deviceName = null) {
        const response = await axios.post(`${this.baseUrl}/api/users/register`, {
            username,
            password,
            device_name: deviceName
        });
        return response.data;
    }

    async login(username, password) {
        const response = await axios.post(
            `${this.baseUrl}/api/users/login`,
            new URLSearchParams({
                username,
                password
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        this.token = response.data.access_token;
        return this.token;
    }

    getHeaders() {
        if (!this.token) {
            throw new Error('Not authenticated. Call login() first.');
        }
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    async getOverview() {
        const response = await axios.get(
            `${this.baseUrl}/api/analytics/overview`,
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async getSessions(options = {}) {
        const { page = 1, pageSize = 20, appName, dateFrom, dateTo } = options;
        const params = { page, page_size: pageSize };
        
        if (appName) params.app_name = appName;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        const response = await axios.get(
            `${this.baseUrl}/api/sessions`,
            {
                headers: this.getHeaders(),
                params
            }
        );
        return response.data;
    }

    async getAppDistribution(days = 7) {
        const response = await axios.get(
            `${this.baseUrl}/api/analytics/app-distribution`,
            {
                headers: this.getHeaders(),
                params: { days }
            }
        );
        return response.data;
    }

    async exportCsv(dateFrom = null, dateTo = null) {
        const params = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        const response = await axios.get(
            `${this.baseUrl}/api/analytics/export/csv`,
            {
                headers: this.getHeaders(),
                params,
                responseType: 'blob'
            }
        );
        return response.data;
    }
}

// Usage Example
(async () => {
    const client = new ActivityMonitorClient();
    
    try {
        // Login
        const token = await client.login('default_user', 'default_password');
        console.log(`Logged in successfully! Token: ${token.substring(0, 20)}...`);
        
        // Get overview
        const overview = await client.getOverview();
        console.log(`\nActive hours today: ${overview.total_active_hours_today.toFixed(2)}`);
        console.log(`Sessions today: ${overview.total_sessions_today}`);
        
        // Get sessions
        const sessions = await client.getSessions({ page: 1, pageSize: 10 });
        console.log(`\nTotal sessions: ${sessions.total}`);
        sessions.items.slice(0, 5).forEach(session => {
            console.log(`  - ${session.app_name}: ${session.duration_seconds.toFixed(0)}s`);
        });
        
        // Get app distribution
        const apps = await client.getAppDistribution(7);
        console.log('\nTop applications (last 7 days):');
        apps.slice(0, 5).forEach(app => {
            console.log(`  - ${app.app_name}: ${app.total_duration.toFixed(0)}s (${app.percentage.toFixed(1)}%)`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
```

---

## C# Examples

### Setup

```bash
dotnet add package Newtonsoft.Json
dotnet add package RestSharp
```

### Complete C# Client

```csharp
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class ActivityMonitorClient
{
    private readonly HttpClient _httpClient;
    private string _token;

    public ActivityMonitorClient(string baseUrl = "http://localhost:8000")
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(baseUrl)
        };
    }

    public async Task<string> LoginAsync(string username, string password)
    {
        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("username", username),
            new KeyValuePair<string, string>("password", password)
        });

        var response = await _httpClient.PostAsync("/api/users/login", content);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        _token = result["access_token"];

        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", _token);

        return _token;
    }

    public async Task<Dictionary<string, object>> GetOverviewAsync()
    {
        var response = await _httpClient.GetAsync("/api/analytics/overview");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
    }

    public async Task<Dictionary<string, object>> GetSessionsAsync(
        int page = 1, 
        int pageSize = 20, 
        string appName = null)
    {
        var queryParams = $"?page={page}&page_size={pageSize}";
        if (!string.IsNullOrEmpty(appName))
        {
            queryParams += $"&app_name={Uri.EscapeDataString(appName)}";
        }

        var response = await _httpClient.GetAsync($"/api/sessions{queryParams}");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
    }

    public async Task<List<Dictionary<string, object>>> GetAppDistributionAsync(int days = 7)
    {
        var response = await _httpClient.GetAsync($"/api/analytics/app-distribution?days={days}");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(json);
    }

    public async Task<byte[]> ExportCsvAsync(string dateFrom = null, string dateTo = null)
    {
        var queryParams = "";
        if (!string.IsNullOrEmpty(dateFrom))
        {
            queryParams += $"?date_from={Uri.EscapeDataString(dateFrom)}";
        }
        if (!string.IsNullOrEmpty(dateTo))
        {
            queryParams += string.IsNullOrEmpty(queryParams) ? "?" : "&";
            queryParams += $"date_to={Uri.EscapeDataString(dateTo)}";
        }

        var response = await _httpClient.GetAsync($"/api/analytics/export/csv{queryParams}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsByteArrayAsync();
    }
}

// Usage Example
class Program
{
    static async Task Main(string[] args)
    {
        var client = new ActivityMonitorClient();

        try
        {
            // Login
            var token = await client.LoginAsync("default_user", "default_password");
            Console.WriteLine($"Logged in successfully! Token: {token.Substring(0, 20)}...");

            // Get overview
            var overview = await client.GetOverviewAsync();
            Console.WriteLine($"\nActive hours today: {overview["total_active_hours_today"]}");
            Console.WriteLine($"Sessions today: {overview["total_sessions_today"]}");

            // Get sessions
            var sessions = await client.GetSessionsAsync(page: 1, pageSize: 10);
            Console.WriteLine($"\nTotal sessions: {sessions["total"]}");

            // Get app distribution
            var apps = await client.GetAppDistributionAsync(days: 7);
            Console.WriteLine("\nTop applications (last 7 days):");
            foreach (var app in apps)
            {
                Console.WriteLine($"  - {app["app_name"]}: {app["total_duration"]}s ({app["percentage"]}%)");
            }

            // Export CSV
            var csvData = await client.ExportCsvAsync();
            await System.IO.File.WriteAllBytesAsync("activity_export.csv", csvData);
            Console.WriteLine("\n✓ Exported data to activity_export.csv");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
```

---

## cURL Examples

### Authentication

```bash
# Register a new user
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123",
    "device_name": "My Computer"
  }'

# Login and get token
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=default_user&password=default_password"

# Response:
# {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","token_type":"bearer"}

# Save token to variable (Linux/Mac)
TOKEN=$(curl -s -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=default_user&password=default_password" | jq -r '.access_token')

# Windows PowerShell
$response = Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/users/login" -Body @{username="default_user";password="default_password"}
$TOKEN = $response.access_token
```

### Get Overview Statistics

```bash
curl -X GET http://localhost:8000/api/analytics/overview \
  -H "Authorization: Bearer $TOKEN"
```

### Get Sessions (with pagination)

```bash
curl -X GET "http://localhost:8000/api/sessions?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Sessions (with filters)

```bash
curl -X GET "http://localhost:8000/api/sessions?app_name=chrome.exe&date_from=2026-02-01&date_to=2026-02-17" \
  -H "Authorization: Bearer $TOKEN"
```

### Get App Distribution

```bash
curl -X GET "http://localhost:8000/api/analytics/app-distribution?days=7" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Activity Timeline

```bash
curl -X GET "http://localhost:8000/api/analytics/timeline" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Top Apps

```bash
curl -X GET "http://localhost:8000/api/analytics/top-apps?limit=10&days=30" \
  -H "Authorization: Bearer $TOKEN"
```

### Export CSV

```bash
curl -X GET "http://localhost:8000/api/analytics/export/csv" \
  -H "Authorization: Bearer $TOKEN" \
  -o activity_export.csv
```

### Get Screenshots

```bash
curl -X GET "http://localhost:8000/api/screenshots?page=1&page_size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Specific Screenshot

```bash
curl -X GET "http://localhost:8000/api/screenshots/1" \
  -H "Authorization: Bearer $TOKEN" \
  -o screenshot.jpg
```

### Delete Session

```bash
curl -X DELETE "http://localhost:8000/api/sessions/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Patterns

### Error Handling

All API errors return JSON with a `detail` field:

```json
{
  "detail": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

### Pagination

List endpoints support pagination:

```
GET /api/sessions?page=1&page_size=20
```

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

### Date Filtering

Use ISO 8601 format for dates:

```
?date_from=2026-02-01T00:00:00&date_to=2026-02-17T23:59:59
```

Or simplified:

```
?date_from=2026-02-01&date_to=2026-02-17
```

### WebSocket Real-Time Updates

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
    console.log('Connected to Activity Monitor');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
```

---

## API Documentation

For complete API documentation, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Security Best Practices

1. **Never hardcode credentials** - Use environment variables
2. **Store tokens securely** - Use secure storage mechanisms
3. **Use HTTPS in production** - Never send tokens over HTTP
4. **Implement token refresh** - Handle token expiration gracefully
5. **Validate SSL certificates** - Don't disable certificate verification

---

## Support

For API integration issues:

1. Check the API documentation at `/docs`
2. Review this examples document
3. Check project README.md
4. Open an issue on GitHub

---

**Happy Integrating! 🚀**
