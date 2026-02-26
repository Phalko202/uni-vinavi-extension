# Google Drive Sync Setup (Feb 2026)

This extension uses `chrome.identity.getAuthToken()` (Manifest V3) to sign in to Google and read/write a JSON file on the doctor’s Google Drive.

## 1) Load the extension (to get the Extension ID)
1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder:
   - `uni-vinavi-extension-main/unified-extension`
5. You will see the extension card; copy the **ID** (looks like `abcdefghijklmnop...`).

## 2) Create Google OAuth Client (Chrome Extension)
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create/select a project.
3. Go to **APIs & Services → Library**
4. Enable:
   - **Google Drive API**
5. Go to **APIs & Services → OAuth consent screen**
   - Choose **External** or **Internal** (Internal is best if you have Google Workspace)
   - Fill required app name + support email
   - Add scopes (you can add them later; the extension requests them):
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Add **Test users** (at least your doctor accounts) if the app is in testing.
6. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**
7. Application type: **Chrome Extension**
8. Enter:
   - **Name**: something like `Vinavi Extension Drive Sync`
   - **Item ID**: paste your Chrome **Extension ID** from step (1)
9. Create and copy the generated **Client ID** (ends with `.apps.googleusercontent.com`).

## 3) Put the Client ID into the extension manifest
1. Open: `unified-extension/manifest.json`
2. Find:
   ```json
   "oauth2": {
     "client_id": "REPLACE_WITH_YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/drive.file",
       "https://www.googleapis.com/auth/userinfo.email"
     ]
   }
   ```
3. Replace the `client_id` value with your real Client ID.

## 4) Reload extension + test
1. Back in `chrome://extensions`
2. Click **Reload** on the extension card
3. Open the lab dashboard page (the page that shows the new Drive buttons)
4. Click **Google Sign in**
5. Click **Save** (it creates a Drive folder `Vinavi Extension Sync` and file `vinavi-sync.json`)
6. On another computer, install the extension, sign in, click **Load**.

## Notes / common issues
- If you see “Drive sync is not configured yet”: client ID in `manifest.json` is still the placeholder.
- If sign-in fails on a doctor account: ensure the account is in **Test users** (if OAuth app is in testing).
- Unpacked extension IDs can differ per Chrome profile. For stable rollout, publish the extension so the ID stays fixed.
