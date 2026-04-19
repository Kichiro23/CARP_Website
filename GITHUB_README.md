# CARP - Climate & Air Research Platform

## Project Overview

CARP is a fully functional Weather & Environmental Dashboard Web Application that provides real-time air quality monitoring, weather data visualization, climate news aggregation, and global environmental tracking. The system fetches live data from multiple external APIs and presents it through an intuitive, modern interface with dark/light mode support.

Developed by:
- Rommel Andrei L. De Leon
- Raiza Charine S. Galang
- John Mareign Punzalan
- Angela Sedigo
- Rowella L. Lazaro

---

## Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- Chart.js + React-ChartJS-2
- Leaflet.js (Maps)
- Lucide React (Icons)

### Backend
- PHP (API routes structure provided)
- localStorage (Client-side session management)

### APIs Integrated
- Open-Meteo Weather API - Real-time weather & air quality
- Open-Meteo Air Quality API - PM2.5, PM10 readings
- REST Countries API - Country & city data
- RSS2JSON API - News feed conversion
- The Guardian RSS - Climate news
- BBC News RSS - Science & environment news

---

## Features

### 1. Authentication
- User registration with email/password
- Login system with form validation
- Persistent sessions via localStorage
- Logout functionality
- Protected routes (dashboard requires login)

### 2. Dashboard
- Live clock display
- Current weather conditions (temperature, humidity, UV, precipitation, wind, pressure)
- Weather condition banner with "feels like" temperature
- 6 weather metric tiles with icons
- 4 real-time charts (Temperature, Humidity, UV Index, Precipitation)
- 14-day weather calendar (clickable daily forecasts)

### 3. Countries & Cities
- 26 major cities across 6 continents
- 250+ countries from REST Countries API
- Region filters (Asia, Europe, Americas, Africa, Oceania)
- City/country search with autocomplete
- Detailed data tables with population, capital, region

### 4. User Profile
- Profile picture upload/change
- Name and location editing
- View authentication method
- Save changes functionality

### 5. Climate News
- Real-time news from The Guardian & BBC
- RSS feed integration via RSS2JSON API
- Article cards with images, dates, titles, excerpts
- Manual refresh button
- 1-hour local caching
- Fallback articles when API is unavailable
- Clickable links to full articles

### 6. About Page
- Project description and mission
- Development team (5 members)
- Technology stack overview
- Data sources acknowledgment

### 7. Theme System
- Dark/Light mode toggle
- Persistent theme preference
- Full color scheme switching
- Smooth transitions

---

## API Integration

### Weather Data
```
API: Open-Meteo (Free, no key required)
Endpoints:
  - /forecast (current weather, hourly, daily)
  - /air-quality (PM2.5, PM10)
Data: Temperature, humidity, wind, UV, precipitation, pressure, visibility
```

### Countries Data
```
API: REST Countries (Free, no key required)
Endpoint: /v3.1/all
Data: Country name, capital, region, population, flag, coordinates
```

### News Data
```
API: RSS2JSON + The Guardian + BBC
Endpoints:
  - RSS2JSON converts RSS to JSON
  - Guardian Climate Crisis RSS
  - BBC Science & Environment RSS
Data: Article title, excerpt, image, publish date, source
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### First Time Use
1. Open the application in your browser
2. Click "Register" to create a new account
3. Enter your name, email, and password
4. You'll be automatically logged in

---

## Project Structure

```
app/
  src/
    components/
      Navbar.tsx         # Top navigation with theme toggle
      Footer.tsx         # Footer with team info
      Layout.tsx         # Page wrapper layout
      ProtectedRoute.tsx # Auth guard for protected pages
    pages/
      Login.tsx          # Login page
      Register.tsx       # Registration page
      Dashboard.tsx      # Main dashboard with weather/charts
      Countries.tsx      # Countries & cities explorer
      Profile.tsx        # User profile management
      News.tsx           # Climate news feed
      About.tsx          # About page with team
    hooks/
      useAuth.ts         # Authentication hook
      useTheme.ts        # Dark/light mode hook
    services/
      weatherApi.ts      # Weather API calls
      countriesApi.ts    # Countries API calls
      newsApi.ts         # News API calls
    types/
      index.ts           # TypeScript types
    config/
      api.ts             # API configuration
    App.tsx              # Root component with routes
    main.tsx             # Entry point
```

---

## Deployment

### Static Deployment
```bash
npm run build
dist/ folder contains production files
```

### .com Domain Setup
1. Purchase a domain from a registrar
2. Set up hosting with PHP support (required for backend)
3. Upload dist/ contents to public_html
4. Configure domain DNS to point to hosting
5. Set up SSL certificate (HTTPS)

### PHP Backend Setup
The frontend is a static React SPA. For the PHP backend:
1. Set up Apache/Nginx with PHP 8.0+
2. Configure MongoDB or MySQL database
3. Deploy PHP API routes for auth and data
4. Update frontend API calls to point to your PHP backend URL

---

## Team Contributions

| Member | Contribution |
|--------|-------------|
| Rommel Andrei L. De Leon | Project lead, architecture, API integration |
| Raiza Charine S. Galang | Dashboard design, charts, weather data |
| John Mareign Punzalan | Countries/cities page, search functionality |
| Angela Sedigo | News system, profile page, UI components |
| Rowella L. Lazaro | Authentication, theme system, testing |

---

## License

This project is for educational purposes as part of the Climate & Air Research Platform initiative.
