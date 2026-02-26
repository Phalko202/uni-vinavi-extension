// log-view.js
// Renders unified activity log into the existing failLog table.

(function () {
  'use strict';

  const FAIL_LOG_STORAGE_KEY = 'failedTestLogHMH';

  function safe(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function loadFailed() {
    try {
      const raw = localStorage.getItem(FAIL_LOG_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function clearFailed() {
    try { localStorage.setItem(FAIL_LOG_STORAGE_KEY, JSON.stringify([])); } catch (_) {}
  }

  function loadAppLog() {
    try { return window.AppLog?.load?.() || []; } catch (_) { return []; }
  }

  function clearAppLog() {
    try { window.AppLog?.clear?.(); } catch (_) {}
  }

  function mapFailed(rec) {
    const dt = new Date(rec.ts || Date.now());
    return {
      ts: rec.ts || Date.now(),
      time: dt.toLocaleString(),
      episode: rec.episode || '-',
      type: rec.itemType || 'Failed Push',
      name: rec.testName || '-',
      asnd: rec.asnd || '-',
      vinaviId: rec.vinaviId || '-',
      reason: rec.reason || 'Unknown error'
    };
  }

  function mapApp(rec) {
    const dt = new Date(rec.ts || Date.now());
    const lvl = (rec.level || 'info').toUpperCase();
    const src = rec.source || 'app';
    return {
      ts: rec.ts || Date.now(),
      time: dt.toLocaleString(),
      episode: '-',
      type: `LOG/${lvl}`,
      name: src,
      asnd: '-',
      vinaviId: '-',
      reason: rec.message || ''
    };
  }

  function render() {
    const body = document.getElementById('failLogBody');
    if (!body) return;

    const failed = loadFailed().map(mapFailed);
    const app = loadAppLog().map(mapApp);

    const all = failed.concat(app).sort((a, b) => (b.ts || 0) - (a.ts || 0));

    if (all.length === 0) {
      body.innerHTML = '<tr class="empty-row"><td colspan="7">No log entries yet.</td></tr>';
      return;
    }

    body.innerHTML = all.map(r => (
      `<tr>
        <td>${safe(r.time)}</td>
        <td>${safe(r.episode)}</td>
        <td>${safe(r.type)}</td>
        <td>${safe(r.name)}</td>
        <td>${safe(r.asnd)}</td>
        <td>${safe(r.vinaviId)}</td>
        <td>${safe(r.reason)}</td>
      </tr>`
    )).join('');
  }

  function wireControls() {
    const refresh = document.getElementById('refreshFailLog');
    if (refresh && !refresh._wiredLogs) {
      refresh.addEventListener('click', render);
      refresh._wiredLogs = true;
    }

    const clear = document.getElementById('clearFailLog');
    if (clear && !clear._wiredLogs) {
      clear.addEventListener('click', () => {
        if (!confirm('Clear all log entries (failed pushes + cloud sync logs)?')) return;
        clearFailed();
        clearAppLog();
        render();
        try { window.showToast?.('Logs cleared', 'info'); } catch (_) {}
      });
      clear._wiredLogs = true;
    }
  }

  window.LogView = { render };

  document.addEventListener('DOMContentLoaded', () => {
    wireControls();
  });
})();
