# CARP - Complete Production Audit & Action Plan
## Climate & Air Research Platform

---

## EXECUTIVE SUMMARY

CARP is a React.js frontend SPA with localStorage-based auth and direct third-party API calls. It is NOT production-ready. It needs a proper backend, real authentication, Google OAuth, database, and professional hosting before it can go live on a .com domain.

| Status | Item |
|--------|------|
| WORKING | Frontend UI (15 pages, glassmorphism design) |
| WORKING | Third-party API integration (weather, news, countries) |
| WORKING | Location management (multi-city, autocomplete) |
| WORKING | Profile image upload with compression |
| BROKEN/MISSING | Backend server (no Node.js/Express API) |
| BROKEN/MISSING | Real database (no MongoDB/PostgreSQL/SQLite) |
| BROKEN/MISSING | Google OAuth (button shows error message) |
| BROKEN/MISSING | Password hashing (plaintext in localStorage) |
| BROKEN/MISSING | Email/password reset (just a UI mock) |
| BROKEN/MISSING | HTTPS/SSL certificate |
| BROKEN/MISSING | Domain + hosting setup |
| BROKEN/MISSING | API rate limiting & security |
| BROKEN/MISSING | User data persistence across devices |
| BROKEN/MISSING | Admin dashboard |
| BROKEN/MISSING | Contact/feedback system |
| BROKEN/MISSING | SEO meta tags |

---

## FRONTEND AUDIT

### PAGES (19 Total) - Status

| # | Page | Status | Issues |
|---|------|--------|--------|
| 1 | Landing | WORKING | Needs Google OAuth integration |
| 2 | Login | BROKEN | Google OAuth button shows error, no real backend |
| 3 | Register | BROKEN | Same as Login, passwords stored plaintext |
| 4 | Forgot Password | MOCK | UI only, no actual email sent |
| 5 | Dashboard | WORKING | Needs real-time data refresh interval |
| 6 | Live Map | WORKING | Minor: map reloads on location change |
| 7 | Air Quality | WORKING | Needs historical data API |
| 8 | Countries | WORKING | Needs pagination for 250+ countries |
| 9 | Compare | WORKING | No issues |
| 10 | Analytics | WORKING | Needs more chart types |
| 11 | Trends | WORKING | No issues |
| 12 | Alerts | WORKING | Threshold logic is basic |
| 13 | News | WORKING | Needs filtering by location/topic |
| 14 | About | WORKING | Team section is static |
| 15 | Profile | WORKING | Image upload works, needs cloud storage |
| 16 | Settings | WORKING | Theme toggle works |
| 17 | Security | MOCK | Password change is UI only |
| 18 | 404 Page | MISSING | No 404/not found page |
| 19 | Admin Dashboard | MISSING | No admin panel |

### CRITICAL FRONTEND GAPS

```
1. GOOGLE OAUTH INTEGRATION
   Current: Button shows "Google OAuth requires setup. See docs."
   Needed: Real Google Identity Services integration
   Files to modify: Login.tsx, Register.tsx, hooks/useAuth.ts
   
2. PASSWORD RESET (REAL)
   Current: UI form that says "check email" but sends nothing
   Needed: Backend endpoint + email service (SendGrid/Nodemailer)
   Files to create: backend/routes/auth.js (forgotPassword, resetPassword)
   
3. 404 ERROR PAGE
   Current: React Router shows blank page for unknown routes
   Needed: Custom 404 page with navigation back
   Files to create: pages/NotFound.tsx
   
4. SEO & META TAGS
   Current: No meta tags, no Open Graph, no title per page
   Needed: react-helmet-async for dynamic titles/meta
   Files to modify: All pages
   
5. SERVICE WORKER / PWA
   Current: No offline support
   Needed: PWA manifest + service worker
   Files to create: manifest.json, sw.js
   
6. ANALYTICS TRACKING
   Current: No user behavior tracking
   Needed: Google Analytics 4 or Plausible
   
7. ACCESSIBILITY (a11y)
   Current: No ARIA labels, no keyboard nav on dropdowns
   Needed: Full WCAG 2.1 AA compliance audit
   
8. LOADING SKELETONS (PARTIAL)
   Current: Dashboard has skeletons, other pages don't
   Needed: Skeleton screens on ALL data-fetching pages
   Files to modify: AirQuality, Alerts, Analytics, Trends, Countries
```

### DESIGN/UX GAPS

```
- No page transition animations
- No toast notifications for user actions (success/error)
- No confirmation dialogs for destructive actions (delete location)
- Charts are not interactive (no tooltips on hover)
- Mobile menu has no animation
- No dark/light theme toggle in settings (toggle exists but doesn't fully work)
- Scrollbar is browser default (should be custom styled)
```

---

## BACKEND AUDIT (WHAT NEEDS TO BE BUILT)

### CURRENT STATE: NO BACKEND EXISTS

