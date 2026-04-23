import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isFallback?: boolean;
}

/* ─────────── API Keys ─────────── */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';

const HAS_AI_KEY = !!(GEMINI_API_KEY || OPENAI_API_KEY);
const USE_OPENAI = !!OPENAI_API_KEY;

/* ─────────── System Prompt ─────────── */

const SYSTEM_PROMPT = `You are CARP AI, a helpful assistant for the CARP (Climate & Air Research Platform) website. You were created by BSCPE 3C students: Rommel Andrei L. De Leon, Raiza Charine H. Galang, Cristina Angela G. Sedigo, John Mareign B. Punzalan, and Rowella L. Lazaro.

CARP features:
- Real-time weather data from Open-Meteo API (temperature, humidity, wind, UV, precipitation, pressure, visibility, cloud cover)
- Air Quality Index (AQI) monitoring with 6 pollutants: PM2.5, PM10, CO, NO2, O3, SO2
- 7-day weather forecasts with hourly and daily breakdowns
- Interactive world map with 60+ cities including 20+ Philippine cities
- City search to add any city globally
- City Battle — compare weather between cities with comfort scoring
- Analytics hub with temperature charts, precipitation probability, weather condition breakdowns
- Time Machine — historical weather lookup from 1940 to present
- Heatmap Calendar — year-long temperature visualization
- Holiday Forecast — real weather for upcoming Philippine holidays
- Typhoon Tracker — wind and pressure monitoring across Philippine regions
- Environment hub: Water & Marine (sea temp, wave height, river discharge), Soil & Agriculture (soil moisture, temp, crop recommendations), UV & Solar (7-day UV forecast, SPF guide), Fire Risk Calculator
- Weather Journal — personal environmental diary with mood tracking
- Zen Mode — ambient nature sounds (rain, ocean, forest, fire, wind) with guided breathing
- Climate news from The Guardian and BBC RSS feeds
- Country Explorer with flags, capitals, populations
- User accounts with email/password and Google Sign-In
- AI-powered recommendations for clothing, travel, and health

Weather knowledge:
- PM2.5 under 12 = Good, 12-35 = Moderate, 35-55 = Unhealthy for Sensitive, 55-150 = Unhealthy, 150+ = Hazardous
- UV Index: 0-2 Low, 3-5 Moderate, 6-7 High, 8-10 Very High, 11+ Extreme
- AQI stands for Air Quality Index
- Weather data comes from Open-Meteo's global weather models
- For smaller cities, data is interpolated from nearby weather stations

Be friendly, concise, and helpful. Answer questions about the website features, weather, air quality, environmental data, and how to use CARP. If asked about things unrelated to CARP or weather, politely redirect to CARP topics.`;

/* ─────────── Expanded Rule-Based Fallback ─────────── */

type Topic = 'greeting' | 'about' | 'weather' | 'aqi' | 'map' | 'team' | 'auth' | 'news' | 'countries' | 'compare' | 'analytics' | 'tools' | 'journal' | 'zen' | 'environment' | 'fire' | 'uv' | 'soil' | 'marine' | 'settings' | 'help' | 'goodbye' | 'thanks' | 'api' | 'data' | 'tech' | 'presentation';

interface Rule {
  topics: Topic[];
  keywords: string[];
  synonyms?: Record<string, string[]>;
  response: string;
  followUpHint?: string;
}

