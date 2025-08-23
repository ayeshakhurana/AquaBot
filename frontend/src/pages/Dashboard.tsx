import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowUp, ArrowDown, MoreVertical, Filter, MessageCircle, Cloud, Navigation, FileText, Leaf, CheckSquare, Mic, Ship, MessageSquare, ArrowRight, NavigationIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Weather alert cleared for Singapore Port', time: '2 minutes ago', read: false },
    { id: 2, message: 'New voyage created successfully', time: '15 minutes ago', read: false },
    { id: 3, message: 'Document processed and analyzed', time: '1 hour ago', read: false },
    { id: 4, message: 'Route optimization completed', time: '2 hours ago', read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Dynamic data based on date range
  const getStatsData = () => {
    switch (dateRange) {
      case 'week':
        return [
          { label: 'Active Voyages', value: '31', change: '+3', changeType: 'positive', icon: Navigation },
          { label: 'Ports Monitored', value: '63', change: '+1', changeType: 'positive', icon: Navigation },
          { label: 'Documents Processed', value: '47', change: '+5', changeType: 'positive', icon: FileText }
        ];
      case 'month':
        return [
          { label: 'Active Voyages', value: '127', change: '+12', changeType: 'positive', icon: Navigation },
          { label: 'Ports Monitored', value: '89', change: '+8', changeType: 'positive', icon: Navigation },
          { label: 'Documents Processed', value: '189', change: '+23', changeType: 'positive', icon: FileText }
        ];
      case 'year':
        return [
          { label: 'Active Voyages', value: '1,247', change: '+89', changeType: 'positive', icon: Navigation },
          { label: 'Ports Monitored', value: '156', change: '+23', changeType: 'positive', icon: Navigation },
          { label: 'Documents Processed', value: '2,341', change: '+187', changeType: 'positive', icon: FileText }
        ];
      default:
        return [
          { label: 'Active Voyages', value: '31', change: '+3', changeType: 'positive', icon: Navigation },
          { label: 'Ports Monitored', value: '63', change: '+1', changeType: 'positive', icon: Navigation },
          { label: 'Documents Processed', value: '47', change: '+5', changeType: 'positive', icon: FileText }
        ];
    }
  };

  const getRecentActivityData = () => {
    switch (dateRange) {
      case 'week':
        return [
          { id: 1, message: 'Weather alert cleared for Singapore Port', time: '2 minutes ago', type: 'weather', read: false },
          { id: 2, message: 'New voyage created successfully', time: '15 minutes ago', type: 'navigation', read: false },
          { id: 3, message: 'Document processed and analyzed', time: '1 hour ago', type: 'documents', read: false },
          { id: 4, message: 'Route optimization completed', time: '2 hours ago', type: 'navigation', read: false }
        ];
      case 'month':
        return [
          { id: 1, message: 'Monthly port congestion report generated', time: '1 day ago', type: 'ports', read: false },
          { id: 2, message: 'Voyage efficiency analysis completed', time: '2 days ago', type: 'analytics', read: false },
          { id: 3, message: 'Carbon emission report finalized', time: '3 days ago', type: 'carbon', read: false },
          { id: 4, message: 'Compliance audit completed', time: '1 week ago', type: 'compliance', read: false }
        ];
      case 'year':
        return [
          { id: 1, message: 'Annual maritime operations report', time: '1 month ago', type: 'reports', read: false },
          { id: 2, message: 'Port expansion project completed', time: '2 months ago', type: 'infrastructure', read: false },
          { id: 3, message: 'Fleet modernization program', time: '3 months ago', type: 'fleet', read: false },
          { id: 4, message: 'Sustainability goals achieved', time: '6 months ago', type: 'sustainability', read: false }
        ];
      default:
        return [
          { id: 1, message: 'Weather alert cleared for Singapore Port', time: '2 minutes ago', type: 'weather', read: false },
          { id: 2, message: 'New voyage created successfully', time: '15 minutes ago', type: 'navigation', read: false },
          { id: 3, message: 'Document processed and analyzed', time: '1 hour ago', type: 'documents', read: false },
          { id: 4, message: 'Route optimization completed', time: '2 hours ago', type: 'navigation', read: false }
        ];
    }
  };

  const getTopPortsData = () => {
    switch (dateRange) {
      case 'week':
        return [
          { name: 'Singapore Port', country: 'Singapore', percentage: 25, code: 'SGSIN' },
          { name: 'Rotterdam Port', country: 'Netherlands', percentage: 18, code: 'NLRTM' },
          { name: 'Shanghai Port', country: 'China', percentage: 12, code: 'CNSHA' }
        ];
      case 'month':
        return [
          { name: 'Singapore Port', country: 'Singapore', percentage: 28, code: 'SGSIN' },
          { name: 'Rotterdam Port', country: 'Netherlands', percentage: 22, code: 'NLRTM' },
          { name: 'Shanghai Port', country: 'China', percentage: 18, code: 'CNSHA' },
          { name: 'New York Port', country: 'USA', percentage: 15, code: 'USNYC' }
        ];
      case 'year':
        return [
          { name: 'Singapore Port', country: 'Singapore', percentage: 32, code: 'SGSIN' },
          { name: 'Rotterdam Port', country: 'Netherlands', percentage: 25, code: 'NLRTM' },
          { name: 'Shanghai Port', country: 'China', percentage: 20, code: 'CNSHA' },
          { name: 'New York Port', country: 'USA', percentage: 18, code: 'USNYC' },
          { name: 'Hamburg Port', country: 'Germany', percentage: 12, code: 'DEHAM' }
        ];
      default:
        return [
          { name: 'Singapore Port', country: 'Singapore', percentage: 25, code: 'SGSIN' },
          { name: 'Rotterdam Port', country: 'Netherlands', percentage: 18, code: 'NLRTM' },
          { name: 'Shanghai Port', country: 'China', percentage: 12, code: 'CNSHA' }
        ];
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Navigation functions
  const navigateToPage = (page: string) => {
    navigate(`/${page}`);
  };



  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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

  const stats = getStatsData();

  const quickActions = [
    { 
      title: 'AI Chat', 
      description: 'Ask maritime questions', 
      icon: MessageCircle, 
      action: () => navigateToPage('ai-chat'),
      color: 'blue'
    },
    { 
      title: 'Weather Check', 
      description: 'Port conditions', 
      icon: Cloud, 
      action: () => navigateToPage('weather'),
      color: 'blue'
    },
    { 
      title: 'Route Planning', 
      description: 'Navigation tools', 
      icon: Navigation, 
      action: () => navigateToPage('navigation'),
      color: 'green'
    },
    { 
      title: 'Document Analysis', 
      description: 'SOF & CP parsing', 
      icon: FileText, 
      action: () => navigateToPage('documents'),
      color: 'purple'
    },
    { 
      title: 'Carbon Calculator', 
      description: 'Emission estimation', 
      icon: Leaf, 
      action: () => navigateToPage('carbon'),
      color: 'green'
    },
    { 
      title: 'Voyage Checklists', 
      description: 'Stage-based tasks', 
      icon: CheckSquare, 
      action: () => navigateToPage('checklist'),
      color: 'blue'
    },
    { 
      title: 'Voice Controls', 
      description: 'Speech recognition', 
      icon: Mic, 
      action: () => navigateToPage('voice'),
      color: 'purple'
    }
  ];

  const topPorts = getTopPortsData();

  const recentActivity = getRecentActivityData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#001F3F]/95 to-[#001F3F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-8 relative z-10"
      >
      {/* Header */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0074D9]/30 to-[#39CCCC]/30 border border-white/20 backdrop-blur-2xl shadow-2xl shadow-[#0074D9]/10">
                <Ship className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#39CCCC] bg-clip-text text-transparent">AquaBot</h1>
                <p className="text-[#ADB5BD] text-lg mt-1">Monitor health of your maritime operations</p>
              </div>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex items-center gap-3 p-2 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10">
              <button
                onClick={() => setDateRange('week')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 ${
                  dateRange === 'week' 
                    ? 'bg-gradient-to-r from-[#0074D9] to-[#39CCCC] text-white shadow-2xl shadow-[#0074D9]/30 transform scale-105' 
                    : 'bg-white/5 backdrop-blur-md text-[#ADB5BD] hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 ${
                  dateRange === 'month' 
                    ? 'bg-gradient-to-r from-[#0074D9] to-[#39CCCC] text-white shadow-2xl shadow-[#0074D9]/30 transform scale-105' 
                    : 'bg-white/5 backdrop-blur-md text-[#ADB5BD] hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 ${
                  dateRange === 'year' 
                    ? 'bg-gradient-to-r from-[#0074D9] to-[#39CCCC] text-white shadow-2xl shadow-[#0074D9]/30 transform scale-105' 
                    : 'bg-white/5 backdrop-blur-md text-[#ADB5BD] hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/30 hover:shadow-2xl hover:shadow-[#0074D9]/20 transition-all duration-700 overflow-hidden"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0074D9]/10 to-[#39CCCC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0074D9]/30 to-[#39CCCC]/30 border border-white/30 backdrop-blur-xl shadow-xl">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white group-hover:text-[#39CCCC] transition-colors duration-500">{stat.value}</div>
                        <div className="text-sm text-[#ADB5BD] group-hover:text-white transition-colors duration-500">{stat.label}</div>
            </div>
          </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium backdrop-blur-xl ${
                        stat.changeType === 'positive' 
                          ? 'bg-gradient-to-r from-[#2ECC40]/30 to-[#2ECC40]/20 text-[#2ECC40] border border-[#2ECC40]/40' 
                          : 'bg-gradient-to-r from-[#FF4136]/30 to-[#FF4136]/20 text-[#FF4136] border border-[#FF4136]/40'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        {stat.change}
                      </div>
                      <p className="text-xs text-[#ADB5BD] group-hover:text-white transition-colors duration-500">last day</p>
                    </div>
            </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-3xl border border-white/25 rounded-3xl p-8 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-[#0074D9] to-[#39CCCC] rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Chat */}
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-[#0074D9]/20"
              onClick={() => navigateToPage('ai-chat')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-[#0074D9]/30 to-[#39CCCC]/30 border border-white/30 backdrop-blur-xl shadow-lg w-12 h-12 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#39CCCC] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Chat</h3>
              <p className="text-[#ADB5BD] text-sm mb-4">Ask maritime questions</p>
              <div className="flex items-center text-[#39CCCC] text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>

            {/* Weather */}
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-[#39CCCC]/20"
              onClick={() => navigateToPage('weather')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-[#39CCCC]/30 to-[#0074D9]/30 border border-white/30 backdrop-blur-xl shadow-lg w-12 h-12 rounded-xl flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#39CCCC] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Weather Check</h3>
              <p className="text-[#ADB5BD] text-sm mb-4">Port conditions</p>
              <div className="flex items-center text-[#39CCCC] text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>

            {/* Route Planning */}
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-[#FF6B6B]/20"
              onClick={() => navigateToPage('navigation')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-[#FF6B6B]/30 to-[#FF8E53]/30 border border-white/30 backdrop-blur-xl shadow-lg w-12 h-12 rounded-xl flex items-center justify-center">
                  <NavigationIcon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#39CCCC] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Route Planning</h3>
              <p className="text-[#ADB5BD] text-sm mb-4">Navigation tools</p>
              <div className="flex items-center text-[#39CCCC] text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>

            {/* Document Analysis */}
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-[#4ECDC4]/20"
              onClick={() => navigateToPage('documents')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-[#4ECDC4]/30 to-[#44A08D]/30 border border-white/30 backdrop-blur-xl shadow-lg w-12 h-12 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#39CCCC] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Document Analysis</h3>
              <p className="text-[#ADB5BD] text-sm mb-4">SOF & CP parsing</p>
              <div className="flex items-center text-[#39CCCC] text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>

            {/* Carbon Calculator */}
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-[#45B7D1]/20"
              onClick={() => navigateToPage('carbon')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-[#45B7D1]/30 to-[#96CEB4]/30 border border-white/30 backdrop-blur-xl shadow-lg w-12 h-12 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#39CCCC] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Carbon Calculator</h3>
              <p className="text-[#ADB5BD] text-sm mb-4">Emission estimation</p>
              <div className="flex items-center text-[#39CCCC] text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>

            {/* Voyage Checklists */}
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-[#FFA726]/20"
              onClick={() => navigateToPage('checklist')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-[#FFA726]/30 to-[#FF7043]/30 border border-white/30 backdrop-blur-xl shadow-lg w-12 h-12 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#39CCCC] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Voyage Checklists</h3>
              <p className="text-[#ADB5BD] text-sm mb-4">Stage-based tasks</p>
              <div className="flex items-center text-[#39CCCC] text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>

            {/* Voice Controls */}
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-left cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-[#E91E63]/20"
              onClick={() => navigateToPage('voice')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-[#E91E63]/30 to-[#9C27B0]/30 border border-white/30 backdrop-blur-xl shadow-lg w-12 h-12 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#39CCCC] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Controls</h3>
              <p className="text-[#ADB5BD] text-sm mb-4">Speech recognition</p>
              <div className="flex items-center text-[#39CCCC] text-sm font-medium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Top Ports */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-3xl border border-white/25 rounded-3xl p-8 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-[#0074D9] to-[#39CCCC] rounded-full"></div>
                Top Ports
              </h2>
              <button 
                onClick={() => navigateToPage('navigation')}
                className="text-sm text-[#39CCCC] hover:text-white transition-all duration-300 hover:scale-105"
              >
                View all
              </button>
            </div>
            <div className="space-y-4">
              {topPorts.map((port, index) => (
                <div key={index} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all duration-500 cursor-pointer border border-transparent hover:border-white/20 hover:shadow-lg hover:shadow-[#39CCCC]/20">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{port.code}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-[#39CCCC] transition-colors duration-300">{port.name}</div>
                    <div className="text-xs text-[#ADB5BD] group-hover:text-white transition-colors duration-300">{port.country} • {port.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-3xl border border-white/25 rounded-3xl p-8 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-[#0074D9] to-[#39CCCC] rounded-full"></div>
                Recent Activity
              </h2>
              <button 
                onClick={() => navigateToPage('ai-chat')}
                className="text-sm text-[#39CCCC] hover:text-white transition-all duration-300 hover:scale-105"
              >
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="group flex items-center justify-between py-3 px-4 hover:bg-white/10 rounded-2xl transition-all duration-500 cursor-pointer border border-transparent hover:border-white/20 hover:shadow-lg hover:shadow-[#39CCCC]/20">
                  <span className="text-white group-hover:text-[#39CCCC] transition-colors duration-300">{activity.message}</span>
                  <span className="text-sm text-[#ADB5BD] group-hover:text-white transition-colors duration-300">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 