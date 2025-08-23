import React, { useState } from 'react';
import { API_ENDPOINTS } from '../utils/api';

const WeatherWidget: React.FC = () => {
  const [port, setPort] = useState('Singapore');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_ENDPOINTS.weather, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port_name: port })
      });
      if (!res.ok) throw new Error('Failed to fetch weather');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <input
          value={port}
          onChange={(e) => setPort(e.target.value)}
          placeholder="Port name"
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 text-white rounded-md"
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {data && !data.error && (
        <div className="text-sm space-y-1">
          <div><strong>Port:</strong> {data.port_name}</div>
          <div><strong>Temp:</strong> {data.current_weather?.temperature}°C</div>
          <div><strong>Wind:</strong> {data.current_weather?.wind_speed} km/h</div>
          <div><strong>Conditions:</strong> {data.current_weather?.weather_description}</div>
        </div>
      )}

      {data && data.error && (
        <div className="text-red-600 text-sm">{data.error}</div>
      )}
    </div>
  );
};

export default WeatherWidget; 