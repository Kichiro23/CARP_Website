# CARP - Hostinger Deployment Guide
## Complete step-by-step to deploy on .com domain

---

## STEP 1: Buy Domain + Hosting

1. Go to https://www.hostinger.com/
2. Choose **Premium Shared Hosting** (~$3-5/month, includes free domain for 1 year)
3. Register your domain: `carpclimate.com` (or your preferred name)
4. Complete checkout
5. You'll receive login credentials for Hostinger Panel (hPanel)

---

## STEP 2: Set Up MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/atlas
2. Sign up with Google (free forever tier)
3. Create a new cluster:
   - Choose **M0 (Free Tier)**
   - Provider: AWS
   - Region: closest to your users (e.g., Mumbai for Philippines)
   - Cluster name: `carp-cluster`
4. Click **Create Cluster** (takes 1-3 minutes)
5. In Security > Database Access:
   - Click **Add New Database User**
   - Username: `carp_user`
   - Password: Generate a strong password, **SAVE IT**
   - Role: **Read and write to any database**
   - Click **Add User**
6. In Security > Network Access:
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Confirm
7. In Clusters > Click **Connect** > **Drivers** > **Node.js**
8. Copy the connection string (looks like):
   ```
   mongodb+srv://carp_user:<password>@carp-cluster.xxxxx.mongodb.net/carp?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

**SAVE THIS URI** - you'll need it in Step 5.

---

## STEP 3: Set Up Google OAuth

1. Go to https://console.cloud.google.com/
2. Click the project selector (top) > **New Project**
   - Project name: `CARP Climate Platform`
   - Click **Create**
3. Make sure your new project is selected
4. Go to **APIs & Services** > **OAuth consent screen**
   - User Type: **External**
   - Click **Create**
   - App name: `CARP`
   - User support email: your Gmail
   - Developer contact: your Gmail
   - Click **Save and Continue** 3 times
   - Click **Back to Dashboard**
5. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
   - Application type: **Web application**
   - Name: `CARP Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://carpclimate.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5173/login
     https://carpclimate.com/login
     ```
   - Click **Create**
6. Copy the **Client ID** and **Client Secret** ( popup appears, or find in credentials list)

**SAVE BOTH** - you'll need them in Step 5.

---

## STEP 4: Set Up Cloudinary (Free Image Hosting)

1. Go to https://cloudinary.com/
2. Sign up (free tier = 25GB storage)
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret (click reveal)

**SAVE ALL THREE** - you'll need them in Step 5.

---

## STEP 5: Create Backend .env File

In your `carp-backend` folder, create a file named `.env`:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://carp_user:YOUR_PASSWORD@carp-cluster.xxxxx.mongodb.net/carp?retryWrites=true&w=majority
JWT_SECRET=generate-a-64-char-random-string-here-change-this
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
FRONTEND_URL=https://carpclimate.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=CARP <noreply@carpclimate.com>
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**IMPORTANT:** Replace all `YOUR_...` placeholders with your actual values.

### How to generate JWT_SECRET:
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output into JWT_SECRET.

### How to get Gmail App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Sign in
3. Select app: **Mail**
4. Select device: **Other (Custom name)** > `CARP`
5. Click **Generate**
6. Copy the 16-character password

---

## STEP 6: Create Frontend .env File

In your root `app` folder, create a file named `.env.production`:

```env
VITE_API_URL=https://carpclimate.com/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

For local development, create `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

---

## STEP 7: Upload Code to Hostinger

### Option A: Using Git (Recommended)

In Hostinger hPanel:
1. Go to **Advanced** > **Git**
2. Click **Create Repository**
3. Paste your GitHub repo URL: `https://github.com/Kichiro23/CARP_Website`
4. Click **Create**
5. Your files will be cloned to `~/public_html/`

### Option B: Using File Manager

In Hostinger hPanel:
1. Go to **Files** > **File Manager**
2. Navigate to `public_html/`
3. Delete default files (index.html, etc.)
4. Upload your project files via the Upload button
   - Upload frontend `dist/` contents to `public_html/`
   - Upload `carp-backend/` folder to `~/carp-backend/`

---

## STEP 8: Set Up Node.js Backend in Hostinger

In Hostinger hPanel:
1. Go to **Advanced** > **Node.js**
2. Click **Create Application**
   - Node.js version: **20.x**
   - Application mode: **Production**
   - Application root: `carp-backend` (the folder name)
   - Application startup file: `server.js`
3. Click **Create**
4. Click **Configuration files** next to your app
5. Edit or create `carp-backend/.env` with all values from Step 5
6. Click **Run npm install** (or run: `cd ~/carp-backend && npm install`)
7. Click **Restart**

---

## STEP 9: Configure Domain + SSL

In Hostinger hPanel:
1. Go to **Websites** > your domain
2. Click **SSL** > **Install SSL** (Let's Encrypt - Free)
3. Force HTTPS redirect: **Enable**

---

## STEP 10: Build Frontend for Production

On your local computer:
```bash
cd ~/OneDrive/Documents/GitHub/CARP_Website/app

# Make sure .env.production has the correct API URL
# VITE_API_URL=https://carpclimate.com/api

npm install
npm run build
```

This creates a `dist/` folder with the production build.

Upload the `dist/` folder contents to `public_html/` in Hostinger File Manager.

---

## STEP 11: Restart Everything

In Hostinger:
1. **Node.js** > Click **Restart** on your app
2. Wait 1-2 minutes
3. Visit your domain: `https://carpclimate.com`

---

## FOLDER STRUCTURE ON HOSTINGER

```
/home/u123456789/
├── public_html/              # Frontend (built React app)
│   ├── index.html
│   ├── assets/
│   ├── logo.png
│   └── ...
├── carp-backend/             # Backend (Node.js/Express)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
└── ...
```

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Blank page | Check browser console for errors. Make sure `VITE_API_URL` matches your domain. |
| Backend not starting | Check Node.js logs in Hostinger. Verify `.env` file exists. |
| MongoDB connection error | Check IP whitelist (0.0.0.0/0). Verify URI format. |
| Google OAuth not working | Check Client ID matches. Verify authorized origins include your domain. |
| CORS errors | Make sure `FRONTEND_URL` in backend `.env` matches your actual domain. |
| Email not sending | Use Gmail App Password (not regular password). Enable "Less secure apps" if needed. |

---

## QUICK COMMANDS (SSH)

If you have SSH access:
```bash
# SSH into Hostinger
ssh u123456789@carpclimate.com

# Go to backend
cd ~/carp-backend

# Install dependencies
npm install

# Restart backend
# (use Hostinger panel, or if PM2 is available:)
pm2 restart server.js

# View logs
tail -f ~/.pm2/logs/server-out.log
tail -f ~/.pm2/logs/server-error.log

# Exit
exit
```

---

## SUMMARY OF WHAT YOU NEED

| Service | Cost | What You Get |
|---------|------|-------------|
| Hostinger Premium Hosting | ~$3-5/month | Domain + Server + SSL |
| MongoDB Atlas | Free | 512MB Database |
| Google Cloud Console | Free | OAuth 2.0 Login |
| Cloudinary | Free | 25GB Image Storage |
| Gmail SMTP | Free | Password Reset Emails |

**Total monthly cost: ~$3-5**

---

*CARP Development Team - BSCpE 3C 2025-2026*
