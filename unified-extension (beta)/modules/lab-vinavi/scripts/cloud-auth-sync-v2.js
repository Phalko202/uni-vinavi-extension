// cloud-auth-sync-v2.js
// Modern Email/Password Firebase Cloud Sync for HMH Vinavi Extension
// Syncs both Lab Dashboard bundles + QuickText templates to Firebase Realtime Database
// Firebase path: /doctors/{uid}/vinavi-sync.json

(function () {
  'use strict';

  // localStorage keys (Lab Dashboard bundles + clinical sets)
  const LS_KEYS = ['labBundlesHMH', 'labPatientBundlesHMH', 'HMH_CLINICAL_SETS_V1'];
  
  // chrome.storage.local keys (QuickText templates)
  const CHROME_KEYS = ['customTemplates', 'vinavi_doctor_name', 'vinavi_doctor_code', 'vinavi_doctor_specialty'];

  // Keys that should be applied from cloud even if the value is an empty string
  // (useful for overrides where the user might clear a previously saved value)
  const CHROME_KEYS_ALLOW_EMPTY = ['vinavi_doctor_name', 'vinavi_doctor_code', 'vinavi_doctor_specialty'];
  const META_SUFFIX = '__cloud_meta_v1';

  const META_KEY = `cloud${META_SUFFIX}`;

  const STORE_KEYS = {
    email: 'cloud_email',
    uid: 'cloud_uid',
    refresh: 'cloud_refresh_token',
    method: 'cloud_auth_method', // 'google' or 'email'
    googleToken: 'cloud_google_token'
  };

  let debounceTimer = null;

  // =============================================
  // HELPERS
  // =============================================

  function cfg() {
    return window.CloudConfig || {};
  }

  function isConfigured() {
    const c = cfg();
    return !!(c.firebaseApiKey && c.firebaseProjectId);
  }

  function setStatus(msg) {
    const el = document.getElementById('cloudStatusText');
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

  async function getMeta() {
    const items = await chromeGet([META_KEY]);
    const meta = items?.[META_KEY];
    return (meta && typeof meta === 'object') ? meta : {};
  }

  async function setMeta(patch) {
    const current = await getMeta();
    await chromeSet({ [META_KEY]: { ...current, ...(patch || {}) } });
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

  async function chromeGet(keys) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(keys, (items) => resolve(items || {}));
      } catch (_) {
        resolve({});
      }
    });
  }

  async function chromeSet(obj) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set(obj || {}, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  async function chromeRemove(keys) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.remove(keys, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  // =============================================
  // GOOGLE OAUTH VIA CHROME.IDENTITY
  // =============================================

  async function signInWithGoogle() {
    const c = cfg();
    if (!c.googleClientId) {
      throw new Error('Google Client ID not configured. Admin must add it to cloud-config.js');
    }

    return new Promise((resolve, reject) => {
      try {
        const redirectURL = chrome.identity.getRedirectURL();
        const clientId = c.googleClientId;
        const scopes = ['email', 'profile'];
        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(clientId)}&response_type=token&redirect_uri=${encodeURIComponent(redirectURL)}&scope=${encodeURIComponent(scopes.join(' '))}`;

        chrome.identity.launchWebAuthFlow(
          {
            url: authUrl,
            interactive: true
          },
          (redirectUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            if (!redirectUrl) {
              reject(new Error('Sign-in cancelled'));
              return;
            }

            // Parse access token from redirect URL
            const match = redirectUrl.match(/access_token=([^&]+)/);
            if (!match) {
              reject(new Error('Failed to get access token'));
              return;
            }

            const accessToken = match[1];
            resolve({ accessToken });
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  async function exchangeGoogleTokenForFirebase(googleAccessToken) {
    const c = cfg();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${encodeURIComponent(c.firebaseApiKey)}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postBody: `access_token=${googleAccessToken}&providerId=google.com`,
        requestUri: 'http://localhost',
        returnIdpCredential: true,
        returnSecureToken: true
      })
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text || '{}'); } catch (_) { json = { raw: text }; }
    
    if (!res.ok) {
      const msg = json?.error?.message || json?.error || res.statusText;
      throw new Error(msg);
    }

    return json;
  }

  // =============================================
  // EMAIL/PASSWORD AUTH (FIREBASE)
  // =============================================
  
  async function signUp(email, password) {
    const c = cfg();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(c.firebaseApiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text || '{}'); } catch (_) { json = { raw: text }; }
    if (!res.ok) {
      const msg = json?.error?.message || json?.error || res.statusText;
      throw new Error(msg);
    }
    return json;
  }

  async function signIn(email, password) {
    const c = cfg();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(c.firebaseApiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text || '{}'); } catch (_) { json = { raw: text }; }
    if (!res.ok) {
      const msg = json?.error?.message || json?.error || res.statusText;
      throw new Error(msg);
    }
    return json;
  }

  async function sendPasswordReset(email) {
    const c = cfg();
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(c.firebaseApiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email })
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text || '{}'); } catch (_) { json = { raw: text }; }
    if (!res.ok) {
      const msg = json?.error?.message || json?.error || res.statusText;
      throw new Error(msg);
    }
    return json;
  }

  async function refreshIdToken(refreshToken) {
    const c = cfg();
    const url = `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(c.firebaseApiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken })
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text || '{}'); } catch (_) { json = { raw: text }; }
    if (!res.ok) {
      const msg = json?.error?.message || json?.error || res.statusText;
      throw new Error(msg);
    }
    return json;
  }

  // =============================================
  // FIREBASE RTDB SYNC
  // =============================================

  function normalizeDbBaseUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return withProto.replace(/\/+$/, '');
  }

  function computeDbBaseUrlCandidates(meta) {
    const c = cfg();
    const candidates = [];

    const pushUnique = (u) => {
      const nu = normalizeDbBaseUrl(u);
      if (!nu) return;
      if (!candidates.includes(nu)) candidates.push(nu);
    };

    // Prefer last known-good URL
    pushUnique(meta?.rtdbBaseUrl);

    // Configured URL
    pushUnique(c.firebaseDatabaseUrl);

    // If config is regionless *.firebasedatabase.app, also try *.firebaseio.com
    try {
      const base = normalizeDbBaseUrl(c.firebaseDatabaseUrl);
      if (base) {
        const u = new URL(base);
        const parts = (u.hostname || '').split('.');
        const isFirebasedatabaseApp = parts.length >= 3 && parts.slice(-2).join('.') === 'app' && parts.slice(-3).join('.') === 'firebasedatabase.app';
        const isRegionless = isFirebasedatabaseApp && parts.length === 3;
        if (isRegionless) {
          const instance = parts[0];
          pushUnique(`https://${instance}.firebaseio.com`);
        }
      }
    } catch (_) {}

    // Common fallbacks based on project id
    if (c.firebaseProjectId) {
      pushUnique(`https://${c.firebaseProjectId}-default-rtdb.firebaseio.com`);
      pushUnique(`https://${c.firebaseProjectId}.firebaseio.com`);
    }

    return candidates;
  }

  function formatTriedCandidates(candidates) {
    try {
      const list = (candidates || []).filter(Boolean);
      if (list.length === 0) return '';
      const max = 4;
      const shown = list.slice(0, max);
      const more = list.length > max ? ` (+${list.length - max} more)` : '';
      return `Tried: ${shown.join(' | ')}${more}`;
    } catch (_) {
      return '';
    }
  }

  async function fetchWithText(res) {
    const text = await res.text();
    return text;
  }

  async function tryRtdbRequest(baseUrl, idToken, uid, { method, body }) {
    const dbUrl = `${baseUrl}/doctors/${uid}/vinavi-sync.json?auth=${encodeURIComponent(idToken)}`;
    console.log('Cloud RTDB URL:', dbUrl);
    const res = await fetch(dbUrl, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    return { res, dbUrl };
  }

  async function pullFromCloud(idToken, uid) {
    const meta = await getMeta();
    const candidates = computeDbBaseUrlCandidates(meta);
    if (candidates.length === 0) throw new Error('Cloud database URL not configured');

    let last404 = null;
    for (const baseUrl of candidates) {
      const { res } = await tryRtdbRequest(baseUrl, idToken, uid, { method: 'GET' });

      // In Firebase RTDB REST, missing data is typically 200 with null.
      // A 404 usually means the database host/instance URL is wrong.
      if (res.status === 404) {
        last404 = await fetchWithText(res);
        continue;
      }
      if (!res.ok) {
        const text = await fetchWithText(res);
        throw new Error(`Pull failed (${res.status} ${res.statusText}): ${text}`);
      }

      await setMeta({ rtdbBaseUrl: baseUrl });
      const data = await res.json();
      return data || null;
    }

    const hint = 'This usually means the Realtime Database instance URL is wrong OR RTDB is not created/enabled for this Firebase project.';
    const tried = formatTriedCandidates(candidates);
    throw new Error(
      `Pull failed (404 Not Found). Check firebaseDatabaseUrl in cloud-config.js. ${hint}` +
      (tried ? ` ${tried}` : '') +
      (last404 ? ` Response: ${String(last404).slice(0, 160)}` : '')
    );
  }

  async function pushToCloud(idToken, uid, payload) {
    const meta = await getMeta();
    const candidates = computeDbBaseUrlCandidates(meta);
    if (candidates.length === 0) throw new Error('Cloud database URL not configured');

    let last404 = null;
    for (const baseUrl of candidates) {
      const { res } = await tryRtdbRequest(baseUrl, idToken, uid, { method: 'PUT', body: payload });
      if (res.status === 404) {
        last404 = await fetchWithText(res);
        continue;
      }
      if (!res.ok) {
        const text = await fetchWithText(res);
        throw new Error(`Push failed (${res.status} ${res.statusText}): ${text}`);
      }

      await setMeta({ rtdbBaseUrl: baseUrl });
      return await res.json();
    }

    const hint = 'This usually means the Realtime Database instance URL is wrong OR RTDB is not created/enabled for this Firebase project.';
    const tried = formatTriedCandidates(candidates);
    throw new Error(
      `Push failed (404 Not Found). Check firebaseDatabaseUrl in cloud-config.js. ${hint}` +
      (tried ? ` ${tried}` : '') +
      (last404 ? ` Response: ${String(last404).slice(0, 160)}` : '')
    );
  }

  // =============================================
  // SESSION MANAGEMENT
  // =============================================

  async function getCurrentSession() {
    const stored = await chromeGet([STORE_KEYS.uid, STORE_KEYS.email, STORE_KEYS.refresh, STORE_KEYS.method]);
    if (!stored[STORE_KEYS.uid] || !stored[STORE_KEYS.refresh]) return null;
    return {
      uid: stored[STORE_KEYS.uid],
      email: stored[STORE_KEYS.email],
      refreshToken: stored[STORE_KEYS.refresh],
      method: stored[STORE_KEYS.method] || 'email'
    };
  }

  async function storeSession(uid, email, refreshToken, method) {
    await chromeSet({
      [STORE_KEYS.uid]: uid,
      [STORE_KEYS.email]: email,
      [STORE_KEYS.refresh]: refreshToken,
      [STORE_KEYS.method]: method
    });
  }

  async function clearSession() {
    await chromeRemove([STORE_KEYS.uid, STORE_KEYS.email, STORE_KEYS.refresh, STORE_KEYS.method, STORE_KEYS.googleToken]);
  }

  // =============================================
  // UI CONTROL
  // =============================================

  function showEmailForm() {
    const emailForm = document.getElementById('cloudEmailForm');
    const signinArea = document.getElementById('cloudSigninArea');
    if (emailForm) emailForm.classList.remove('hidden');
    if (signinArea) signinArea.classList.add('hidden');
  }

  function hideEmailForm() {
    const emailForm = document.getElementById('cloudEmailForm');
    const signinArea = document.getElementById('cloudSigninArea');
    if (emailForm) emailForm.classList.add('hidden');
    if (signinArea) signinArea.classList.remove('hidden');
  }

  function showQuickActions() {
    const actions = document.getElementById('cloudQuickActions');
    if (actions) actions.classList.remove('hidden');
  }

  function hideQuickActions() {
    const actions = document.getElementById('cloudQuickActions');
    if (actions) actions.classList.add('hidden');
  }

  function openModal() {
    const m = document.getElementById('cloudAccountModal');
    if (m) m.classList.remove('hidden');
  }

  function closeModal() {
    const m = document.getElementById('cloudAccountModal');
    if (m) m.classList.add('hidden');
  }

  function showSignUpWindow() {
    const signUpWin = document.getElementById('cloudSignUpWindow');
    const resetWin = document.getElementById('cloudResetWindow');
    const resetSentWin = document.getElementById('cloudResetSentWindow');
    const emailForm = document.getElementById('cloudEmailForm');
    const userDisplay = document.getElementById('cloudUserDisplay');
    if (userDisplay) userDisplay.classList.add('hidden');
    if (emailForm) emailForm.classList.add('hidden');
    if (resetWin) resetWin.classList.add('hidden');
    if (resetSentWin) resetSentWin.classList.add('hidden');
    if (signUpWin) signUpWin.classList.remove('hidden');

    const email = document.getElementById('cloudSignUpEmail');
    setTimeout(() => { try { email?.focus?.(); } catch (_) {} }, 0);
  }

  function hideSignUpWindow() {
    const signUpWin = document.getElementById('cloudSignUpWindow');
    const emailForm = document.getElementById('cloudEmailForm');
    const userDisplay = document.getElementById('cloudUserDisplay');
    if (signUpWin) signUpWin.classList.add('hidden');
    const signedIn = !!(userDisplay && !userDisplay.classList.contains('hidden'));
    if (emailForm && !signedIn) emailForm.classList.remove('hidden');
  }

  function showResetWindow(prefillEmail) {
    const resetWin = document.getElementById('cloudResetWindow');
    const resetSentWin = document.getElementById('cloudResetSentWindow');
    const signUpWin = document.getElementById('cloudSignUpWindow');
    const emailForm = document.getElementById('cloudEmailForm');
    const userDisplay = document.getElementById('cloudUserDisplay');

    if (userDisplay) userDisplay.classList.add('hidden');
    if (emailForm) emailForm.classList.add('hidden');
    if (signUpWin) signUpWin.classList.add('hidden');
    if (resetSentWin) resetSentWin.classList.add('hidden');
    if (resetWin) resetWin.classList.remove('hidden');

    const emailInput = document.getElementById('cloudResetEmail');
    if (emailInput && typeof prefillEmail === 'string' && prefillEmail.trim()) {
      emailInput.value = prefillEmail.trim();
    }
    setTimeout(() => { try { emailInput?.focus?.(); } catch (_) {} }, 0);
  }

  function hideResetWindow() {
    const resetWin = document.getElementById('cloudResetWindow');
    const resetSentWin = document.getElementById('cloudResetSentWindow');
    const emailForm = document.getElementById('cloudEmailForm');
    const userDisplay = document.getElementById('cloudUserDisplay');

    if (resetWin) resetWin.classList.add('hidden');
    if (resetSentWin) resetSentWin.classList.add('hidden');

    const signedIn = !!(userDisplay && !userDisplay.classList.contains('hidden'));
    if (emailForm && !signedIn) emailForm.classList.remove('hidden');
  }

  function showResetSentWindow() {
    const resetWin = document.getElementById('cloudResetWindow');
    const resetSentWin = document.getElementById('cloudResetSentWindow');
    if (resetWin) resetWin.classList.add('hidden');
    if (resetSentWin) resetSentWin.classList.remove('hidden');
  }

  function wirePasswordToggle(toggleId, inputId) {
    const btn = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!btn || !input || btn._wired) return;

    const syncButtonState = () => {
      const nowHidden = input.type === 'password';
      btn.classList.toggle('is-hidden', nowHidden);
      const label = nowHidden ? 'Show password' : 'Hide password';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    };

    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      syncButtonState();
    });

    // Initialize correct icon state on load
    syncButtonState();
    btn._wired = true;
  }

  // =============================================
  // AUTH ACTIONS
  // =============================================

  async function handleGoogleSignIn() {
    if (!isConfigured()) {
      toast('Cloud not configured. Admin must set up Firebase & Google OAuth.', 'error');
      return;
    }

    try {
      setStatus('Opening Google Sign-In...');
      const { accessToken } = await signInWithGoogle();
      
      setStatus('Authenticating with Firebase...');
      const authData = await exchangeGoogleTokenForFirebase(accessToken);

      const uid = authData.localId;
      const email = authData.email || 'google-user';
      const refreshToken = authData.refreshToken;

      await storeSession(uid, email, refreshToken, 'google');
      setStatus(`Signed in as ${email}`);
      toast(`Signed in via Google: ${email}`, 'success');
      showQuickActions();

      // Auto-pull
      try {
        await handlePull();
      } catch (pullErr) {
        console.warn('Auto-pull after sign-in failed:', pullErr);
      }

    } catch (err) {
      toastErr('Google Sign-In failed', err);
      setStatus('Sign-in failed');
    }
  }

  async function handleEmailSignIn() {
    const emailInput = document.getElementById('cloudEmail');
    const passwordInput = document.getElementById('cloudPassword');
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      toast('Please enter email and password', 'error');
      return;
    }

    if (!isConfigured()) {
      toast('Cloud not configured.', 'error');
      return;
    }

    try {
      setStatus('Signing in...');
      const authData = await signIn(email, password);
      const uid = authData.localId;
      const refreshToken = authData.refreshToken;

      await storeSession(uid, email, refreshToken, 'email');
      setStatus(`Signed in as ${email}`);
      toast(`Signed in: ${email}`, 'success');
      updateUIForSignedIn(email);

      // Ensure we are not stuck on sign-up window
      try { hideSignUpWindow(); } catch (_) {}

      // Auto-pull
      try {
        const pulled = await handlePull();
        // If cloud empty, push local state up once
        if (!pulled) {
          await handlePush();
        }
      } catch (pullErr) {
        console.warn('Auto-pull failed:', pullErr);
      }

    } catch (err) {
      toastErr('Email sign-in failed', err);
      setStatus('Sign-in failed');
    }
  }

  async function handleEmailSignUpFromWindow() {
    const emailInput = document.getElementById('cloudSignUpEmail');
    const passwordInput = document.getElementById('cloudSignUpPassword');
    const confirmInput = document.getElementById('cloudSignUpPasswordConfirm');
    if (!emailInput || !passwordInput || !confirmInput) return;

    const email = (emailInput.value || '').trim();
    const password = passwordInput.value || '';
    const confirm = confirmInput.value || '';

    if (!email || !password || !confirm) {
      toast('Please fill in all fields', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirm) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (!isConfigured()) {
      toast('Cloud not configured.', 'error');
      return;
    }

    try {
      setStatus('Creating account...');
      const authData = await signUp(email, password);
      const uid = authData.localId;
      const refreshToken = authData.refreshToken;

      await storeSession(uid, email, refreshToken, 'email');
      setStatus(`Account created: ${email}`);
      toast(`Account created: ${email}`, 'success');
      updateUIForSignedIn(email);

      // First-time accounts likely have no cloud data yet; push local state
      try {
        await handlePush();
      } catch (_) {}

      // Go back to normal modal view
      hideSignUpWindow();
    } catch (err) {
      toastErr('Account creation failed', err);
      setStatus('Sign-up failed');
    }
  }

  async function handleForgotPassword() {
    // Open a dedicated window to enter email (as requested)
    const signInEmail = document.getElementById('cloudEmail');
    const prefill = (signInEmail?.value || '').trim();
    showResetWindow(prefill);
  }

  async function handleSendResetFromWindow() {
    const emailInput = document.getElementById('cloudResetEmail');
    const email = (emailInput?.value || '').trim();

    if (!email) {
      toast('Please type your email', 'error');
      return;
    }
    if (!isConfigured()) {
      toast('Cloud not configured.', 'error');
      return;
    }

    try {
      setStatus('Sending reset email...');
      await sendPasswordReset(email);
      setStatus('Reset email sent');
      showResetSentWindow();
      toast('Reset email sent. Check your inbox.', 'success');
    } catch (err) {
      toastErr('Password reset failed', err);
      setStatus('Reset failed');
    }
  }

  async function handleSignOut() {
    await clearSession();
    setStatus('Not signed in');
    toast('Signed out', 'info');
    updateUIForSignedOut();
  }

  async function handlePull() {
    const session = await getCurrentSession();
    if (!session) {
      toast('Not signed in', 'error');
      return;
    }

    try {
      setStatus('Fetching from cloud...');
      const freshData = await refreshIdToken(session.refreshToken);
      const idToken = freshData.id_token;

      const cloudData = await pullFromCloud(idToken, session.uid);
      if (!cloudData) {
        setStatus('No cloud data found');
        toast('No data in cloud yet', 'info');
        await setMeta({ lastPullAt: Date.now() });
        return 0;
      }

      let appliedCount = 0;
      
      // Apply localStorage keys (Lab bundles)
      for (const key of LS_KEYS) {
        const cloudValue = cloudData[key];
        if (cloudValue) {
          lsSet(key, cloudValue);
          appliedCount++;
        }
      }
      
      // Apply chrome.storage.local keys (QuickText templates)
      const chromeData = {};
      for (const key of CHROME_KEYS) {
        const hasKey = Object.prototype.hasOwnProperty.call(cloudData, key);
        if (!hasKey) continue;

        const cloudValue = cloudData[key];
        const shouldApply = CHROME_KEYS_ALLOW_EMPTY.includes(key)
          ? (cloudValue !== null && typeof cloudValue !== 'undefined')
          : !!cloudValue;

        if (shouldApply) {
          // Back-compat: older pushes stored JSON as a string
          if (typeof cloudValue === 'string') {
            const trimmed = cloudValue.trim();
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
              try {
                chromeData[key] = JSON.parse(trimmed);
              } catch (_) {
                chromeData[key] = cloudValue;
              }
            } else {
              chromeData[key] = cloudValue;
            }
          } else {
            chromeData[key] = cloudValue;
          }
          appliedCount++;
        }
      }
      if (Object.keys(chromeData).length > 0) {
        await chromeSet(chromeData);
      }

      setStatus(`Pulled ${appliedCount} items from cloud`);
      toast(`Synced ${appliedCount} items from cloud`, 'success');

      await setMeta({ lastPullAt: Date.now() });

      // Refresh UI if on Bundles/Sets view
      if (typeof window.renderBundles === 'function') window.renderBundles();

      return appliedCount;

    } catch (err) {
      toastErr('Pull failed', err);
      setStatus('Pull failed');
      return 0;
    }
  }

  async function handlePush() {
    const session = await getCurrentSession();
    if (!session) {
      toast('Not signed in', 'error');
      return;
    }

    try {
      setStatus('Saving to cloud...');
      const freshData = await refreshIdToken(session.refreshToken);
      const idToken = freshData.id_token;

      const payload = { updatedAt: Date.now() };
      
      // Collect localStorage data (Lab bundles)
      for (const key of LS_KEYS) {
        payload[key] = lsGet(key) || '';
      }
      
      // Collect chrome.storage.local data (QuickText templates)
      const chromeData = await chromeGet(CHROME_KEYS);
      for (const key of CHROME_KEYS) {
        const val = chromeData[key];
        // Store objects as objects (RTDB supports JSON), keep strings as-is
        payload[key] = (typeof val === 'undefined' || val === null) ? '' : val;
      }

      await pushToCloud(idToken, session.uid, payload);
      setStatus('Saved to cloud');
      toast('Bundles + templates saved to cloud', 'success');

      await setMeta({ lastPushAt: Date.now() });

    } catch (err) {
      toastErr('Push failed', err);
      setStatus('Push failed');
    }
  }

  async function handleSyncNow() {
    await handlePull();
    await handlePush();
    await handlePull();
    toast('Full sync complete', 'success');
  }

  // =============================================
  // AUTO-SYNC ON LOCAL CHANGE
  // =============================================

  function onLocalChange(key) {
    if (!LS_KEYS.includes(key) && !CHROME_KEYS.includes(key)) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const session = await getCurrentSession();
      if (!session) return;
      try {
        await handlePush();
      } catch (err) {
        console.warn('Auto-push failed:', err);
      }
    }, 3000);
  }

  // =============================================
  // INIT
  // =============================================

  function updateUIForSignedIn(email) {
    // Hide email form, show signed-in card
    const form = document.getElementById('cloudEmailForm');
    const actions = document.getElementById('cloudQuickActions');
    const userDisplay = document.getElementById('cloudUserDisplay');
    const userEmail = document.getElementById('cloudUserEmail');
    
    if (form) form.classList.add('hidden');
    if (actions) actions.classList.remove('hidden');
    if (userDisplay) {
      userDisplay.classList.remove('hidden');
      if (userEmail) userEmail.textContent = email;
    }
  }

  function updateUIForSignedOut() {
    // Show email form, hide signed-in card
    const form = document.getElementById('cloudEmailForm');
    const actions = document.getElementById('cloudQuickActions');
    const userDisplay = document.getElementById('cloudUserDisplay');
    
    if (form) form.classList.remove('hidden');
    if (actions) actions.classList.add('hidden');
    if (userDisplay) userDisplay.classList.add('hidden');
  }

  async function init() {
    // Wire buttons
    const emailSignInBtn = document.getElementById('emailSignIn');
    if (emailSignInBtn) emailSignInBtn.addEventListener('click', handleEmailSignIn);
    
    const emailSignUpBtn = document.getElementById('emailSignUp');
    if (emailSignUpBtn) emailSignUpBtn.addEventListener('click', showSignUpWindow);

    const forgotBtn = document.getElementById('cloudForgotPassword');
    if (forgotBtn && !forgotBtn._wired) {
      forgotBtn.addEventListener('click', handleForgotPassword);
      forgotBtn._wired = true;
    }

    const resetBackBtn = document.getElementById('cloudResetBack');
    if (resetBackBtn && !resetBackBtn._wired) {
      resetBackBtn.addEventListener('click', hideResetWindow);
      resetBackBtn._wired = true;
    }

    const resetSentBackBtn = document.getElementById('cloudResetSentBack');
    if (resetSentBackBtn && !resetSentBackBtn._wired) {
      resetSentBackBtn.addEventListener('click', hideResetWindow);
      resetSentBackBtn._wired = true;
    }

    const resetDoneBtn = document.getElementById('cloudResetDone');
    if (resetDoneBtn && !resetDoneBtn._wired) {
      resetDoneBtn.addEventListener('click', hideResetWindow);
      resetDoneBtn._wired = true;
    }

    const resetSendBtn = document.getElementById('cloudResetSend');
    if (resetSendBtn && !resetSendBtn._wired) {
      resetSendBtn.addEventListener('click', handleSendResetFromWindow);
      resetSendBtn._wired = true;
    }

    const signUpBackBtn = document.getElementById('cloudSignUpBack');
    if (signUpBackBtn && !signUpBackBtn._wired) {
      signUpBackBtn.addEventListener('click', hideSignUpWindow);
      signUpBackBtn._wired = true;
    }

    const signUpCreateBtn = document.getElementById('cloudSignUpCreate');
    if (signUpCreateBtn && !signUpCreateBtn._wired) {
      signUpCreateBtn.addEventListener('click', handleEmailSignUpFromWindow);
      signUpCreateBtn._wired = true;
    }

    // Password show/hide toggles
    wirePasswordToggle('cloudPasswordToggle', 'cloudPassword');
    wirePasswordToggle('cloudSignUpPasswordToggle', 'cloudSignUpPassword');
    wirePasswordToggle('cloudSignUpPasswordConfirmToggle', 'cloudSignUpPasswordConfirm');

    // Enter-to-submit
    const signInEmail = document.getElementById('cloudEmail');
    const signInPass = document.getElementById('cloudPassword');
    const signUpEmail = document.getElementById('cloudSignUpEmail');
    const signUpPass = document.getElementById('cloudSignUpPassword');
    const signUpConfirm = document.getElementById('cloudSignUpPasswordConfirm');

    [signInEmail, signInPass].forEach((el) => {
      if (!el || el._enterWired) return;
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleEmailSignIn();
        }
      });
      el._enterWired = true;
    });

    [signUpEmail, signUpPass, signUpConfirm].forEach((el) => {
      if (!el || el._enterWired) return;
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleEmailSignUpFromWindow();
        }
      });
      el._enterWired = true;
    });

    // Enter-to-submit for reset window
    const resetEmail = document.getElementById('cloudResetEmail');
    if (resetEmail && !resetEmail._enterWired) {
      resetEmail.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSendResetFromWindow();
        }
      });
      resetEmail._enterWired = true;
    }

    const signOutBtn = document.getElementById('cloudSignOutV2');
    if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);

    const syncBtn = document.getElementById('cloudSyncNowV2');
    if (syncBtn) syncBtn.addEventListener('click', handleSyncNow);

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

    // Check existing session
    if (!isConfigured()) {
      setStatus('Cloud not configured (admin must add Firebase keys)');
      return;
    }

    const session = await getCurrentSession();
    if (session) {
      setStatus(`Signed in as ${session.email}`);
      updateUIForSignedIn(session.email);

      // Auto-pull periodically to keep devices in sync
      try {
        const meta = await getMeta();
        const lastPullAt = Number(meta?.lastPullAt || 0);
        const sixHours = 6 * 60 * 60 * 1000;
        const shouldPull = !lastPullAt || (Date.now() - lastPullAt) > sixHours;
        if (shouldPull) {
          await handlePull();
        }
      } catch (e) {
        console.warn('Auto-pull on init failed:', e);
      }
    } else {
      setStatus('Not signed in');
      updateUIForSignedOut();
    }
  }

  // Export for external use
  window.CloudSync = {
    init,
    onLocalChange,
    pull: handlePull,
    push: handlePush
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
