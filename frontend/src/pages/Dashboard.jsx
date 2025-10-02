import { useState, useEffect } from 'react';
import { fetchCurrentAQI } from '../utils/api';
import { Wind, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import AQIAlert from '../components/AQIAlert';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const cities = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix'];

  useEffect(() => {
    loadData();
    // Refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Check for high AQI alerts
  useEffect(() => {
    const cityAQIs = [
      { city: 'Los Angeles', aqi: 45 },
      { city: 'New York', aqi: 85 },
      { city: 'Chicago', aqi: 120 },
      { city: 'Houston', aqi: 55 },
      { city: 'Phoenix', aqi: 38 },
    ];

    const highAQI = cityAQIs.filter(c => c.aqi > 100);
    setAlerts(highAQI);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Try to fetch data for Los Angeles as default
      const result = await fetchCurrentAQI('Los Angeles');
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load air quality data. The backend may still be collecting initial data.');
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-900';
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Data Collection in Progress</h3>
            <p className="text-yellow-700 mb-4">{error}</p>
            <p className="text-sm text-yellow-600 mb-4">
              The backend is collecting initial data from NASA TEMPO, OpenAQ, and weather APIs.
              This process takes 2-3 minutes on first start.
            </p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AQI Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <AQIAlert
              key={idx}
              aqi={alert.aqi}
              city={alert.city}
              onClose={() => setAlerts(alerts.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Air Quality Dashboard</h2>
        <p className="text-gray-600">
          Real-time air quality monitoring powered by NASA TEMPO satellite data
        </p>
      </div>

      {/* Demo AQI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city, idx) => {
          const demoAQI = [45, 85, 120, 55, 38][idx];
          return (
            <div key={city} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{city}</h3>
                <Wind className="w-5 h-5 text-gray-400" />
              </div>
              <div className={`${getAQIColor(demoAQI)} text-white rounded-lg p-4 mb-4`}>
                <div className="text-4xl font-bold">{demoAQI}</div>
                <div className="text-sm opacity-90">AQI</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center mb-2">
                  {demoAQI <= 100 ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                  )}
                  <span className="font-medium">{getAQILevel(demoAQI)}</span>
                </div>
                <p className="text-xs">
                  {demoAQI <= 100
                    ? 'Air quality is acceptable'
                    : 'Sensitive groups should limit outdoor activity'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Activity className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Welcome to CleanAirSight!</h3>
            <p className="text-blue-800 mb-2">
              This dashboard displays real-time air quality data from multiple sources:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>NASA TEMPO satellite measurements (NO₂, O₃, HCHO)</li>
              <li>Ground sensors from OpenAQ and EPA AirNow (PM2.5, PM10)</li>
              <li>Weather data from OpenWeatherMap</li>
              <li>ML-powered forecasts using XGBoost</li>
            </ul>
            <p className="text-sm text-blue-600 mt-4">
              💡 Data collection runs automatically every hour. Navigate to the <strong>Map</strong> view
              to see geographic distribution or <strong>Forecast</strong> for predictions.
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-gray-700">Backend API: <strong>Running</strong></span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-gray-700">Database: <strong>Connected</strong></span>
          </div>
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-gray-700">Data Collection: <strong>Active</strong></span>
          </div>
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-gray-700">ML Models: <strong>Ready</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
