import React, { useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { CheckCircle, ArrowRight, Users, Building, AlertTriangle, Bus, Briefcase, FlaskConical } from 'lucide-react';

const ProfileSelector = () => {
  const { USER_PROFILES, selectProfile, isProfileSelected } = useUserProfile();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({});

  if (isProfileSelected) {
    return null; // Don't show if profile already selected
  }

  const getProfileIcon = (profileId) => {
    const icons = {
      health_sensitive: Users,
      policy_maker: Building,
      emergency_responder: AlertTriangle,
      transportation_parks: Bus,
      economic_stakeholder: Briefcase,
      citizen_science: FlaskConical
    };
    return icons[profileId] || Users;
  };

  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId);
    setPreferences(USER_PROFILES[profileId].preferences);
    setShowPreferences(true);
  };

  const handleConfirmSelection = () => {
    if (selectedProfile) {
      selectProfile(selectedProfile, preferences);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {!showPreferences ? (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to CleanAirSight
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Choose your profile to get a personalized dashboard experience tailored to your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(USER_PROFILES).map((profile) => {
                const IconComponent = getProfileIcon(profile.id);
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile.id)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                      selectedProfile === profile.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full ${profile.color} flex items-center justify-center mb-4`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {profile.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {profile.description}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {profile.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {feature.replace('_', ' ')}
                          </span>
                        ))}
                        {profile.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{profile.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedProfile && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  Continue with {USER_PROFILES[selectedProfile].name}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full ${USER_PROFILES[selectedProfile].color} flex items-center justify-center mx-auto mb-4`}>
                {React.createElement(getProfileIcon(selectedProfile), { className: "w-10 h-10 text-white" })}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Customize Your {USER_PROFILES[selectedProfile].name} Experience
              </h2>
              <p className="text-gray-600">
                Adjust these settings to match your specific needs and preferences
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                {selectedProfile === 'health_sensitive' && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Health Tips & Recommendations</h4>
                        <p className="text-sm text-gray-600">Show activity guidance and health advice</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.showHealthTips}
                          onChange={(e) => updatePreference('showHealthTips', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Medication Reminders</h4>
                        <p className="text-sm text-gray-600">Get reminders for air quality-related medications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.showMedicationReminders}
                          onChange={(e) => updatePreference('showMedicationReminders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Activity Recommendations</h4>
                        <p className="text-sm text-gray-600">Get suggestions for indoor/outdoor activities</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.activityRecommendations}
                          onChange={(e) => updatePreference('activityRecommendations', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {selectedProfile === 'policy_maker' && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Show Pollution Hotspots</h4>
                        <p className="text-sm text-gray-600">Highlight areas exceeding pollution thresholds</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.showHotspots}
                          onChange={(e) => updatePreference('showHotspots', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Policy Simulation Tools</h4>
                        <p className="text-sm text-gray-600">Enable "what-if" analysis for policy impacts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.policySimulation}
                          onChange={(e) => updatePreference('policySimulation', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Data Export Features</h4>
                        <p className="text-sm text-gray-600">Enable CSV/PDF report generation</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.enableDataExport}
                          onChange={(e) => updatePreference('enableDataExport', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </>
                )}

                {/* Add similar preference sections for other profile types */}
                {selectedProfile === 'citizen_science' && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Community Leaderboard</h4>
                        <p className="text-sm text-gray-600">Show top cities with cleanest air</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.showLeaderboard}
                          onChange={(e) => updatePreference('showLeaderboard', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">Educational Content</h4>
                        <p className="text-sm text-gray-600">Access to learning resources and challenges</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.educationalContent}
                          onChange={(e) => updatePreference('educationalContent', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Start Using CleanAirSight
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;