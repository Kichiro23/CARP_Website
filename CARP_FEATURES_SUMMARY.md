# CARP – Climate & Air Research Platform
## Capstone Project Features Summary

**Team:** BSCPE 3C  
**Members:** Rommel Andrei L. De Leon, Raiza Charine H. Galang, Cristina Angela G. Sedigo, John Mareign B. Punzalan, Rowella L. Lazaro  
**Academic Year:** 2025–2026

**Live Website:** https://weathercarp.com  
**GitHub:** https://github.com/Kichiro23/CARP_Website

---

## What CARP Does

CARP is a full-stack web application that provides real-time weather data, air quality monitoring, and climate insights for cities worldwide — with a special focus on Philippine cities.

---

## Core Features

### 1. Real-Time Weather Dashboard
- Current weather: temperature, humidity, wind speed, UV index, precipitation, visibility
- 7-day daily forecast with scrollable cards
- Hour-by-hour breakdown for today
- Auto-detects user location on login

### 2. Air Quality Index (AQI) Monitoring
- Live PM2.5 readings from Open-Meteo
- Color-coded health levels: Good → Moderate → Unhealthy for Sensitive → Unhealthy → Hazardous
- Health recommendations based on current AQI

### 3. Interactive Live Map
- 60+ preloaded cities worldwide (20+ in the Philippines)
- **Search any city globally** — type and select from dropdown results
- Color-coded markers based on PM2.5 level
- Click markers for live weather + AQI popups
- Searched cities save automatically (localStorage persistence)

### 4. CARP AI Chatbot
- Floating chat widget on every page (bottom-right)
- Powered by **Google Gemini 2.0 Flash**
- **Offline fallback** — rule-based responses when API quota is exceeded
- Answers questions about weather, AQI, website features, and the team

### 5. City Comparison & Analytics
- **Compare** — side-by-side weather metrics for multiple cities
- **Analytics** — interactive Chart.js graphs for temperature, humidity, trends
- **Trends** — historical weather pattern analysis
- **Alerts** — custom weather notification settings

### 6. Climate News & Country Data
- **News** — real-time climate/environmental articles from RSS feeds
- **Countries** — browse flags, capitals, populations, and geographic data

### 7. User Account System
- Email/password registration with validation
- **Google Sign-In** (OAuth 2.0)
- User profiles with saved locations (add/remove/set default)
- Password change + email-based forgot password reset
- Secure JWT session management with auto-logout

### 8. Design & UX
- **Dark & Light Mode** — full theme system with toggle and localStorage persistence
- Glassmorphism UI with cloud video background
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router, Chart.js, React-Leaflet |
| **Backend** | Node.js, Express, MongoDB Atlas, JWT, bcrypt |
| **Authentication** | Google OAuth 2.0, email/password |
| **External APIs** | Open-Meteo (Weather + AQI + Geocoding), REST Countries, Google Gemini |
| **Deployment** | Hostinger (Frontend), Render (Backend), GitHub Pages (Mirror) |

---

## What Was Built & Completed

✅ Full frontend with 12+ pages (Dashboard, Map, AQI, Compare, Analytics, Trends, Alerts, News, Countries, Profile, Settings, Security)  
✅ RESTful backend API with MongoDB database  
✅ JWT authentication + Google OAuth  
✅ Password reset via email (Nodemailer)  
✅ Real-time weather & AQI data integration  
✅ Interactive world map with search  
✅ AI chatbot with fallback system  
✅ Dark/Light mode theme system  
✅ Responsive design across all devices  
✅ Live deployment on custom domain (weathercarp.com)
