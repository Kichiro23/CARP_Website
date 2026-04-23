# CARP Presentation Cheat Sheet
## Climate & Air Research Platform
### BSCpE 3C | Bulacan State University | AY 2025-2026

---

## Team Presentation Assignments

| Member | Part | Pages / Topics |
|--------|------|---------------|
| **Rommel** | Part 1 | Introduction, Landing Page, Authentication, Dashboard |
| **Raiza** | Part 2 | Live Map, Explore Hub (Countries, Compare, City Battle) |
| **Cristina** | Part 3 | Analytics Hub, Tools Hub (Time Machine, Heatmap, Holidays, Typhoons) |
| **John** | Part 4 | Environment Hub, Air Quality Page |
| **Rowella** | Part 5 | Journal Hub, News, About, AI Chatbot, Tech Stack & Closing |

**Total Estimated Time:** 15-20 minutes (3-4 min per member)

---

## GENERAL TIPS FOR ALL MEMBERS

1. **Speak slowly and clearly** — pause after key features
2. **Demo over slides** — show the actual website, don't just talk
3. **Use the live site** — https://weathercarp.com
4. **Have a backup** — GitHub Pages mirror at https://Kichiro23.github.io/CARP_Website
5. **If internet is slow** — run locally with `cd app && npm run dev`
6. **If APIs fail** — fallback data shows automatically, just say "even if the API is rate-limited, the app still works"

---

# PART 1 — Rommel Andrei L. De Leon
## Introduction + Landing + Auth + Dashboard

### Opening Script (30 seconds)
> "Good morning/afternoon. We are BSCpE 3C from Bulacan State University, and this is our capstone project: CARP — the Climate & Air Research Platform. CARP is a comprehensive environmental data platform that monitors, analyzes, and visualizes the state of our environment — from atmospheric conditions and air quality to water systems, soil health, and fire risk."

### Landing Page (30 seconds)
**What to demo:**
- Animated cloud video background
- Live world population counter (increases in real-time)
- 5 timezone clocks (Manila, UTC, NYC, London, Tokyo)
- 8 feature cards showing platform capabilities
- "Get Started" button leads to login

**Key talking points:**
- "The landing page immediately shows our environmental focus — live population data reminds users of humanity's impact on the planet."
- "The video background changes based on theme — dark clouds for dark mode, lighter for light mode."

### Authentication System (1 minute)
**What to demo:**
- Click "Get Started" → Login page
- Show email/password login
- Show "Create Account" with validation
- Show Google Sign-In button
- Mention: "All passwords are hashed with bcrypt. JWT tokens expire in 7 days."
- Show "Forgot Password" → email reset flow

**Key talking points:**
- "Users can register with email or use Google OAuth for one-click access."
- "Passwords are never stored in plain text — we use bcrypt with 12 rounds of hashing."
- "Forgot password sends a secure reset link via email using Nodemailer."

### Dashboard (1.5 minutes)
**What to demo:**
- Current weather card (temp, humidity, wind, pressure, UV, visibility)
- Severe weather alerts section (auto-generated)
- 7-day forecast scrollable cards
- Sunrise / sunset with day length
- "This Day Last Year" historical comparison
- PM2.5 24-hour forecast chart
- Air Quality Index with color coding
- AI Recommendations (clothing, travel, health tips)
- Temperature and precipitation charts
- Climate news feed at bottom

**Key talking points:**
- "The Dashboard is the main hub — everything a user needs at a glance."
- "Alerts are auto-generated: heat warnings above 35C, UV alerts above 8, wind alerts above 50 km/h."
- "The AI recommendations adapt based on current weather AND air quality."
- "Users can share weather data to clipboard with one click."

---

# PART 2 — Raiza Charine H. Galang
## Live Map + Explore Hub

### Live Map (1.5 minutes)
**What to demo:**
- Full-screen interactive Leaflet map
- 60+ preloaded cities with color-coded PM2.5 markers
  - Green = Good, Yellow = Moderate, Orange = Unhealthy, Red = Hazardous, Purple = Very Hazardous
- Click any marker → detail panel opens
- Detail panel shows: city name, temperature, humidity, wind, weather emoji, 3-day mini forecast
- **Layer switcher** (top right): toggle Precipitation Radar overlay
- **Layer switcher**: toggle Cloud Cover overlay
- Search bar to add any city globally
- "Locate Me" button uses GPS
- Added cities persist in localStorage

