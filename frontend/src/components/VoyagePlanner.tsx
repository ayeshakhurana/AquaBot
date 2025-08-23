import React, { useState } from 'react';
import { API_ENDPOINTS } from '../utils/api';

const VoyagePlanner: React.FC = () => {
  const [port1, setPort1] = useState('Rotterdam');
  const [port2, setPort2] = useState('Shanghai');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDistance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_ENDPOINTS.distance, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port1, port2 })
      });
      if (!res.ok) throw new Error('Failed to calculate distance');
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
          value={port1}
          onChange={(e) => setPort1(e.target.value)}
          placeholder="From port"
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          value={port2}
          onChange={(e) => setPort2(e.target.value)}
          placeholder="To port"
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={fetchDistance}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 text-white rounded-md"
        >
          {loading ? 'Loading...' : 'Calculate'}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {data && !data.error && (
        <div className="text-sm space-y-1">
          <div><strong>Route:</strong> {data.port1} → {data.port2}</div>
          <div><strong>Distance:</strong> {data.distance?.distance_nm} NM ({data.distance?.distance_km} km)</div>
          <div><strong>ETA @ base speed:</strong> {data.eta?.base_speed?.eta_hours} hrs ({data.eta?.base_speed?.eta_days} days)</div>
        </div>
      )}

      {data && data.error && (
        <div className="text-red-600 text-sm">{data.error}</div>
      )}
    </div>
  );
};

export default VoyagePlanner; 