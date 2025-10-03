import axios from 'axios';

// In Docker, don't use baseURL - let Vite proxy handle routing
const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods
export const fetchCurrentAQI = async (city, lat, lon, pollutant) => {
  const params = {};
  if (city) params.city = city;
  if (lat) params.lat = lat;
  if (lon) params.lon = lon;
  if (pollutant) params.pollutant = pollutant;
  
  const response = await api.get('/api/current', { params });
  return response.data;
};

export const fetchForecast = async (city, lat, lon, hours = 24, pollutant) => {
  const params = { hours };
  if (city) params.city = city;
  if (lat) params.lat = lat;
  if (lon) params.lon = lon;
  if (pollutant) params.pollutant = pollutant;
  
  const response = await api.get('/api/forecast', { params });
  return response.data;
};

export const fetchMapData = async (bbox, pollutant) => {
  const params = {};
  if (bbox) params.bbox = bbox;
  if (pollutant) params.pollutant = pollutant;
  
  const response = await api.get('/api/map', { params });
  return response.data;
};

export const fetchHistoricalData = async (city, pollutant, startDate, endDate, limit = 100) => {
  const params = { limit };
  if (city) params.city = city;
  if (pollutant) params.pollutant = pollutant;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get('/api/historical', { params });
  return response.data;
};

export const fetchValidationReport = async () => {
  const response = await api.get('/api/validation');
  return response.data;
};

export const triggerDataUpdate = async () => {
  const response = await api.post('/api/trigger-update');
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Email subscription methods
export const subscribeToAlerts = async (subscriptionData) => {
  const response = await api.post('/api/subscribe', subscriptionData);
  return response.data;
};

export const unsubscribeFromAlerts = async (email) => {
  const response = await api.delete(`/api/unsubscribe/${email}`);
  return response.data;
};

export const previewEmail = async (email) => {
  const response = await api.get(`/api/subscribers/preview/${email}`);
  return response.data;
};

export default api;
