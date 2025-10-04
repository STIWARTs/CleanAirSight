import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { 
  AlertTriangle, 
  MapPin, 
  Radio, 
  Clock, 
  Users,
  Flame,
  Wind,
  Eye,
  Phone,
  Send
} from 'lucide-react';

const EmergencyResponderDashboard = () => {
  const { userPreferences, getAQIThreshold } = useUserProfile();
  const [alerts, setAlerts] = useState([
    { 
      id: 1, 
      type: 'wildfire', 
      severity: 'high', 
      location: 'Santa Monica Mountains', 
      aqi: 220, 
      time: '2 hours ago',
      status: 'active',
      description: 'Wildfire smoke causing severe air quality degradation'
    },
    { 
      id: 2, 
      type: 'industrial', 
      severity: 'medium', 
      location: 'Port of LA', 
      aqi: 155, 
      time: '45 minutes ago',
      status: 'monitoring',
      description: 'Industrial emission spike detected'
    },
    { 
      id: 3, 
      type: 'dust_storm', 
      severity: 'low', 
      location: 'Antelope Valley', 
      aqi: 125, 
      time: '1 hour ago',
      status: 'resolved',
      description: 'Dust storm impact decreasing'
    }
  ]);

  const [riskZones, setRiskZones] = useState([
    { name: 'Santa Monica Mountains', risk: 'extreme', aqi: 220, population: 15000 },
    { name: 'San Fernando Valley', risk: 'high', aqi: 175, population: 45000 },
    { name: 'Downtown LA', risk: 'moderate', aqi: 135, population: 85000 },
    { name: 'Pasadena', risk: 'low', aqi: 95, population: 25000 }
  ]);

  const [citizenReports, setCitizenReports] = useState([
    { id: 1, type: 'smoke', location: 'Malibu Beach', time: '30 min ago', verified: false },
    { id: 2, type: 'dust', location: 'Lancaster', time: '1 hour ago', verified: true },
    { id: 3, type: 'chemical_smell', location: 'Carson', time: '2 hours ago', verified: false }
  ]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'extreme': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'wildfire': return Flame;
      case 'industrial': return Radio;
      case 'dust_storm': return Wind;
      default: return AlertTriangle;
    }
  };

  const handleRespondToAlert = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'responding' }
        : alert
    ));
  };

  const handleVerifyReport = (reportId) => {
    setCitizenReports(citizenReports.map(report => 
      report.id === reportId 
        ? { ...report, verified: true }
        : report
    ));
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert Banner */}
      <div className="bg-red-600 text-white p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">ACTIVE EMERGENCY ALERT</h2>
              <p>Wildfire smoke causing hazardous air quality in Santa Monica Mountains area</p>
            </div>
          </div>
          <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            View Details
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'active').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk Zones</p>
              <p className="text-2xl font-bold text-orange-600">{riskZones.filter(z => z.risk === 'high' || z.risk === 'extreme').length}</p>
            </div>
            <MapPin className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">People Affected</p>
              <p className="text-2xl font-bold text-purple-600">170K</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citizen Reports</p>
              <p className="text-2xl font-bold text-blue-600">{citizenReports.length}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Active Alerts
        </h2>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertIcon className="w-6 h-6 text-red-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {alert.type.replace('_', ' ')} Alert
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">{alert.time}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {alert.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wind className="w-4 h-4" />
                          AQI {alert.aqi}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <button 
                        onClick={() => handleRespondToAlert(alert.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Respond
                      </button>
                    )}
                    <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Zones Forecast */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-orange-500" />
          High Risk Zones (Next 24 Hours)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskZones.map((zone, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{zone.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(zone.risk)}`}>
                  {zone.risk.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>AQI: {zone.aqi}</span>
                <span>Population: {zone.population.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Reports */}
      {userPreferences.citizenReports && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Citizen Reports
          </h2>
          <div className="space-y-3">
            {citizenReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${report.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-800 capitalize">
                      {report.type.replace('_', ' ')} - {report.location}
                    </p>
                    <p className="text-sm text-gray-600">{report.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.verified ? (
                    <span className="text-green-600 text-sm font-medium">Verified</span>
                  ) : (
                    <button
                      onClick={() => handleVerifyReport(report.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                  <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Emergency Response Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
            <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
            <h3 className="font-semibold text-red-800">Issue Public Alert</h3>
            <p className="text-sm text-red-700">Send emergency notifications to affected areas</p>
          </button>
          
          <button className="p-4 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <Radio className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-800">Coordinate Response</h3>
            <p className="text-sm text-blue-700">Contact other emergency services</p>
          </button>
          
          <button className="p-4 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <MapPin className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-800">Deploy Resources</h3>
            <p className="text-sm text-green-700">Allocate emergency response teams</p>
          </button>
        </div>
      </div>

      {/* Communication Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Phone className="w-6 h-6 text-purple-500" />
          Emergency Communications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Quick Contacts</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-800">Fire Department</span>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-800">Air Quality Control</span>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-800">Public Health</span>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Send Alert</h3>
            <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <textarea 
                placeholder="Type emergency message..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
              />
              <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium">
                <Send className="w-4 h-4" />
                Send Emergency Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponderDashboard;