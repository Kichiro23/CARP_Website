# CARP - Climate & Air Research Platform

![CARP Logo](app/public/logo.png)

**CARP** is a comprehensive environmental data platform that monitors, analyzes, and visualizes the state of our environment - from atmospheric conditions and air quality to water systems, soil health, and fire risk. It transforms raw environmental measurements into actionable insights for individuals, communities, and researchers.

Developed by **BSCpE 3C Students** at **Bulacan State University** as a capstone project for the Academic Year **2025-2026**.

**Live Site:**
- 🌐 **Production:** https://weathercarp.com
- 📦 **GitHub Pages:** https://Kichiro23.github.io/CARP_Website

---

## What is CARP?

**CARP** stands for **Climate & Air Research Platform**.

CARP was built to democratize access to environmental data. We believe that understanding our environment - its air, water, soil, and climate - is the first step toward protecting it. By aggregating data from global monitoring networks, satellite observations, and meteorological models, CARP empowers users to make informed decisions about their health, safety, and impact on the planet.

The platform spans four environmental domains:
- 🌬️ **Atmospheric** - Weather, air quality, UV radiation, and climate trends
- 💧 **Aquatic** - Sea surface temperature, wave height, and river discharge
- 🌱 **Terrestrial** - Soil moisture, soil temperature, and agricultural insights
- 🔥 **Risk Assessment** - Wildfire risk calculation based on environmental factors

---

## Table of Contents