**Key talking points:**
- "The map visualizes air quality across the globe using Open-Meteo real-time data."
- "The precipitation radar shows live rain patterns — useful for tracking storms."
- "Users can search and add ANY city worldwide, not just the preloaded ones."
- "All custom cities are saved locally and persist across sessions."

### Explore Hub — Countries (1 minute)
**What to demo:**
- Grid of all world countries with flags
- Click any country → detail modal with:
  - Flag, capital, population, region
  - Real weather data for that country's capital
  - Currency, languages, timezone
- Search/filter countries

**Key talking points:**
- "We integrated REST Countries API for geographic data plus Open-Meteo for live weather."
- "This combines geopolitical knowledge with environmental awareness."

### Explore Hub — City Compare (30 seconds)
**What to demo:**
- Two search boxes — enter any two cities
- Side-by-side comparison: temp, humidity, wind, weather condition
- 7-day forecast comparison table
- "Winner" summary based on comfort metrics

**Key talking points:**
- "Users planning trips can compare destinations before deciding."

### Explore Hub — City Battle (1 minute)
**What to demo:**
- Dropdown selectors for two cities
- Weather emoji, temperature, condition for each
- **Search box** to find ANY city worldwide via geocoding
- Winner announcement with trophy icon
- Detailed comparison: wind, humidity, UV, score
- **Leaderboard** — all cities ranked by comfort score

**Key talking points:**
- "City Battle uses a comfort scoring algorithm: ideal temp (25-32C), good humidity (40-70%), low wind, clear skies, and safe UV."
- "The search function uses Open-Meteo Geocoding API to find any city on Earth."

---

# PART 3 — Cristina Angela G. Sedigo
## Analytics Hub + Tools Hub

### Analytics Hub — Overview (1 minute)
**What to demo:**
- 7-Day Temperature Range bar chart (max vs min)
- Stat cards below chart: Avg Max, Avg Min, Range, Highest
- Weather Conditions doughnut chart (Clear, Cloudy, Rain, Storm)
- Breakdown list with icons and day counts
- **Info badges** explain what each chart means

**Key talking points:**
- "The Overview tab gives users a quick visual summary of the week ahead."
- "Each chart has an info badge so users know exactly what they're looking at."
- "The temperature stats help users plan activities — knowing the range helps decide what to wear."

### Analytics Hub — Trends (1 minute)
**What to demo:**
- 48-hour temperature trend line chart
- 14-day outlook with min/max/average
- Temperature stats (highest, lowest, average)
- Rain probability bars
- Weather condition breakdown with percentages

**Key talking points:**
- "Trends help identify patterns — is it getting hotter? Is rain coming?"

### Analytics Hub — Alerts (30 seconds)
**What to demo:**
- Auto-generated alert cards with severity colors
- Heat, UV, wind, rain, fog, humidity alerts
- Each alert has title, description, severity level, timestamp

**Key talking points:**
- "Alerts are computed in real-time from current weather data — no manual input needed."

### Tools Hub — Time Machine (1 minute)
**What to demo:**
- Date picker (1940 to present)
- Select a date → shows historical weather for that day
- Displays: max temp, min temp, weather condition
- "Fun Fact" section with historical events

**Key talking points:**
- "We use the Open-Meteo Archive API which contains weather data from 1940 to today."
- "Users can check what the weather was like on their birthday, or any historical event."

### Tools Hub — Heatmap Calendar (30 seconds)
**What to demo:**
- Year-long color grid — each cell is a day
- Color intensity = temperature (blue = cold, red = hot)
- Hover to see exact temp
- Stats: hottest day, coldest day, average temp

### Tools Hub — Holiday Forecast (30 seconds)
**What to demo:**
- List of upcoming Philippine holidays
- Real weather forecast for each holiday
- Category badges (National, Religious, etc.)
- Aggregate stats: average temp, rain chance

### Tools Hub — Typhoon Tracker (30 seconds)
**What to demo:**
- Philippine regions with current wind and pressure
- Interactive Leaflet map with region markers
- Wind speed and surface pressure for each region
- Color-coded wind intensity

**Key talking points:**
- "This helps monitor typhoon conditions across Philippine regions in real-time."

---

# PART 4 — John Mareign B. Punzalan
## Environment Hub + Air Quality

### Environment Hub — Water & Marine (1 minute)
**What to demo:**
- Sea Surface Temperature card
- Wave Height card
- River Discharge card
- Data from Open-Meteo Marine and Flood APIs

