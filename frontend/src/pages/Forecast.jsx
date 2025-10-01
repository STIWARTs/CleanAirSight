import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchForecast } from '../utils/api';
import { TrendingUp, MapPin, Clock, AlertTriangle } from 'lucide-react';

const Forecast = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Los Angeles');
  const [forecastData, setForecastData] = useState([]);
  const [selectedHours, setSelectedHours] = useState(24);

  const cities = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix'];

  useEffect(() => {
    loadForecast();
  }, [selectedCity, selectedHours]);

  const loadForecast = () => {
    // Generate demo forecast data
    const now = new Date();
    const data = [];
    
    for (let i = 0; i < selectedHours; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const baseAQI = 50 + Math.random() * 50;
      const variation = Math.sin(i / 3) * 15;
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        fullTime: time.toISOString(),
        aqi: Math.round(baseAQI + variation),
        pm25: Math.round((baseAQI + variation) * 0.3),
        confidence: Math.max(60, 95 - i * 1.5),
      });
    }
    
    setForecastData(data);
    setLoading(false);
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    return '#8f3f97';
  };

  const avgAQI = forecastData.length > 0 
    ? Math.round(forecastData.reduce((sum, d) => sum + d.aqi, 0) / forecastData.length)
    : 0;

  const maxAQI = forecastData.length > 0 
    ? Math.max(...forecastData.map(d => d.aqi))
    : 0;

  if (loading) {
    return <div className="text-center py-8">Loading forecast...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Air Quality Forecast</h2>
        <p className="text-gray-600">ML-powered predictions using XGBoost models</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Select City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Forecast Duration
            </label>
            <select
              value={selectedHours}
              onChange={(e) => setSelectedHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Average AQI</div>
          <div className="text-3xl font-bold" style={{ color: getAQIColor(avgAQI) }}>
            {avgAQI}
          </div>
          <div className="text-xs text-gray-500 mt-1">Next {selectedHours} hours</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Peak AQI</div>
          <div className="text-3xl font-bold" style={{ color: getAQIColor(maxAQI) }}>
            {maxAQI}
          </div>
          <div className="text-xs text-gray-500 mt-1">Highest expected</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Confidence</div>
          <div className="text-3xl font-bold text-blue-600">
            {Math.round(forecastData[0]?.confidence || 90)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Model confidence</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <TrendingUp className="w-5 h-5 inline mr-2" />
          AQI Forecast Trend
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval={Math.floor(selectedHours / 12)}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value, name) => {
                if (name === 'aqi') return [value, 'AQI'];
                if (name === 'pm25') return [value + ' µg/m³', 'PM2.5'];
                return [value + '%', 'Confidence'];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="aqi" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="AQI"
            />
            <Line 
              type="monotone" 
              dataKey="pm25" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 3 }}
              name="PM2.5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Demo Forecast:</strong> This forecast is generated using demonstration data. 
            In production, XGBoost models analyze historical patterns, weather conditions, and temporal 
            cycles to predict air quality up to 72 hours ahead. Models retrain automatically every 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
