CARP - Climate & Air Research Platform
A comprehensive, interactive web application for monitoring global air quality, tracking environmental data, and staying updated on climate research.

=================================================================
OVERVIEW
=================================================================

CARP monitors global air quality and environmental data for research and awareness. It provides live air quality readings from 150+ monitoring stations across 48 countries and 342 cities worldwide. The platform includes interactive maps, historical pollution trends, city comparisons, real-time climate news, and automated air quality alerts.

=================================================================
FEATURES
=================================================================

Real-Time Data Dashboard
- Live PM2.5 Air Quality Index readings
- Temperature, humidity, and wind speed monitoring
- Stats bar showing active monitors, countries, cities, and alerts
- Trend indicators showing whether air quality is improving or worsening

Interactive World Map
- Leaflet-powered interactive map
- Color-coded markers for each monitored city (green/orange/red)
- Clickable popups showing detailed air quality readings
- Dark and light map tile layers

City Comparison Tool
- Side-by-side radar chart comparing air quality between two cities
- Compares PM2.5, PM10, NO2, SO2, and O3 levels
- Available cities: Manila, Beijing, Delhi, Tokyo, London, New York

Analytics
- Historical pollution trends over 5 years (Asia, Europe, Americas)
- Pollution by source breakdown (Transport, Industry, Agriculture, Residential, Natural)
- Regional comparison bar chart across 6 continents

Trend Analysis
- Individual city trend cards showing pollution changes
- 30-day forecast model with upper bound estimates
- Trend indicators for each monitored city

Active Alerts
- Auto-generated alerts based on real-time air quality data
- Danger alerts for hazardous air quality (PM2.5 >= 55)
- Warning alerts for poor air quality (PM2.5 35-55)
- All-clear message when all cities are at acceptable levels

Climate News (Live API)
- Fetches real-time climate news from The Guardian and BBC RSS feeds
- 6 latest articles with images, headlines, dates, and excerpts
- 1-hour local caching for fast loading
- Manual refresh button
- Fallback to curated articles if API is unavailable

Dark/Light Mode
- Full theme toggle between dark and light modes
- Persistent preference saved across browser sessions

User Authentication
- Registration and login system
- Persistent login sessions
- Form validation with error messages

Responsive Design
- Works on desktop, tablet, and mobile devices

=================================================================
PAGES AND SECTIONS
=================================================================

1. Login/Registration
   - Split-screen design with visual branding
   - Create account or sign in with email and password
   - Account data stored locally in the browser

2. Dashboard
   - Stats bar: 156 active monitors, 48 countries, 342 cities, 12 alerts
   - 4 environmental metric cards (AQI, Temperature, Humidity, Wind)
   - Line chart showing real-time pollution across 5 major cities
   - Quick-access image cards linking to Alerts, Map, and News

3. Live Map
   - Full-screen interactive map with all monitoring stations
   - Circle markers color-coded by air quality status
   - Click any marker for city name, PM2.5 level, and status
   - Filter buttons: All, Good, Moderate, Poor

4. Countries
   - Searchable table with all 12 monitored cities
   - Shows country (with flag), city name, region, PM2.5, PM10, AQI status
   - Status badges: Good (green), Moderate (orange), Poor (red), Hazardous (purple)
   - Region filter buttons: All Regions, Asia, Americas, Europe
   - Data updates in real-time from Open-Meteo API

5. Compare
   - Select any two cities from dropdown menus
   - Radar chart comparing 5 pollution metrics
   - City A shown in orange, City B shown in blue-gray

6. Analytics
   - 5-year historical trends line chart
   - Pollution sources doughnut chart
   - Regional comparison bar chart

7. Trends
   - 6 city trend cards with percentage change indicators
   - 30-day PM2.5 forecast line chart with upper bound

8. Alerts
   - Auto-generated based on live air quality readings
   - Red danger alerts for hazardous levels
   - Orange warning alerts for poor levels
   - Green checkmark when all clear

9. News
   - Live news feed from The Guardian climate RSS
   - Falls back to BBC Science & Environment RSS
   - 6 article cards with image, date, title, and excerpt
   - Shows news source name on each article

10. About
    - Project description and mission statement
    - Development team section (5 members)
    - Info cards: Mission, Data Sources, Global Coverage

=================================================================
TECHNOLOGY STACK
=================================================================

HTML5 - Semantic markup structure
CSS3 - Custom styling with CSS variables for dark/light theming
Vanilla JavaScript - All application logic, no frameworks
Chart.js - Data visualization (line, bar, radar, doughnut charts)
Leaflet.js - Interactive world map
OpenStreetMap - Map tile layers
localStorage - User sessions, theme preference, news caching

=================================================================
APIS USED
=================================================================

Open-Meteo Weather API
  Endpoint: api.open-meteo.com/v1/forecast
  Data: Temperature, humidity, wind speed

Open-Meteo Air Quality API
  Endpoint: air-quality-api.open-meteo.com/v1/air-quality
  Data: PM2.5, PM10 readings

RSS2JSON
  Endpoint: api.rss2json.com/v1/api.json
  Purpose: Converts RSS feeds to JSON format

The Guardian Climate RSS
  Endpoint: theguardian.com/environment/climate-crisis/rss
  Data: Latest climate crisis news articles

BBC Science & Environment RSS
  Endpoint: feeds.bbci.co.uk/news/science_and_environment/rss.xml
  Data: Science and environment news articles

=================================================================
HOW TO RUN
=================================================================

1. Open the index.html file in any modern web browser
2. No server or build step needed - runs entirely client-side
3. Internet connection required for API data and map tiles

First time use:
1. Click "Register" to create a new account
2. Enter your full name, email, and password
3. Click "Create Account"
4. You will be logged in automatically

=================================================================
USER AUTHENTICATION
=================================================================

Registration: Create account with name, email, password
Login: Sign in with email and password
Logout: Secure logout clears session
Session: Stays logged in across browser restarts
Validation: Password confirmation, duplicate email detection
Storage: All user data stored locally in browser (localStorage)

Note: This is a client-side demo. In production, use a proper backend with encrypted passwords.

=================================================================
MONITORED CITIES (12)
=================================================================

Manila, Philippines (Asia)
Los Angeles, USA (Americas)
Beijing, China (Asia)
Delhi, India (Asia)
Tokyo, Japan (Asia)
London, UK (Europe)
Paris, France (Europe)
New York, USA (Americas)
Sydney, Australia (Oceania)
Sao Paulo, Brazil (Americas)
Cairo, Egypt (Africa)
Moscow, Russia (Europe)

=================================================================
DEVELOPMENT TEAM
=================================================================

Rommel Andrei L. De Leon - Developer
Raiza Charine S. Galang - Developer
John Mareign Punzalan - Developer
Angela Sedigo - Developer
Rowella L. Lazaro - Developer

=================================================================
DATA SOURCES
=================================================================

Open-Meteo (Weather & Air Quality)
The Guardian (Climate News)
BBC (Science & Environment News)
NASA Earthdata
150+ international monitoring stations across 48 countries

=================================================================
ACKNOWLEDGMENTS
=================================================================

Weather and air quality data: Open-Meteo
News data: The Guardian and BBC
Mapping: Leaflet and OpenStreetMap
Charts: Chart.js
