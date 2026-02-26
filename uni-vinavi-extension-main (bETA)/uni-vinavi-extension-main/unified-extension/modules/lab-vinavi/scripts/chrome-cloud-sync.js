// chrome-cloud-sync.js
// Free cloud sync using Chrome's built-in account sync (chrome.storage.sync).
// No Drive/OAuth setup; data syncs per Chrome profile/account.

(function () {
  'use strict';

  const SYNC_KEYS = [
    'labBundlesHMH',
    'labPatientBundlesHMH',
    'HMH_CLINICAL_SETS_V1'
  ];

  const META_SUFFIX = '__meta';
  const CHUNK_PREFIX = '__c';
  const DEFAULT_CHUNK_SIZE = 7000; // below Chrome sync per-item limits

  function nowMs() { return Date.now(); }

  function safeJsonParse(s, fallback) {
    try { return JSON.parse(s); } catch (_) { return fallback; }
  }

  function getLocalMeta(key) {
    const raw = localStorage.getItem(key + META_SUFFIX);
    const meta = safeJsonParse(raw || '', null);
    return meta && typeof meta === 'object' ? meta : null;
  }

  function setLocalMeta(key, meta) {
    try { localStorage.setItem(key + META_SUFFIX, JSON.stringify(meta || {})); } catch (_) {}
  }

  function getLocalRaw(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function setLocalRaw(key, raw) {
    try {
      if (raw === null || typeof raw === 'undefined') localStorage.removeItem(key);
      else localStorage.setItem(key, raw);
    } catch (_) {}
  }

  function hasChromeSync() {
    try { return !!(chrome?.storage?.sync); } catch (_) { return false; }
  }

  function syncGet(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(keys, (items) => {
          const err = chrome.runtime?.lastError;
          if (err) reject(new Error(err.message || 'chrome.storage.sync.get failed'));
          else resolve(items || {});
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function syncSet(obj) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set(obj, () => {
          const err = chrome.runtime?.lastError;
          if (err) reject(new Error(err.message || 'chrome.storage.sync.set failed'));
          else resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function syncRemove(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.remove(keys, () => {
          const err = chrome.runtime?.lastError;
          if (err) reject(new Error(err.message || 'chrome.storage.sync.remove failed'));
          else resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) chunks.push(str.slice(i, i + size));
    return chunks;
  }

  async function readSyncRaw(key) {
    const metaRaw = (await syncGet([key + META_SUFFIX]))[key + META_SUFFIX];
    const meta = safeJsonParse(metaRaw || '', null);
    if (!meta || typeof meta !== 'object') return { raw: null, meta: null };

    const chunkCount = Number(meta.chunkCount || 0);
    if (!chunkCount) return { raw: null, meta };

    const chunkKeys = [];
    for (let i = 0; i < chunkCount; i++) chunkKeys.push(key + CHUNK_PREFIX + i);

    const chunkItems = await syncGet(chunkKeys);
    let raw = '';
    for (let i = 0; i < chunkCount; i++) {
      raw += String(chunkItems[key + CHUNK_PREFIX + i] || '');
    }

    return { raw, meta };
  }

  async function writeSyncRaw(key, raw, updatedAt) {
    const chunks = chunkString(raw || '', DEFAULT_CHUNK_SIZE);
    const metaKey = key + META_SUFFIX;

    // Remove old chunks if any
    const existingMetaRaw = (await syncGet([metaKey]))[metaKey];
    const existingMeta = safeJsonParse(existingMetaRaw || '', null);
    const existingCount = Number(existingMeta?.chunkCount || 0);

    if (existingCount && existingCount !== chunks.length) {
      const oldKeys = [];
      for (let i = 0; i < existingCount; i++) oldKeys.push(key + CHUNK_PREFIX + i);
      await syncRemove(oldKeys);
    }

    const obj = {};
    for (let i = 0; i < chunks.length; i++) obj[key + CHUNK_PREFIX + i] = chunks[i];

    const meta = {
      updatedAt: updatedAt || nowMs(),
      chunkCount: chunks.length,
      length: (raw || '').length
    };
    obj[metaKey] = JSON.stringify(meta);

    await syncSet(obj);
  }

  // --- Debounced writes ---
  const pending = new Map(); // key -> { raw, updatedAt }
  let flushTimer = null;
  let flushInFlight = false;

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushPending().catch(() => {});
    }, 12000); // keep well under sync write quotas
  }

  async function flushPending() {
    if (!hasChromeSync()) return;
    if (flushInFlight) return;
    flushInFlight = true;

    try {
      // write sequentially to reduce quota spikes
      for (const [key, info] of Array.from(pending.entries())) {
        pending.delete(key);
        await writeSyncRaw(key, info.raw, info.updatedAt);
      }
    } finally {
      flushInFlight = false;
      if (pending.size) scheduleFlush();
    }
  }

  async function bootstrapKey(key) {
    const localRaw = getLocalRaw(key);
    const localMeta = getLocalMeta(key);

    const sync = await readSyncRaw(key);
    const syncRaw = sync.raw;
    const syncMeta = sync.meta;

    const localUpdatedAt = Number(localMeta?.updatedAt || 0);
    const syncUpdatedAt = Number(syncMeta?.updatedAt || 0);

    // If nothing exists anywhere, do nothing
    if (!localRaw && !syncRaw) return;

    // If only local exists -> push to sync
    if (localRaw && !syncRaw) {
      const updatedAt = localUpdatedAt || nowMs();
      setLocalMeta(key, { updatedAt });
      pending.set(key, { raw: localRaw, updatedAt });
      scheduleFlush();
      return;
    }

    // If only sync exists -> pull to local
    if (!localRaw && syncRaw) {
      setLocalRaw(key, syncRaw);
      setLocalMeta(key, { updatedAt: syncUpdatedAt || nowMs() });
      return;
    }

    // Both exist: pick newest by updatedAt (fallback to sync)
    if (localUpdatedAt && syncUpdatedAt) {
      if (localUpdatedAt >= syncUpdatedAt) {
        pending.set(key, { raw: localRaw, updatedAt: localUpdatedAt });
        scheduleFlush();
      } else {
        setLocalRaw(key, syncRaw);
        setLocalMeta(key, { updatedAt: syncUpdatedAt });
      }
      return;
    }

    // If metadata missing, prefer sync as source of truth
    if (syncRaw) {
      setLocalRaw(key, syncRaw);
      setLocalMeta(key, { updatedAt: syncUpdatedAt || nowMs() });
    } else if (localRaw) {
      const updatedAt = localUpdatedAt || nowMs();
      setLocalMeta(key, { updatedAt });
      pending.set(key, { raw: localRaw, updatedAt });
      scheduleFlush();
    }
  }

  let readyResolve;
  let readyReject;
  const readyPromise = new Promise((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });

  async function bootstrap() {
    if (!hasChromeSync()) {
      readyResolve();
      return;
    }

    try {
      for (const key of SYNC_KEYS) {
        await bootstrapKey(key);
      }

      // After pulling, best-effort refresh UI if already running
      try {
        if (typeof window.loadBundles === 'function') window._labBundles = window.loadBundles();
        if (typeof window.loadPatientBundles === 'function') window._patientBundles = window.loadPatientBundles();
        if (typeof window.renderBundles === 'function') window.renderBundles();
      } catch (_) {}

      readyResolve();
    } catch (e) {
      // If sync is unavailable (e.g., user not signed into Chrome), we still operate locally
      console.warn('[ChromeCloudSync] Bootstrap failed:', e);
      readyResolve();
    }
  }

  function onLocalChange(key, raw) {
    if (!hasChromeSync()) return;
    const updatedAt = nowMs();
    setLocalMeta(key, { updatedAt });
    pending.set(key, { raw: String(raw || ''), updatedAt });
    scheduleFlush();
  }

  window.ChromeCloudSync = {
    ready: () => readyPromise,
    onLocalChange
  };

  // Start immediately (don’t wait for DOMContentLoaded)
  bootstrap().catch((e) => {
    console.warn('[ChromeCloudSync] init error:', e);
    try { readyReject(e); } catch (_) {}
  });
})();
