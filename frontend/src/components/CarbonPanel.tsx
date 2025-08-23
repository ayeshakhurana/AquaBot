import React, { useState } from 'react';
import { API_ENDPOINTS } from '../utils/api';

interface CarbonEstimate {
  distance_nm: number;
  days_at_sea: number;
  fuel_tons: number;
  co2_kg: number;
  co2_tons: number;
  fuel: string;
  vessel_type: string;
}

const CarbonPanel: React.FC = () => {
  const [formData, setFormData] = useState({
    distance_nm: '',
    days_at_sea: '',
    fuel: 'vlsfo',
    vessel_type: 'general'
  });
  const [result, setResult] = useState<CarbonEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fuelTypes = [
    { value: 'hfo', label: 'Heavy Fuel Oil (HFO)' },
    { value: 'vlsfo', label: 'Very Low Sulphur Fuel Oil (VLSFO)' },
    { value: 'mgo', label: 'Marine Gas Oil (MGO)' },
    { value: 'lng', label: 'Liquefied Natural Gas (LNG)' }
  ];

  const vesselTypes = [
    { value: 'container', label: 'Container Ship' },
    { value: 'bulk', label: 'Bulk Carrier' },
    { value: 'tanker', label: 'Oil Tanker' },
    { value: 'lng', label: 'LNG Carrier' },
    { value: 'general', label: 'General Cargo' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.distance_nm || !formData.days_at_sea) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
              const response = await fetch(API_ENDPOINTS.carbon, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance_nm: parseFloat(formData.distance_nm),
          days_at_sea: parseFloat(formData.days_at_sea),
          fuel: formData.fuel,
          vessel_type: formData.vessel_type
        })
      });

      if (!response.ok) throw new Error('Failed to estimate emissions');
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to estimate emissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🌱 Carbon Emission Estimator
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance (Nautical Miles) *
            </label>
            <input
              type="number"
              name="distance_nm"
              value={formData.distance_nm}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days at Sea *
            </label>
            <input
              type="number"
              name="days_at_sea"
              value={formData.days_at_sea}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 5.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuel Type
            </label>
            <select
              name="fuel"
              value={formData.fuel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fuelTypes.map(fuel => (
                <option key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vessel Type
            </label>
            <select
              name="vessel_type"
              value={formData.vessel_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vesselTypes.map(vessel => (
                <option key={vessel.value} value={vessel.value}>
                  {vessel.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Calculating...' : 'Estimate Emissions'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Emission Estimate Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.co2_tons}</div>
              <div className="text-sm text-green-700">CO₂ (tons)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{result.fuel_tons}</div>
              <div className="text-sm text-blue-700">Fuel (tons)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{result.distance_nm}</div>
              <div className="text-sm text-purple-700">Distance (nm)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{result.days_at_sea}</div>
              <div className="text-sm text-orange-700">Days at Sea</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-800">Vessel Type:</span> {result.vessel_type}
              </div>
              <div>
                <span className="font-medium text-green-800">Fuel Type:</span> {result.fuel.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonPanel; 