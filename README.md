# CARP - Climate & Air Research Platform

A comprehensive, interactive web application for monitoring global air quality, tracking environmental data, and staying updated on climate research. Built as a single-page application (SPA) with dark/light mode support.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Pages & Sections](#pages--sections)
- [Technology Stack](#technology-stack)
- [APIs Used](#apis-used)
- [Getting Started](#getting-started)
- [User Authentication](#user-authentication)
- [File Structure](#file-structure)
- [Development Team](#development-team)

---

## Overview

CARP (Climate & Air Research Platform) is a real-time environmental monitoring dashboard that provides:

- Live air quality data from 150+ monitoring stations across 48 countries and 342 cities
- Interactive maps with color-coded pollution markers
- Historical pollution trends and 30-day forecasts
- Real-time climate news updates from The Guardian and BBC
- City-to-city air quality comparison tools
- Automated air quality alerts and warnings

---

## Features

### Core Functionality
- **Real-Time Data Dashboard** - Live PM2.5, temperature, humidity, and wind speed readings
- **Interactive World Map** - Leaflet-powered map with air quality station markers
- **Dark/Light Mode Toggle** - Full theme switching with persistent preference
- **User Authentication** - Registration and login system with local storage
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Data Caching** - News and weather data cached locally for performance

### Data Visualization
- Chart.js-powered charts (line, bar, radar, doughnut)
- Color-coded AQI badges (Good, Moderate, Poor, Hazardous)
- Trend indicators with up/down/stable arrows
- Regional comparison bar charts
- Historical 5-year pollution trend lines
- 30-day pollution forecast model

---

## Pages & Sections

### 1. Login / Registration
- Clean split-screen design with visual branding
- Form validation with error messages
- Account creation with email/password
- Persistent login sessions via localStorage

### 2. Dashboard
- **Stats Bar**: Active monitors (156), Countries (48), Cities (342), Active alerts (12)
- **Environmental Cards**: PM2.5 AQI, Temperature, Humidity, Wind Speed with trend arrows
- **Live Pollution Chart**: Line chart showing PM2.5 levels across 5 major cities
- **Quick-Access Cards**: Clickable image cards linking to Alerts, Map, and News

### 3. Live Map
- Full-screen Leaflet map with dark/light tile layers
- Color-coded circle markers for each monitored city:
  - **Green (#10b981)**: Moderate pollution
  - **Orange (#f59e0b)**: Poor pollution
  - **Red (#ef4444)**: Hazardous pollution
- Clickable popups showing city name, PM2.5 reading, and status
- Filter buttons (All, Good, Moderate, Poor)

### 4. Countries
- Searchable data table with all monitored cities
- Columns: Country (with flag), City, Region, PM2.5, PM10, AQI Status, Last Updated
- Color-coded status badges (Good/Moderate/Poor/Hazardous)
- Filter by region (Asia, Americas, Europe)
- Real-time data from Open-Meteo Air Quality API

### 5. City Comparison
- Side-by-side radar chart comparing two cities
- Metrics: PM2.5, PM10, NO2, SO2, O3
- Dropdown selectors for City A and City B
- Cities: Manila, Beijing, Delhi, Tokyo, London, New York

### 6. Analytics
- **Historical Trends (5 Years)**: Multi-line chart comparing Asia, Europe, Americas
- **Pollution by Source**: Doughnut chart (Transport, Industry, Agriculture, Residential, Natural)
- **Regional Comparison**: Bar chart of average PM2.5 by continent

### 7. Trends
- **City Trend Cards**: 6 cards showing PM2.5 trends with change percentages
- **30-Day Forecast**: Line chart with predicted PM2.5 and upper bound
- Trend icons: trending up, down, or stable

### 8. Active Alerts
- Auto-generated alerts based on real-time air quality data
- **Danger Alerts**: PM2.5 >= 55 (hazardous - avoid outdoor activities)
- **Warning Alerts**: PM2.5 35-55 (poor - sensitive groups limit exposure)
- **All Clear**: Shows when all cities are within acceptable levels
- Alert metadata: timestamp, region, exact PM2.5 reading
- "Check New" button to refresh alerts

### 9. Climate News
- Fetches **live real-time news** from The Guardian and BBC RSS feeds
- 6 article cards with image, date, headline, and excerpt
- "Refresh News" button for manual updates
- **1-hour automatic caching** for fast loading
- Graceful fallback to curated articles if API is unavailable
- Image fallback for broken article images

### 10. About
- Hero section with project description
- **Development Team** (5 members):
  1. Rommel Andrei L. De Leon - Developer
  2. Raiza Charine S. Galang - Developer
  3. John Mareign Punzalan - Developer
  4. Angela Sedigo - Developer
  5. Rowella L. Lazaro - Developer
- Info cards: Mission, Data Sources, Global Coverage

---

## Technology Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic markup structure |
| **CSS3** | Custom styling with CSS variables for theming |
| **Vanilla JavaScript** | All application logic (no framework) |
| **Chart.js** | Data visualization (6 chart types) |
| **Leaflet.js** | Interactive world map |
| **OpenStreetMap** | Map tile layers (dark & light) |
| **localStorage** | User sessions, theme preference, news cache |

---

## APIs Used

| API | Endpoint | Data Provided |
|---|---|---|
| **Open-Meteo Weather** | `api.open-meteo.com/v1/forecast` | Temperature, humidity, wind speed |
| **Open-Meteo Air Quality** | `air-quality-api.open-meteo.com/v1/air-quality` | PM2.5, PM10 readings |
| **RSS2JSON** | `api.rss2json.com/v1/api.json` | RSS feed to JSON conversion for news |
| **The Guardian RSS** | `theguardian.com/environment/climate-crisis/rss` | Climate crisis news |
| **BBC News RSS** | `feeds.bbci.co.uk/news/science_and_environment/rss.xml` | Science & environment news |

---

## Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API data and map tiles)

### Running the Application
1. Download or clone the project
2. Open `index.html` in your web browser
3. No server or build step required - runs entirely client-side

### First Time Use
1. Click **"Register"** to create a new account
2. Enter your full name, email, and password
3. Click **"Create Account"**
4. You'll be logged in automatically and taken to the Dashboard

---

## User Authentication

| Feature | Description |
|---|---|
| **Registration** | Create account with name, email, password |
| **Login** | Sign in with email and password |
| **Session Persistence** | Stays logged in across browser restarts |
| **Logout** | Secure logout clears session data |
| **Validation** | Password confirmation, duplicate email detection |
| **Data Storage** | All user data stored locally in browser (localStorage) |

> **Note**: This is a client-side demo. In production, use a proper backend with encrypted passwords and JWT tokens.

---

## File Structure

```
output/
    index.html          # Single-page application (HTML, CSS, JS)
    README.md           # This documentation file
```

The entire application is contained in a single HTML file for simplicity:
- **`<style>`** section: All CSS styling (~550 lines)
- **`<body>`** section: All HTML markup
- **`<script>`** section: All JavaScript logic (~800 lines)

---

## Data Flow

```
User Login --> Dashboard Loads
    |
    +--> Fetch weather data (Open-Meteo)
    +--> Fetch air quality data (Open-Meteo AQ)
    +--> Load charts (Chart.js)
    +--> Generate alerts from air quality data
    +--> Fetch news (RSS2JSON --> Guardian/BBC)
    +--> Cache news (localStorage, 1 hour expiry)
```

---

## Monitored Cities

| City | Country | Region |
|---|---|---|
| Manila | Philippines | Asia |
| Los Angeles | USA | Americas |
| Beijing | China | Asia |
| Delhi | India | Asia |
| Tokyo | Japan | Asia |
| London | UK | Europe |
| Paris | France | Europe |
| New York | USA | Americas |
| Sydney | Australia | Oceania |
| Sao Paulo | Brazil | Americas |
| Cairo | Egypt | Africa |
| Moscow | Russia | Europe |

---

## Color System

### Dark Mode (Default)
| Element | Color |
|---|---|
| Background | #0F0F0F |
| Surface | #1A1A1A |
| Border | #2A2A2A |
| Primary Text | #EAEFEF |
| Secondary Text | #C6CACA |
| Accent (Orange) | #EA9D63 |
| Accent (Blue) | #A2B7C7 |

### Light Mode
| Element | Color |
|---|---|
| Background | #F5F7FA |
| Surface | #FFFFFF |
| Border | #E5E7EB |
| Primary Text | #111111 |
| Secondary Text | #6B7280 |

---

## Development Team

| Member | Role |
|---|---|
| **Rommel Andrei L. De Leon** | Developer |
| **Raiza Charine S. Galang** | Developer |
| **John Mareign Punzalan** | Developer |
| **Angela Sedigo** | Developer |
| **Rowella L. Lazaro** | Developer |

---

## License

This project is for educational/research purposes as part of the Climate & Air Research Platform initiative.

## Acknowledgments

- Weather and air quality data provided by [Open-Meteo](https://open-meteo.com/)
- News data provided by [The Guardian](https://www.theguardian.com/) and [BBC](https://www.bbc.com/news/)
- Mapping powered by [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
