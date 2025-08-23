import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Weather from './pages/Weather';
import Navigation from './pages/Navigation';
import Documents from './pages/Documents';
import Carbon from './pages/Carbon';
import Checklist from './pages/Checklist';
import Voice from './pages/Voice';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/navigation" element={<Navigation />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/carbon" element={<Carbon />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 