**Key talking points:**
- "The marine tab tracks aquatic environmental health — important for fishing, boating, and coastal communities."
- "River discharge data comes from the Global Flood Awareness System (GloFAS)."

### Environment Hub — Soil & Agriculture (1 minute)
**What to demo:**
- Soil Moisture (0-1cm depth)
- Soil Temperature (0-7cm depth)
- Crop recommendations based on soil conditions
- Drought risk assessment

**Key talking points:**
- "Soil data helps farmers and agricultural researchers make informed decisions."
- "The app suggests crops based on current moisture and temperature levels."

### Environment Hub — UV & Solar (1 minute)
**What to demo:**
- 7-day UV index forecast chart
- UV index cards for each day
- SPF protection guide:
  - UV 0-2: No protection needed
  - UV 3-5: SPF 30
  - UV 6-7: SPF 50
  - UV 8-10: SPF 50+, avoid midday sun
  - UV 11+: Stay indoors
- Solar radiation data

**Key talking points:**
- "UV radiation is invisible but dangerous — this tab helps prevent skin damage."
- "The SPF guide is based on WHO recommendations."

### Environment Hub — Fire Risk (1 minute)
**What to demo:**
- Fire Risk Calculator
- Inputs: temperature, humidity, wind speed, drought index
- Risk level: Low (green) → Moderate (yellow) → High (orange) → Extreme (red)
- Prevention guidelines for each risk level

**Key talking points:**
- "Wildfire risk is calculated using the McArthur Forest Fire Danger Index formula."
- "It considers temperature, humidity, wind, and evapotranspiration."
- "This is especially relevant for provinces like Baguio and areas prone to forest fires."

### Air Quality Page (1.5 minutes)
**What to demo:**
- Large AQI display with color-coded circle
- AQI category (Good, Moderate, Unhealthy, etc.)
- Health recommendation based on current AQI
- 5-dot visual indicator

**Scroll down to pollutant cards:**
- PM2.5 — large value, health description, progress bar
- PM10 — coarse particles description
- CO — carbon monoxide description
- NO2 — nitrogen dioxide description
- O3 — ozone description
- SO2 — sulfur dioxide description

**Scroll to bottom:**
- "Understanding Air Quality Units" section
- Explains what ug/m3 and mg/m3 mean
- Explains health impact of each pollutant

**Key talking points:**
- "We track 6 pollutants using the Open-Meteo Air Quality API, which sources data from Copernicus."
- "Each pollutant has a plain-English description so users understand the health risks."
- "PM2.5 is the most dangerous because particles are small enough to enter the bloodstream."

---

# PART 5 — Rowella L. Lazaro
## Journal + News + About + AI Chatbot + Tech Stack & Closing

### Journal Hub — Weather Journal (1 minute)
**What to demo:**
- Click "New Entry" → auto-fills current weather data
- Mood selector (Happy, Calm, Energetic, Melancholy, Anxious, Tired)
- Note text area for personal observations
- Saved entries list with weather + mood + date
- Statistics: total entries, most common mood, average temp

**Key talking points:**
- "The Weather Journal combines personal diary writing with environmental data."
- "Users can track how weather affects their mood over time."
- "All data is stored locally for privacy."

### Journal Hub — Zen Mode (1 minute)
**What to demo:**
- 5 ambient nature sounds: Rain, Ocean, Forest, Fire, Wind
- Click any sound → plays via Web Audio API (no external files)
- Volume slider
- Guided breathing exercise (4-7-8 technique)
- Animated breathing circle

**Key talking points:**
- "Zen Mode is for relaxation and stress relief."
- "All sounds are generated in-browser using the Web Audio API — no downloads, no internet required for sound playback."
- "The fire sound uses randomized crackle bursts for realism."
- "The breathing exercise uses the 4-7-8 technique recommended by doctors for anxiety relief."

### News Page (30 seconds)
**What to demo:**
- Latest climate news from The Guardian and BBC
- Article cards with image, title, summary, date
- Click to read full article
- Category tags

**Key talking points:**
- "News keeps users informed about climate change and environmental issues globally."

### About Page (30 seconds)
**What to demo:**
- Platform mission statement
- Development team (all 5 members)
- 16 feature cards with icons
- Data sources section
- Acknowledgments

### AI Chatbot — CARP AI (1 minute)
**What to demo:**
- Orange chat icon in bottom-right corner
- Click to open floating chat window
- Ask: "What's the weather in Manila?"
- Ask: "What does PM2.5 mean?"
- Ask: "How do I use the map?"
- Show offline fallback response (if API quota exceeded)

**Key talking points:**
- "CARP AI is powered by Google Gemini 2.0 Flash API."
- "It can answer weather questions, explain air quality, and help users navigate the platform."
- "If the API quota is exceeded, it falls back to rule-based responses — the chatbot NEVER breaks."

### Tech Stack & Architecture (1 minute)
**What to show:** (Open README.md or show diagram)
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express on Render
- Database: MongoDB Atlas
- Auth: JWT + Google OAuth 2.0
- Maps: React-Leaflet
- Charts: Chart.js
- AI: Google Gemini API
- External APIs: Open-Meteo (weather, air quality, marine, flood, geocoding)

**Key talking points:**
- "We use React 19 with TypeScript for type safety and fewer bugs."
- "Vite gives us fast builds and hot reloading during development."
- "The backend is deployed on Render with auto-deploy from GitHub."
- "MongoDB Atlas stores user accounts and saved locations."
- "All external APIs are free-tier — Open-Meteo requires no API key."

### Closing Script (30 seconds)
> "CARP was built to democratize access to environmental data. We believe that understanding our environment — its air, water, soil, and climate — is the first step toward protecting it. Whether you're a student, a farmer, a traveler, or a researcher, CARP gives you the data you need to make informed decisions. Thank you for listening. We would be happy to answer any questions."

---

## Q&A PREPARATION

### Common Questions & Answers

**Q: Why did you choose Open-Meteo over other weather APIs?**
A: Open-Meteo is free, requires no API key, has generous rate limits, and covers not just weather but also air quality, marine data, flood data, and historical archives. Other APIs like OpenWeatherMap require paid subscriptions for the same features.

**Q: How does the AI chatbot work?**
A: It uses Google Gemini 2.0 Flash API. We send the user's message with context about CARP's features. If the API quota is exceeded, it falls back to rule-based pattern matching so the user always gets a response.

**Q: How do you handle API failures?**
A: Every API call has a fallback. If Open-Meteo rate-limits us, we show realistic fallback data based on Manila's climate and display a banner telling the user. The app never crashes.

**Q: Is user data secure?**
A: Yes. Passwords are hashed with bcrypt. JWT tokens expire in 7 days. All backend endpoints use HTTPS. MongoDB connection uses SSL.

**Q: Why did you use HashRouter instead of BrowserRouter?**
A: HashRouter works with static hosting (Hostinger, GitHub Pages) without server-side configuration. BrowserRouter requires URL rewriting rules that many static hosts don't support.

**Q: What makes CARP different from other weather apps?**
A: Most weather apps only show forecasts. CARP covers the full environmental picture: weather, air quality, marine data, soil data, UV radiation, fire risk, historical data, and AI assistance — all in one platform.

**Q: How does the fire risk calculator work?**
A: It uses temperature, humidity, wind speed, and evapotranspiration data. Each factor contributes to a score. High temperature + low humidity + high wind = higher fire risk.

**Q: Can this work offline?**
A: Partially. The app shell works offline if cached. Weather data requires internet, but we cache API responses for 1 hour in localStorage so recently viewed data is still available.

---

## EMERGENCY BACKUP PLAN

If the live site or internet fails during presentation:

1. **Run locally:**
   ```bash
   cd app
   npm install
   npm run dev
   ```
   Open http://localhost:5173

2. **If APIs are down:**
   - Say: "The app is designed to work even when APIs fail — watch the fallback data load automatically."
   - The fallback shows realistic Manila weather data.

3. **If backend is down:**
   - The frontend still works for all weather features.
   - Auth and saved locations won't work — say "the backend is temporarily unreachable but the core platform remains functional."

---

## DEMO CHECKLIST

Before presenting, verify:

- [ ] Internet connection is stable
- [ ] https://weathercarp.com loads quickly
- [ ] Login works (test account ready)
- [ ] Map markers load
- [ ] Charts render
- [ ] AI chatbot responds
- [ ] All team members know their part
- [ ] Someone has the GitHub Pages backup ready

**Test Account (optional):**
- Email: `demo@carp.test`
- Password: `demo123`
- Or create a fresh account during demo

---

**Good luck, team! You've built something impressive. Own it.**
