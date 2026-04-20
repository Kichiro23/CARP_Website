# CARP - Climate & Air Research Platform

![CARP Logo](app/public/logo.png)

**CARP** is a comprehensive climate and air quality monitoring platform built with React, TypeScript, and a real Node.js backend. It provides real-time weather data, air quality index tracking, interactive global mapping, and climate news for 75+ cities worldwide including full Philippine coverage.

---

## Features

### Weather & Climate
- **Real-time weather data** from Open-Meteo API (temperature, humidity, wind, UV, precipitation)
- **Air Quality Index (AQI)** monitoring with PM2.5 data
- **7-day forecasts** with daily and hourly breakdowns
- **Interactive weather charts** using Chart.js
- **City comparison tool** side-by-side weather metrics

### Global Coverage
- **75+ cities** across 6 continents
- **15 Philippine cities** including Manila, Quezon City, Cebu, Davao, Baguio
- **Interactive Leaflet map** with temperature-coded markers and AQI popups
- **Search with autocomplete** and fly-to-location

### Data & News
- **Real climate news** from The Guardian and BBC via RSS2JSON
- **REST Countries API** integration with flags and demographics
- **AI-powered weather insights** for each location

### Authentication (Real Backend)
- **Email/password registration** with bcrypt-hashed passwords
- **JWT token authentication** with 24h expiry + refresh tokens
- **Google OAuth 2.0** sign-in support
- **Protected routes** with auth guards
- **User profiles** with password change and account deletion

### Design
- **Cloud video background** on all pages (generated, not static)
- **iOS 26 glassmorphism** design system
- **Dark/light mode** toggle
- **Fully responsive** mobile-first layout
- **No text overlap** - proper padding and truncation throughout

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router | Client-side routing (HashRouter) |
| Chart.js + react-chartjs-2 | Weather charts |
| React-Leaflet | Interactive maps |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | API server |
| TypeScript | Type safety |
| JSON file database | Persistent storage (no SQLite compilation needed) |
| bcryptjs | Password hashing (12 rounds) |
| jsonwebtoken | JWT authentication |
| Google Identity Services | Real Google OAuth |

### External APIs
| API | Data |
|---|---|
| Open-Meteo | Weather forecasts |
| Open-Meteo Air Quality | PM2.5 AQI data |
| RSS2JSON | Climate news feeds |
| REST Countries | Country data & flags |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Clone & Install Frontend
```bash
cd app
npm install
```

### 2. Install & Start Backend
```bash
cd ../carp-backend
npm install
npm run build
node dist/index.js
```
Backend runs on `http://localhost:3001`

### 3. Configure Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web application)
3. Add `http://localhost:5173` to Authorized JavaScript origins
4. Copy Client ID to `app/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
5. Copy Client ID & Secret to `carp-backend/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Start Frontend
```bash
cd app
npm run dev
```
Opens on `http://localhost:5173`

---

## Project Structure

```
app/                        # Frontend (React + Vite)
  src/
    components/             # Reusable components
      CarpLogo.tsx
      Footer.tsx
      GoogleSignIn.tsx
      Layout.tsx
      Navbar.tsx
      VideoBackground.tsx
    hooks/
      useAuth.ts            # Authentication hook
      useTheme.ts           # Dark/light mode
    pages/                  # 15 pages
      Login.tsx
      Register.tsx
      Dashboard.tsx
      LiveMap.tsx
      Countries.tsx
      Compare.tsx
      Analytics.tsx
      Trends.tsx
      Alerts.tsx
      News.tsx
      About.tsx
      Profile.tsx
      Settings.tsx
      Security.tsx
    services/
      api.ts                # Backend API client
      weatherApi.ts         # Open-Meteo integration
      newsApi.ts            # RSS2JSON feeds
      countriesApi.ts       # REST Countries
      phCitiesApi.ts        # Philippine cities data
      countriesList.ts      # Country dropdown list
    types/                  # TypeScript interfaces
  public/
    logo.png                # CARP logo
    videos/
      clouds.mp4            # Background video
  .env                     # Frontend env vars
  vite.config.ts
  tailwind.config.js

carp-backend/               # Backend (Express + Node.js)
  src/
    db/
      jsonDb.ts             # JSON database engine
      users.ts              # User CRUD operations
      tokens.ts             # Refresh token management
    middleware/
      jwt.ts                # JWT auth middleware
    routes/
      auth.ts               # Login, register, Google OAuth
      user.ts               # Profile, password, delete
    index.ts                # Express server entry
  .env                     # Backend env vars
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account (name, email, password) |
| POST | `/api/auth/login` | Login (email, password) |
| POST | `/api/auth/google` | Google OAuth callback |
| GET | `/api/auth/me` | Get current user (requires Bearer token) |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/refresh` | Refresh access token |

### User
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/profile` | Get user profile |
| PATCH | `/api/user/profile` | Update profile |
| POST | `/api/user/change-password` | Change password |
| DELETE | `/api/user/account` | Delete account |

---

## Environment Variables

### Frontend (`app/.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend (`carp-backend/.env`)
```env
PORT=3001
JWT_SECRET=your-super-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DB_PATH=./carp.json
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Team

Developed by **BSCpE 3C Students 2026**

| Name | Role |
|---|---|
| Rommel De Leon | Lead Developer |
| Raiza Galang | UI/UX Designer |
| Angela Sedigo | Frontend Developer |
| John Punzalan | Backend Developer |
| Rowella Lazaro | QA & Documentation |

---

## License

This project was created for academic purposes at [Your University Name].

---

## Screenshots

*Coming soon - Dashboard, Live Map, Analytics, Login, Register*
