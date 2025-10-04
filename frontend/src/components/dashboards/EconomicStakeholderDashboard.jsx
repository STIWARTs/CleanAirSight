import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { 
  Briefcase, 
  TrendingDown, 
  MapPin, 
  Download, 
  BarChart3,
  AlertTriangle,
  Building,
  DollarSign,
  Shield,
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const EconomicStakeholderDashboard = () => {
  const { userPreferences, locations } = useUserProfile();
  const [selectedLocation, setSelectedLocation] = useState('location1');
  const [timeRange, setTimeRange] = useState('1year');
  
  const [businessLocations] = useState([
    { 
      id: 'location1', 
      name: 'Downtown Office', 
      address: '123 Main St, Los Angeles',
      currentAQI: 95, 
      riskLevel: 'moderate',
      employees: 150,
      operationalImpact: 'minimal'
    },
    { 
      id: 'location2', 
      name: 'Manufacturing Plant', 
      address: '456 Industrial Blvd, Carson',
      currentAQI: 125, 
      riskLevel: 'high',
      employees: 300,
      operationalImpact: 'significant'
    },
    { 
      id: 'location3', 
      name: 'Retail Store', 
      address: '789 Shopping Center, Beverly Hills',
      currentAQI: 78, 
      riskLevel: 'low',
      employees: 45,
      operationalImpact: 'none'
    }
  ]);

  const [historicalTrends] = useState([
    { month: 'Jan 2024', aqi: 85, businessDays: 20, lostDays: 2, costs: 15000 },
    { month: 'Feb 2024', aqi: 92, businessDays: 19, lostDays: 3, costs: 22000 },
    { month: 'Mar 2024', aqi: 78, businessDays: 22, lostDays: 1, costs: 8000 },
    { month: 'Apr 2024', aqi: 95, businessDays: 21, lostDays: 2, costs: 18000 },
    { month: 'May 2024', aqi: 88, businessDays: 21, lostDays: 2, costs: 16000 },
    { month: 'Jun 2024', aqi: 105, businessDays: 18, lostDays: 4, costs: 35000 },
    { month: 'Jul 2024', aqi: 115, businessDays: 17, lostDays: 5, costs: 42000 },
    { month: 'Aug 2024', aqi: 98, businessDays: 20, lostDays: 3, costs: 25000 },
    { month: 'Sep 2024', aqi: 89, businessDays: 21, lostDays: 2, costs: 17000 },
    { month: 'Oct 2024', aqi: 93, businessDays: 20, lostDays: 3, costs: 24000 }
  ]);

  const [riskAssessment] = useState([
    { category: 'Employee Health', score: 75, impact: 'High', trend: 'stable' },
    { category: 'Operational Continuity', score: 68, impact: 'Medium', trend: 'declining' },
    { category: 'Property Value', score: 82, impact: 'Low', trend: 'improving' },
    { category: 'Insurance Costs', score: 70, impact: 'Medium', trend: 'stable' }
  ]);

  const [costAnalysis] = useState([
    { name: 'Lost Productivity', value: 45, color: '#EF4444' },
    { name: 'Healthcare Costs', value: 25, color: '#F59E0B' },
    { name: 'Equipment/Facility', value: 20, color: '#3B82F6' },
    { name: 'Insurance Claims', value: 10, color: '#8B5CF6' }
  ]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'none': return 'text-green-600 bg-green-100';
      case 'minimal': return 'text-yellow-600 bg-yellow-100';
      case 'significant': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const generateReport = () => {
    // In a real app, this would generate and download a comprehensive business report
    alert('Generating comprehensive business impact report...');
  };

  const exportData = () => {
    // In a real app, this would export data in CSV/Excel format
    alert('Exporting data to CSV format...');
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Briefcase className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Business Impact Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {businessLocations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last Quarter</option>
              <option value="1year">Last Year</option>
              <option value="2years">Last 2 Years</option>
            </select>
            
            {userPreferences.dataExport && (
              <div className="flex gap-2">
                <button 
                  onClick={generateReport}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Report
                </button>
                <button 
                  onClick={exportData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost Impact</p>
              <p className="text-2xl font-bold text-red-600">$242K</p>
              <p className="text-sm text-red-600">↗️ +15% from last year</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lost Business Days</p>
              <p className="text-2xl font-bold text-orange-600">27</p>
              <p className="text-sm text-orange-600">Due to poor air quality</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High-Risk Locations</p>
              <p className="text-2xl font-bold text-purple-600">1</p>
              <p className="text-sm text-purple-600">Requiring immediate action</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <p className="text-2xl font-bold text-blue-600">74/100</p>
              <p className="text-sm text-blue-600">Moderate risk level</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Locations Overview */}
      {userPreferences.multiLocation && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-500" />
            Business Locations
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Current AQI</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Risk Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Employees</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Operational Impact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {businessLocations.map((location) => (
                  <tr key={location.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-800">{location.name}</div>
                        <div className="text-sm text-gray-600">{location.address}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-orange-600">{location.currentAQI}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(location.riskLevel)}`}>
                        {location.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4">{location.employees}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(location.operationalImpact)}`}>
                        {location.operationalImpact}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Cost Analysis */}
      {userPreferences.historicalTrends && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-500" />
            Historical Cost Impact
          </h2>
          <div className="h-80 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="costs" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Costs ($)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="lostDays" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Lost Days"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Total Cost Impact</p>
              <p className="text-lg font-bold text-red-600">$242,000</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800 font-medium">Total Lost Days</p>
              <p className="text-lg font-bold text-orange-600">27 days</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Average AQI</p>
              <p className="text-lg font-bold text-blue-600">93.3</p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {userPreferences.riskAssessment && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            Risk Assessment Matrix
          </h2>
          <div className="space-y-4">
            {riskAssessment.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{risk.category}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Impact: {risk.impact}</span>
                      <span className="text-lg">{getTrendIcon(risk.trend)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          risk.score >= 80 ? 'bg-green-500' : 
                          risk.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${risk.score}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-800">{risk.score}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cost Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {costAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Mitigation Strategies</h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h3 className="font-semibold text-green-800">Air Filtration Systems</h3>
              <p className="text-sm text-green-700">Install HEPA filters to reduce indoor air pollution impact</p>
              <p className="text-sm text-green-600 font-medium mt-1">Potential savings: $45K/year</p>
            </div>
            
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h3 className="font-semibold text-blue-800">Remote Work Policies</h3>
              <p className="text-sm text-blue-700">Flexible work arrangements during high AQI days</p>
              <p className="text-sm text-blue-600 font-medium mt-1">Potential savings: $28K/year</p>
            </div>
            
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
              <h3 className="font-semibold text-purple-800">Insurance Optimization</h3>
              <p className="text-sm text-purple-700">Adjust coverage based on air quality risk assessment</p>
              <p className="text-sm text-purple-600 font-medium mt-1">Potential savings: $15K/year</p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Predictive Risk Scoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-2">6.2/10</div>
            <h3 className="font-semibold text-yellow-800 mb-1">Next Month Risk</h3>
            <p className="text-sm text-yellow-700">Moderate risk expected based on seasonal patterns</p>
          </div>
          
          <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">7.8/10</div>
            <h3 className="font-semibold text-orange-800 mb-1">Summer Risk</h3>
            <p className="text-sm text-orange-700">High risk period requiring additional precautions</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">4.1/10</div>
            <h3 className="font-semibold text-green-800 mb-1">Winter Risk</h3>
            <p className="text-sm text-green-700">Lower risk period with minimal operational impact</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-800">Generate Report</h3>
            <p className="text-sm text-blue-700">Create detailed business impact analysis</p>
          </button>
          
          <button className="p-4 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <Shield className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-800">Update Insurance</h3>
            <p className="text-sm text-green-700">Adjust coverage based on risk assessment</p>
          </button>
          
          <button className="p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <Building className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-800">Location Analysis</h3>
            <p className="text-sm text-purple-700">Detailed air quality impact per location</p>
          </button>
          
          <button className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
            <Download className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-orange-800">Export Data</h3>
            <p className="text-sm text-orange-700">Download historical data and trends</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EconomicStakeholderDashboard;