CARP has zero backend. All data is:
- Stored in browser localStorage (users, locations, settings)
- API keys are hardcoded (actually no keys needed for Open-Meteo)
- No server-side validation
- No authentication tokens/JWT
- No rate limiting
- No database

### REQUIRED BACKEND ARCHITECTURE

```
carp-backend/
|-- server.js                 # Express entry point
|-- config/
|   |-- db.js                 # MongoDB/PostgreSQL connection
|   |-- passport.js           # Google OAuth strategy
|   |-- jwt.js                # JWT secret & config
|-- models/
|   |-- User.js               # User schema (name, email, avatar, authProvider)
|   |-- Location.js           # Saved locations schema
|   |-- Alert.js              # User alert preferences
|-- routes/
|   |-- auth.js               # POST /register, /login, /google, /forgot-password
|   |-- profile.js            # GET/PUT /profile, /profile/image
|   |-- locations.js          # CRUD /locations, /locations/default
|   |-- alerts.js             # GET/POST /alerts/settings
|-- middleware/
|   |-- auth.js               # JWT token verification
|   |-- errorHandler.js       # Global error handling
|   |-- rateLimiter.js        # API rate limiting
|-- utils/
|   |-- email.js              # SendGrid/Nodemailer email service
|   |-- cloudinary.js         # Cloudinary image upload
|-- package.json
|-- .env                      # API keys, DB URI, JWT secret
```

### BACKEND API ENDPOINTS NEEDED

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/auth/register | Email/password registration | No |
| POST | /api/auth/login | Email/password login | No |
| POST | /api/auth/google | Google OAuth callback | No |
| POST | /api/auth/forgot-password | Send reset email | No |
| POST | /api/auth/reset-password | Reset with token | No |
| GET | /api/profile | Get current user | JWT |
| PUT | /api/profile | Update name/email | JWT |
| POST | /api/profile/avatar | Upload avatar image | JWT |
| GET | /api/locations | Get saved locations | JWT |
| POST | /api/locations | Add location | JWT |
| DELETE | /api/locations/:id | Remove location | JWT |
| PUT | /api/locations/:id/default | Set default | JWT |
| GET | /api/alerts | Get alert thresholds | JWT |
| PUT | /api/alerts | Update thresholds | JWT |

### BACKEND TECH STACK

```
Runtime:     Node.js 20+
Framework:   Express.js 4.x
Database:    MongoDB Atlas (free tier) OR PostgreSQL
Auth:        Passport.js (Google OAuth 2.0) + JWT
Email:       Nodemailer + Gmail SMTP OR SendGrid
Images:      Cloudinary (free tier, 25GB)
Security:    bcrypt (password hashing), helmet, cors, express-rate-limit
Validation:  express-validator
Env Vars:    dotenv
```

---

## GOOGLE OAUTH INTEGRATION (STEP-BY-STEP)

### STEP 1: Google Cloud Console Setup
1. Go to https://console.cloud.google.com/
2. Create a new project named "CARP Climate Platform"
3. Go to APIs & Services > Credentials
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure consent screen:
   - User Type: External
   - App name: CARP
   - User support email: your-email@gmail.com
   - Authorized domains: carpclimate.com (your domain)
   - Scopes: email, profile, openid
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: CARP Web Client
   - Authorized JavaScript origins:
     - http://localhost:5173 (local dev)
     - https://yourdomain.com (production)
   - Authorized redirect URIs:
     - http://localhost:5173/login
     - https://yourdomain.com/login
7. Copy the Client ID (looks like: 123456789-abc123.apps.googleusercontent.com)

### STEP 2: Frontend Integration
```bash
npm install @react-oauth/google
```

Wrap app in GoogleOAuthProvider:
```tsx
// main.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <App />
</GoogleOAuthProvider>
```

Replace current broken button in Login.tsx:
```tsx
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={async (credentialResponse) => {
    // Send token to backend
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential })
    });
    const data = await res.json();
    // Save JWT token, redirect to dashboard
  }}
  onError={() => setError('Google login failed')}
  shape="pill"
  size="large"
  width="100%"
/>
```

### STEP 3: Backend Google OAuth Handler
```javascript
// backend/routes/auth.js
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token } = req.body;
  
  // Verify Google token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  
  // Find or create user
  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      avatar: payload.picture,
      authProvider: 'google',
      googleId: payload.sub,
    });
  }
  
  // Generate JWT
  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token: jwtToken, user });
});
```

---

## HOSTINGER DEPLOYMENT GUIDE

### WHAT YOU NEED TO BUY

| Item | Hostinger Plan | Price |
|------|---------------|-------|
| Domain (.com) | Domain Registration | ~$10/year |
| Hosting | Premium Shared Hosting | ~$3-5/month |
| SSL | Free with Hostinger | $0 |

