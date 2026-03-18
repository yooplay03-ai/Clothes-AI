import { WeatherData, WeatherCondition, WeatherForecast } from '@moodfit/shared';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

interface OpenWeatherCurrentResponse {
  name: string;
  sys: { country: string };
  coord: { lat: number; lon: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg: number };
  weather: Array<{ main: string; description: string; icon: string }>;
  visibility: number;
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: { temp_min: number; temp_max: number; humidity: number };
    weather: Array<{ main: string; description: string }>;
    wind: { speed: number };
    pop: number; // probability of precipitation
    dt_txt: string;
  }>;
}

function mapCondition(main: string): WeatherCondition {
  const conditionMap: Record<string, WeatherCondition> = {
    Clear: WeatherCondition.SUNNY,
    Clouds: WeatherCondition.CLOUDY,
    Drizzle: WeatherCondition.RAINY,
    Rain: WeatherCondition.RAINY,
    Thunderstorm: WeatherCondition.THUNDERSTORM,
    Snow: WeatherCondition.SNOWY,
    Mist: WeatherCondition.FOGGY,
    Fog: WeatherCondition.FOGGY,
    Haze: WeatherCondition.FOGGY,
    Dust: WeatherCondition.WINDY,
    Sand: WeatherCondition.WINDY,
    Ash: WeatherCondition.FOGGY,
    Squall: WeatherCondition.WINDY,
    Tornado: WeatherCondition.WINDY,
  };
  return conditionMap[main] || WeatherCondition.CLOUDY;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    return getMockWeatherData();
  }

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`),
    fetch(`${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const current: OpenWeatherCurrentResponse = await currentRes.json();
  const forecastData: OpenWeatherForecastResponse = await forecastRes.json();

  // Group forecast by day (take midday reading per day)
  const dailyMap = new Map<string, OpenWeatherForecastResponse['list'][0]>();
  forecastData.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    const hour = parseInt(item.dt_txt.split(' ')[1]);
    if (!dailyMap.has(date) || Math.abs(hour - 12) < Math.abs(parseInt(dailyMap.get(date)!.dt_txt.split(' ')[1]) - 12)) {
      dailyMap.set(date, item);
    }
  });

  const forecast: WeatherForecast[] = Array.from(dailyMap.values())
    .slice(0, 7)
    .map((item) => ({
      date: item.dt_txt.split(' ')[0],
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      condition: mapCondition(item.weather[0].main),
      description: item.weather[0].description,
      precipitationChance: Math.round(item.pop * 100),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6),
    }));

  return {
    location: {
      city: current.name,
      country: current.sys.country,
      lat: current.coord.lat,
      lon: current.coord.lon,
    },
    current: {
      temperature: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6),
      windDirection: current.wind.deg,
      condition: mapCondition(current.weather[0].main),
      description: current.weather[0].description,
      iconCode: current.weather[0].icon,
      uvIndex: 0, // Requires separate UV API call
      visibility: Math.round(current.visibility / 1000),
      pressure: current.main.pressure,
    },
    forecast,
    updatedAt: new Date().toISOString(),
  };
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    return getMockWeatherData(city);
  }

  const geoRes = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${WEATHER_API_KEY}`,
  );
  const geoData = await geoRes.json();
  if (!geoData.length) throw new Error(`City not found: ${city}`);

  return getCurrentWeather(geoData[0].lat, geoData[0].lon);
}

export async function getUserLocationWeather(): Promise<WeatherData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await getCurrentWeather(position.coords.latitude, position.coords.longitude);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      () => reject(new Error('Location access denied')),
      { timeout: 10000 },
    );
  });
}

export function getMockWeatherData(city = '서울'): WeatherData {
  return {
    location: { city, country: 'KR', lat: 37.5665, lon: 126.978 },
    current: {
      temperature: 18,
      feelsLike: 16,
      humidity: 65,
      windSpeed: 14,
      windDirection: 220,
      condition: WeatherCondition.PARTLY_CLOUDY,
      description: 'partly cloudy',
      iconCode: '02d',
      uvIndex: 5,
      visibility: 10,
      pressure: 1015,
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        tempMin: 12,
        tempMax: 20,
        condition: WeatherCondition.SUNNY,
        description: 'clear sky',
        precipitationChance: 5,
        humidity: 55,
        windSpeed: 10,
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        tempMin: 14,
        tempMax: 22,
        condition: WeatherCondition.PARTLY_CLOUDY,
        description: 'few clouds',
        precipitationChance: 15,
        humidity: 60,
        windSpeed: 12,
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        tempMin: 10,
        tempMax: 16,
        condition: WeatherCondition.RAINY,
        description: 'light rain',
        precipitationChance: 75,
        humidity: 80,
        windSpeed: 20,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function getWeatherIcon(condition: WeatherCondition): string {
  const icons: Record<WeatherCondition, string> = {
    [WeatherCondition.SUNNY]: '☀️',
    [WeatherCondition.PARTLY_CLOUDY]: '⛅',
    [WeatherCondition.CLOUDY]: '☁️',
    [WeatherCondition.RAINY]: '🌧️',
    [WeatherCondition.HEAVY_RAIN]: '⛈️',
    [WeatherCondition.THUNDERSTORM]: '⛈️',
    [WeatherCondition.SNOWY]: '❄️',
    [WeatherCondition.BLIZZARD]: '🌨️',
    [WeatherCondition.FOGGY]: '🌫️',
    [WeatherCondition.WINDY]: '💨',
    [WeatherCondition.HOT]: '🔥',
    [WeatherCondition.HUMID]: '💧',
  };
  return icons[condition] || '🌤️';
}

export function getTemperatureColor(temp: number): string {
  if (temp >= 30) return 'text-red-400';
  if (temp >= 20) return 'text-orange-400';
  if (temp >= 10) return 'text-yellow-400';
  if (temp >= 0) return 'text-blue-300';
  return 'text-blue-500';
}
