# Hostinger Backend Setup Guide (Git Deployment)

## The Problem

When Hostinger pulls your GitHub repo, it clones the **entire repository** — not just the built frontend. Your repo looks like:

```
CARP_Website/
├── src/              ← React source code (should NOT be public)
├── node_modules/     ← Dependencies (should NOT be public)
├── dist/             ← Built frontend (this goes to public_html/)
├── carp-backend/     ← Backend API (goes to ~/carp-backend/)
├── index.html        ← Vite dev entry (not the production build)
└── package.json      ← Frontend package.json
```

If you deploy this straight to `public_html/`, visitors can see your source code.

## Recommended Setup

### Step 1: Configure Git in Hostinger hPanel

1. Go to **Advanced → Git**
2. Click **Create Repository**
3. Paste: `https://github.com/Kichiro23/CARP_Website`
4. **Branch:** `main`
5. **Deploy Path:** `/home/your-user/CARP_Website/` (NOT public_html)
   - Replace `your-user` with your Hostinger username
6. Click **Create**

This pulls the repo to a private working directory.

---

### Step 2: Deploy Frontend to public_html

**Option A — SSH (fastest):**

```bash
# SSH into your Hostinger account
ssh u123456789@weathercarp.com

# Copy built frontend to public_html
cp -r ~/CARP_Website/dist/* ~/public_html/
cp ~/CARP_Website/public/.htaccess ~/public_html/

# Optional: clean old files
rm ~/public_html/index.html 2>/dev/null
```

**Option B — File Manager:**
1. hPanel → **Files → File Manager**
2. Open `CARP_Website/dist/`
3. Select all files → **Move** to `public_html/`
4. Also move `CARP_Website/public/.htaccess` to `public_html/`

After this, `public_html/` should only contain:
```
public_html/
├── index.html
├── .htaccess
├── logo.png
├── news-fallback.jpg
├── assets/
│   ├── index-CCSPsw0x.css
│   └── index-D82XIXJP.js
└── videos/
    └── clouds.mp4
```

---

### Step 3: Move Backend Out

```bash
# SSH
ssh u123456789@weathercarp.com

# Move backend to its own folder
mv ~/CARP_Website/carp-backend ~/carp-backend

# Install dependencies
cd ~/carp-backend && npm install
```

---

### Step 4: Create .env on the Server

In File Manager or SSH, create `~/carp-backend/.env`:

```env
NODE_ENV=production
PORT=3001

# MongoDB Atlas
MONGODB_URI=mongodb+srv://rommeld216_db_user:qQ1TZjferTt9fl6D@carp.rejvept.mongodb.net/?appName=CARP

# JWT
JWT_SECRET=carp-jwt-secret-change-this-in-production-2026
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=83677643243-gud764401r8kktcc0v77l9532bc60r5n.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Your domain
FRONTEND_URL=https://weathercarp.com

# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=rommeld216@gmail.com
EMAIL_PASS=xfqt vudk pqqv rcwp
EMAIL_FROM=CARP <notification@weathercarp.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=dbqh7bakd
CLOUDINARY_API_KEY=792699229491766
CLOUDINARY_API_SECRET=KbL-tYmCqrHZ5PGiZI7NMMzcJhQ
```

> ⚠️ **Change that weak JWT_SECRET!** Run:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### Step 5: Start Node.js Backend

1. hPanel → **Advanced → Node.js**
2. Click **Create Application**
   - **Node.js version:** 20.x
   - **Application mode:** Production
   - **Application root:** `carp-backend`
   - **Application startup file:** `server.js`
3. Click **Create**
4. Click **Run npm install**
5. Click **Restart**

---

### Step 6: SSL + Domain

1. hPanel → **Websites → your domain**
2. Click **SSL → Install SSL** (Let's Encrypt)
3. Enable **Force HTTPS redirect**

---

## One-Command Deploy Script

Save this as `~/deploy.sh` on Hostinger:

```bash
#!/bin/bash
set -e

echo "Pulling latest code..."
cd ~/CARP_Website && git pull origin main

echo "Deploying frontend..."
rm -rf ~/public_html/*
cp -r ~/CARP_Website/dist/* ~/public_html/
cp ~/CARP_Website/public/.htaccess ~/public_html/

echo "Updating backend..."
rm -rf ~/carp-backend
cp -r ~/CARP_Website/carp-backend ~/carp-backend
cd ~/carp-backend && npm install

echo "Restarting Node.js app..."
# Restart via hPanel Node.js section, or if you have pm2:
# pm2 restart server.js

echo "Done!"
```

Make it executable:
```bash
chmod +x ~/deploy.sh
```

Run it anytime you push new code:
```bash
~/deploy.sh
```

---

## Important: API URL / Port Issue

Your frontend is built to call:
```
https://weathercarp.com:3001/api
```

On shared hosting, **port 3001 might be blocked**.

### If it doesn't work, use same-domain proxy:

Add this to `public_html/.htaccess` **before** the SPA rewrite rules:

```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
```

Then rebuild locally with:
```env
VITE_API_URL=/api
```

Push to GitHub and redeploy.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page | Make sure `dist/` contents (not the folder itself) are in `public_html/` |
| 404 on refresh | Verify `.htaccess` is in `public_html/` |
| Backend won't start | Check Node.js logs in hPanel. Verify `.env` exists. |
| CORS error | Update `FRONTEND_URL` in backend `.env` to `https://weathercarp.com` |
| MongoDB timeout | Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access |
| Google OAuth fails | Add `https://weathercarp.com` to Google Cloud Console authorized origins |
