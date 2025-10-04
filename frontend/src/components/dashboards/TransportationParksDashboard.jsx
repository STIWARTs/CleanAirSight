import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Route,
  TreePine
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TransportationParksDashboard = () => {
  const { userPreferences } = useUserProfile();
  const [selectedRoute, setSelectedRoute] = useState('route1');
  const [timeFrame, setTimeFrame] = useState('today');
  
  const [routes] = useState([
    { id: 'route1', name: 'Metro Red Line', avgAQI: 95, status: 'operational', alerts: 1 },
    { id: 'route2', name: 'Bus Route 720', avgAQI: 105, status: 'delayed', alerts: 2 },
    { id: 'route3', name: 'Expo Line', avgAQI: 78, status: 'operational', alerts: 0 },
    { id: 'route4', name: 'Blue Line', avgAQI: 112, status: 'modified', alerts: 1 }
  ]);

  const [parks] = useState([
    { name: 'Griffith Park', aqi: 88, status: 'open', events: 2, recommendation: 'good' },
    { name: 'Santa Monica Beach', aqi: 125, status: 'caution', events: 0, recommendation: 'limited' },
    { name: 'Exposition Park', aqi: 95, status: 'open', events: 1, recommendation: 'moderate' },
    { name: 'Echo Park', aqi: 78, status: 'open', events: 3, recommendation: 'excellent' }
  ]);

  const [hourlyForecast] = useState([
    { hour: '6 AM', aqi: 65, temp: 18 },
    { hour: '9 AM', aqi: 85, temp: 22 },
    { hour: '12 PM', aqi: 105, temp: 28 },
    { hour: '3 PM', aqi: 115, temp: 32 },
    { hour: '6 PM', aqi: 95, temp: 26 },
    { hour: '9 PM', aqi: 75, temp: 21 }
  ]);

  const [upcomingEvents] = useState([
    { 
      id: 1, 
      name: 'Marathon Training', 
      location: 'Griffith Park', 
      time: 'Tomorrow 7:00 AM',
      participants: 150,
      recommendation: 'proceed',
      aqiExpected: 70
    },
    { 
      id: 2, 
      name: 'Outdoor Concert', 
      location: 'Santa Monica Beach', 
      time: 'Saturday 6:00 PM',
      participants: 500,
      recommendation: 'monitor',
      aqiExpected: 110
    },
    { 
      id: 3, 
      name: 'Youth Soccer Game', 
      location: 'Echo Park', 
      time: 'Sunday 10:00 AM',
      participants: 80,
      recommendation: 'proceed',
      aqiExpected: 85
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      case 'modified': return 'text-yellow-600 bg-yellow-100';
      case 'caution': return 'text-orange-600 bg-orange-100';
      case 'open': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'limited': return 'text-orange-600 bg-orange-100';
      case 'proceed': return 'text-green-600 bg-green-100';
      case 'monitor': return 'text-yellow-600 bg-yellow-100';
      case 'cancel': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-green-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Bus className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Transportation & Parks Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedRoute} 
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
            
            <select 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Routes Affected</p>
              <p className="text-2xl font-bold text-orange-600">2</p>
              <p className="text-sm text-gray-600">Poor air quality</p>
            </div>
            <Route className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Parks Open</p>
              <p className="text-2xl font-bold text-green-600">4/4</p>
              <p className="text-sm text-gray-600">All operational</p>
            </div>
            <TreePine className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Events Today</p>
              <p className="text-2xl font-bold text-blue-600">6</p>
              <p className="text-sm text-gray-600">Scheduled activities</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Air Quality Alerts</p>
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-600">Active warnings</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Route AQI Monitoring */}
      {userPreferences.showRouteAQI && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Route className="w-6 h-6 text-blue-500" />
            Transportation Routes Air Quality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {routes.map((route) => (
              <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{route.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg AQI:</span>
                    <span className={`font-semibold ${getAQIColor(route.avgAQI)}`}>
                      {route.avgAQI}
                    </span>
                  </div>
                  {route.alerts > 0 && (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      {route.alerts} alert{route.alerts > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parks & Recreation Areas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TreePine className="w-6 h-6 text-green-500" />
          Parks & Recreation Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {parks.map((park, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{park.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(park.status)}`}>
                  {park.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AQI:</span>
                  <span className={`font-semibold ${getAQIColor(park.aqi)}`}>
                    {park.aqi}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Events:</span>
                  <span className="text-sm font-medium">{park.events}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getRecommendationColor(park.recommendation)}`}>
                  {park.recommendation} for activities
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 24-Hour Forecast */}
      {userPreferences.trendCharts && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            24-Hour Air Quality Forecast
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                  name="AQI"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Best time for outdoor activities:</strong> Early morning (6-9 AM) and evening (after 7 PM)
            </p>
          </div>
        </div>
      )}

      {/* Event Scheduling */}
      {userPreferences.eventScheduling && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            Upcoming Events & Recommendations
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{event.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(event.recommendation)}`}>
                        {event.recommendation}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {event.participants} participants
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      Expected AQI: <span className={`font-semibold ${getAQIColor(event.aqiExpected)}`}>
                        {event.aqiExpected}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {event.recommendation === 'proceed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : event.recommendation === 'monitor' ? (
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational Alerts */}
      {userPreferences.operationalAlerts && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Operational Alerts & Recommendations
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Route Modification Recommended</h3>
                <p className="text-yellow-700 text-sm">
                  Bus Route 720 passing through high AQI area. Consider alternative routing during peak hours.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Outdoor Event Caution</h3>
                <p className="text-orange-700 text-sm">
                  Air quality may affect Saturday's outdoor concert. Consider providing masks and health advisories.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">Optimal Conditions</h3>
                <p className="text-green-700 text-sm">
                  Tomorrow morning shows excellent air quality for all scheduled outdoor activities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <Route className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-800">Modify Routes</h3>
            <p className="text-sm text-blue-700">Adjust transit routes based on air quality</p>
          </button>
          
          <button className="p-4 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <Calendar className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-800">Schedule Event</h3>
            <p className="text-sm text-green-700">Plan new events with air quality consideration</p>
          </button>
          
          <button className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
            <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-orange-800">Send Alerts</h3>
            <p className="text-sm text-orange-700">Notify about air quality changes</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportationParksDashboard;