// drive-sync.js
// Google Drive sync for doctor-specific local data (lab bundles, patient bundles, clinical sets)
// Stores a single JSON file inside a Drive folder created by this extension.

(function () {
  'use strict';

  const DRIVE_FOLDER_NAME = 'Vinavi Extension Sync';
  const DRIVE_FILE_NAME = 'vinavi-sync.json';

  const SYNC_KEYS = [
    'labBundlesHMH',
    'labPatientBundlesHMH',
    'HMH_CLINICAL_SETS_V1'
  ];

  const STORAGE = {
    folderId: 'drive_sync_folder_id',
    fileId: 'drive_sync_file_id',
    email: 'drive_sync_user_email'
  };

  function toast(msg, type) {
    try {
      if (typeof window.showToast === 'function') {
        window.showToast(msg, type || 'info');
        return;
      }
    } catch (_) {}
    // Fallback
    console.log('[DriveSync]', msg);
  }

  function getExtensionId() {
    try { return chrome?.runtime?.id || ''; } catch (_) { return ''; }
  }

  function getOauthClientId() {
    try {
      const mf = chrome?.runtime?.getManifest?.();
      const clientId = mf?.oauth2?.client_id || '';
      return String(clientId || '');
    } catch (_) {
      return '';
    }
  }

  function isOauthClientConfigured() {
    const clientId = getOauthClientId();
    if (!clientId) return false;
    if (clientId.includes('REPLACE_WITH_YOUR_GOOGLE_OAUTH_CLIENT_ID')) return false;
    if (!clientId.includes('.apps.googleusercontent.com')) return false;
    return true;
  }

  function chromeStorageGet(keys) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(keys, (items) => resolve(items || {}));
      } catch (_) {
        resolve({});
      }
    });
  }

  function chromeStorageSet(obj) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set(obj || {}, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  function getAuthToken(interactive) {
    return new Promise((resolve, reject) => {
      if (!chrome?.identity?.getAuthToken) {
        reject(new Error('chrome.identity is not available (missing permission or unsupported context)'));
        return;
      }
      chrome.identity.getAuthToken({ interactive: !!interactive }, (token) => {
        const err = chrome.runtime?.lastError;
        if (err || !token) {
          reject(new Error(err?.message || 'Failed to get auth token'));
          return;
        }
        resolve(token);
      });
    });
  }

  async function apiFetch(url, token, options) {
    const res = await fetch(url, {
      ...(options || {}),
      headers: {
        ...(options?.headers || {}),
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      let details = '';
      try { details = await res.text(); } catch (_) {}
      throw new Error(`Google API error ${res.status}: ${details || res.statusText}`);
    }

    return res;
  }

  async function fetchUserEmail(token) {
    const res = await apiFetch('https://www.googleapis.com/oauth2/v2/userinfo', token);
    const json = await res.json();
    return json?.email || '';
  }

  function exportLocalData() {
    const data = {};
    for (const key of SYNC_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        data[key] = null;
        continue;
      }
      try {
        data[key] = JSON.parse(raw);
      } catch (_) {
        // Unexpected non-JSON; store as string
        data[key] = raw;
      }
    }

    return {
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      data
    };
  }

  function importLocalData(payload) {
    if (!payload || typeof payload !== 'object' || !payload.data) {
      throw new Error('Invalid sync file format');
    }

    for (const key of SYNC_KEYS) {
      if (!(key in payload.data)) continue;
      const val = payload.data[key];
      if (val === null || typeof val === 'undefined') {
        localStorage.removeItem(key);
      } else if (typeof val === 'string') {
        // If file stored raw string, keep it as-is
        localStorage.setItem(key, val);
      } else {
        localStorage.setItem(key, JSON.stringify(val));
      }
    }

    // Best-effort UI refresh
    try {
      if (typeof window.loadBundles === 'function') window._labBundles = window.loadBundles();
      if (typeof window.loadPatientBundles === 'function') window._patientBundles = window.loadPatientBundles();
      if (typeof window.renderBundles === 'function') window.renderBundles();
    } catch (_) {}
  }

  async function driveCreateFolder(token) {
    const metadata = {
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const res = await apiFetch('https://www.googleapis.com/drive/v3/files?fields=id', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(metadata)
    });

    const json = await res.json();
    if (!json?.id) throw new Error('Drive folder creation failed');
    return json.id;
  }

  async function driveCreateFileMultipart(token, folderId, contentJsonString) {
    const boundary = '----vinaviDriveSyncBoundary' + Math.random().toString(16).slice(2);
    const metadata = {
      name: DRIVE_FILE_NAME,
      mimeType: 'application/json',
      parents: folderId ? [folderId] : undefined
    };

    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${contentJsonString}\r\n` +
      `--${boundary}--`;

    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
    const res = await apiFetch(url, token, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: multipartBody
    });

    const json = await res.json();
    if (!json?.id) throw new Error('Drive file creation failed');
    return json.id;
  }

  async function driveUpdateFileMedia(token, fileId, contentJsonString) {
    const url = `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`;
    await apiFetch(url, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: contentJsonString
    });
  }

  async function driveDownloadFile(token, fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
    const res = await apiFetch(url, token);
    return await res.json();
  }

  async function ensureDriveTargets(token) {
    const stored = await chromeStorageGet([STORAGE.folderId, STORAGE.fileId]);
    let folderId = stored[STORAGE.folderId] || '';
    let fileId = stored[STORAGE.fileId] || '';

    if (!folderId) {
      toast('Creating Drive sync folder…');
      folderId = await driveCreateFolder(token);
      await chromeStorageSet({ [STORAGE.folderId]: folderId });
    }

    return { folderId, fileId };
  }

  async function signIn(interactive) {
    if (!isOauthClientConfigured()) {
      const extId = getExtensionId();
      throw new Error(
        'Google Drive sync is not configured yet. Set oauth2.client_id in manifest.json first. ' +
        (extId ? ('Your Extension ID is: ' + extId) : '')
      );
    }
    const token = await getAuthToken(!!interactive);
    let email = '';
    try {
      email = await fetchUserEmail(token);
    } catch (e) {
      console.warn('[DriveSync] Could not fetch user email:', e);
    }

    if (email) {
      await chromeStorageSet({ [STORAGE.email]: email });
    }

    return { token, email };
  }

  function setControlsEnabled(enabled) {
    const pullBtn = document.getElementById('drivePullBtn');
    const pushBtn = document.getElementById('drivePushBtn');
    if (pullBtn) pullBtn.disabled = !enabled;
    if (pushBtn) pushBtn.disabled = !enabled;
  }

  async function refreshUiFromStorage() {
    const emailEl = document.getElementById('driveUserEmail');
    const stored = await chromeStorageGet([STORAGE.email]);
    const email = stored[STORAGE.email] || '';
    if (emailEl) {
      const extId = getExtensionId();
      const base = email ? `Drive: ${email}` : 'Drive: not signed in';
      emailEl.textContent = extId ? `${base} (ExtID: ${extId})` : base;
      emailEl.title = extId ? `Extension ID: ${extId}` : '';
    }
  }

  async function doPull() {
    const { token } = await signIn(false).catch(() => signIn(true));
    const { folderId, fileId: storedFileId } = await ensureDriveTargets(token);

    let fileId = storedFileId;
    if (!fileId) {
      throw new Error('No sync file found yet. Click Save first on one computer.');
    }

    toast('Loading from Drive…');
    const payload = await driveDownloadFile(token, fileId);
    importLocalData(payload);
    toast('Loaded from Drive', 'success');
  }

  async function doPush() {
    const { token } = await signIn(false).catch(() => signIn(true));
    const { folderId, fileId: storedFileId } = await ensureDriveTargets(token);

    const payload = exportLocalData();
    const content = JSON.stringify(payload, null, 2);

    let fileId = storedFileId;

    toast('Saving to Drive…');
    if (!fileId) {
      fileId = await driveCreateFileMultipart(token, folderId, content);
      await chromeStorageSet({ [STORAGE.fileId]: fileId });
    } else {
      await driveUpdateFileMedia(token, fileId, content);
    }

    toast('Saved to Drive', 'success');
  }

  async function wireUi() {
    const signInBtn = document.getElementById('driveSignInBtn');
    const pullBtn = document.getElementById('drivePullBtn');
    const pushBtn = document.getElementById('drivePushBtn');

    if (!signInBtn || !pullBtn || !pushBtn) return;

    // Disable if OAuth client isn't configured
    const configured = isOauthClientConfigured();
    setControlsEnabled(configured);
    if (!configured) {
      const extId = getExtensionId();
      toast('Drive sync needs Google OAuth setup. ' + (extId ? ('Extension ID: ' + extId) : ''), 'error');
    }

    signInBtn.addEventListener('click', async () => {
      try {
        const { email } = await signIn(true);
        if (email) {
          toast(`Signed in: ${email}`, 'success');
        } else {
          toast('Signed in', 'success');
        }
        await refreshUiFromStorage();
      } catch (e) {
        toast('Google sign-in failed: ' + e.message, 'error');
      }
    });

    pullBtn.addEventListener('click', async () => {
      try {
        await doPull();
      } catch (e) {
        toast('Load failed: ' + e.message, 'error');
      }
    });

    pushBtn.addEventListener('click', async () => {
      try {
        await doPush();
      } catch (e) {
        toast('Save failed: ' + e.message, 'error');
      }
    });

    // Best-effort: show remembered email
    await refreshUiFromStorage();
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireUi().catch((e) => console.warn('[DriveSync] init failed', e));
  });
})();
