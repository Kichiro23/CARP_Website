# CARP - Climate & Air Research Platform

![CARP Logo](app/public/logo.png)

**CARP** is a comprehensive climate and air quality monitoring web application that provides real-time weather data, air quality index tracking, interactive global mapping, AI-powered assistance, and climate news for cities worldwide.

Developed by **BSCPE 3C Students** as a capstone project.

**Live Sites:**
- 🌐 **Production:** https://weathercarp.com
- 🌐 **GitHub Pages:** https://Kichiro23.github.io/CARP_Website

---

## Table of Contents

- [Features](#features)
- [User Manual](#user-manual)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [API Configuration](#api-configuration)
- [Deployment](#deployment)
- [Developers](#developers)

---

## Features

### Weather & Climate Monitoring
- **Real-time weather data** – temperature, humidity, wind speed, UV index, precipitation, visibility
- **Air Quality Index (AQI)** – PM2.5 monitoring with health recommendations
- **7-day weather forecasts** – daily and hourly breakdowns
- **Interactive weather charts** – visual analytics using Chart.js
- **City comparison tool** – side-by-side weather metrics for multiple cities
- **Weather alerts** – custom notifications for weather conditions

### Global Coverage
- **60+ preloaded cities** across 6 continents
- **20+ Philippine cities** including Manila, Quezon City, Cebu, Davao, Baguio, Bulacan, Pampanga, and more
- **City search** – search and add any city globally using Open-Meteo geocoding
- **Searched cities persistence** – your searched cities are saved to localStorage
- **Interactive world map** – color-coded markers by PM2.5 AQI level with live weather popups
- **Auto-geolocation** – detects your current location on load

### AI-Powered Chat Assistant
- **CARP AI** – floating chatbot powered by Google Gemini 2.0 Flash API
- **Offline fallback** – rule-based responses when API quota is exceeded or connection fails
- **Smart topic detection** – weather, AQI, map features, account help, team info, and more
- **Available on every page** – bottom-right floating widget

### Data & Insights
- **Real-time climate news** – latest environmental news feeds
- **Country information** – flags, demographics, capitals, and geographic data
- **Weather analytics** – trend analysis and pattern recognition
- **Historical trends** – long-term weather pattern visualization

### User Account System
- **Email/password registration** – secure account creation with validation
- **Google Sign-In** – one-click OAuth authentication
- **User profiles** – customizable settings and saved locations
- **Password management** – secure change password + email-based forgot password reset
- **Session management** – automatic logout, 401 handling, and token refresh
- **Saved locations** – add/remove favorite cities, set a default location

### Design & UX
- **Cloud video background** – dynamic animated backdrop on landing page
- **Glassmorphism design** – modern frosted-glass UI elements
- **Dark & light mode** – full theme system with CSS variables and localStorage persistence
- **Fully responsive** – mobile, tablet, and desktop optimized
- **Smooth animations** – page transitions and micro-interactions
- **Debounced search** – 350ms debounce on city search for performance

---

## User Manual

### Getting Started

#### 1. Landing Page
- Visit the website to see the animated landing page
- Click **"Get Started"** or **"Sign In"** to access the platform

#### 2. Create an Account
- Click **"Create Account"** on the login page
- Fill in your **full name**, **email address**, and **password** (min 6 characters)
- Alternatively, click **"Sign in with Google"** for instant registration

#### 3. Log In
- Enter your **email** and **password**
- Click **"Sign In"**
- Or use **Google Sign-In** for faster access

### Dashboard Navigation

After logging in, you will see the **Dashboard** with:

| Section | Description |
|---------|-------------|
| **Current Weather** | Live weather for your selected location |
| **7-Day Forecast** | Scrollable daily weather predictions |
| **Hourly Forecast** | Hour-by-hour breakdown for today |
| **Air Quality** | AQI reading with health recommendations |
| **Weather Charts** | Interactive temperature and humidity graphs |

### Main Features

#### Live Map
- Click **"Live Map"** in the navigation bar
- Explore 60+ default cities with interactive markers
- **Search any city** using the search bar – type a city name and select from dropdown
- Click any marker to see live weather + PM2.5 data
- Markers are **color-coded by AQI level** (green = good, red = hazardous)
- Your searched cities are saved automatically and persist across sessions
- Click the **×** on a popup to remove a searched city

#### Compare Cities
- Go to **"Compare"** page
- Select two or more cities
- View side-by-side weather metrics

#### Analytics
- Visit **"Analytics"** for detailed charts
- View temperature trends over time
- Analyze humidity and precipitation patterns

#### Trends
- Go to **"Trends"** for historical weather pattern analysis
- View long-term climate data visualizations

#### Alerts
- Visit **"Alerts"** to set custom weather notifications
- Configure conditions for temperature, rain, or AQI thresholds

#### News
- Check **"News"** for latest climate articles
- Read environmental updates from trusted sources

#### Countries
- Browse **"Countries"** for global data
- View flags, capitals, populations, and geographic information

#### CARP AI Chatbot
- Look for the **orange message icon** in the bottom-right corner of any page
- Click it to open the chat panel
- Ask about weather, air quality, how to use CARP, or the team
- If the AI is busy (API limit), it switches to offline mode with instant rule-based answers

### Account Management

#### Profile Settings
- Click your **avatar** in the top right
- Select **"Profile"** to view your information
- Update your name or email as needed
- Manage your saved locations (add, remove, set default)

#### Settings
- Go to **"Settings"** from the profile menu
- Toggle between **Dark Mode** and **Light Mode**
- Switch temperature units (°C / °F)
- Clear local cache

#### Change Password
- Go to **"Security"** from the profile menu
- Enter your current password
- Set a new password (minimum 6 characters)

#### Forgot Password
- On the login page, click **"Forgot Password?"**
- Enter your registered email
- Check your inbox for a reset link
- Set a new password

#### Log Out
- Click your **avatar** → **"Log Out"**
- You will be redirected to the login page

---

## Screenshots

| Page | Description |
|------|-------------|
| Landing Page | Animated intro with cloud video background |
| Dashboard | Main weather overview with charts |
| Live Map | Interactive world map with city markers & search |
| Compare | Side-by-side city weather comparison |
| Analytics | Detailed weather trend charts |
| Trends | Historical weather pattern analysis |
| Alerts | Custom weather notification settings |
| News | Climate and environmental news feed |
| Profile | User account & saved locations |
| Settings | Theme, units, and cache management |

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Router (Navigation)
- Chart.js (Data Visualization)
- React-Leaflet (Maps)
- Lucide React (Icons)

### Backend
- Node.js + Express
- MongoDB Atlas (Database)
- JWT Authentication
- Google OAuth 2.0
- bcrypt (Password Hashing)
- Nodemailer (Password Reset Emails)

### External APIs
- Open-Meteo (Weather Data)
- Open-Meteo Air Quality (AQI / PM2.5 Data)
- Open-Meteo Geocoding (City Search)
- REST Countries (Country Information)
- Google Gemini 2.0 Flash (AI Chatbot)

---

## API Configuration

### Google Gemini (CARP AI Chatbot)
1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it to `app/.env`:
   ```
   VITE_GEMINI_API_KEY=your-key-here
   ```
3. The chatbot falls back to rule-based responses automatically if the API quota is exceeded.

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized JavaScript origins:
   - `https://weathercarp.com`
   - `https://Kichiro23.github.io`
   - `http://localhost:3000` (for local dev)
4. Add the Client ID to `app/.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

### Backend Environment Variables
Create `carp-backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/carp
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://weathercarp.com
```

---

## Deployment

### Frontend (Hostinger)
1. Build: `cd app && npm run build`
2. Upload `app/dist/` contents to `public_html/`
3. Update `index.html` script src if the hashed JS filename changed

### Frontend (GitHub Pages)
1. Build & deploy: `cd app && npm run deploy`
2. Uses `HashRouter` for SPA routing compatibility

### Backend (Render)
1. Connect your GitHub repo to [Render](https://render.com)
2. Set root directory to `carp-backend/`
3. Add environment variables from `.env`
4. Deploy

---

## Developers

Developed by **BSCPE 3C Students**

Academic Year **2025-2026**

| Name | Role |
|------|------|
| Rommel Andrei L. De Leon | Lead Developer |
| Raiza Charine H. Galang | UI/UX Designer |
| Cristina Angela G. Sedigo | Frontend Developer |
| John Mareign B. Punzalan | Backend Developer |
| Rowella L. Lazaro | QA & Documentation |

---

## Acknowledgments

This project was created for academic purposes as part of the Bachelor of Science in Computer Engineering program.

**2025-2026**
