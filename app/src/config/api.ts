// ============================================
// CARP - API Configuration
// Add your API keys below where marked
// ============================================

export const API_KEYS = {
  // OpenWeatherMap API - Get free key at: https://home.openweathermap.org/api_keys
  OPENWEATHERMAP: '',

  // NewsAPI - Get free key at: https://newsapi.org/register
  NEWSAPI: '',

  // GeoDB Cities API - Get free key at: https://rapidapi.com/wirefreethought/api/geodb-cities
  GEODB: '',
};

// Base URLs
export const BASE_URLS = {
  OPENWEATHERMAP: 'https://api.openweathermap.org/data/2.5',
  OPENMETEO: 'https://api.open-meteo.com/v1',
  OPENMETEO_AIR: 'https://air-quality-api.open-meteo.com/v1',
  REST_COUNTRIES: 'https://restcountries.com/v3.1',
  NEWSAPI: 'https://newsapi.org/v2',
  RSS2JSON: 'https://api.rss2json.com/v1/api.json',
  GEODB: 'https://wft-geo-db.p.rapidapi.com/v1/geo',
};

// Default location (Manila, Philippines)
export const DEFAULT_LOCATION = {
  lat: 14.5995,
  lng: 120.9842,
  city: 'Manila',
  country: 'Philippines',
};

// RSS Feeds for news
export const NEWS_RSS_FEEDS = [
  'https://www.theguardian.com/environment/climate-crisis/rss',
  'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
];

// Regions for filtering
export const REGIONS = [
  'All',
  'Asia',
  'Europe',
  'Americas',
  'Africa',
  'Oceania',
];
