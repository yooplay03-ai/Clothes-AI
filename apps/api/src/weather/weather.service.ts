import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherData, WeatherCondition, WeatherForecast } from '@moodfit/shared';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY', '');
  }

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    if (!this.apiKey) {
      this.logger.log('No OpenWeather API key — using Open-Meteo (free, no key required)');
      return this.getOpenMeteoWeather(lat, lon);
    }

    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${this.baseUrl}/weather`, {
          params: { lat, lon, appid: this.apiKey, units: 'metric' },
        }),
        axios.get(`${this.baseUrl}/forecast`, {
          params: { lat, lon, appid: this.apiKey, units: 'metric' },
        }),
      ]);

      return this.transformWeatherResponse(currentRes.data, forecastRes.data);
    } catch (error) {
      this.logger.error('Failed to fetch weather:', error);
      return this.getMockWeather();
    }
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    if (!this.apiKey) return this.getOpenMeteoWeather(37.5665, 126.978, city);

    try {
      // Geocoding first
      const geoRes = await axios.get('http://api.openweathermap.org/geo/1.0/direct', {
        params: { q: city, limit: 1, appid: this.apiKey },
      });

      if (!geoRes.data.length) {
        throw new Error(`City not found: ${city}`);
      }

      const { lat, lon } = geoRes.data[0];
      return this.getWeatherByCoords(lat, lon);
    } catch (error) {
      this.logger.error('Failed to geocode city:', error);
      return this.getMockWeather(city);
    }
  }

  private mapCondition(weatherMain: string): WeatherCondition {
    const map: Record<string, WeatherCondition> = {
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
      Squall: WeatherCondition.WINDY,
      Tornado: WeatherCondition.WINDY,
    };
    return map[weatherMain] || WeatherCondition.CLOUDY;
  }

  private transformWeatherResponse(current: any, forecast: any): WeatherData {
    // Group forecast by day - take closest to noon each day
    const dailyMap = new Map<string, any>();
    forecast.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
      if (!dailyMap.has(date)) {
        dailyMap.set(date, item);
      } else {
        const existing = dailyMap.get(date);
        const existingHour = parseInt(existing.dt_txt.split(' ')[1].split(':')[0]);
        if (Math.abs(hour - 12) < Math.abs(existingHour - 12)) {
          dailyMap.set(date, item);
        }
      }
    });

    const forecastData: WeatherForecast[] = Array.from(dailyMap.values())
      .slice(0, 7)
      .map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        tempMin: Math.round(item.main.temp_min),
        tempMax: Math.round(item.main.temp_max),
        condition: this.mapCondition(item.weather[0].main),
        description: item.weather[0].description,
        precipitationChance: Math.round((item.pop || 0) * 100),
        humidity: item.main.humidity,
        windSpeed: Math.round((item.wind?.speed || 0) * 3.6),
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
        condition: this.mapCondition(current.weather[0].main),
        description: current.weather[0].description,
        iconCode: current.weather[0].icon,
        uvIndex: 0,
        visibility: Math.round((current.visibility || 10000) / 1000),
        pressure: current.main.pressure,
      },
      forecast: forecastData,
      updatedAt: new Date().toISOString(),
    };
  }

  private mapWmoCode(code: number): { condition: WeatherCondition; desc: string } {
    if (code === 0)                        return { condition: WeatherCondition.SUNNY,         desc: '맑음' };
    if (code <= 2)                         return { condition: WeatherCondition.PARTLY_CLOUDY, desc: '구름 조금' };
    if (code === 3)                        return { condition: WeatherCondition.CLOUDY,         desc: '흐림' };
    if (code <= 49)                        return { condition: WeatherCondition.FOGGY,          desc: '안개' };
    if (code <= 67)                        return { condition: WeatherCondition.RAINY,          desc: '비' };
    if (code <= 77)                        return { condition: WeatherCondition.SNOWY,          desc: '눈' };
    if (code <= 82)                        return { condition: WeatherCondition.RAINY,          desc: '소나기' };
    if (code <= 86)                        return { condition: WeatherCondition.SNOWY,          desc: '눈' };
    return { condition: WeatherCondition.THUNDERSTORM, desc: '천둥번개' };
  }

  private async getOpenMeteoWeather(lat: number, lon: number, city = '서울'): Promise<WeatherData> {
    try {
      const url = 'https://api.open-meteo.com/v1/forecast';
      const params = {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
        timezone: 'Asia/Seoul',
        forecast_days: 7,
      };
      const res = await axios.get(url, { params });
      const c = res.data.current;
      const d = res.data.daily;
      const { condition, desc } = this.mapWmoCode(c.weather_code);

      const forecast: WeatherForecast[] = d.time.slice(1).map((date: string, i: number) => {
        const { condition: fc, desc: fd } = this.mapWmoCode(d.weather_code[i + 1]);
        return {
          date,
          tempMin: Math.round(d.temperature_2m_min[i + 1]),
          tempMax: Math.round(d.temperature_2m_max[i + 1]),
          condition: fc,
          description: fd,
          precipitationChance: d.precipitation_probability_max[i + 1] ?? 0,
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(d.wind_speed_10m_max[i + 1]),
        };
      });

      this.logger.log(`Open-Meteo 날씨 수신: ${city} ${c.temperature_2m}°C ${desc}`);
      return {
        location: { city, country: 'KR', lat, lon },
        current: {
          temperature: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          windDirection: 0,
          condition,
          description: desc,
          iconCode: '02d',
          uvIndex: 0,
          visibility: 10,
          pressure: Math.round(c.surface_pressure),
        },
        forecast,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Open-Meteo 요청 실패, Mock으로 대체:', error);
      return this.getMockWeather(city);
    }
  }

  private getMockWeather(city = '서울'): WeatherData {
    const month = new Date().getMonth() + 1; // 1~12
    // 계절별 서울 날씨 근사치
    const seasonal: Record<string, { temp: number; feels: number; condition: WeatherCondition; desc: string }> = {
      spring:  { temp: 14, feels: 12, condition: WeatherCondition.PARTLY_CLOUDY, desc: '구름 조금' },
      summer:  { temp: 30, feels: 34, condition: WeatherCondition.CLOUDY,        desc: '흐림' },
      autumn:  { temp: 16, feels: 14, condition: WeatherCondition.SUNNY,         desc: '맑음' },
      winter:  { temp: 2,  feels: -2, condition: WeatherCondition.CLOUDY,        desc: '흐리고 쌀쌀함' },
    };
    const season =
      month >= 3 && month <= 5 ? 'spring' :
      month >= 6 && month <= 8 ? 'summer' :
      month >= 9 && month <= 11 ? 'autumn' : 'winter';

    const w = seasonal[season];

    return {
      location: { city, country: 'KR', lat: 37.5665, lon: 126.978 },
      current: {
        temperature: w.temp,
        feelsLike: w.feels,
        humidity: 62,
        windSpeed: 10,
        windDirection: 270,
        condition: w.condition,
        description: w.desc,
        iconCode: '02d',
        uvIndex: 4,
        visibility: 10,
        pressure: 1013,
      },
      forecast: [
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          tempMin: w.temp - 4,
          tempMax: w.temp + 4,
          condition: WeatherCondition.SUNNY,
          description: '맑음',
          precipitationChance: 5,
          humidity: 55,
          windSpeed: 8,
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          tempMin: w.temp - 3,
          tempMax: w.temp + 3,
          condition: WeatherCondition.CLOUDY,
          description: '흐림',
          precipitationChance: 25,
          humidity: 70,
          windSpeed: 14,
        },
        {
          date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
          tempMin: w.temp - 5,
          tempMax: w.temp + 1,
          condition: WeatherCondition.RAINY,
          description: '비',
          precipitationChance: 75,
          humidity: 88,
          windSpeed: 18,
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }
}
