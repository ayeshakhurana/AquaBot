import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, Wind, Thermometer, Droplets, Navigation } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';

const Weather: React.FC = () => {
  const [selectedPort, setSelectedPort] = useState('Singapore');
  const navigate = useNavigate();
  
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

  const popularPorts = [
    { name: 'Singapore', country: 'Singapore', coordinates: [1.3521, 103.8198] },
    { name: 'Rotterdam', country: 'Netherlands', coordinates: [51.9225, 4.4792] },
    { name: 'Shanghai', country: 'China', coordinates: [31.2304, 121.4737] },
    { name: 'Los Angeles', country: 'USA', coordinates: [34.0522, -118.2437] },
    { name: 'Hamburg', country: 'Germany', coordinates: [53.5511, 9.9937] },
    { name: 'Dubai', country: 'UAE', coordinates: [25.2048, 55.2708] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-8"
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
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-200/50">
                <Cloud className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Weather & Marine Conditions</h1>
                <p className="text-gray-600">Real-time weather forecasts and marine data for global ports</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Port Selection */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Port</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {popularPorts.map((port) => (
                <button
                  key={port.name}
                  onClick={() => setSelectedPort(port.name)}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    selectedPort === port.name
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                      : 'bg-white/60 border-gray-200/50 hover:bg-white/80 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">{port.name}</div>
                    <div className={`text-xs ${selectedPort === port.name ? 'text-blue-100' : 'text-gray-500'}`}>
                      {port.country}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Weather Widget */}
        <motion.div variants={itemVariants} className="mb-8">
          <WeatherWidget />
        </motion.div>

        {/* Weather Features */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Thermometer className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Temperature</h3>
            </div>
            <p className="text-gray-600 text-sm">Real-time temperature data with hourly forecasts for optimal voyage planning.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wind className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Wind & Waves</h3>
            </div>
            <p className="text-gray-600 text-sm">Wind speed, direction, and wave height data from Stormglass marine weather API.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Droplets className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Precipitation</h3>
            </div>
            <p className="text-gray-600 text-sm">Rainfall probability and intensity forecasts to avoid weather delays.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Navigation className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Marine Alerts</h3>
            </div>
            <p className="text-gray-600 text-sm">Storm warnings, gale alerts, and hazardous weather conditions for maritime safety.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Weather; 