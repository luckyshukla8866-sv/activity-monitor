# 📊 Activity Analytics — User Guide

> **What is this app?**
> This is an **AI-powered productivity analyzer**. It looks at your computer usage data (which apps you used, for how long) and gives you smart insights like:
> - Are you productive or wasting time?
> - Are you at risk of burnout?
> - What are your best focus hours?

---

## 🌐 How to Open the App

1. Open your browser (Chrome, Edge, Firefox)
2. Go to: **https://activity-monitor-seven.vercel.app**
3. That's it! No login needed, no installation needed.

---

## 📱 Pages in the App (5 Pages)

### Page 1: Dashboard (Home Page `/`)

**What you see:** The main overview of your productivity.

**4 Cards at the top:**

| Card | What it shows | Example |
|------|--------------|---------|
| 🧠 **Productivity Score** | Your overall score from 0-100 | **78/100** |
| 📊 **Sessions Today** | How many app sessions were recorded | **24 sessions** |
| 📦 **Apps Tracked** | How many different apps you used | **8 apps** |
| ⚠️ **Burnout Risk** | Are you overworking? | **LOW** ✅ |

**Below the cards:**

| Section | What it shows |
|---------|--------------|
| Deep Work / Communication / Distraction | Hours spent in each category |
| App Usage Distribution | Pie chart — which apps took most time |
| Top 5 Applications | Bar chart — your most used apps |
| Activity Timeline | Line chart — when you were active today |

**Expected Output Example:**
```
Productivity Score: 78/100
Deep Work: 4.5h | Communication: 2.0h | Distraction: 1.2h

Top Apps:
1. VS Code        — 3.2 hours
2. Google Chrome   — 2.5 hours
3. Microsoft Teams — 1.8 hours
4. Slack           — 0.9 hours
5. Spotify         — 0.5 hours
```

---

### Page 2: Sessions (`/sessions`)

**What you see:** A detailed table of every app session.

**Each row shows:**

| Column | Example |
|--------|---------|
| App Name | Visual Studio Code |
| Window Title | main.py - activity-monitor |
| Start Time | 2026-03-10 09:15 AM |
| Duration | 45 minutes |
| End Time | 2026-03-10 10:00 AM |

**What you can do:**
- 🔍 Search by app name (e.g., type "Chrome")
- 📅 Filter by date range
- 📄 Navigate pages (50 sessions per page)

---

### Page 3: ML Insights (`/insights`)

**What you see:** AI-powered analysis of your productivity.

**Section 1 — Productivity Score (Big Number)**
```
┌─────────────────────────────────────┐
│   Overall Productivity Score        │
│          78 / 100                   │
│   ████████████████████░░░░░░        │
│   Based on 156 sessions, 42 hours  │
└─────────────────────────────────────┘
```

**Section 2 — Category Breakdown (4 Cards)**

| Category | Hours | Percentage | What counts |
|----------|-------|------------|-------------|
| 🟢 **Deep Work** | 4.5h | 45% | VS Code, GitHub, Terminal, Figma |
| 🟡 **Communication** | 2.0h | 20% | Teams, Slack, Zoom, Email |
| 🔴 **Distraction** | 1.2h | 12% | YouTube, Reddit, Twitter, Games |
| ⚪ **Neutral** | 2.3h | 23% | File Explorer, Settings, etc. |

**Section 3 — App Scores Table**

| Application | Category | Hours | Score |
|-------------|----------|-------|-------|
| Visual Studio Code | Deep Work | 3.2h | 90 |
| Google Chrome (GitHub) | Deep Work | 1.5h | 90 |
| Microsoft Teams | Communication | 1.8h | 60 |
| Google Chrome (YouTube) | Distraction | 0.8h | 10 |
| Spotify | Distraction | 0.5h | 10 |

**How the AI decides:**
- It reads the **app name** + **window title**
- If it finds words like "code", "github", "terminal" → **Deep Work** (score 90)
- If it finds "teams", "slack", "zoom" → **Communication** (score 60)
- If it finds "youtube", "reddit", "twitter" → **Distraction** (score 10)
- Everything else → **Neutral** (score 50)

---

### Page 4: Forecast & Burnout (`/forecast`)

**What you see:** Predictions about your work health.

