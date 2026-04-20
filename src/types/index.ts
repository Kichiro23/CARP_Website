export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  authProvider?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  weatherCode: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  apparentTemperature: number;
  windDirection: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface DailyForecast {
  time: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface WeatherAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  timestamp: string;
  location: string;
}

export interface CountryData {
  name: string;
  code: string;
  capital: string;
  flag: string;
  population: number;
  lat: number;
  lon: number;
  region?: string;
}

export interface PhCity {
  name: string;
  province: string;
  region: string;
  lat: number;
  lon: number;
}

export interface NewsArticle {
  title: string;
  link: string;
  thumbnail: string;
  pubDate: string;
  description: string;
  source?: string;
}

export type Theme = 'dark' | 'light';
