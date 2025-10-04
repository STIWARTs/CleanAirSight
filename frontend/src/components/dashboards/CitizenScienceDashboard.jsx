import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { 
  FlaskConical, 
  Camera, 
  Users, 
  Trophy,
  Upload,
  Star,
  MapPin,
  BookOpen,
  Award,
  Target,
  MessageCircle,
  Send
} from 'lucide-react';

const CitizenScienceDashboard = () => {
  const { userPreferences } = useUserProfile();
  const [selectedTab, setSelectedTab] = useState('contribute');
  const [photoUpload, setPhotoUpload] = useState(null);
  const [reportForm, setReportForm] = useState({
    type: '',
    location: '',
    description: '',
    severity: 'low'
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/personalized/city-leaderboard?limit=10');
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to mock data
        setLeaderboard([
          { rank: 1, city: 'San Francisco', aqi: 45, trend: 'stable', score: 98 },
          { rank: 2, city: 'Seattle', aqi: 52, trend: 'stable', score: 94 },
          { rank: 3, city: 'Portland', aqi: 58, trend: 'stable', score: 89 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const [userReports] = useState([
    { 
      id: 1, 
      type: 'smoke', 
      location: 'Santa Monica Pier', 
      date: '2024-10-01',
      status: 'verified',
      votes: 12,
      impact: 'moderate'
    },
    { 
      id: 2, 
      type: 'dust', 
      location: 'Downtown LA', 
      date: '2024-09-28',
      status: 'pending',
      votes: 5,
      impact: 'low'
    },
    { 
      id: 3, 
      type: 'chemical_smell', 
      location: 'Industrial Area', 
      date: '2024-09-25',
      status: 'verified',
      votes: 18,
      impact: 'high'
    }
  ]);

  const [challenges] = useState([
    {
      id: 1,
      title: 'Air Quality Detective',
      description: 'Submit 10 verified pollution reports',
      progress: 7,
      total: 10,
      reward: '50 points',
      badge: '🕵️‍♂️'
    },
    {
      id: 2,
      title: 'Photo Analyst',
      description: 'Upload 5 sky photos for AQI estimation',
      progress: 3,
      total: 5,
      reward: '30 points',
      badge: '📸'
    },
    {
      id: 3,
      title: 'Community Helper',
      description: 'Vote on 20 community reports',
      progress: 15,
      total: 20,
      reward: '25 points',
      badge: '🤝'
    }
  ]);

  const [educationalContent] = useState([
    {
      title: 'Understanding AQI Levels',
      category: 'Basics',
      duration: '5 min read',
      difficulty: 'Beginner',
      completed: true
    },
    {
      title: 'Identifying Pollution Sources',
      category: 'Advanced',
      duration: '10 min read',
      difficulty: 'Intermediate',
      completed: false
    },
    {
      title: 'Health Impact of Air Pollution',
      category: 'Health',
      duration: '8 min read',
      difficulty: 'Beginner',
      completed: true
    },
    {
      title: 'Data Collection Best Practices',
      category: 'Methods',
      duration: '15 min read',
      difficulty: 'Advanced',
      completed: false
    }
  ]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // Get user's location (simplified - in real app would use geolocation API)
      const lat = 34.0522; // Default to LA coordinates for demo
      const lon = -118.2437;
      
      const params = new URLSearchParams({
        report_type: reportForm.type,
        location: reportForm.location,
        lat: lat.toString(),
        lon: lon.toString(),
        description: reportForm.description,
        severity: reportForm.severity
      });
      
      const response = await fetch(`/api/personalized/citizen-report?${params}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Report submitted successfully! Report ID: ${result.report_id}. Thank you for contributing to cleaner air!`);
        setReportForm({ type: '', location: '', description: '', severity: 'low' });
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, this would upload and analyze the photo
      setPhotoUpload(file);
      alert('Photo uploaded! AI analysis will be available shortly.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with User Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Citizen Science Dashboard</h2>
              <p className="text-indigo-100">Contributing to cleaner air through community science</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">1,247</div>
            <div className="text-indigo-200">Your Points</div>
            <div className="flex items-center gap-2 mt-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">Level 5 Contributor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          {[
            { id: 'contribute', label: 'Contribute', icon: Upload },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'challenges', label: 'Challenges', icon: Target },
            { id: 'learn', label: 'Learn', icon: BookOpen }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'contribute' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pollution Report Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              Report Pollution Event
            </h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select event type</option>
                  <option value="smoke">Smoke/Fire</option>
                  <option value="dust">Dust Storm</option>
                  <option value="chemical_smell">Chemical Odor</option>
                  <option value="vehicle_emissions">Vehicle Emissions</option>
                  <option value="industrial">Industrial Pollution</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={reportForm.location}
                  onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                  placeholder="Enter location or address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Describe what you observed..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={reportForm.severity}
                  onChange={(e) => setReportForm({...reportForm, severity: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low - Minor visibility reduction</option>
                  <option value="moderate">Moderate - Noticeable air quality impact</option>
                  <option value="high">High - Significant health concern</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>

          {/* Photo Upload for AQI Estimation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-6 h-6 text-green-500" />
              AI Sky Photo Analysis
            </h3>
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                {photoUpload ? (
                  <div>
                    <Camera className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">Photo uploaded: {photoUpload.name}</p>
                    <p className="text-sm text-gray-600 mt-2">AI analysis in progress...</p>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Upload a photo of the sky for AQI estimation</p>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="bg-green-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </label>
            </div>

            {/* Recent Photo Results */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Recent Analysis Results</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Santa Monica Beach</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">AQI 95</p>
                    <p className="text-sm text-gray-600">+15 points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'leaderboard' && userPreferences.showLeaderboard && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Clean Air Cities Leaderboard
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">City</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Current AQI</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Trend</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Badge</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((city) => (
                  <tr key={city.rank} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {city.rank <= 3 && (
                          <span className="text-2xl">
                            {city.rank === 1 ? '🥇' : city.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-semibold">{city.rank}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{city.city}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-green-600">{city.aqi}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-lg">{getTrendIcon(city.trend)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-600">{city.points}</span>
                    </td>
                    <td className="py-3 px-4">
                      {city.rank === 1 && <span className="text-lg">👑</span>}
                      {city.rank <= 3 && city.rank > 1 && <span className="text-lg">⭐</span>}
                      {city.rank > 3 && city.rank <= 5 && <span className="text-lg">🌟</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'challenges' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-500" />
              Active Challenges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{challenge.badge}</span>
                    <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">{challenge.reward}</span>
                    {challenge.progress === challenge.total && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Contributions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Contributions</h3>
            <div className="space-y-3">
              {userReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">
                        {report.type.replace('_', ' ')} - {report.location}
                      </p>
                      <p className="text-sm text-gray-600">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(report.impact)}`}>
                      {report.impact} impact
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4" />
                      {report.votes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'learn' && userPreferences.educationalContent && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Educational Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationalContent.map((content, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{content.title}</h4>
                  {content.completed && (
                    <div className="text-green-600">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{content.category}</span>
                  <span>{content.duration}</span>
                  <span>{content.difficulty}</span>
                </div>
                <button className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  content.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}>
                  {content.completed ? 'Completed' : 'Start Learning'}
                </button>
              </div>
            ))}
          </div>

          {/* Learning Progress */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-2">Your Learning Progress</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Completed Courses</span>
                  <span>2/4</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-indigo-600">50%</div>
                <div className="text-sm text-indigo-700">Complete</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenScienceDashboard;