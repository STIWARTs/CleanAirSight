import { useUserProfile } from '../contexts/UserProfileContext';
import HealthSensitiveDashboard from './dashboards/HealthSensitiveDashboard';
import PolicyMakerDashboard from './dashboards/PolicyMakerDashboard';
import EmergencyResponderDashboard from './dashboards/EmergencyResponderDashboard';
import TransportationParksDashboard from './dashboards/TransportationParksDashboard';
import EconomicStakeholderDashboard from './dashboards/EconomicStakeholderDashboard';
import CitizenScienceDashboard from './dashboards/CitizenScienceDashboard';
import ProfileSelector from './ProfileSelector';
import { Settings, User } from 'lucide-react';
import { useState } from 'react';

const PersonalizedDashboard = () => {
  const { currentProfile, getCurrentProfileData, isProfileSelected, resetProfile } = useUserProfile();
  const [showSettings, setShowSettings] = useState(false);

  if (!isProfileSelected) {
    return <ProfileSelector />;
  }

  const profileData = getCurrentProfileData();

  const renderDashboard = () => {
    switch (currentProfile) {
      case 'health_sensitive':
        return <HealthSensitiveDashboard />;
      case 'policy_maker':
        return <PolicyMakerDashboard />;
      case 'emergency_responder':
        return <EmergencyResponderDashboard />;
      case 'transportation_parks':
        return <TransportationParksDashboard />;
      case 'economic_stakeholder':
        return <EconomicStakeholderDashboard />;
      case 'citizen_science':
        return <CitizenScienceDashboard />;
      default:
        return <div>Profile not found</div>;
    }
  };

  return (
    <div className="relative">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-l-4" style={{ borderLeftColor: getCurrentProfileData()?.color?.replace('bg-', '#') || '#3B82F6' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${profileData?.color} flex items-center justify-center text-white text-xl`}>
              {profileData?.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{profileData?.name}</h2>
              <p className="text-sm text-gray-600">{profileData?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Dashboard Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to change your profile? This will reset your preferences.')) {
                  resetProfile();
                }
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Change Profile"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Dashboard Features</h3>
            <div className="flex flex-wrap gap-2">
              {profileData?.features.map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {feature.replace('_', ' ')}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                <strong>AQI Alert Threshold:</strong> {getCurrentProfileData()?.aqiThreshold || 100}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      {renderDashboard()}
    </div>
  );
};

export default PersonalizedDashboard;