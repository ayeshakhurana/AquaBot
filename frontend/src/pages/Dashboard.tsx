import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ship, 
  Cloud, 
  MapPin, 
  FileText, 
  Bot, 
  BarChart3,
  TrendingUp,
  Anchor,
  Compass,
  Wind,
  Waves,
  Zap,
  Globe,
  Clock,
  Target,
  ChevronRight,
  Activity,
  Users,
  Calendar,
  Search,
  Bell,
  Eye,
  User,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Filter
} from 'lucide-react';
import ChatBox from '../components/ChatBox';
import WeatherWidget from '../components/WeatherWidget';
import PortMap from '../components/PortMap';
import DocumentUploader from '../components/DocumentUploader';
import CarbonPanel from '../components/CarbonPanel';
import ChecklistPanel from '../components/ChecklistPanel';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const stats = [
    { 
      label: 'Active Voyages', 
      value: '31', 
      icon: Ship, 
      color: 'from-purple-500 to-pink-500',
      change: '+3',
      changeType: 'up',
      description: 'last day',
      bgPattern: 'bg-gradient-to-br from-purple-50 to-pink-50'
    },
    { 
      label: 'Ports Monitored', 
      value: '63', 
      icon: MapPin, 
      color: 'from-blue-500 to-emerald-500',
      change: '+1',
      changeType: 'up',
      description: 'last day',
      bgPattern: 'bg-gradient-to-br from-blue-50 to-emerald-50'
    },
    { 
      label: 'Documents Processed', 
      value: '10', 
      icon: FileText, 
      color: 'from-gray-600 to-gray-700',
      change: '+1',
      changeType: 'up',
      description: 'last day',
      bgPattern: 'bg-gradient-to-br from-gray-50 to-slate-50'
    }
  ];

  const quickActions = [
    { 
      title: 'AI Chat', 
      description: 'Ask maritime questions', 
      icon: Bot, 
      color: 'from-blue-500 to-cyan-500',
      action: () => setActiveTab('chat'),
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-200/50'
    },
    { 
      title: 'Weather Check', 
      description: 'Port conditions', 
      icon: Cloud, 
      color: 'from-orange-500 to-red-500',
      action: () => setActiveTab('weather'),
      bgColor: 'bg-orange-50/80',
      borderColor: 'border-orange-200/50'
    },
    { 
      title: 'Route Planning', 
      description: 'Navigation tools', 
      icon: Compass, 
      color: 'from-green-500 to-emerald-500',
      action: () => setActiveTab('navigation'),
      bgColor: 'bg-green-50/80',
      borderColor: 'border-green-200/50'
    },
    { 
      title: 'Document Analysis', 
      description: 'SOF & CP parsing', 
      icon: FileText, 
      color: 'from-purple-500 to-pink-500',
      action: () => setActiveTab('documents'),
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-200/50'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'blue' },
    { id: 'chat', label: 'AI Chat', icon: Bot, color: 'purple' },
    { id: 'weather', label: 'Weather', icon: Cloud, color: 'blue' },
    { id: 'navigation', label: 'Navigation', icon: Compass, color: 'green' },
    { id: 'documents', label: 'Documents', icon: FileText, color: 'purple' },
    { id: 'carbon', label: 'Carbon', icon: Zap, color: 'yellow' },
    { id: 'checklist', label: 'Checklist', icon: Target, color: 'red' }
  ];

  const recentActivities = [
    { action: 'Weather alert cleared', time: '2 minutes ago', icon: Cloud, color: 'text-green-500', bgColor: 'bg-green-50' },
    { action: 'New voyage created', time: '15 minutes ago', icon: Ship, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { action: 'Document processed', time: '1 hour ago', icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { action: 'Route optimized', time: '2 hours ago', icon: Compass, color: 'text-green-500', bgColor: 'bg-green-50' }
  ];

  const topPorts = [
    { name: 'Singapore Port', change: '25%', changeType: 'up', image: '🌊' },
    { name: 'Rotterdam Port', change: '18%', changeType: 'up', image: '🚢' },
    { name: 'Shanghai Port', change: '12%', changeType: 'up', image: '⚓' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Monitor health of your maritime operations
              </h1>
              <p className="text-gray-600 text-lg">
                Control and analyze your data in the easiest way
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 w-64 transition-all duration-200"
                />
              </div>
              
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-1">
                {['week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      dateRange === range
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Notification Bell */}
              <button className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`${stat.bgPattern} backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <stat.icon className="w-full h-full text-gray-400" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    {stat.label}
                  </h3>
                  
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                    <div className={`flex items-center text-sm font-medium ${
                      stat.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {stat.change}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                <Filter className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className={`${action.bgColor} ${action.borderColor} border rounded-xl p-4 text-left group cursor-pointer transition-all duration-300 hover:shadow-lg`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:shadow-xl transition-shadow duration-300`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                      <span className="text-sm font-medium">Get Started</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Top Ports */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Top Ports</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
              </div>
              
              <div className="space-y-4">
                {topPorts.map((port, index) => (
                  <div key={port.name} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    index === 0 ? 'bg-blue-50 border border-blue-200/50' : 'hover:bg-gray-50'
                  }`}>
                    <div className="text-2xl">{port.image}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{port.name}</h4>
                      <div className={`flex items-center text-sm font-medium ${
                        port.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <ArrowUp className="w-4 h-4 mr-1" />
                        {port.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
                    : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-600 hover:bg-white hover:shadow-lg'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weather Widget */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Cloud className="w-5 h-5 mr-2 text-blue-500" />
                    Weather Overview
                  </h3>
                  <div className="h-80">
                    <WeatherWidget />
                  </div>
                </div>

                {/* Port Map */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-500" />
                    Port Map
                  </h3>
                  <div className="h-80">
                    <PortMap />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-500" />
                    Recent Activity
                  </h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
                </div>
                
                <div className="space-y-4">
                  {recentActivities.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                      <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-500" />
                AI Assistant Chat
              </h3>
              <div className="h-96">
                <ChatBox />
              </div>
            </motion.div>
          )}

          {activeTab === 'weather' && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Cloud className="w-5 h-5 mr-2 text-blue-500" />
                Weather Monitoring
              </h3>
              <WeatherWidget />
            </motion.div>
          )}

          {activeTab === 'navigation' && (
            <motion.div
              key="navigation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Compass className="w-5 h-5 mr-2 text-green-500" />
                Navigation & Routing
              </h3>
              <PortMap />
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-500" />
                Document Analysis
              </h3>
              <DocumentUploader />
            </motion.div>
          )}

          {activeTab === 'carbon' && (
            <motion.div
              key="carbon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Carbon Emissions
              </h3>
              <CarbonPanel />
            </motion.div>
          )}

          {activeTab === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-500" />
                Voyage Checklist
              </h3>
              <ChecklistPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Dashboard; 