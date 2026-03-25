/**
 * Popup script — communicates with the background service worker
 * to display status and handle user actions.
 */

const $ = (id) => document.getElementById(id);

function timeAgo(isoStr) {
  if (!isoStr) return "never";
  const diff = Math.round((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function refresh() {
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (res) => {
    if (!res) return;

    // Status
    const dot = $("statusDot");
    const text = $("statusText");
    const btn = $("toggleBtn");

    if (res.isTracking) {
      dot.className = "status-dot active";
      text.textContent = "TRACKING";
      btn.textContent = "⏸ Pause";
      btn.classList.remove("paused");
    } else {
      dot.className = "status-dot paused";
      text.textContent = "PAUSED";
      btn.textContent = "▶ Resume";
      btn.classList.add("paused");
    }

    // Stats
    $("totalSent").textContent = res.totalSent.toLocaleString();
    $("pendingCount").textContent = res.pendingCount.toLocaleString();

    // Last flush
    $("lastFlush").textContent = res.lastFlush
      ? `synced ${timeAgo(res.lastFlush)}`
      : "";

    // Current tab
    if (res.currentTab) {
      $("currentTitle").textContent = res.currentTab.title || "Untitled";
      $("currentUrl").textContent = res.currentTab.url;
      $("currentTabCard").style.display = "";
    } else {
      $("currentTabCard").style.display = "none";
    }
  });
}

// Toggle tracking
$("toggleBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_TRACKING" }, () => {
    refresh();
  });
});

// Force flush
$("flushBtn").addEventListener("click", () => {
  $("flushBtn").textContent = "⬆ Sending…";
  $("flushBtn").disabled = true;

  chrome.runtime.sendMessage({ type: "FORCE_FLUSH" }, () => {
    setTimeout(() => {
      $("flushBtn").textContent = "⬆ Send Now";
      $("flushBtn").disabled = false;
      refresh();
    }, 800);
  });
});

// Initial + auto-refresh
refresh();
setInterval(refresh, 3000);