- [Features](#features)
- [User Manual](#user-manual)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Developers](#developers)
- [Data Sources](#data-sources)

---

## Features

### 🌦️ Weather & Climate Monitoring
- **Real-time weather data** - temperature, humidity, wind speed & direction, UV index, precipitation, visibility, cloud cover, surface pressure
- **7-day weather forecasts** - daily and hourly breakdowns with emoji-coded weather conditions
- **48-hour temperature & precipitation trends** - interactive charts
- **Sunrise & sunset tracking** - day length calculation
- **This Day Last Year** - historical weather comparison
- **Weather sharing** - copy current conditions to clipboard

### 🛡️ Air Quality Monitoring
- **6 pollutant tracking** - PM2.5, PM10, CO, NO₂, O₃, SO₂
- **AQI classification** - Good to Hazardous with color-coded indicators
- **24-hour PM2.5 forecast chart** - predictive air quality trends
- **Health recommendations** - tailored advice based on current AQI levels

### 🗺️ Interactive Live Map
- **60+ preloaded cities** across 6 continents with 20+ Philippine cities
- **PM2.5 color-coded markers** - green (Good) to purple (Hazardous)
- **Precipitation radar overlay** - real-time rain tracking via Open-Meteo tiles
- **Cloud cover overlay** - satellite-style cloud layer
- **Weather detail panel** - click any marker for full weather + 3-day mini forecast
- **Custom city search** - add any city globally with localStorage persistence
- **Auto-geolocation** - center map on your current location

### 🌍 Environmental Monitoring (New)
- **Water & Marine Systems** - sea surface temperature, wave height, river discharge
- **Soil & Agriculture** - soil moisture (0-1cm) and soil temperature (0-7cm) with crop recommendations
- **UV & Solar Radiation** - 7-day UV index forecast with SPF protection guide
- **Wildfire Risk Assessment** - fire risk calculator based on temperature, humidity, wind, and evapotranspiration

### 🔬 Analytics & Insights
- **Analytics Hub** - Overview, Trends, and Alerts in one place
  - Overview: 7-day temp range bar charts, weather condition doughnut charts
  - Trends: 48-hour & 14-day outlook charts, temperature stats, rain probability bars
  - Alerts: auto-generated heat, UV, wind, rain, fog, and humidity alerts with severity levels
- **City Comparison** - side-by-side weather metrics for any two cities
- **City Battle** - Philippine city weather competition with comfort scoring
- **Time Machine** - historical weather lookup from 1940 to present
- **Heatmap Calendar** - year-long temperature heatmap with stats
- **Holiday Forecast** - real weather forecasts for upcoming Philippine holidays
- **Typhoon Tracker** - wind & pressure monitoring with interactive Leaflet maps

### 🤖 AI-Powered Chat Assistant
- **CARP AI** - floating chatbot powered by Google Gemini 2.0 Flash API
- **Offline fallback** - rule-based responses when API quota is exceeded
- **Smart topic detection** - weather, AQI, environmental data, account help, team info
- **Available on every page** - bottom-right floating widget

### 📓 Personal Tools
- **Weather Journal** - personal environmental diary with auto-filled weather data, mood tracking, and statistical insights
- **Zen Mode** - 5 ambient nature sounds (rain, ocean, forest, fire, wind) with guided breathing exercises
- **Ambient Soundscape** - global sound controls in the navbar for background nature sounds

### 📰 Climate News & Data
- **Real-time climate news** - latest environmental articles from The Guardian and BBC
- **Country Explorer** - flags, capitals, populations, and geographic data for all nations
- **Widget** - embeddable weather card with query parameters for external sites

### 🎨 Design & UX
- **Cloud video background** - dynamic animated backdrop on landing page (theme-aware)
- **Glassmorphism design** - modern frosted-glass UI elements
- **Dark & light mode** - full theme system with CSS variables and localStorage persistence
- **Fully responsive** - mobile, tablet, and desktop optimized
- **Smooth animations** - page transitions and micro-interactions

### 🔐 User Account System
- **Email/password registration** - secure account creation with validation
- **Google Sign-In** - one-click OAuth authentication
- **User profiles** - customizable settings and saved locations
- **Password management** - secure change password + email-based forgot password reset
- **Saved locations** - add/remove favorite cities, set a default location

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
| **Severe Weather Alerts** | Auto-generated alerts for extreme conditions |
| **7-Day Forecast** | Scrollable daily weather predictions with emoji icons |
| **Sun & Moon** | Sunrise, sunset, and daylight duration |
| **This Day Last Year** | Historical weather comparison |
| **PM2.5 Forecast (24h)** | Predictive air quality chart |
| **Air Quality Index** | Color-coded AQI with pollutant breakdown |
| **AI Recommendations** | Smart clothing, travel, and health advice |
| **Temperature & Precipitation Charts** | 24-hour interactive charts |
| **Climate News** | Latest environmental articles |

### Navigation Menu

| Page | Description |
|------|-------------|
| **Dashboard** | Main hub with weather, AQI, forecasts, and news |
| **Live Map** | Interactive map with AQI markers, radar, and cloud overlays |
| **Explore** | Countries directory, city comparison, and Philippine city battle |
| **Analytics** | Overview charts, 14-day trends, and weather alerts |
| **Tools** | Time Machine, Heatmap Calendar, Holiday Forecast, Typhoon Tracker |
| **Environment** | Water/marine, soil, UV/solar, and wildfire risk data |
| **Journal** | Personal weather diary and Zen Mode with ambient sounds |
| **Air Quality** | Detailed pollutant monitoring and health recommendations |
| **News** | Latest climate and environmental articles |
| **About** | Platform information, team, features, and data sources |

### Main Features

#### Live Map
- Click **"Live Map"** in the navigation bar
- Explore 60+ default cities with interactive AQI markers
- **Toggle overlays** - Precipitation Radar and Cloud Cover layers
- **Search any city** using the search bar
- **Click any marker** to open the detail panel with full weather + 3-day forecast
- **Locate Me** button centers the map on your current GPS position

#### Environment
- Visit **"Environment"** for specialized environmental data
- **Water & Marine** - check sea surface temperature, wave height, and river discharge
- **Soil & Agriculture** - view soil moisture and temperature with crop recommendations
- **UV & Solar** - see 7-day UV forecasts and SPF protection advice
- **Fire Risk** - assess wildfire risk based on real environmental factors

#### Compare Cities
- Go to **"Explore"** → **"Compare"** tab
- Enter two city names and view side-by-side weather metrics
- See 7-day forecast comparison and winner summary

#### Time Machine
- Go to **"Tools"** → **"Time Machine"** tab
- Select any date from 1940 to present
- View historical weather with fun facts

#### CARP AI Chatbot
- Look for the **orange message icon** in the bottom-right corner
- Ask about weather, air quality, environmental data, or how to use CARP
- If the AI is busy, it switches to offline mode with rule-based answers

### Account Management

#### Profile Settings
- Click your **avatar** in the top right → **"Profile"**
- Update your name or manage saved locations

#### Settings
- Go to **"Settings"** from the profile menu
- Toggle **Dark Mode / Light Mode**
- Enable/disable ambient soundscape

#### Change Password
- Go to **"Security"** from the profile menu
- Enter current and new password

#### Log Out
- Click your **avatar** → **"Log Out"**

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Router (Navigation)
- Chart.js + react-chartjs-2 (Data Visualization)
- React-Leaflet + Leaflet (Maps)
- Lucide React (Icons)

### Backend
- Node.js + Express
- MongoDB Atlas (Database)
- JWT Authentication
- Google OAuth 2.0
- bcrypt (Password Hashing)
- Nodemailer (Password Reset Emails)

### External APIs
| API | Purpose |
|-----|---------|
| Open-Meteo Forecast | Weather data, forecasts, historical data |
| Open-Meteo Air Quality | PM2.5, PM10, CO, NO₂, O₃, SO₂ monitoring |
| Open-Meteo Marine | Sea surface temperature, wave height |
| Open-Meteo Flood | River discharge data |
| Open-Meteo Geocoding | City search and reverse geocoding |
| REST Countries | Country demographics and flags |
| The Guardian / BBC RSS | Climate news feeds |
| Google Gemini 2.0 Flash | AI chatbot |

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        A["Browser / Mobile"]
        B["React 19 + Vite SPA"]
        C["Tailwind CSS UI"]
    end

    subgraph CDN["CDN / Static Hosting"]
        D["Hostinger / GitHub Pages<br/>Dist Folder"]
    end

    subgraph Backend["Backend Layer (Render)"]
        E["Node.js + Express"]
        F["JWT Auth Middleware"]
        G["bcrypt + Nodemailer"]
    end

    subgraph Database["Database Layer"]
        H[("MongoDB Atlas<br/>Cloud Cluster")]
    end

    subgraph APIs["External APIs"]
        I["Open-Meteo APIs"]
        J["REST Countries"]
        K["Google Gemini AI"]
        L["Guardian / BBC RSS"]
    end

    A -->|HTTPS| D
    D -->|Serves| B
    B -->|REST JSON| E
    E -->|Mongoose| H
    B -->|Direct Fetch| I
    B -->|Direct Fetch| J
    B -->|Direct Fetch| K
    B -->|Direct Fetch| L
    E -->|OAuth Verify| M["Google OAuth 2.0"]
```

### Architecture Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Presentation** | React 19 + TypeScript + Vite | SPA with component-based UI |
| **Styling** | Tailwind CSS + CSS Variables | Responsive glassmorphism design |
| **Routing** | React Router (HashRouter) | Client-side navigation |
| **State** | React Hooks + localStorage | Auth, locations, theme, cache |
| **API Client** | Native fetch + cache layer | Open-Meteo with 1h localStorage TTL |
| **Backend** | Express.js on Render | Auth, user data, locations |
| **Database** | MongoDB Atlas | Users, saved locations |
| **Auth** | JWT + Google OAuth 2.0 | Secure session management |
| **Hosting** | Hostinger + GitHub Pages | Static frontend distribution |

---

## API Documentation

### Base URL
```
Production: https://carp-backend.onrender.com/api
Local:      http://localhost:3001/api
```

### Authentication
All protected routes require a `Bearer` token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user (name, email, password) |
| `POST` | `/api/auth/login` | No | Login with email/password |
| `POST` | `/api/auth/google` | No | Google OAuth login/registration |
| `POST` | `/api/auth/forgot-password` | No | Request password reset email |
| `POST` | `/api/auth/reset-password` | No | Reset password with token |
| `GET` | `/api/auth/me` | Yes | Get current authenticated user |

#### Profile Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/profile` | Yes | Get full user profile |
| `PUT` | `/api/profile` | Yes | Update name/avatar |
| `POST` | `/api/profile/avatar` | Yes | Upload avatar image (Base64) |
| `PUT` | `/api/profile/password` | Yes | Change password (current + new) |
| `PUT` | `/api/profile/default-location` | Yes | Update default city coordinates |

#### Location Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/locations` | Yes | List all saved locations for user |
| `POST` | `/api/locations` | Yes | Save a new location |
| `DELETE` | `/api/locations/:id` | Yes | Remove a saved location |
| `PUT` | `/api/locations/:id/default` | Yes | Set location as default |

#### System Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Health check - returns DB connection status |

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Database Schema

CARP uses **MongoDB Atlas** with **Mongoose ODM**. The database contains two main collections:

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,              // required, trimmed
  email: String,             // required, unique, lowercase
  password: String,          // hashed with bcrypt (12 rounds)
  avatar: String,            // Base64 image or URL
  authProvider: String,      // "local" | "google"
  googleId: String,          // only for OAuth users
  isVerified: Boolean,       // default: true
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  defaultLocation: {
    name: String,            // default: "Manila"
    country: String,         // default: "Philippines"
    lat: Number,             // default: 14.5995
    lng: Number              // default: 120.9842
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Locations Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,            // ref: User, indexed
  name: String,              // e.g. "Tokyo"
  country: String,           // e.g. "Japan"
  lat: Number,               // latitude
  lng: Number,               // longitude
  isDefault: Boolean,        // default: false
  createdAt: Date,
  updatedAt: Date
}
```

### Schema Relationships

```
┌─────────────┐       1:M       ┌─────────────┐
│    Users    │◄───────────────►│  Locations  │
│  (auth)     │                 │ (saved)     │
└─────────────┘                 └─────────────┘
```

- One user can have **many** saved locations
- Locations are **cascading deleted** when a user is removed
- The `defaultLocation` is stored **inline** on the User document for fast reads

---

## Deployment

```mermaid
graph LR
    subgraph Dev["Development"]
        A["Local Machine<br/>VS Code"]
        B["Git<br/>Commits"]
    end

    subgraph Repo["Repository"]
        C["GitHub<br/>Main Branch"]
    end

    subgraph CI["Build & Deploy"]
        D["npm run build<br/>Vite Bundler"]
        E["dist/ Folder"]
    end

    subgraph FrontendHost["Frontend Hosting"]
        F["Hostinger<br/>weathercarp.com"]
        G["GitHub Pages<br/>Kichiro23.github.io"]
    end

    subgraph BackendHost["Backend Hosting"]
        H["Render.com<br/>carp-backend.onrender.com"]
    end

    subgraph DB["Database"]
        I[("MongoDB Atlas<br/>M0 Free Tier")]
    end

    A --> B --> C
    C --> D --> E
    E --> F
    E --> G
    C -->|Auto-deploy| H
    H --> I
```

### Deployment Flow

| Step | Action | Tool/Platform |
|------|--------|--------------|
| 1 | Developer commits code | Git |
| 2 | Push to `main` branch | GitHub |
| 3 | Frontend build | `cd app && npm run build` (Vite) |
| 4 | Upload `dist/` folder | Hostinger File Manager |
| 5 | Backend auto-deploys | Render (GitHub integration) |
| 6 | Database connection | MongoDB Atlas |

### Environment Variables

#### Frontend (`.env`)
```env
VITE_API_BASE_URL=https://carp-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Backend (`.env`)
```env
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/carp
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=https://weathercarp.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## Developers

Developed by **BSCpE 3C Students**

**Bulacan State University** · Academic Year **2025-2026**

| Name | Role |
|------|------|
| Rommel Andrei L. De Leon | Developer |
| Raiza Charine H. Galang | Developer |
| Cristina Angela G. Sedigo | Developer |
| John Mareign B. Punzalan | Developer |
| Rowella L. Lazaro | Developer |

---

## Data Sources

CARP aggregates environmental data from multiple authoritative sources:

- **Open-Meteo** - Global weather forecasts, historical reanalysis, air quality, marine, flood, and soil data
- **Open-Meteo Air Quality** - Real-time pollutant concentrations from CAMS (Copernicus Atmosphere Monitoring Service)
- **Open-Meteo Marine** - Sea surface temperature and wave data from ERA5 and satellite observations
- **Open-Meteo Flood** - River discharge from GloFAS (Global Flood Awareness System)
- **REST Countries** - Country information and geographic data
- **The Guardian & BBC** - Environmental journalism and climate reporting

---

## Acknowledgments

This project was created for academic purposes as part of the Bachelor of Science in Computer Engineering program at Bulacan State University.

**CARP - Climate & Air Research Platform · 2025-2026**

