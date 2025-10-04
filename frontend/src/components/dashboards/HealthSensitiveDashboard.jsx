import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { 
  Heart, 
  Pill, 
  Activity, 
  Home, 
  TreePine, 
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Wind,
  Shield as Mask
} from 'lucide-react';

const HealthSensitiveDashboard = () => {
  const { userPreferences, getAQIThreshold } = useUserProfile();
  const [currentAQI, setCurrentAQI] = useState(null);
  const [healthAdvice, setHealthAdvice] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        // Fetch current AQI data
        const aqiResponse = await fetch('/api/current-aqi');
        const aqiData = await aqiResponse.json();
        const currentValue = aqiData.aqi || 85;
        setCurrentAQI(currentValue);

        // Fetch personalized health advice
        const adviceResponse = await fetch(`/api/personalized/health-advice?aqi=${currentValue}&user_type=sensitive`);
        const advice = await adviceResponse.json();
        setHealthAdvice(advice);

        // Fetch forecast data
        const forecastResponse = await fetch('/api/forecast');
        const forecastData = await forecastResponse.json();
        if (forecastData.forecasts && forecastData.forecasts.length > 0) {
          setForecast(forecastData.forecasts.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching health data:', error);
        // Fallback to mock data
        setCurrentAQI(85);
        setHealthAdvice({
          aqi: 85,
          user_type: 'sensitive',
          recommendations: ['Good air quality. Consider limiting prolonged outdoor activities.'],
          mask_needed: false,
          activity_level: 'light_caution'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
    const interval = setInterval(fetchHealthData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-green-600 bg-green-100';
    if (aqi <= 100) return 'text-yellow-600 bg-yellow-100';
    if (aqi <= 150) return 'text-orange-600 bg-orange-100';
    if (aqi <= 200) return 'text-red-600 bg-red-100';
    if (aqi <= 300) return 'text-purple-600 bg-purple-100';
    return 'text-maroon-600 bg-red-200';
  };

  const getHealthRecommendation = (aqi) => {
    const threshold = getAQIThreshold();
    
    if (aqi <= 50) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        title: 'Excellent Air Quality',
        message: 'Perfect for all outdoor activities! Enjoy your time outside.',
        maskNeeded: false,
        activities: ['Outdoor exercise', 'Walking', 'Cycling', 'Sports']
      };
    } else if (aqi <= threshold) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        title: 'Use Caution',
        message: 'Consider limiting prolonged outdoor activities.',
        maskNeeded: false,
        activities: ['Light outdoor activities', 'Short walks', 'Indoor exercise preferred']
      };
    } else {
      return {
        icon: ShieldAlert,
        color: 'text-red-600',
        title: 'Stay Indoors',
        message: 'Avoid outdoor activities. Use air purifiers indoors.',
        maskNeeded: true,
        activities: ['Indoor activities only', 'Use air purifier', 'Close windows']
      };
    }
  };

  const recommendation = getHealthRecommendation();
  const RecommendationIcon = recommendation?.icon || AlertTriangle;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {currentAQI > getAQIThreshold() && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ShieldAlert className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Health Alert</h3>
              <p className="text-red-700">
                Air quality is above your safe threshold. Take protective measures.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current AQI Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Current Air Quality</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAQIColor(currentAQI)}`}>
            AQI {currentAQI}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RecommendationIcon className={`w-8 h-8 ${recommendation.color}`} />
              <div>
                <h3 className="font-semibold text-gray-800">{recommendation.title}</h3>
                <p className="text-gray-600 text-sm">{recommendation.message}</p>
              </div>
            </div>
            
            {recommendation.maskNeeded && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Mask className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Mask recommended for outdoor activities</span>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Recommended Activities</h4>
            <ul className="space-y-1">
              {recommendation.activities.map((activity, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Today's Forecast */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {forecast.map((item, index) => (
            <div key={index} className="text-center p-3 border rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{item.time}</div>
              <div className={`text-lg font-semibold mb-1 ${getAQIColor(item.aqi).split(' ')[0]}`}>
                {item.aqi}
              </div>
              <div className="text-xs text-gray-500">{item.level}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Tips */}
      {userPreferences.showHealthTips && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Health Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Indoor Activities</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Perfect day for indoor workouts, reading, or creative projects. 
                Keep windows closed and use air purifiers if available.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Air Quality Tips</h3>
              </div>
              <p className="text-green-700 text-sm">
                Check air quality before planning outdoor activities. 
                Early morning usually has better air quality than evening.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medication Reminders */}
      {userPreferences.showMedicationReminders && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Pill className="w-6 h-6 text-purple-500" />
            Medication Reminders
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-purple-200 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-800">Inhaler Check</p>
                <p className="text-sm text-gray-600">
                  Keep your rescue inhaler accessible when AQI is above {getAQIThreshold()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-800">Allergy Medication</p>
                <p className="text-sm text-gray-600">
                  Consider taking allergy medication if you plan to go outside today
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Recommendations */}
      {userPreferences.activityRecommendations && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            Activity Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Home className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Indoor Exercises</h3>
              <p className="text-sm text-gray-600">Yoga, strength training, dance</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <TreePine className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Limited Outdoor</h3>
              <p className="text-sm text-gray-600">Short walks, light gardening</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Best Times</h3>
              <p className="text-sm text-gray-600">Early morning or late evening</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthSensitiveDashboard;