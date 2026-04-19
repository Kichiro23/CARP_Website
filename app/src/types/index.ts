export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  region?: string;
  city?: string;
  location?: string;
  avatar?: string;
  authProvider?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading?: boolean;
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  weatherCode: number;
  condition?: string;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  high?: number;
  low?: number;
  precipitation?: number;
}

export interface HourlyData {
  time: string[];
  temperature: number[];
  humidity: number[];
  uvIndex: number[];
  precipitation: number[];
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  uvIndex: number;
  precipitation: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  daily: DailyForecast[];
  hourly: HourlyData;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  uvIndex?: number;
  precipitation?: number;
  condition?: string;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
}

export interface CountryData {
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  pm25?: number | null;
}

export interface Country {
  name: string;
  code: string;
  capital: string;
  region: string;
  population: number;
  flag: string;
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  country: string;
  countryCode: string;
  region: string;
  lat: number;
  lng: number;
  population?: number;
}

export interface NewsArticle {
  title: string;
  link: string;
  thumbnail: string;
  pubDate: string;
  description: string;
  // Aliases for different component usage
  url?: string;
  imageUrl?: string;
  publishedAt?: string;
  excerpt?: string;
  source?: string;
}

export type Theme = 'dark' | 'light';
export type PageId = 'dashboard' | 'map' | 'countries' | 'compare' | 'analytics' | 'trends' | 'alerts' | 'news' | 'about' | 'profile' | 'settings' | 'security';
