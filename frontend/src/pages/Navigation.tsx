import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Navigation as NavigationIcon, MapPin, Clock, Route, Ship, Anchor } from 'lucide-react';
import PortMap from '../components/PortMap';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPort, setSelectedPort] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sample ports data - in production this would come from an API
  const ports = [
    { code: 'SGSIN', name: 'Singapore Port', country: 'Singapore', coordinates: [1.2905, 103.8520] },
    { code: 'NLRTM', name: 'Rotterdam Port', country: 'Netherlands', coordinates: [51.9225, 4.4792] },
    { code: 'CNSHA', name: 'Shanghai Port', country: 'China', coordinates: [31.2304, 121.4737] },
    { code: 'USNYC', name: 'New York Port', country: 'USA', coordinates: [40.7128, -74.0060] },
    { code: 'AUSYD', name: 'Sydney Port', country: 'Australia', coordinates: [-33.8688, 151.2093] },
    { code: 'DEHAM', name: 'Hamburg Port', country: 'Germany', coordinates: [53.5511, 9.9937] },
    { code: 'JPTYO', name: 'Tokyo Port', country: 'Japan', coordinates: [35.6762, 139.6503] },
    { code: 'GBLON', name: 'London Port', country: 'UK', coordinates: [51.5074, -0.1278] },
    // Indian Ports
    { code: 'INMUN', name: 'Mumbai Port (JNPT)', country: 'India', coordinates: [18.9647, 72.8258] },
    { code: 'INCHE', name: 'Chennai Port', country: 'India', coordinates: [13.0827, 80.2707] },
    { code: 'INKOL', name: 'Kolkata Port', country: 'India', coordinates: [22.5726, 88.3639] },
    { code: 'INKOC', name: 'Kochi Port', country: 'India', coordinates: [9.9312, 76.2673] },
    { code: 'INVTZ', name: 'Visakhapatnam Port', country: 'India', coordinates: [17.6868, 83.2185] },
    { code: 'INMOR', name: 'Mormugao Port', country: 'India', coordinates: [15.4131, 73.8015] },
    { code: 'INKAN', name: 'Kandla Port', country: 'India', coordinates: [23.0333, 70.2167] },
    { code: 'INTUT', name: 'Tuticorin Port', country: 'India', coordinates: [8.7642, 78.1348] },
    { code: 'INPAR', name: 'Paradip Port', country: 'India', coordinates: [20.3149, 86.6111] },
    { code: 'INMAG', name: 'Mangalore Port', country: 'India', coordinates: [12.9141, 74.8560] }
  ];

  const filteredPorts = ports.filter(port => 
    port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    port.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    port.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateRoute = async () => {
    if (!routeFrom || !routeTo) return;
    
    setIsCalculating(true);
    
    // Simulate API call for route calculation
    setTimeout(() => {
      const fromPort = ports.find(p => p.code === routeFrom);
      const toPort = ports.find(p => p.code === routeTo);
      
      if (fromPort && toPort) {
        // Calculate approximate distance and ETA
        const distance = calculateDistance(fromPort.coordinates, toPort.coordinates);
        const eta = calculateETA(distance);
        
        setRouteDetails({
          from: fromPort,
          to: toPort,
          distance: distance.toFixed(0),
          eta: eta,
          fuelConsumption: (distance * 0.15).toFixed(1), // 0.15 tons per nautical mile
          estimatedCost: (distance * 25).toFixed(0) // $25 per nautical mile
        });
        setShowRoute(true);
      }
      setIsCalculating(false);
    }, 2000);
  };

  const calculateDistance = (coord1: number[], coord2: number[]): number => {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateETA = (distance: number): string => {
    const avgSpeed = 12; // knots
    const hours = distance / avgSpeed;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${remainingHours}h`;
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
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-200/50">
                <NavigationIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Navigation & Route Planning</h1>
                <p className="text-gray-600">Plan optimal routes and analyze maritime navigation</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Port Search & Route Planning */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
            {/* Port Search */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Port Search
              </h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ports by name, country, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredPorts.map((port) => (
                  <div
                    key={port.code}
                    onClick={() => setSelectedPort(port.code)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedPort === port.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{port.name}</div>
                        <div className="text-sm text-gray-600">{port.country} • {port.code}</div>
                      </div>
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Planning */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Route className="w-5 h-5 text-green-600" />
                Route Planning
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Port</label>
                  <select
                    value={routeFrom}
                    onChange={(e) => setRouteFrom(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select departure port</option>
                    {ports.map((port) => (
                      <option key={port.code} value={port.code}>
                        {port.name} ({port.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Port</label>
                  <select
                    value={routeTo}
                    onChange={(e) => setRouteTo(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select destination port</option>
                    {ports.map((port) => (
                      <option key={port.code} value={port.code}>
                        {port.name} ({port.code})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={calculateRoute}
                  disabled={!routeFrom || !routeTo || isCalculating}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Calculating Route...
                    </>
                  ) : (
                    <>
                      <Route className="w-4 h-4" />
                      Calculate Route
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Route Details */}
            {showRoute && routeDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Ship className="w-5 h-5 text-blue-600" />
                  Route Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">{routeDetails.from.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{routeDetails.to.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{routeDetails.distance} nm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ETA:</span>
                    <span className="font-medium">{routeDetails.eta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fuel:</span>
                    <span className="font-medium">{routeDetails.fuelConsumption} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Cost:</span>
                    <span className="font-medium">${routeDetails.estimatedCost}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Panel - Map */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Interactive Port Map
              </h2>
              
              <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                <PortMap />
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>• Click on ports to view details</p>
                <p>• Use the map controls to zoom and pan</p>
                <p>• Search for ports using the left panel</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Info */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Navigation Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 rounded-full bg-blue-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Port Search</h3>
                <p className="text-gray-600">Find ports worldwide with detailed information and coordinates</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 rounded-full bg-green-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Route className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Route Planning</h3>
                <p className="text-gray-600">Calculate optimal routes with distance, ETA, and fuel consumption</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 rounded-full bg-purple-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Maps</h3>
                <p className="text-gray-600">Visualize routes and port locations on interactive maritime maps</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Navigation; 