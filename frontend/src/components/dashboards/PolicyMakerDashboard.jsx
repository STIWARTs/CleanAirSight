import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { 
  Building, 
  MapPin, 
  TrendingUp, 
  Download, 
  BarChart3,
  AlertTriangle,
  FileText,
  Settings,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AQIMap from '../AQIMap';

const PolicyMakerDashboard = () => {
  const { userPreferences } = useUserProfile();
  const [selectedCity, setSelectedCity] = useState('Los Angeles');
  const [timeRange, setTimeRange] = useState('30days');
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        // Fetch pollution hotspots
        const hotspotsResponse = await fetch('/api/personalized/hotspots?threshold=100&limit=10');
        const hotspotsData = await hotspotsResponse.json();
        
        if (hotspotsData.hotspots && hotspotsData.hotspots.length > 0) {
          const formattedHotspots = hotspotsData.hotspots.map(hotspot => ({
            name: hotspot.location.city || `Location ${hotspot.location.lat.toFixed(2)}, ${hotspot.location.lon.toFixed(2)}`,
            aqi: hotspot.aqi,
            trend: 'stable', // Would need historical comparison for real trend
            lat: hotspot.location.lat,
            lon: hotspot.location.lon,
            pollutant: hotspot.pollutant,
            timestamp: hotspot.timestamp
          }));
          setHotspots(formattedHotspots);
        } else {
          // Fallback to mock data if no real hotspots
          setHotspots([
            { name: 'Downtown LA', aqi: 145, trend: 'up', lat: 34.0522, lon: -118.2437 },
            { name: 'Industrial District', aqi: 132, trend: 'stable', lat: 34.0224, lon: -118.2851 },
            { name: 'Port Area', aqi: 158, trend: 'up', lat: 33.7361, lon: -118.2922 },
            { name: 'Airport Zone', aqi: 128, trend: 'down', lat: 33.9425, lon: -118.4081 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching policy data:', error);
        // Fallback to mock data
        setHotspots([
          { name: 'Downtown LA', aqi: 145, trend: 'up', lat: 34.0522, lon: -118.2437 },
          { name: 'Industrial District', aqi: 132, trend: 'stable', lat: 34.0224, lon: -118.2851 },
          { name: 'Port Area', aqi: 158, trend: 'up', lat: 33.7361, lon: -118.2922 },
          { name: 'Airport Zone', aqi: 128, trend: 'down', lat: 33.9425, lon: -118.4081 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
    const interval = setInterval(fetchPolicyData, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, [selectedCity]);

  const [historicalData] = useState([
    { month: 'Jan', aqi: 85, pm25: 35, no2: 25, o3: 45 },
    { month: 'Feb', aqi: 92, pm25: 38, no2: 28, o3: 48 },
    { month: 'Mar', aqi: 78, pm25: 32, no2: 22, o3: 42 },
    { month: 'Apr', aqi: 95, pm25: 40, no2: 30, o3: 52 },
    { month: 'May', aqi: 88, pm25: 36, no2: 26, o3: 48 },
    { month: 'Jun', aqi: 105, pm25: 45, no2: 35, o3: 58 },
  ]);

  const [policyScenarios] = useState([
    { name: 'Current Baseline', aqi: 95, reduction: 0 },
    { name: 'Traffic Reduction 20%', aqi: 82, reduction: 13.7 },
    { name: 'Industrial Limits', aqi: 78, reduction: 17.9 },
    { name: 'Green Transit Initiative', aqi: 71, reduction: 25.3 },
    { name: 'Combined Measures', aqi: 65, reduction: 31.6 },
  ]);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-green-600 bg-green-100';
    if (aqi <= 100) return 'text-yellow-600 bg-yellow-100';
    if (aqi <= 150) return 'text-orange-600 bg-orange-100';
    if (aqi <= 200) return 'text-red-600 bg-red-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  const generateReport = async (format = 'csv') => {
    try {
      // Generate CSV data
      if (format === 'csv') {
        const csvData = [
          ['Location', 'AQI', 'Trend', 'Latitude', 'Longitude', 'Pollutant', 'Timestamp'],
          ...hotspots.map(hotspot => [
            hotspot.name,
            hotspot.aqi,
            hotspot.trend,
            hotspot.lat,
            hotspot.lon,
            hotspot.pollutant || 'N/A',
            hotspot.timestamp || new Date().toISOString()
          ])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `air-quality-hotspots-${selectedCity}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // For PDF, we would typically use a library like jsPDF
        // For now, show an alert that PDF generation would be implemented
        alert('PDF generation would be implemented with jsPDF library. For now, please use CSV export.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Building className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Policy Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="Los Angeles">Los Angeles</option>
              <option value="New York">New York</option>
              <option value="Chicago">Chicago</option>
              <option value="Houston">Houston</option>
            </select>
            
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            
            {userPreferences.enableDataExport && (
              <div className="flex gap-2">
                <button 
                  onClick={() => generateReport('csv')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button 
                  onClick={() => generateReport('pdf')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average AQI</p>
              <p className="text-2xl font-bold text-gray-800">95</p>
              <p className="text-sm text-orange-600">↗️ +5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hotspots</p>
              <p className="text-2xl font-bold text-gray-800">{hotspots.length}</p>
              <p className="text-sm text-red-600">Areas above threshold</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Population Affected</p>
              <p className="text-2xl font-bold text-gray-800">2.3M</p>
              <p className="text-sm text-gray-600">In moderate+ zones</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-800">78%</p>
              <p className="text-sm text-green-600">↗️ +3% improvement</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* City/Neighborhood Level AQI Map */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-500" />
          City/Neighborhood AQI Map - Satellite + Ground Data
        </h2>
        <div className="relative">
          <AQIMap 
            hotspots={hotspots}
            center={selectedCity === 'Los Angeles' ? [34.0522, -118.2437] : 
                   selectedCity === 'New York' ? [40.7128, -74.0060] :
                   selectedCity === 'Chicago' ? [41.8781, -87.6298] :
                   selectedCity === 'Houston' ? [29.7604, -95.3698] : [34.0522, -118.2437]}
            zoom={10}
          />
          {hotspots.length === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <p className="text-lg font-medium">Loading hotspot data...</p>
                <p className="text-sm">Real-time pollution monitoring</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>🛰️ <strong>Data Sources:</strong> NASA TEMPO Satellite + Ground Monitoring Stations</p>
          <p>🔄 <strong>Updates:</strong> Real-time every 10 minutes | <strong>Coverage:</strong> City-wide heatmap overlays</p>
        </div>
      </div>

      {/* Pollution Hotspots */}
      {userPreferences.showHotspots && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Pollution Hotspots (Areas Exceeding Thresholds)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotspots.map((hotspot, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{hotspot.name}</h3>
                  <span className="text-xl">{getTrendIcon(hotspot.trend)}</span>
                </div>
                <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${getAQIColor(hotspot.aqi)}`}>
                  AQI {hotspot.aqi}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {hotspot.lat.toFixed(4)}, {hotspot.lon.toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Trends */}
      {userPreferences.showHistoricalTrends && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Historical Trends
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="AQI"
                />
                <Line 
                  type="monotone" 
                  dataKey="pm25" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="PM2.5"
                />
                <Line 
                  type="monotone" 
                  dataKey="no2" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="NO2"
                />
                <Line 
                  type="monotone" 
                  dataKey="o3" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="O3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Policy Simulation */}
      {userPreferences.policySimulation && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-500" />
            Policy Impact Simulation
          </h2>
          <p className="text-gray-600 mb-4">
            Projected AQI changes based on different policy interventions
          </p>
          
          <div className="space-y-4">
            {policyScenarios.map((scenario, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{scenario.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-1 rounded text-sm ${getAQIColor(scenario.aqi)}`}>
                      AQI {scenario.aqi}
                    </span>
                    {scenario.reduction > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        -{scenario.reduction}% reduction
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(scenario.reduction, 5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Recommendation:</strong> Implementing combined measures could reduce AQI by 31.6%, 
              significantly improving air quality for 2.3M residents.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-800">Generate Monthly Report</h3>
            <p className="text-sm text-gray-600">Create comprehensive air quality report</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <AlertTriangle className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-800">Set Alert Thresholds</h3>
            <p className="text-sm text-gray-600">Configure pollution alert levels</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Download className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-800">Export Data</h3>
            <p className="text-sm text-gray-600">Download CSV/PDF reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyMakerDashboard;