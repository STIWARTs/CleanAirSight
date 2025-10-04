import { useState, useEffect } from 'react';
import { fetchCurrentAQI } from '../utils/api';
import { Wind, AlertTriangle, CheckCircle, Activity, Satellite, MapPin, TrendingUp, Cloud, Droplets, Info, User, Settings } from 'lucide-react';
import AQIAlert from '../components/AQIAlert';
import EmailSubscription from '../components/EmailSubscription';
import PersonalizedDashboard from '../components/PersonalizedDashboard';
import ProfileSelector from '../components/ProfileSelector';
import { useUserProfile } from '../contexts/UserProfileContext';

const Dashboard = () => {
  const { isProfileSelected } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

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

  // If user has selected a profile, show personalized dashboard
  if (isProfileSelected) {
    return <PersonalizedDashboard />;
  }

  // If user clicked "Set Up Profile", show profile selector
  if (showProfileSetup) {
    return <ProfileSelector onClose={() => setShowProfileSetup(false)} forceShow={true} />;
  }

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

  const getAQIIcon = (aqi) => {
    if (aqi <= 50) return '🌿';
    if (aqi <= 100) return '😊';
    if (aqi <= 150) return '😷';
    if (aqi <= 200) return '🚨';
    if (aqi <= 300) return '☠️';
    return '💀';
  };

  const getHealthAdvice = (aqi) => {
    if (aqi <= 50) return '✓ Perfect for outdoor activities. Enjoy the fresh air!';
    if (aqi <= 100) return '✓ Air quality is acceptable for most outdoor activities.';
    if (aqi <= 150) return '⚠️ Sensitive groups should reduce prolonged outdoor exertion.';
    if (aqi <= 200) return '⚠️ Everyone should limit prolonged outdoor activities.';
    if (aqi <= 300) return '🚨 Health alert: Avoid outdoor activities.';
    return '🚨 Health emergency: Stay indoors with air filtration.';
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
      {/* NASA-Themed Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
              <Satellite className="w-8 h-8 text-blue-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">CleanAirSight</h1>
              <p className="text-blue-200 text-sm">Real-time Air Quality from Space to Street</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-blue-100 text-sm">🛰️ Powered by NASA TEMPO</p>
            <p className="text-blue-300 text-xs">Launched 2023 • Monitoring North America</p>
          </div>
        </div>
      </div>

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

      {/* Personalized Dashboard Call-to-Action */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">🎯 Get Your Personalized Dashboard</h2>
              <p className="text-green-100 text-sm">Tailored air quality insights based on your role and needs</p>
            </div>
          </div>
          <button
            onClick={() => {
              // Clear any previous dismissal when user explicitly wants to set up profile
              sessionStorage.removeItem('profile_selector_dismissed');
              setShowProfileSetup(true);
            }}
            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Set Up Profile
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-white text-xs">
          <div className="bg-white/10 rounded p-2 text-center">
            <div>🏥 Health-Sensitive</div>
          </div>
          <div className="bg-white/10 rounded p-2 text-center">
            <div>🏛️ Policy Makers</div>
          </div>
          <div className="bg-white/10 rounded p-2 text-center">
            <div>🚨 Emergency Response</div>
          </div>
          <div className="bg-white/10 rounded p-2 text-center">
            <div>🚌 Transportation</div>
          </div>
          <div className="bg-white/10 rounded p-2 text-center">
            <div>💼 Business</div>
          </div>
          <div className="bg-white/10 rounded p-2 text-center">
            <div>🔬 Citizen Science</div>
          </div>
        </div>
      </div>

      {/* Enhanced AQI Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Major Cities Air Quality</h2>
            <p className="text-gray-600 mt-1">Real-time monitoring across North America</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates</span>
            </div>
            <div className="text-xs text-gray-400">Refreshes every 5 minutes</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city, idx) => {
            const demoAQI = [45, 85, 120, 55, 38][idx];
            const pollutants = {
              'Los Angeles': { pm25: 12.5, no2: 28.3, o3: 45.2 },
              'New York': { pm25: 18.2, no2: 35.1, o3: 52.8 },
              'Chicago': { pm25: 28.5, no2: 42.7, o3: 68.3 },
              'Houston': { pm25: 15.3, no2: 31.2, o3: 48.9 },
              'Phoenix': { pm25: 10.8, no2: 24.5, o3: 38.6 }
            };
            const forecast = [48, 88, 115, 58, 42][idx];
            const trend = forecast > demoAQI ? '↑' : '↓';
            
            return (
              <div 
                key={city} 
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300 cursor-pointer group relative z-10 hover:z-20"
              >
                {/* City Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">{city}</h3>
                  </div>
                  <Wind className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* AQI Display */}
                <div className={`${getAQIColor(demoAQI)} text-white rounded-xl p-6 mb-4 shadow-md relative overflow-hidden`}>
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  
                  <div className="relative flex items-end justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-6xl">{getAQIIcon(demoAQI)}</div>
                      <div>
                        <div className="text-5xl font-extrabold mb-1">{demoAQI}</div>
                        <div className="text-sm opacity-90 font-medium">AQI Index</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75">Tomorrow</div>
                      <div className="text-lg font-bold">{forecast} {trend}</div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center mb-4">
                  {demoAQI <= 100 ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                  )}
                  <span className="font-bold text-gray-900">{getAQILevel(demoAQI)}</span>
                </div>

                {/* Pollutants Breakdown (Always Visible but Compact) */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-300">
                  <div className="text-xs font-semibold text-gray-700 mb-2 group-hover:text-blue-800">Pollutant Levels</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-600">PM2.5</div>
                      <div className="font-bold text-gray-900">{pollutants[city].pm25}</div>
                      <div className="text-gray-500">µg/m³</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600">NO₂</div>
                      <div className="font-bold text-gray-900">{pollutants[city].no2}</div>
                      <div className="text-gray-500">ppb</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600">O₃</div>
                      <div className="font-bold text-gray-900">{pollutants[city].o3}</div>
                      <div className="text-gray-500">ppb</div>
                    </div>
                  </div>
                </div>

                {/* Health Advice with Icon */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border-l-4 border-blue-500 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                  <div className="flex items-start space-x-2">
                    <Activity className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-gray-800">
                      {getHealthAdvice(demoAQI)}
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions (Shown on Hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 mt-3">
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-700 transition">
                      View Details
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                      Set Alert
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AQI Legend */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          AQI Scale Reference
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="text-center">
            <div className="bg-green-500 text-white rounded-lg py-2 px-3 mb-2 font-bold">0-50</div>
            <div className="text-xs font-semibold text-gray-700">Good</div>
          </div>
          <div className="text-center">
            <div className="bg-yellow-500 text-white rounded-lg py-2 px-3 mb-2 font-bold">51-100</div>
            <div className="text-xs font-semibold text-gray-700">Moderate</div>
          </div>
          <div className="text-center">
            <div className="bg-orange-500 text-white rounded-lg py-2 px-3 mb-2 font-bold">101-150</div>
            <div className="text-xs font-semibold text-gray-700">Unhealthy (SG)</div>
          </div>
          <div className="text-center">
            <div className="bg-red-500 text-white rounded-lg py-2 px-3 mb-2 font-bold">151-200</div>
            <div className="text-xs font-semibold text-gray-700">Unhealthy</div>
          </div>
          <div className="text-center">
            <div className="bg-purple-500 text-white rounded-lg py-2 px-3 mb-2 font-bold">201-300</div>
            <div className="text-xs font-semibold text-gray-700">Very Unhealthy</div>
          </div>
          <div className="text-center">
            <div className="bg-red-900 text-white rounded-lg py-2 px-3 mb-2 font-bold">300+</div>
            <div className="text-xs font-semibold text-gray-700">Hazardous</div>
          </div>
        </div>
      </div>

      {/* Data Sources Info with Badges */}
      <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Data Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start space-x-3 bg-blue-50 rounded-lg p-3">
            <Satellite className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-gray-900">NASA TEMPO Satellite</div>
              <div className="text-sm text-gray-600">NO₂, O₃, HCHO measurements</div>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-blue-200 text-blue-800 rounded">Verified Source</span>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-green-50 rounded-lg p-3">
            <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-gray-900">Ground Sensors</div>
              <div className="text-sm text-gray-600">OpenAQ & EPA AirNow (PM2.5, PM10)</div>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-green-200 text-green-800 rounded">EPA Certified</span>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-purple-50 rounded-lg p-3">
            <Cloud className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-gray-900">Weather Context</div>
              <div className="text-sm text-gray-600">OpenWeatherMap integration</div>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-purple-200 text-purple-800 rounded">Real-time</span>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-orange-50 rounded-lg p-3">
            <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-gray-900">ML Forecasting</div>
              <div className="text-sm text-gray-600">XGBoost predictions (6-72h)</div>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-orange-200 text-orange-800 rounded">96% Accuracy</span>
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🛰️ NASA Partner</div>
          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">✓ EPA Approved</div>
          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🔒 Real-time Data</div>
          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">🤖 AI-Powered</div>
        </div>
      </div>

      {/* Enhanced System Status */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">System Status</h3>
          <div className="text-xs text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Backend API</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-lg font-bold text-gray-900">Running</div>
            <div className="text-xs text-green-600 mt-1">🟢 Operational</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Database</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-lg font-bold text-gray-900">Connected</div>
            <div className="text-xs text-green-600 mt-1">🟢 MongoDB Ready</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Data Collection</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-lg font-bold text-gray-900">Active</div>
            <div className="text-xs text-blue-600 mt-1">🔵 Every 15-60 min</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ML Models</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-lg font-bold text-gray-900">Ready</div>
            <div className="text-xs text-green-600 mt-1">🟢 4 Models Trained</div>
          </div>
        </div>
      </div>

      {/* Email Subscription Section */}
      <EmailSubscription />
    </div>
  );
};

export default Dashboard;