const RULES: Rule[] = [
  /* Greetings */
  {
    topics: ['greeting'],
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo', 'sup', 'howdy', 'greetings'],
    response: `Hey there! I'm CARP AI, your environmental assistant. I can help you with:
- Weather forecasts and current conditions
- Air quality readings and health advice
- Navigating the CARP website
- Environmental data like UV, fire risk, and soil moisture

What would you like to know?`,
  },

  /* About CARP */
  {
    topics: ['about'],
    keywords: ['what is carp', 'about carp', 'carp means', 'what does carp stand for', 'who are you', 'what is this app', 'what is this website', 'tell me about carp', 'carp platform'],
    response: `CARP stands for **Climate & Air Research Platform**. It's a comprehensive environmental data web app built by BSCPE 3C students from Bulacan State University:

- Rommel Andrei L. De Leon
- Raiza Charine H. Galang
- Cristina Angela G. Sedigo
- John Mareign B. Punzalan
- Rowella L. Lazaro

CARP monitors, analyzes, and visualizes environmental data — from atmospheric conditions and air quality to water systems, soil health, and wildfire risk.`,
    followUpHint: 'help',
  },

  /* Weather - general */
  {
    topics: ['weather'],
    keywords: ['weather', 'temperature', 'forecast', 'humidity', 'wind', 'rain', 'sunny', 'cloudy', 'precipitation', 'uv index', 'current weather', 'what is the weather', 'how hot', 'how cold', 'will it rain', 'storm', 'drizzle', 'snow', 'fog', 'visibility', 'pressure', 'feels like'],
    response: `CARP provides real-time weather data from the Open-Meteo API, including:
- Temperature (actual and feels-like)
- Humidity and dew point
- Wind speed and direction
- UV index and visibility
- Precipitation probability
- Cloud cover and surface pressure

Go to the **Dashboard** for your location's current weather, or use the **Live Map** to explore any city worldwide. You can also check the **7-Day Forecast** for daily and hourly breakdowns.`,
  },

  /* Air Quality - general */
  {
    topics: ['aqi'],
    keywords: ['aqi', 'air quality', 'pm2.5', 'pm25', 'pm10', 'pollution', 'hazardous', 'unhealthy', 'moderate', 'good air', 'co', 'no2', 'o3', 'so2', 'carbon monoxide', 'nitrogen dioxide', 'ozone', 'sulfur dioxide', 'smog', 'clean air', 'breathing', 'lung', 'particulate'],
    response: `CARP tracks **6 pollutants** using the Open-Meteo Air Quality API:

- **PM2.5** — Fine particles (<2.5 microns), most dangerous
- **PM10** — Coarse particles (<10 microns)
- **CO** — Carbon monoxide
- **NO2** — Nitrogen dioxide
- **O3** — Ground-level ozone
- **SO2** — Sulfur dioxide

**AQI Scale:**
- 0–12: Good (green)
- 12–35: Moderate (yellow)
- 35–55: Unhealthy for Sensitive (orange)
- 55–150: Unhealthy (red)
- 150+: Hazardous (purple)

Check the **Air Quality** page for detailed readings and health recommendations!`,
  },

  /* Live Map */
  {
    topics: ['map'],
    keywords: ['map', 'live map', 'cities', 'location', 'marker', 'philippines', 'manila', 'cebu', 'davao', 'quezon city', 'baguio', 'makati', 'iloilo', 'cagayan de oro', 'world map', 'add city', 'search city', 'find city', 'where is', 'gps', 'locate me', 'radar', 'cloud cover', 'precipitation radar', 'overlay'],
    response: `The **Live Map** is an interactive Leaflet-powered map featuring:

- **60+ preloaded cities** across 6 continents, including 20+ Philippine cities
- **Color-coded PM2.5 markers** — green (Good) to purple (Hazardous)
- **Precipitation Radar overlay** — live rain tracking
- **Cloud Cover overlay** — satellite-style cloud layer
- **Click any marker** for full weather + 3-day mini forecast
- **Search any city globally** — just type and it geocodes automatically
- **"Locate Me" button** — centers map on your GPS position
- Custom cities persist in your browser`,
  },

  /* Team */
  {
    topics: ['team'],
    keywords: ['team', 'developers', 'who made', 'creators', 'authors', 'students', 'bscpe', 'bscpe 3c', 'bulacan state university', 'bsu', 'capstone', 'de leon', 'galang', 'sedigo', 'punzalan', 'lazaro', 'rommel', 'raiza', 'cristina', 'john', 'rowella', 'professor', 'adviser'],
    response: `CARP was built by **BSCPE 3C students** at **Bulacan State University** for Academic Year 2025-2026:

- **Rommel Andrei L. De Leon**
- **Raiza Charine H. Galang**
- **Cristina Angela G. Sedigo**
- **John Mareign B. Punzalan**
- **Rowella L. Lazaro**

This is our capstone project for the Bachelor of Science in Computer Engineering program.`,
  },

  /* Authentication */
  {
    topics: ['auth'],
    keywords: ['login', 'register', 'sign in', 'sign up', 'account', 'google', 'oauth', 'password', 'forgot password', 'reset password', 'create account', 'log in', 'log out', 'profile', 'avatar', 'my account'],
    response: `CARP offers flexible authentication:

- **Email + Password** — create an account with your email (min 6 char password)
- **Google Sign-In** — one-click OAuth, no password needed
- **Forgot Password** — email-based reset link sent via Nodemailer

Once logged in, you can:
- Save favorite locations
- Set a default city
- Upload a profile avatar
- Change your password in **Security** settings`,
  },

  /* News */
  {
    topics: ['news'],
    keywords: ['news', 'climate news', 'rss', 'article', 'environmental news', 'guardian', 'bbc', 'headlines', 'updates', 'current events', 'climate change'],
    response: `The **News** page pulls the latest climate and environmental articles from:
- **The Guardian** — Science & Environment section
- **BBC** — Science & Environment feed

Articles include images, summaries, and publication dates. Click any article to read the full story. It's a great way to stay informed about global climate issues while checking weather data.`,
  },

  /* Countries */
  {
    topics: ['countries'],
    keywords: ['countries', 'country', 'flag', 'nation', 'capital', 'population', 'explorer', 'world', 'geography', 'demographics'],
    response: `The **Countries** page lets you explore all nations worldwide with data from REST Countries API:

- Flag, capital, and region
- Population and area
- Currency and languages
- Real weather for the capital city
- Timezone information

It's a great way to learn about different countries while seeing their current environmental conditions.`,
  },

  /* City Compare & Battle */
  {
    topics: ['compare'],
    keywords: ['compare', 'comparison', 'versus', 'vs', 'city battle', 'battle', 'competition', 'which city', 'better weather', 'comfort score', 'leaderboard', 'ranking', 'score'],
    response: `CARP has two comparison tools:

**City Compare** — Enter any two cities side-by-side:
- Temperature, humidity, wind
- Weather conditions
- 7-day forecast comparison

**City Battle** — A competitive ranking system:
- Comfort scoring based on: ideal temp (25-32C), good humidity (40-70%), low wind, clear skies, safe UV
- Winner announcement with trophy
- **Global search** — find ANY city worldwide via geocoding
- **Leaderboard** — all cities ranked by comfort score

Great for travelers deciding between destinations!`,
  },

  /* Analytics */
  {
    topics: ['analytics'],
    keywords: ['analytics', 'charts', 'graphs', 'statistics', 'stats', 'overview', 'trends', 'data visualization', 'bar chart', 'line chart', 'doughnut', 'insights', 'patterns'],
    response: `The **Analytics Hub** provides detailed data visualization:

**Overview Tab:**
- 7-Day Temperature Range (bar chart with max/min)
- Temperature stats: Avg Max, Avg Min, Range, Highest
- Weather Conditions breakdown (clear, cloudy, rain, storm)
- Precipitation Probability line chart

**Trends Tab:**
- 48-hour and 14-day temperature trends
- Rain probability bars
- Weather condition percentages

**Alerts Tab:**
- Auto-generated alerts for heat, UV, wind, rain, fog, and humidity
- Color-coded severity levels`,
  },

  /* Tools */
  {
    topics: ['tools'],
    keywords: ['tools', 'time machine', 'heatmap', 'calendar', 'holiday', 'holidays', 'typhoon', 'tracker', 'historical', 'past weather', 'old weather', 'this day last year', 'history', 'archive'],
    response: `The **Tools Hub** contains specialized utilities:

- **Time Machine** — Historical weather for ANY date from 1940 to today. Check what the weather was like on your birthday or any historical event!
- **Heatmap Calendar** — Year-long temperature visualization. Blue = cold days, Red = hot days. Hover for exact temps.
- **Holiday Forecast** — Real weather forecasts for upcoming Philippine holidays with category badges.
- **Typhoon Tracker** — Wind speed and surface pressure monitoring across all Philippine regions with an interactive map.`,
  },

  /* Journal */
  {
    topics: ['journal'],
    keywords: ['journal', 'diary', 'log', 'entry', 'mood', 'feelings', 'weather journal', 'personal', 'notes', 'write', 'entries', 'memory'],
    response: `The **Weather Journal** is your personal environmental diary:

- **Auto-filled weather** — when you create an entry, current weather data is inserted automatically
- **Mood tracking** — select from 6 moods: Happy, Calm, Energetic, Melancholy, Anxious, Tired
- **Personal notes** — write observations about your day
- **Statistics** — total entries, most common mood, average temperature across entries
- **Privacy** — all data is stored locally in your browser

Great for tracking how weather affects your mood over time!`,
  },

  /* Zen Mode */
  {
    topics: ['zen'],
    keywords: ['zen', 'relax', 'relaxation', 'sound', 'sounds', 'ambient', 'nature', 'rain', 'ocean', 'forest', 'fire', 'wind', 'meditation', 'breathing', 'calm', 'stress', 'sleep', 'focus'],
    response: `**Zen Mode** is a relaxation feature with:

**5 Ambient Sounds** (generated in-browser via Web Audio API):
- Rain — filtered white noise
- Ocean — brown noise with wave rhythm
- Forest — pink noise with bird chirps
- Fire — realistic randomized crackle bursts
- Wind — pink noise with gust simulation

**Guided Breathing** — The 4-7-8 technique:
- Inhale for 4 seconds
- Hold for 7 seconds
- Exhale for 8 seconds
- Animated breathing circle guides you

All sounds work offline — no downloads needed!`,
  },

  /* Environment - general */
  {
    topics: ['environment'],
    keywords: ['environment', 'environmental', 'marine', 'water', 'sea', 'ocean', 'wave', 'river', 'discharge', 'soil', 'agriculture', 'crop', 'farm', 'plant', 'drought', 'uv', 'solar', 'radiation', 'sun', 'sunscreen', 'spf', 'fire', 'wildfire', 'fire risk', 'burn'],
    response: `The **Environment Hub** covers four environmental domains:

**Water & Marine** — Sea surface temperature, wave height, and river discharge data from Open-Meteo Marine and Flood APIs.

**Soil & Agriculture** — Soil moisture (0-1cm depth) and soil temperature (0-7cm depth) with crop recommendations based on current conditions.

**UV & Solar** — 7-day UV index forecast with SPF protection guide:
- UV 0-2: No protection needed
- UV 3-5: SPF 30
- UV 6-7: SPF 50
- UV 8-10: SPF 50+, avoid midday
- UV 11+: Stay indoors

**Fire Risk** — Calculator based on temperature, humidity, wind, and evapotranspiration. Risk levels: Low → Moderate → High → Extreme, with prevention guidelines for each.`,
  },

  /* Fire Risk specifically */
  {
    topics: ['fire'],
    keywords: ['fire risk', 'wildfire', 'fire calculator', 'forest fire', 'burn risk', 'bushfire', 'fire danger'],
    response: `The **Fire Risk Calculator** uses the McArthur Forest Fire Danger Index approach:

**Inputs:**
- Temperature (hotter = higher risk)
- Humidity (lower = higher risk)
- Wind speed (stronger = higher risk)
- Drought index / evapotranspiration

**Risk Levels:**
- Low (green) — minimal danger
- Moderate (yellow) — stay alert
- High (orange) — avoid open flames
- Extreme (red) — total fire ban recommended

Each level includes specific prevention guidelines. This is especially relevant for provinces like Baguio and forested areas.`,
  },

  /* UV specifically */
  {
    topics: ['uv'],
    keywords: ['uv', 'uv index', 'sunscreen', 'spf', 'sun protection', 'sunburn', 'tan', 'solar radiation', 'sun exposure'],
    response: `The **UV & Solar** tab provides:

- **7-day UV index forecast** — plan your week accordingly
- **Solar radiation data** — measured in MJ/m2
- **SPF Protection Guide:**
  - UV 0-2: No protection needed
  - UV 3-5: SPF 30
  - UV 6-7: SPF 50
  - UV 8-10: SPF 50+, avoid midday sun (10am-4pm)
  - UV 11+: Stay indoors if possible

UV radiation is invisible but causes skin damage, premature aging, and skin cancer risk. CARP helps you protect yourself with data-driven advice.`,
  },

  /* Soil specifically */
  {
    topics: ['soil'],
    keywords: ['soil', 'moisture', 'agriculture', 'crop', 'farm', 'farming', 'plant', 'drought', 'irrigation', 'soil temp', 'soil temperature'],
    response: `The **Soil & Agriculture** tab shows:

- **Soil Moisture** (0-1cm depth) — how much water is in topsoil
- **Soil Temperature** (0-7cm depth) — affects seed germination and root growth
- **Crop Recommendations** — based on current moisture and temperature:
  - High moisture + warm: rice, corn, vegetables
  - Low moisture: drought-resistant crops like sorghum
  - Cold soil: delay planting
- **Drought Risk Assessment**

This helps farmers, gardeners, and agricultural researchers make data-driven planting decisions.`,
  },

  /* Marine specifically */
  {
    topics: ['marine'],
    keywords: ['sea', 'ocean', 'marine', 'wave', 'wave height', 'sea temperature', 'sst', 'sea surface', 'river', 'discharge', 'flood', 'water level', 'aquatic'],
    response: `The **Water & Marine** tab monitors aquatic environmental health:

- **Sea Surface Temperature (SST)** — from Open-Meteo Marine API (ERA5 + satellite data)
- **Wave Height** — maximum wave height forecast
- **River Discharge** — from the Global Flood Awareness System (GloFAS)

Useful for:
- Fishermen tracking sea conditions
- Boaters planning trips
- Coastal communities monitoring flood risk
- Researchers studying aquatic ecosystems`,
  },

  /* Settings */
  {
    topics: ['settings'],
    keywords: ['settings', 'theme', 'dark mode', 'light mode', 'units', 'celsius', 'fahrenheit', 'preferences', 'config', 'change password', 'security', 'delete account', 'logout', 'sign out'],
    response: `Go to **Settings** to customize CARP:

- **Dark / Light Mode** — full theme system with CSS variables
- **Temperature Units** — switch between Celsius and Fahrenheit
- **Ambient Soundscape** — enable/disable background nature sounds in the navbar
- **Clear Cache** — reset local data and API cache

Go to **Security** to change your password. Click your avatar → **Log Out** to sign out.`,
  },

  /* Help / Features List */
  {
    topics: ['help'],
    keywords: ['help', 'how to use', 'features', 'what can you do', 'commands', 'guide', 'tutorial', 'how do i', 'how to', 'what should i do', 'where is', 'how does', 'navigation', 'menu'],
    response: `Here's everything CARP offers:

**Weather & Climate:**
- Dashboard — current weather, forecasts, alerts
- Live Map — 60+ cities with AQI markers and radar
- Analytics — charts, trends, and statistics

**Air & Environment:**
- Air Quality — 6 pollutant tracking with health advice
- Environment — marine, soil, UV, and fire risk data

**Tools & Utilities:**
- Time Machine — historical weather from 1940
- Heatmap Calendar — year-long temperature view
- Holiday Forecast — Philippine holidays weather
- Typhoon Tracker — regional wind & pressure

**Personal:**
- Weather Journal — diary with mood tracking
- Zen Mode — ambient sounds + breathing exercises
- News — climate articles from Guardian & BBC
- Countries — world explorer with flags & weather

**Account:**
- Email/Google login, saved locations, profile settings`,
    followUpHint: 'about',
  },

  /* API / Data Sources */
  {
    topics: ['api'],
    keywords: ['api', 'data source', 'where data', 'open-meteo', 'gemini', 'google', 'accuracy', 'real time', 'how accurate', 'where from', 'data from'],
    response: `CARP aggregates data from multiple authoritative sources:

**Weather & Environment:**
- **Open-Meteo** — Global weather forecasts, historical reanalysis, air quality
- **Open-Meteo Air Quality** — CAMS (Copernicus Atmosphere Monitoring Service)
- **Open-Meteo Marine** — ERA5 + satellite observations
- **Open-Meteo Flood** — GloFAS (Global Flood Awareness System)

**Geographic:**
- **REST Countries** — Country demographics and flags
- **Open-Meteo Geocoding** — City search worldwide

**News & AI:**
- **The Guardian & BBC** — RSS climate feeds
- **Google Gemini 2.0 Flash** — AI chatbot

All weather data is updated in real-time. We also cache responses for 1 hour to reduce API load and improve performance.`,
  },

  /* Tech Stack */
  {
    topics: ['tech'],
    keywords: ['tech stack', 'technology', 'react', 'vite', 'typescript', 'tailwind', 'mongodb', 'express', 'node', 'how built', 'architecture', 'framework', 'database'],
    response: `CARP's tech stack:

**Frontend:**
- React 19 + TypeScript — type-safe components
- Vite — fast builds and hot reloading
- Tailwind CSS — responsive glassmorphism design
- React Router (HashRouter) — SPA navigation
- Chart.js + react-chartjs-2 — data visualization
- React-Leaflet + Leaflet — interactive maps
- Lucide React — icons

**Backend:**
- Node.js + Express — REST API
- MongoDB Atlas — user data and saved locations
- JWT Authentication — secure sessions
- Google OAuth 2.0 — social login
- bcrypt — password hashing
- Nodemailer — password reset emails

**Hosting:**
- Frontend: Hostinger + GitHub Pages
- Backend: Render.com
- Database: MongoDB Atlas (cloud)`,
  },

  /* Presentation / Demo */
  {
    topics: ['presentation'],
    keywords: ['presentation', 'demo', 'defense', 'capstone', 'thesis', 'panel', 'judge', 'grade', 'school', 'university', 'academic'],
    response: `CARP is our BSCPE 3C capstone project at Bulacan State University for AY 2025-2026.

**Team:** Rommel De Leon, Raiza Galang, Cristina Sedigo, John Punzalan, Rowella Lazaro

**Adviser:** [Your Adviser Name]

**Live Sites:**
- Production: https://weathercarp.com
- GitHub Pages: https://Kichiro23.github.io/CARP_Website

For our full presentation guide, check the PRESENTATION_CHEAT_SHEET.md in our GitHub repo!`,
  },

  /* Thanks */
  {
    topics: ['thanks'],
    keywords: ['thank', 'thanks', 'ty', 'appreciate', 'grateful', 'helpful', 'awesome', 'great', 'amazing', 'good job', 'well done'],
    response: `You're very welcome! I'm glad I could help. If you have any other questions about weather, air quality, or using CARP, feel free to ask anytime. Stay safe and check the forecast before heading out!`,
  },

  /* Goodbye */
  {
    topics: ['goodbye'],
    keywords: ['bye', 'goodbye', 'see you', 'cya', 'later', 'good night', 'take care', 'farewell'],
    response: `Goodbye! Stay safe and remember to check the weather and air quality before heading out. Have a great day!`,
  },
];

const FALLBACK_GENERIC = `I'm not sure I understood that. I can help you with:

- Weather forecasts and current conditions
- Air quality readings and health advice (AQI, PM2.5, etc.)
- Using CARP's features (map, analytics, journal, zen mode)
- Environmental data (UV, fire risk, soil, marine)
- The team and tech behind CARP

Try asking something like "What's the weather like?" or "How do I use the map?"`;

/* ─────────── Smart Rule Matching ─────────── */

function getRuleBasedResponse(userText: string, contextTopic?: Topic | null): { text: string; topic: Topic | null } {
  const lower = userText.toLowerCase();

  // Check for exact keyword matches first
  for (const rule of RULES) {
    if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return { text: rule.response, topic: rule.topics[0] || null };
    }
  }

  // If no match, try context-based follow-up
  if (contextTopic) {
    const followUp = RULES.find(r => r.topics.includes(contextTopic) && r.followUpHint);
    if (followUp) {
      return { text: followUp.response, topic: contextTopic };
    }
  }

  return { text: FALLBACK_GENERIC, topic: null };
}

function isQuotaError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('quota') || lower.includes('rate limit') || lower.includes('exceeded') || lower.includes('429') || lower.includes('too many requests');
}

/* ─────────── AI API Calls ─────────── */

async function callOpenAI(history: { role: string; text: string }[], userText: string): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: userText },
  ];

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

