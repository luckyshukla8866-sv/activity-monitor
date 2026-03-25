/**
 * Activity Monitor — Chrome Extension Background Service Worker
 *
 * Tracks active tab URL, title, and time spent.
 * Batches records every 60 seconds and POSTs them to the backend.
 */

const API_URL =
  "https://activity-monitor-qmx3.onrender.com/api/sessions/browser";
const FLUSH_INTERVAL_SECONDS = 60;
const IDLE_THRESHOLD_SECONDS = 120; // 2 min idle → stop counting

// ── State ──────────────────────────────────────────────────────────────

let currentTab = null; // { url, title, startedAt }
let pendingSessions = []; // sessions awaiting flush
let isTracking = true;

// ── Helpers ────────────────────────────────────────────────────────────

function now() {
  return Date.now();
}

/** Close the current tab record and push it to the pending queue. */
function closeCurrentTab() {
  if (!currentTab) return;

  const durationMs = now() - currentTab.startedAt;
  const durationSeconds = Math.round(durationMs / 1000);

  // Only record if > 1 second (ignore sub-second flickers)
  if (durationSeconds > 1) {
    pendingSessions.push({
      url: currentTab.url,
      title: currentTab.title,
      duration_seconds: durationSeconds,
      timestamp: new Date(currentTab.startedAt).toISOString(),
    });
  }

  currentTab = null;
}

/** Start tracking a new tab. */
function startTracking(url, title) {
  if (!isTracking) return;

  // Skip internal Chrome pages
  if (
    !url ||
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url.startsWith("edge://") ||
    url === ""
  ) {
    return;
  }

  currentTab = { url, title: title || "", startedAt: now() };
}

/** Switch from the old tab to a new one. */
function switchTab(url, title) {
  closeCurrentTab();
  startTracking(url, title);
}

// ── Flush: batch POST to backend ───────────────────────────────────────

async function flush() {
  if (pendingSessions.length === 0) return;

  const batch = [...pendingSessions];
  pendingSessions = [];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions: batch }),
    });

    if (!response.ok) {
      // Put them back for retry on non-success
      console.warn(
        `[ActivityMonitor] flush failed (${response.status}), re-queuing ${batch.length} sessions`
      );
      pendingSessions = batch.concat(pendingSessions);
    } else {
      const data = await response.json();
      console.log(
        `[ActivityMonitor] flushed ${data.sessions_created} sessions`
      );
    }
  } catch (err) {
    // Network error — re-queue
    console.warn("[ActivityMonitor] network error, re-queuing:", err.message);
    pendingSessions = batch.concat(pendingSessions);
  }

  // Persist stats
  await updateStats(batch.length);
}

async function updateStats(flushedCount) {
  const data = await chrome.storage.local.get(["totalSent", "lastFlush"]);
  await chrome.storage.local.set({
    totalSent: (data.totalSent || 0) + flushedCount,
    lastFlush: new Date().toISOString(),
    pendingCount: pendingSessions.length,
  });
}

// ── Tab & Window Event Listeners ───────────────────────────────────────

// Tab activated (user switches tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    switchTab(tab.url, tab.title);
  } catch (e) {
    // Tab may have been closed already
  }
});

// Tab updated (page navigated within same tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  // Only care about the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id === tabId) {
      switchTab(tab.url, tab.title);
    }
  });
});

// Window focus changed (switching windows or losing focus)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User left Chrome entirely
    closeCurrentTab();
    return;
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, windowId });
    if (tabs[0]) {
      switchTab(tabs[0].url, tabs[0].title);
    }
  } catch (e) {
    // Window may have been closed
  }
});

// Idle detection — pause tracking when user walks away
chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS);
chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle" || state === "locked") {
    closeCurrentTab();
  } else if (state === "active") {
    // Re-query the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        startTracking(tabs[0].url, tabs[0].title);
      }
    });
  }
});

// ── Alarm-based periodic flush ─────────────────────────────────────────

chrome.alarms.create("flush", { periodInMinutes: FLUSH_INTERVAL_SECONDS / 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "flush") {
    // Close+reopen the current tab record so duration is accurate
    if (currentTab) {
      const { url, title } = currentTab;
      closeCurrentTab();
      startTracking(url, title);
    }
    flush();
  }
});

// ── Message handler (for popup communication) ──────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_STATUS") {
    chrome.storage.local.get(
      ["totalSent", "lastFlush", "pendingCount"],
      (data) => {
        sendResponse({
          isTracking,
          totalSent: data.totalSent || 0,
          lastFlush: data.lastFlush || null,
          pendingCount: pendingSessions.length,
          currentTab: currentTab
            ? { url: currentTab.url, title: currentTab.title }
            : null,
        });
      }
    );
    return true; // indicates async response
  }

  if (msg.type === "TOGGLE_TRACKING") {
    isTracking = !isTracking;
    if (!isTracking) {
      closeCurrentTab();
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) startTracking(tabs[0].url, tabs[0].title);
      });
    }
    sendResponse({ isTracking });
    return true;
  }

  if (msg.type === "FORCE_FLUSH") {
    if (currentTab) {
      const { url, title } = currentTab;
      closeCurrentTab();
      startTracking(url, title);
    }
    flush().then(() => sendResponse({ ok: true }));
    return true;
  }
});

// ── Startup ────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  console.log("[ActivityMonitor] Extension installed / updated");
  chrome.storage.local.set({ totalSent: 0, pendingCount: 0 });
});

// Immediately track the current tab on service worker wake
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    startTracking(tabs[0].url, tabs[0].title);
  }
});
