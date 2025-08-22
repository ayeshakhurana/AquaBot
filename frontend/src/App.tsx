import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ship, 
  Navigation, 
  Cloud, 
  FileText, 
  Bot, 
  MapPin, 
  BarChart3,
  Settings,
  Sun,
  Moon,
  Waves,
  Anchor,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import './App.css';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Simulate loading animation
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100'}`}>
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-cyan-400/10 to-indigo-400/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <WavesAnimation />
        </div>
      </div>

      {/* Navigation Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative z-10 backdrop-blur-md border-b ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-gray-200'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Ship className="w-7 h-7 text-white" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Maritime AI
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Intelligent Navigation Assistant
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'navigation', label: 'Navigation', icon: Navigation },
                { id: 'weather', label: 'Weather', icon: Cloud },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'ai', label: 'AI Chat', icon: Bot }
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : `${isDark ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'}`
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Theme Toggle & Settings */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/50 hover:bg-white/80'
                } shadow-lg`}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon className="w-5 h-5 text-blue-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/50 hover:bg-white/80'
                } shadow-lg`}
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg transition-all duration-200 bg-white/50 hover:bg-white/80 shadow-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 dark:border-slate-700"
            >
              <div className="px-4 py-4 space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'navigation', label: 'Navigation', icon: Navigation },
                  { id: 'weather', label: 'Weather', icon: Cloud },
                  { id: 'documents', label: 'Documents', icon: FileText },
                  { id: 'ai', label: 'AI Chat', icon: Bot }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-blue-500 text-white'
                        : `${isDark ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 pt-8"
      >
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
      <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:shadow-blue-500/25 transition-shadow duration-300"
      >
        <Anchor className="w-8 h-8" />
      </motion.button>
    </div>
  );
};

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
      >
        <Ship className="w-12 h-12 text-white" />
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4"
      >
        Maritime AI
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-xl text-gray-600 mb-8"
      >
        Setting sail for intelligent navigation...
      </motion.p>
      
      <motion.div
        animate={{ width: [0, 300, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto"
      />
    </div>
  </div>
);

// Waves Animation Component
const WavesAnimation: React.FC = () => (
  <div className="relative w-full h-full">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        animate={{
          x: [0, -100, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 1.5
        }}
        className="absolute bottom-0 left-0 w-full h-32"
        style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.54,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%230ea5e9'/%3E%3C/svg%3E")`,
          backgroundSize: '1200px 120px',
          backgroundRepeat: 'repeat-x'
        }}
      />
    ))}
  </div>
);

export default App; 