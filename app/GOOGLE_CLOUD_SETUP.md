# Google OAuth Setup Guide for CARP

## Fixing the "origin_mismatch" Error

**Error message:** `Error 400: origin_mismatch`

**Cause:** Your domain (`https://weathercarp.com`) is not registered in Google Cloud Console as an authorized origin.

---

## Step-by-Step Fix

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with the Google account that owns the OAuth credentials
3. Make sure project **"CARP"** is selected (top left dropdown)

### Step 2: Navigate to Credentials
1. Click the **hamburger menu** (top left)
2. Go to **"APIs & Services"** > **"Credentials"**
   
   Or direct URL:
   ```
   https://console.cloud.google.com/apis/credentials
   ```

### Step 3: Edit Your OAuth Client
1. Find **"Web client 1"** (or your client name)
2. Click the **pencil icon** to edit

### Step 4: Add Authorized JavaScript Origins

Under **"Authorized JavaScript origins"**, click **"ADD URI"** and add:

```
https://weathercarp.com
```

**Also add these for testing:**
```
http://localhost:5173
http://localhost:3000
```

**Your list should look like:**
- `https://weathercarp.com`
- `http://localhost:5173`
- `http://localhost:3000`

### Step 5: Add Authorized Redirect URIs

Under **"Authorized redirect URIs"**, click **"ADD URI"** and add:

```
https://weathercarp.com
https://weathercarp.com/login
https://weathercarp.com/register
```

### Step 6: Save
Click **"SAVE"** at the bottom.

**Wait 5-10 minutes** for Google's servers to update.

---

## Important Settings Checklist

| Setting | Should Be |
|---------|-----------|
| Application type | **Web application** |
| Authorized JS origins | Includes `https://weathercarp.com` |
| Authorized redirect URIs | Includes `https://weathercarp.com` |
| OAuth consent screen | **Published** (not Testing) |

---

## Publishing the OAuth Consent Screen

If your app is still in **Testing** mode, only test users can sign in.

### To publish:
1. Go to **APIs & Services** > **OAuth consent screen**
2. At the top, click **"PUBLISH APP"**
3. Confirm the dialog
4. Status changes from **"Testing"** to **"In production"**

**Note:** Publishing may require verification by Google if you request sensitive scopes. For basic login (email, profile), no verification is needed.

---

## Troubleshooting

### Still getting origin_mismatch?
- Wait 10 minutes after saving (Google caches)
- Check for `http` vs `https` mismatch
- Make sure there's no trailing slash (`/`) in origins
- Try adding `www` version: `https://www.weathercarp.com`

### "This app isn't verified"
1. Go to **OAuth consent screen**
2. Click **"PUBLISH APP"**
3. Or add test users under **"Test users"**

### "Access blocked"
Check that these scopes are configured:
- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`
- `openid`

---

## Your OAuth Client ID
```
83677643243-gud764401r8kktcc0v77l9532bc60r5n.apps.googleusercontent.com
```

This is already set in your `.env.production` and backend `.env` files.

---

## Quick Reference

| URL | Purpose |
-----|---------|
| https://console.cloud.google.com | Google Cloud Console |
| https://console.cloud.google.com/apis/credentials | Credentials page |
| https://console.cloud.google.com/apis/credentials/consent | OAuth consent screen |

---

**After completing the steps above, wait 10 minutes, then try Google Sign In again on https://weathercarp.com**
