// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  // Use environment variable if available, otherwise use default
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://0.0.0.0:8011',
  
  // Specific endpoints
  ENDPOINTS: {
    CHAT: '/chat',
  },
  
  // Timeout in milliseconds
  TIMEOUT: 30000,
};

// Get the full URL for a specific endpoint
export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

// Debug function to check API configuration
export const logApiConfig = () => {
  console.log('API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    endpoints: API_CONFIG.ENDPOINTS,
  });
}; 