**Section 1 — Predicted Peak Hours**
```
🎯 Your Most Productive Hours:
  ☀️ 10:00  ████████████████ 92
  ☀️ 11:00  ██████████████   85
  ☀️ 14:00  █████████████    80

💡 Schedule your hardest tasks during 10 AM - 11 AM!
```

**Section 2 — Burnout Risk**
```
⚠️ Burnout Risk: MEDIUM
━━━━━━━━━━━━━━░░░░░░░░░░░  Score: 35/100

Message: "Some work patterns look concerning."
```

**Section 3 — Hourly Heatmap**
Shows a colored bar for each hour (6 AM to 11 PM):
- 🟢 Green = High Focus
- 🔵 Blue = Moderate
- 🟡 Yellow = Mixed
- 🔴 Red = Low Focus

**Section 4 — Warnings (if any)**
```
⚠️ Your latest day (12.5h) is above your average (8.2h).
⚠️ You worked past 10 PM on 3 of the last 7 days.
⚠️ Your working hours are trending up (7.5h → 10.2h avg).
```

**Section 5 — Recommendations**
```
✅ Try to keep your workday under 9 hours.
✅ Take regular breaks using Pomodoro (25 min work, 5 min break).
✅ Avoid late-night work sessions.
```

**Section 6 — Daily Hours Chart (14 Days)**
```
          ▓
        ▓ ▓
      ▓ ▓ ▓ ▓
  ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓
  ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓
  ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓
  Feb   Mar    Mar    Mar    Mar
  26    01     05     08     11

🔵 Normal (≤8h)  🟡 Long (8-10h)  🔴 Overtime (>10h)
```

---

### Page 5: Upload Data (`/upload`)

**What you see:** A file upload area to import your own data.

**Step-by-step:**

1. **Click "Download Sample"** to get a sample CSV file
2. **Open the CSV** in Excel / Google Sheets
3. **Edit it** with your own data (or keep the sample)
4. **Drag the CSV file** onto the upload area (or click to browse)
5. **Click "Upload & Analyze"**
6. **Go to ML Insights page** to see the results

**CSV Format (what your file should look like):**

```csv
app_name,window_title,start_time,end_time,duration_seconds,mouse_clicks,key_presses
Visual Studio Code,main.py - project,2026-03-10T09:00:00,2026-03-10T09:45:00,2700,150,800
Google Chrome,GitHub - Pull Request,2026-03-10T09:45:00,2026-03-10T10:15:00,1800,200,300
Microsoft Teams,Sprint Meeting,2026-03-10T10:15:00,2026-03-10T11:00:00,2700,50,100
Google Chrome,YouTube - Music,2026-03-10T11:00:00,2026-03-10T11:15:00,900,30,10
```

**Required columns:** `app_name`, `start_time`, `duration_seconds`
**Optional columns:** `window_title`, `end_time`, `mouse_clicks`, `key_presses`

**Expected Output after upload:**
```
✅ Successfully imported 5 sessions.
Visit the ML Insights page to see your analysis results.
```

---

## 🔄 Complete User Flow (Start to Finish)

```
Step 1: Open https://activity-monitor-seven.vercel.app
            ↓
Step 2: See Dashboard → Check Productivity Score & Burnout Risk
            ↓
Step 3: Click "ML Insights" → See detailed breakdown
        (Which apps = productive, which = distracting)
            ↓
Step 4: Click "Forecast" → See peak hours & burnout warnings
        (When should I work? Am I overworking?)
            ↓
Step 5: Click "Upload Data" → Upload your own CSV
        (Get personalized analysis for your data)
            ↓
Step 6: Go back to Dashboard → See updated stats
```

---

## ❓ Common Questions

| Question | Answer |
|----------|--------|
| Do I need to install anything? | **No.** Just open the link in a browser. |
| Do I need to create an account? | **No.** It works without login. |
| Can I use it on my phone? | **Yes.** The website is responsive. |
| Where does the data come from? | Demo data is pre-loaded. You can also upload your own CSV. |
| Is my data safe? | Yes. Data stays on the server. No data is shared externally. |
| Can multiple people use it? | Yes. Anyone with the link can use it. |
| What browsers work? | Chrome, Edge, Firefox, Safari — all modern browsers. |
