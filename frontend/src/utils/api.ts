// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/api/chat`,
  weather: `${API_BASE_URL}/api/weather`,
  distance: `${API_BASE_URL}/api/distance`,
  carbon: `${API_BASE_URL}/api/carbon/estimate`,
  documents: `${API_BASE_URL}/api/documents/analyze`,
  voice: `${API_BASE_URL}/api/voice/transcribe`,
  ports: `${API_BASE_URL}/api/ports`,
  config: `${API_BASE_URL}/api/config/public`
}; 