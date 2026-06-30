export interface WeatherAlert {
  type: 'frost' | 'heavy_rain';
  severity: 'moderate' | 'high';
  message: string;
  date: string;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  weatherCode: number;
}

export interface WeatherResponse {
  farmId: string;
  farmName: string;
  latitude: number;
  longitude: number;
  current: {
    temperature: number;
    humidity: number;
    weatherCode: number;
  };
  daily: WeatherDay[];
  alerts: WeatherAlert[];
  fetchedAt: string;
}

const WMO_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Light drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  80: 'Showers',
  95: 'Thunderstorm',
};

export function weatherLabel(code: number): string {
  return WMO_LABELS[code] ?? 'Variable';
}

export async function fetchWeather(lat: number, lon: number): Promise<Omit<WeatherResponse, 'farmId' | 'farmName'>> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Weather service unavailable');

  const json = await res.json();
  const daily: WeatherDay[] = (json.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    tempMax: json.daily.temperature_2m_max[i],
    tempMin: json.daily.temperature_2m_min[i],
    precipitation: json.daily.precipitation_sum[i],
    weatherCode: json.daily.weather_code[i],
  }));

  const alerts: WeatherAlert[] = [];
  for (const day of daily) {
    if (day.tempMin <= 2) {
      alerts.push({
        type: 'frost',
        severity: day.tempMin <= 0 ? 'high' : 'moderate',
        message: `Frost risk — minimum ${day.tempMin.toFixed(1)}°C`,
        date: day.date,
      });
    }
    if (day.precipitation >= 25) {
      alerts.push({
        type: 'heavy_rain',
        severity: 'high',
        message: `Heavy rain expected — ${day.precipitation.toFixed(1)} mm`,
        date: day.date,
      });
    }
  }

  return {
    latitude: lat,
    longitude: lon,
    current: {
      temperature: json.current.temperature_2m,
      humidity: json.current.relative_humidity_2m,
      weatherCode: json.current.weather_code,
    },
    daily,
    alerts,
    fetchedAt: new Date().toISOString(),
  };
}