async function callGemini(history: { role: string; text: string }[], userText: string): Promise<string> {
  const contents = [
    ...history.filter(m => m.role !== 'model' || m.text !== "Hi! I'm CARP AI. Ask me anything about weather, air quality, or how to use this website!").map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    { role: 'user', parts: [{ text: userText }] }
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

/* ─────────── Component ─────────── */

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm CARP AI. Ask me anything about weather, air quality, how to use this website, or environmental data!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [warn, setWarn] = useState('');
  const [contextTopic, setContextTopic] = useState<Topic | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const addModelMsg = useCallback((text: string, isFallback?: boolean) => {
    setMessages(prev => [...prev, { role: 'model', text, isFallback }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setWarn('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // No AI key → rule-based only
    if (!HAS_AI_KEY) {
      const result = getRuleBasedResponse(userText, contextTopic);
      addModelMsg(result.text, true);
      setContextTopic(result.topic);
      setLoading(false);
      return;
    }

    // Prepare conversation history (last 6 messages for context)
    const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));

    try {
      let reply: string;

      if (USE_OPENAI) {
        reply = await callOpenAI(history, userText);
      } else {
        reply = await callGemini(history, userText);
      }

      addModelMsg(reply);
      setContextTopic(null); // Clear context when AI handles it
    } catch (err: any) {
      const msg = err.message || '';

      if (isQuotaError(msg)) {
        const result = getRuleBasedResponse(userText, contextTopic);
        addModelMsg(result.text, true);
        setContextTopic(result.topic);
        setWarn('CARP AI is in offline mode (API quota exceeded). Answers are rule-based but still helpful!');
      } else {
        // Network or other errors → fallback too
        const result = getRuleBasedResponse(userText, contextTopic);
        addModelMsg(result.text, true);
        setContextTopic(result.topic);
        setWarn('CARP AI is in offline mode (connection issue). Answers are rule-based but still helpful!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)', color: 'white' }}
          title="Ask CARP AI"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-[9999] flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            width: 360,
            maxWidth: 'calc(100vw - 40px)',
            height: 520,
            maxHeight: 'calc(100vh - 40px)',
            background: 'var(--bg-secondary)',
            borderColor: 'var(--tile-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white">CARP AI</span>
              {!HAS_AI_KEY && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] text-white">Offline</span>}
            </div>
            <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/20">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Offline warning */}
          {warn && (
            <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: 'rgba(234,157,99,0.12)' }}>
              <AlertCircle className="h-3 w-3 shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="text-[10px]" style={{ color: 'var(--primary)' }}>{warn}</span>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: msg.role === 'user' ? 'var(--primary)' : 'var(--accent)' }}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                </div>
                <div
                  className="max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line"
                  style={{
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--tile-bg)',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    border: msg.role === 'user' ? 'none' : msg.isFallback ? '1px dashed var(--primary)' : '1px solid var(--tile-border)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--accent)' }}>
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--tile-bg)', border: '1px solid var(--tile-border)', color: 'var(--text-muted)' }}>
                  {USE_OPENAI ? 'Thinking with ChatGPT...' : 'Thinking...'}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t px-3 py-2.5" style={{ borderColor: 'var(--tile-border)' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={HAS_AI_KEY ? 'Ask about weather, AQI, or CARP...' : 'Ask about CARP features...'}
              className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
              style={{ background: 'var(--tile-bg)', color: 'var(--text)', border: '1px solid var(--tile-border)' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