### STEP 1: Buy Domain + Hosting
1. Go to https://www.hostinger.com/
2. Buy a domain (e.g., carpclimate.com)
3. Buy Premium Shared Hosting (includes free domain often)
4. In Hostinger Panel, link your domain to the hosting

### STEP 2: Prepare Backend for VPS

Create `carp-backend/server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(passport.initialize());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/locations', require('./routes/locations'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

Create `carp-backend/.env`:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carp
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://carpclimate.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### STEP 3: Deploy to Hostinger VPS

Method A: Using Hostinger File Manager
1. In Hostinger Panel, go to File Manager
2. Upload frontend `dist/` files to `public_html/`
3. Upload backend to a separate folder (e.g., `~/carp-backend/`)
4. In Hostinger, go to Advanced > Node.js
5. Set up Node.js app pointing to `carp-backend/server.js`
6. Set environment variables in Hostinger panel

Method B: Using Git + SSH (Professional)
```bash
# 1. Build frontend locally
npm run build

# 2. SSH into your Hostinger server
ssh u123456789@your-server.hostinger.com

# 3. Clone backend repo
git clone https://github.com/Kichiro23/carp-backend.git

# 4. Install dependencies
cd carp-backend
npm install --production

# 5. Create .env file (use nano or vim)
nano .env
# Paste your environment variables, save (Ctrl+O, Enter, Ctrl+X)

# 6. Install PM2 (process manager)
npm install -g pm2

# 7. Start backend with PM2
pm2 start server.js --name carp-backend

# 8. Save PM2 config
pm2 save
pm2 startup

# 9. Exit SSH
exit

# 10. Upload frontend dist files via SCP or FTP
scp -r dist/* u123456789@your-server.hostinger.com:~/public_html/
```

### STEP 4: Configure Domain

1. In Hostinger Panel > Domains > yourdomain.com
2. Point A record to your VPS IP address
3. Enable SSL (Let's Encrypt) - free in Hostinger
4. Force HTTPS redirect

### STEP 5: Update Frontend API URL

In your frontend `.env.production`:
```env
VITE_API_URL=https://carpclimate.com/api
```

Update `src/config/api.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

---

## COMPLETE BUILD ORDER (PRIORITY)

### PHASE 1: CRITICAL (Must Have)
```
1. Create Express.js backend server
2. Set up MongoDB Atlas database
3. Implement JWT authentication
4. Build /api/auth/register endpoint
5. Build /api/auth/login endpoint
6. Integrate Google OAuth (frontend + backend)
7. Hash passwords with bcrypt
8. Deploy backend to Hostinger
```

### PHASE 2: ESSENTIAL (Should Have)
```
9. Migrate user data from localStorage to MongoDB
10. Build /api/profile endpoints (get, update, avatar upload)
11. Build /api/locations endpoints (CRUD)
12. Build password reset with email (Nodemailer)
13. Add rate limiting (express-rate-limit)
14. Add security headers (helmet)
15. Add input validation (express-validator)
```

### PHASE 3: PRODUCTION READY (Nice to Have)
```
16. Add Cloudinary for image storage
17. Create 404 error page
18. Add SEO meta tags (react-helmet-async)
19. Add Google Analytics
20. Add PWA support
21. Create admin dashboard
22. Add contact/feedback form
23. Add email notifications for alerts
24. Performance optimization (lazy loading, code splitting)
```

---

## ENVIRONMENT VARIABLES NEEDED

### Frontend (.env)
```
VITE_API_URL=https://yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend (.env)
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
FRONTEND_URL=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=xxx@gmail.com
EMAIL_PASS=xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## SECURITY CHECKLIST

- [x] Frontend input validation (basic)
- [ ] Password hashing (bcrypt) - NOT IMPLEMENTED
- [ ] JWT token authentication - NOT IMPLEMENTED
- [ ] HTTPS/SSL certificate - NOT IMPLEMENTED
- [ ] Rate limiting on API - NOT IMPLEMENTED
- [ ] SQL/NoSQL injection protection - NOT IMPLEMENTED
- [ ] XSS protection (helmet) - NOT IMPLEMENTED
- [ ] CORS configuration - NOT IMPLEMENTED
- [ ] Environment variables (.env) - NOT IMPLEMENTED
- [ ] API key security - NOT IMPLEMENTED
- [ ] Session management - NOT IMPLEMENTED
- [ ] Secure cookie flags - NOT IMPLEMENTED

---

## ESTIMATED DEVELOPMENT TIME

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| Phase 1 (Critical) | Backend + Auth + Google OAuth | 3-5 days |
| Phase 2 (Essential) | Database migration + APIs + Email | 2-3 days |
| Phase 3 (Polish) | SEO + PWA + Admin + Analytics | 2-3 days |
| **Total** | | **7-11 days** |

---

*End of Audit*
*CARP Development Team - BSCpE 3C 2025-2026*
