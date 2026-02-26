// cloud-auth-sync.js
// Firebase Auth (email/password) + Realtime Database sync using REST endpoints.
// Free-tier friendly, no Google Workspace required.

(function () {
  'use strict';

  const SYNC_KEYS = ['labBundlesHMH', 'labPatientBundlesHMH', 'HMH_CLINICAL_SETS_V1'];
  const META_SUFFIX = '__cloud_meta_v1';

  const STORE_KEYS = {
    email: 'cloud_email',
    uid: 'cloud_uid',
    refresh: 'cloud_refresh_token'
  };

  function cfg() {
    return window.CloudConfig || {};
  }

  function isConfigured() {
    const c = cfg();
    return !!(c.firebaseApiKey && c.firebaseProjectId);
  }

  function status(msg) {
    const el = document.getElementById('cloudStatus');
    if (el) el.textContent = msg;
  }

  function toast(msg, type) {
    try { window.showToast?.(msg, type || 'info'); } catch (_) {}
    try { window.AppLog?.info?.('cloud', msg); } catch (_) {}
  }

  function toastErr(msg, err) {
    const full = err?.message ? `${msg}: ${err.message}` : msg;
    try { window.showToast?.(full, 'error'); } catch (_) {}
    try { window.AppLog?.error?.('cloud', full, { err: String(err?.message || err || '') }); } catch (_) {}
  }

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function lsSet(key, val) {
    try {
      if (val === null || typeof val === 'undefined') localStorage.removeItem(key);
      else localStorage.setItem(key, String(val));
    } catch (_) {}
  }

  function localMeta(key) {
    const raw = lsGet(key + META_SUFFIX);
    try {
      const m = JSON.parse(raw || '');
      return (m && typeof m === 'object') ? m : null;
    } catch (_) {
      return null;
    }
  }

  function setLocalMeta(key, meta) {
    try { lsSet(key + META_SUFFIX, JSON.stringify(meta || {})); } catch (_) {}
  }

  function chromeGet(keys) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(keys, (items) => resolve(items || {}));
      } catch (_) {
        resolve({});
      }
    });
  }

  function chromeSet(obj) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set(obj || {}, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  function chromeRemove(keys) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.remove(keys, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  async function authFetchJson(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text || '{}'); } catch (_) { json = { raw: text }; }
    if (!res.ok) {
      const msg = json?.error?.message || json?.error || res.statusText;
      throw new Error(msg);
    }
    return json;
  }

  async function signUp(email, password) {
    const c = cfg();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(c.firebaseApiKey)}`;
    return authFetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
  }

  async function signIn(email, password) {
    const c = cfg();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(c.firebaseApiKey)}`;
    return authFetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
  }

  async function refreshIdToken(refreshToken) {
    const c = cfg();
    const url = `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(c.firebaseApiKey)}`;
    const form = new URLSearchParams();
    form.set('grant_type', 'refresh_token');
    form.set('refresh_token', refreshToken);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error?.message || 'token_refresh_failed');
    }
    return {
      idToken: json.id_token,
      refreshToken: json.refresh_token,
      uid: json.user_id,
      expiresIn: Number(json.expires_in || 3600)
    };
  }

  function rtdbBaseUrl() {
    const c = cfg();
    return `https://${c.firebaseProjectId}-default-rtdb.firebaseio.com`;
  }

  function syncUrl(uid, idToken) {
    return `${rtdbBaseUrl()}/doctors/${encodeURIComponent(uid)}/vinavi-sync.json?auth=${encodeURIComponent(idToken)}`;
  }

  function exportPayload() {
    const keys = {};
    const now = Date.now();
    for (const k of SYNC_KEYS) {
      const raw = lsGet(k);
      const meta = localMeta(k);
      const updatedAt = Number(meta?.updatedAt || 0) || now;
      keys[k] = { updatedAt, raw: raw || '' };
    }
    return {
      schemaVersion: 1,
      updatedAt: now,
      keys
    };
  }

  function applyRemotePayload(payload) {
    if (!payload || typeof payload !== 'object' || !payload.keys) {
      throw new Error('Invalid cloud payload');
    }

    for (const k of SYNC_KEYS) {
      const remote = payload.keys[k];
      if (!remote || typeof remote !== 'object') continue;
      const remoteUpdatedAt = Number(remote.updatedAt || 0);
      const remoteRaw = String(remote.raw ?? '');

      const local = localMeta(k);
      const localUpdatedAt = Number(local?.updatedAt || 0);

      if (!localUpdatedAt || remoteUpdatedAt > localUpdatedAt) {
        lsSet(k, remoteRaw);
        setLocalMeta(k, { updatedAt: remoteUpdatedAt || Date.now() });
      }
    }

    // UI refresh best-effort
    try {
      if (typeof window.loadBundles === 'function') window._labBundles = window.loadBundles();
      if (typeof window.loadPatientBundles === 'function') window._patientBundles = window.loadPatientBundles();
      if (typeof window.renderBundles === 'function') window.renderBundles();
    } catch (_) {}
  }

  // ---- session ----
  let _session = {
    email: '',
    uid: '',
    refreshToken: '',
    idToken: '',
    idTokenExp: 0
  };

  async function loadSession() {
    const items = await chromeGet([STORE_KEYS.email, STORE_KEYS.uid, STORE_KEYS.refresh]);
    _session.email = items[STORE_KEYS.email] || '';
    _session.uid = items[STORE_KEYS.uid] || '';
    _session.refreshToken = items[STORE_KEYS.refresh] || '';
  }

  async function saveSession() {
    await chromeSet({
      [STORE_KEYS.email]: _session.email || '',
      [STORE_KEYS.uid]: _session.uid || '',
      [STORE_KEYS.refresh]: _session.refreshToken || ''
    });
  }

  async function clearSession() {
    _session = { email: '', uid: '', refreshToken: '', idToken: '', idTokenExp: 0 };
    await chromeRemove([STORE_KEYS.email, STORE_KEYS.uid, STORE_KEYS.refresh]);
  }

  async function ensureIdToken() {
    if (!_session.refreshToken) throw new Error('not_signed_in');
    const now = Date.now();
    if (_session.idToken && _session.idTokenExp && now < _session.idTokenExp - 60000) {
      return _session.idToken;
    }

    const tok = await refreshIdToken(_session.refreshToken);
    _session.idToken = tok.idToken;
    _session.refreshToken = tok.refreshToken || _session.refreshToken;
    _session.uid = tok.uid || _session.uid;
    _session.idTokenExp = Date.now() + (tok.expiresIn * 1000);
    await saveSession();
    return _session.idToken;
  }

  async function pullFromCloud() {
    const idToken = await ensureIdToken();
    if (!_session.uid) throw new Error('missing_uid');

    status('Cloud: fetching…');
    window.AppLog?.info?.('cloud', 'Sync pull started');

    const res = await fetch(syncUrl(_session.uid, idToken), { method: 'GET' });
    if (res.status === 404) {
      status('Cloud: no data yet (click Sync Now to upload)');
      return;
    }

    const json = await res.json().catch(() => null);
    if (!json) {
      status('Cloud: fetch failed (invalid response)');
      return;
    }

    applyRemotePayload(json);
    status(`Cloud: loaded (${_session.email || _session.uid})`);
    window.AppLog?.info?.('cloud', 'Sync pull success');
  }

  async function pushToCloud() {
    const idToken = await ensureIdToken();
    if (!_session.uid) throw new Error('missing_uid');

    const payload = exportPayload();
    status('Cloud: saving…');
    window.AppLog?.info?.('cloud', 'Sync push started');

    const res = await fetch(syncUrl(_session.uid, idToken), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`save_failed ${res.status} ${t}`);
    }

    status(`Cloud: saved (${_session.email || _session.uid})`);
    window.AppLog?.info?.('cloud', 'Sync push success');
  }

  // --- debounced pushes ---
  const pending = new Map(); // key -> { raw, updatedAt }
  let timer = null;
  let inFlight = false;

  function schedulePush() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      flushPush().catch(() => {});
    }, 8000);
  }

  async function flushPush() {
    if (inFlight) return;
    if (!_session.refreshToken) return; // not signed in

    inFlight = true;
    try {
      // Update local meta already done, we just push whole payload
      pending.clear();
      await pushToCloud();
    } finally {
      inFlight = false;
    }
  }

  function onLocalChange(key, raw) {
    if (!SYNC_KEYS.includes(key)) return;
    const updatedAt = Date.now();
    setLocalMeta(key, { updatedAt });
    pending.set(key, { raw: String(raw || ''), updatedAt });
    schedulePush();
  }

  // ---- UI wiring ----
  function openModal() {
    const m = document.getElementById('cloudAccountModal');
    if (m) m.classList.remove('hidden');
  }

  function closeModal() {
    const m = document.getElementById('cloudAccountModal');
    if (m) m.classList.add('hidden');
  }

  function setUiSignedIn(signedIn) {
    const outBtn = document.getElementById('cloudSignOut');
    if (outBtn) outBtn.disabled = !signedIn;
    const syncBtn = document.getElementById('cloudSyncNow');
    if (syncBtn) syncBtn.disabled = !signedIn;
  }

  async function updateStatusLine() {
    if (!isConfigured()) {
      status('Cloud: not configured (admin must add Firebase keys)');
      setUiSignedIn(false);
      return;
    }

    await loadSession();
    if (_session.refreshToken) {
      status(`Cloud: signed in as ${_session.email || '(unknown)'}\nTip: click “Sync Now” if you want to force save+fetch.`);
      setUiSignedIn(true);
    } else {
      status('Cloud: signed out');
      setUiSignedIn(false);
    }
  }

  async function doSignIn() {
    if (!isConfigured()) throw new Error('not_configured');

    const email = (document.getElementById('cloudEmail')?.value || '').trim();
    const password = document.getElementById('cloudPassword')?.value || '';
    if (!email || !password) throw new Error('Enter email + password');

    const r = await signIn(email, password);
    _session.email = email;
    _session.uid = r.localId;
    _session.refreshToken = r.refreshToken;
    _session.idToken = r.idToken;
    _session.idTokenExp = Date.now() + (Number(r.expiresIn || 3600) * 1000);
    await saveSession();

    toast(`Cloud signed in: ${email}`, 'success');
    await pullFromCloud().catch(() => {});
    await updateStatusLine();
  }

  async function doSignUp() {
    if (!isConfigured()) throw new Error('not_configured');

    const email = (document.getElementById('cloudEmail')?.value || '').trim();
    const password = document.getElementById('cloudPassword')?.value || '';
    if (!email || !password) throw new Error('Enter email + password');

    const r = await signUp(email, password);
    _session.email = email;
    _session.uid = r.localId;
    _session.refreshToken = r.refreshToken;
    _session.idToken = r.idToken;
    _session.idTokenExp = Date.now() + (Number(r.expiresIn || 3600) * 1000);
    await saveSession();

    toast(`Cloud account created: ${email}`, 'success');
    // First push creates remote record
    await pushToCloud().catch(() => {});
    await updateStatusLine();
  }

  async function doSignOut() {
    await clearSession();
    toast('Cloud signed out', 'info');
    await updateStatusLine();
  }

  async function doSyncNow() {
    await pullFromCloud().catch(() => {});
    await pushToCloud();
    await pullFromCloud().catch(() => {});
  }

  function wireUi() {
    const openBtn = document.getElementById('cloudAccountBtn');
    if (openBtn && !openBtn._wired) {
      openBtn.addEventListener('click', openModal);
      openBtn._wired = true;
    }
    const closeBtn = document.getElementById('cloudAccountClose');
    if (closeBtn && !closeBtn._wired) {
      closeBtn.addEventListener('click', closeModal);
      closeBtn._wired = true;
    }
    const overlay = document.getElementById('cloudAccountOverlay');
    if (overlay && !overlay._wired) {
      overlay.addEventListener('click', closeModal);
      overlay._wired = true;
    }

    const inBtn = document.getElementById('cloudSignIn');
    if (inBtn && !inBtn._wired) {
      inBtn.addEventListener('click', async () => {
        try { await doSignIn(); } catch (e) { toastErr('Sign in failed', e); }
      });
      inBtn._wired = true;
    }

    const upBtn = document.getElementById('cloudSignUp');
    if (upBtn && !upBtn._wired) {
      upBtn.addEventListener('click', async () => {
        try { await doSignUp(); } catch (e) { toastErr('Create account failed', e); }
      });
      upBtn._wired = true;
    }

    const outBtn = document.getElementById('cloudSignOut');
    if (outBtn && !outBtn._wired) {
      outBtn.addEventListener('click', async () => {
        try { await doSignOut(); } catch (e) { toastErr('Sign out failed', e); }
      });
      outBtn._wired = true;
    }

    const syncBtn = document.getElementById('cloudSyncNow');
    if (syncBtn && !syncBtn._wired) {
      syncBtn.addEventListener('click', async () => {
        try { await doSyncNow(); toast('Sync completed', 'success'); } catch (e) { toastErr('Sync failed', e); }
      });
      syncBtn._wired = true;
    }

    updateStatusLine().catch(() => {});
  }

  // Expose API for other modules
  window.CloudSync = {
    isConfigured,
    onLocalChange,
    pull: pullFromCloud,
    push: pushToCloud,
    signOut: doSignOut
  };

  document.addEventListener('DOMContentLoaded', () => {
    wireUi();
  });
})();
