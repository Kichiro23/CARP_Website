# CARP - Climate & Air Research Platform

![CARP Logo](app/public/logo.png)

**CARP** is a comprehensive climate and air quality monitoring web application that provides real-time weather data, air quality index tracking, interactive global mapping, and climate news for cities worldwide.

Developed by **BSCPE 3C Students** as a capstone project.

---

## Table of Contents

- [Features](#features)
- [User Manual](#user-manual)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Developers](#developers)

---

## Features

### Weather & Climate Monitoring
- **Real-time weather data** - temperature, humidity, wind speed, UV index, precipitation
- **Air Quality Index (AQI)** - PM2.5 monitoring with health recommendations
- **7-day weather forecasts** - daily and hourly breakdowns
- **Interactive weather charts** - visual analytics using Chart.js
- **City comparison tool** - side-by-side weather metrics for multiple cities

### Global Coverage
- **75+ cities** across 6 continents
- **Philippine cities** including Manila, Quezon City, Cebu, Davao, Baguio
- **Interactive world map** - temperature-coded markers with AQI popups
- **Search with autocomplete** - quick city lookup and fly-to-location

### Data & Insights
- **Real-time climate news** - latest environmental news feeds
- **Country information** - flags, demographics, and geographic data
- **Weather analytics** - trend analysis and pattern recognition
- **AI-powered insights** - location-based weather interpretations

### User Account System
- **Email/password registration** - secure account creation
- **Google Sign-In** - one-click authentication
- **User profiles** - customizable settings and preferences
- **Password management** - secure change password functionality
- **Session management** - automatic logout and token refresh

### Design & UX
- **Cloud video background** - dynamic animated backdrop
- **Glassmorphism design** - modern frosted-glass UI elements
- **Dark & light mode** - theme toggle for user preference
- **Fully responsive** - mobile, tablet, and desktop optimized
- **Smooth animations** - page transitions and micro-interactions

---

## User Manual

### Getting Started

#### 1. Landing Page
- Visit the website to see the animated landing page
- Click **"Get Started"** or **"Sign In"** to access the platform

#### 2. Create an Account
- Click **"Create Account"** on the login page
- Fill in your **full name**, **email address**, and **password**
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
- Explore cities worldwide with interactive markers
- Click any marker to see live weather data
- Use the search bar to find specific cities

#### Compare Cities
- Go to **"Compare"** page
- Select two or more cities
- View side-by-side weather metrics

#### Analytics
- Visit **"Analytics"** for detailed charts
- View temperature trends over time
- Analyze humidity and precipitation patterns

#### News
- Check **"News"** for latest climate articles
- Read environmental updates from trusted sources

#### Countries
- Browse **"Countries"** for global data
- View flags, capitals, and geographic information

### Account Management

#### Profile Settings
- Click your **avatar** in the top right
- Select **"Profile"** to view your information
- Update your name or email as needed

#### Change Password
- Go to **"Security"** from the profile menu
- Enter your current password
- Set a new password (minimum 6 characters)

#### Log Out
- Click your **avatar** → **"Log Out"**
- You will be redirected to the login page

---

## Screenshots

| Page | Description |
|------|-------------|
| Landing Page | Animated intro with cloud video background |
| Dashboard | Main weather overview with charts |
| Live Map | Interactive world map with city markers |
| Compare | Side-by-side city weather comparison |
| Analytics | Detailed weather trend charts |
| News | Climate and environmental news feed |
| Profile | User account management |

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
- MongoDB (Database)
- JWT Authentication
- Google OAuth 2.0
- bcrypt (Password Hashing)

### External APIs
- Open-Meteo (Weather Data)
- Open-Meteo Air Quality (AQI Data)
- REST Countries (Country Information)

---

## Developers

Developed by **BSCPE 3C Students**

| Name | Role |
|------|------|
| Rommel De Leon | Lead Developer |
| Angela Sedigo | Frontend Developer |
| John Punzalan | Backend Developer |
| Rowella Lazaro | QA & Documentation |

---

## Acknowledgments

This project was created for academic purposes as part of the Bachelor of Science in Computer Engineering program.

**2025-2026**
