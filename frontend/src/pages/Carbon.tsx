import React, { useState } from 'react';
import { API_ENDPOINTS } from '../utils/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Calculator, TrendingDown, BarChart3 } from 'lucide-react';

const Carbon: React.FC = () => {
  const [distance, setDistance] = useState('');
  const [days, setDays] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('');
  const [vesselType, setVesselType] = useState('container');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const vesselTypes = [
    { id: 'container', name: 'Container Ship', factor: 2.8 },
    { id: 'bulk', name: 'Bulk Carrier', factor: 3.2 },
    { id: 'tanker', name: 'Oil Tanker', factor: 3.5 },
    { id: 'lng', name: 'LNG Carrier', factor: 3.8 },
    { id: 'general', name: 'General Cargo', factor: 2.5 }
  ];

  const calculateEmissions = async () => {
    if (!distance || !days || !fuelConsumption) return;
    
    setLoading(true);
    try {
              const response = await fetch(API_ENDPOINTS.carbon, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance_nm: parseFloat(distance),
          days_at_sea: parseFloat(days),
          fuel_consumption: parseFloat(fuelConsumption),
          vessel_type: vesselType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        throw new Error('Failed to calculate emissions');
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback calculation
      const selectedVessel = vesselTypes.find(v => v.id === vesselType);
      const factor = selectedVessel?.factor || 2.8;
      const emissions = (parseFloat(distance) * parseFloat(fuelConsumption) * factor) / 1000;
      
      setResult({
        total_emissions_tonnes: emissions.toFixed(2),
        daily_emissions_tonnes: (emissions / parseFloat(days)).toFixed(2),
        efficiency_score: Math.max(0, 100 - (emissions * 10)).toFixed(0),
        vessel_type: selectedVessel?.name,
        distance_nm: distance,
        days_at_sea: days
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-100/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-6 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-200/50">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Carbon Emission Calculator</h1>
                <p className="text-gray-600">Estimate CO2 emissions for maritime voyages and optimize environmental impact</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calculator Form */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Voyage Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance (Nautical Miles)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="e.g., 5000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days at Sea</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="e.g., 15"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Consumption (tons/day)</label>
                <input
                  type="number"
                  value={fuelConsumption}
                  onChange={(e) => setFuelConsumption(e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vessel Type</label>
                <select
                  value={vesselType}
                  onChange={(e) => setVesselType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {vesselTypes.map((vessel) => (
                    <option key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={calculateEmissions}
              disabled={loading || !distance || !days || !fuelConsumption}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Calculating...' : 'Calculate Emissions'}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Emission Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{result.total_emissions_tonnes}</div>
                  <div className="text-sm text-red-700">Total CO2 (tonnes)</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{result.daily_emissions_tonnes}</div>
                  <div className="text-sm text-orange-700">Daily CO2 (tonnes)</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{result.efficiency_score}%</div>
                  <div className="text-sm text-green-700">Efficiency Score</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Voyage Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Vessel Type:</span>
                    <div className="font-medium">{result.vessel_type}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <div className="font-medium">{result.distance_nm} nm</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <div className="font-medium">{result.days_at_sea} days</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Fuel:</span>
                    <div className="font-medium">{fuelConsumption} tons/day</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Info */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Accurate Calculations</h3>
            </div>
            <p className="text-gray-600 text-sm">Industry-standard emission factors and vessel-specific calculations for precise CO2 estimates.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Optimization Insights</h3>
            </div>
            <p className="text-gray-600 text-sm">Identify efficiency improvements and reduce environmental impact through data-driven insights.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Compliance Ready</h3>
            </div>
            <p className="text-gray-600 text-sm">Generate reports for IMO compliance, carbon trading, and environmental reporting requirements.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Carbon; 