# Google Cloud Sync Setup Guide

This guide explains how to set up Google Sign-In + Firebase cloud sync for the Vinavi Extension.

## Overview

Doctors can now:
1. **Sign in with Google** (one-click, uses their Gmail account)
2. **OR sign in with email/password** (any email, creates account in Firebase)
3. **Sync bundles across all computers** - data saved in Firebase Realtime Database
4. **Persistent sessions** - stays signed in even after closing browser

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "HMH Vinavi Extension")
4. Complete setup wizard

### 2. Enable Firebase Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Save changes

### 3. Create Realtime Database

1. Go to **Build > Realtime Database**
2. Click "Create Database"
3. Choose location (closest to Maldives: `asia-southeast1`)
4. Start in **Test mode** (we'll secure it next)

### 4. Set Security Rules

1. In Realtime Database, go to **Rules** tab
2. Replace with these rules:

```json
{
  "rules": {
    "doctors": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

3. Click **Publish**

### 5. Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Copy **Web API Key** (under "Your apps" section)
3. Copy **Project ID** (top of settings page)

### 6. Create Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (or create one)
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Application type: **Chrome Extension**
6. Name: "Vinavi Extension"
7. After Chrome Web Store publishes extension, add extension ID to **Authorized redirect URIs**:
   - Format: `https://<EXTENSION-ID>.chromiumapp.org/`
   - For development, you can get extension ID from `chrome://extensions`
8. Click **Create**
9. Copy the **Client ID** (format: `XXXXX.apps.googleusercontent.com`)

### 7. Configure Extension

1. Open `modules/lab-vinavi/scripts/cloud-config.js`
2. Fill in the values:

```javascript
window.CloudConfig = {
  firebaseApiKey: 'YOUR_FIREBASE_WEB_API_KEY',
  firebaseProjectId: 'your-project-id',
  googleClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
};
```

3. Save the file
4. Reload the extension in Chrome

## Testing

1. Open the extension dashboard
2. Click **Cloud Account** button (top right)
3. Click **Sign in with Google**
4. Authorize the extension
5. You should see "Signed in as your.email@gmail.com"
6. Create some bundles
7. Click **Sync Now** to save to cloud
8. Open extension on another computer, sign in, and your bundles will sync automatically

## Troubleshooting

### "Cloud not configured" error
- Make sure you filled all three values in `cloud-config.js`
- Check that there are no typos
- Reload the extension

### "Sign-in cancelled"
- User closed Google sign-in popup
- Click the button again

### "Failed to get access token"
- Google Client ID might be incorrect
- Check that you added the correct redirect URI
- Make sure OAuth consent screen is configured

### "Pull/Push failed"
- Check Firebase Realtime Database security rules
- Make sure authentication is enabled
- Check browser console for detailed errors

## Security Notes

- Each doctor's data is isolated by their unique user ID
- Database rules prevent unauthorized access
- Firebase handles password hashing and security
- Google OAuth uses industry-standard OAuth 2.0 flow
- Sessions persist in `chrome.storage.local` (encrypted by Chrome)

## Support

For issues, check:
1. Browser console (F12 > Console tab)
2. Extension logs (Cloud Account modal shows status)
3. Firebase Console > Authentication to see registered users
4. Firebase Console > Realtime Database to see synced data
