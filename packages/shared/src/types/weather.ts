export enum WeatherCondition {
  SUNNY = 'sunny',
  PARTLY_CLOUDY = 'partly_cloudy',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  HEAVY_RAIN = 'heavy_rain',
  THUNDERSTORM = 'thunderstorm',
  SNOWY = 'snowy',
  BLIZZARD = 'blizzard',
  FOGGY = 'foggy',
  WINDY = 'windy',
  HOT = 'hot',
  HUMID = 'humid',
}

export interface WeatherData {
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number; // Celsius
    feelsLike: number;
    humidity: number; // percentage
    windSpeed: number; // km/h
    windDirection: number; // degrees
    condition: WeatherCondition;
    description: string;
    iconCode: string;
    uvIndex: number;
    visibility: number; // km
    pressure: number; // hPa
  };
  forecast: WeatherForecast[];
  updatedAt: string;
}

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: WeatherCondition;
  description: string;
  precipitationChance: number; // percentage
  humidity: number;
  windSpeed: number;
}

export interface WeatherOutfitSuggestion {
  layering: boolean;
  waterproof: boolean;
  warmth: 'light' | 'medium' | 'heavy';
  breathability: 'low' | 'medium' | 'high';
  suggestions: string[];
  avoidItems: string[];
}

export function getWeatherOutfitAdvice(weather: WeatherData): WeatherOutfitSuggestion {
  const temp = weather.current.temperature;
  const condition = weather.current.condition;

  let warmth: 'light' | 'medium' | 'heavy' = 'medium';
  if (temp > 25) warmth = 'light';
  else if (temp < 10) warmth = 'heavy';

  const waterproof = [
    WeatherCondition.RAINY,
    WeatherCondition.HEAVY_RAIN,
    WeatherCondition.THUNDERSTORM,
    WeatherCondition.SNOWY,
    WeatherCondition.BLIZZARD,
  ].includes(condition);

  const layering = temp < 15 || condition === WeatherCondition.WINDY;

  const breathability: 'low' | 'medium' | 'high' = temp > 25 ? 'high' : temp > 15 ? 'medium' : 'low';

  const suggestions: string[] = [];
  const avoidItems: string[] = [];

  if (temp > 30) {
    suggestions.push('Lightweight, breathable fabrics like linen or cotton');
    suggestions.push('Light colors to reflect heat');
    avoidItems.push('Heavy denim', 'Wool', 'Dark synthetic fabrics');
  } else if (temp > 20) {
    suggestions.push('Light layers for temperature changes');
    suggestions.push('Cotton or moisture-wicking fabrics');
  } else if (temp > 10) {
    suggestions.push('Medium-weight layers');
    suggestions.push('Denim jacket or light cardigan');
  } else {
    suggestions.push('Heavy coat or puffer jacket');
    suggestions.push('Thermal underlayers');
    suggestions.push('Warm accessories: scarf, gloves, hat');
    avoidItems.push('Light summer fabrics');
  }

  if (waterproof) {
    suggestions.push('Waterproof or water-resistant outerwear');
    suggestions.push('Waterproof boots or shoes');
    avoidItems.push('Suede or leather shoes');
  }

  return { layering, waterproof, warmth, breathability, suggestions, avoidItems };
}
