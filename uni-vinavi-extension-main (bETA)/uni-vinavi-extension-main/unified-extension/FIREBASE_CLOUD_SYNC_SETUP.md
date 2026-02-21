# Portal-Style Cloud Sync (Free) — Firebase Auth + Realtime Database

This adds an in-extension **Cloud Account** (email/password) so doctors can sign in, then bundles sync automatically across computers even after the browser is closed.

## What this syncs
- `labBundlesHMH`
- `labPatientBundlesHMH`
- `HMH_CLINICAL_SETS_V1`

## 1) Create Firebase project (free)
1. Go to https://console.firebase.google.com/
2. **Add project** → choose a name
3. Finish project creation

## 2) Enable Email/Password login
1. Firebase Console → **Build → Authentication**
2. **Get started**
3. **Sign-in method** tab
4. Enable **Email/Password**

## 3) Enable Realtime Database
1. Firebase Console → **Build → Realtime Database**
2. Click **Create Database**
3. Choose location
4. Start in **Locked mode** (recommended)

### Recommended rules (per-doctor private storage)
In Realtime Database → **Rules**, set:
```json
{
  "rules": {
    "doctors": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

## 4) Get your Web API Key + Project ID
1. Firebase Console → **Project settings** (gear icon)
2. Under **General**:
   - Copy **Project ID**
3. Under **Your apps** (if none, click **Add app → Web app**; no hosting needed)
   - Copy **Web API Key**

## 5) Put keys into the extension
Edit:
- `unified-extension/modules/lab-vinavi/scripts/cloud-config.js`

Fill:
```js
window.CloudConfig = {
  firebaseApiKey: 'PASTE_WEB_API_KEY_HERE',
  firebaseProjectId: 'PASTE_PROJECT_ID_HERE'
};
```

## 6) Reload the extension
1. Chrome → `chrome://extensions`
2. Click **Reload**
3. Open the lab dashboard
4. Click **Cloud Account**
5. Doctors can:
   - **Create Account** once
   - Then **Sign In** on any computer
   - Click **Sync Now** the first time

## Notes
- No Google Workspace required.
- Doctors only create the account once. After that, they just sign in.
- Activity is visible in the **Logs** view (includes failed pushes + cloud sync events).
