// app-log.js
// Unified activity log for the extension UI (sync events, errors, etc.)

(function () {
  'use strict';

  const LOG_KEY = 'vinaviActivityLogV1';
  const MAX = 800;

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  function load() {
    const raw = localStorage.getItem(LOG_KEY);
    const arr = safeParse(raw || '', []);
    return Array.isArray(arr) ? arr : [];
  }

  function save(arr) {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(arr)); } catch (_) {}
  }

  function add(entry) {
    const list = load();
    list.push(entry);
    if (list.length > MAX) list.splice(0, list.length - MAX);
    save(list);

    // If log view is open, re-render
    try {
      if (document.getElementById('failLogView')?.classList.contains('active')) {
        window.LogView?.render?.();
      }
    } catch (_) {}
  }

  function log(level, source, message, extra) {
    add({
      ts: Date.now(),
      level: level || 'info',
      source: source || 'app',
      message: String(message || ''),
      extra: extra || null
    });
  }

  window.AppLog = {
    key: LOG_KEY,
    load,
    clear: () => save([]),
    info: (source, message, extra) => log('info', source, message, extra),
    warn: (source, message, extra) => log('warn', source, message, extra),
    error: (source, message, extra) => log('error', source, message, extra)
  };
})();
