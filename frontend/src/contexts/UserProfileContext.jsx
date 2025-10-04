import { createContext, useContext, useState, useEffect } from 'react';

const UserProfileContext = createContext();

export const USER_TYPES = {
  HEALTH_SENSITIVE: 'health_sensitive',
  POLICY_MAKER: 'policy_maker',
  EMERGENCY_RESPONDER: 'emergency_responder',
  TRANSPORTATION_PARKS: 'transportation_parks',
  ECONOMIC_STAKEHOLDER: 'economic_stakeholder',
  CITIZEN_SCIENCE: 'citizen_science'
};

export const USER_PROFILES = {
  [USER_TYPES.HEALTH_SENSITIVE]: {
    id: USER_TYPES.HEALTH_SENSITIVE,
    name: 'Health-Sensitive Individual',
    description: 'Children, elderly, asthmatics, and vulnerable populations',
    icon: '🏥',
    color: 'bg-red-500',
    features: ['personalized_alerts', 'health_tips', 'daily_forecast', 'medication_reminders'],
    aqiThreshold: 75, // Lower threshold for sensitive individuals
    preferences: {
      showHealthTips: true,
      showMedicationReminders: true,
      preferredAlertMethods: ['email', 'sms', 'push'],
      activityRecommendations: true
    }
  },
  [USER_TYPES.POLICY_MAKER]: {
    id: USER_TYPES.POLICY_MAKER,
    name: 'Policy Maker & Municipal Authority',
    description: 'Government officials, municipal leaders, transportation authorities',
    icon: '🏛️',
    color: 'bg-blue-500',
    features: ['city_maps', 'hotspot_identification', 'policy_simulation', 'historical_trends', 'reports'],
    aqiThreshold: 100,
    preferences: {
      showHotspots: true,
      showHistoricalTrends: true,
      enableDataExport: true,
      policySimulation: true
    }
  },
  [USER_TYPES.EMERGENCY_RESPONDER]: {
    id: USER_TYPES.EMERGENCY_RESPONDER,
    name: 'Emergency Responder',
    description: 'Wildfire teams, disaster readiness, crisis communication',
    icon: '🚨',
    color: 'bg-orange-500',
    features: ['rapid_alerts', 'incident_reporting', 'forecast_zones', 'citizen_reports'],
    aqiThreshold: 150, // Higher threshold for emergency situations
    preferences: {
      rapidAlerts: true,
      incidentReporting: true,
      showForecastZones: true,
      citizenReports: true
    }
  },
  [USER_TYPES.TRANSPORTATION_PARKS]: {
    id: USER_TYPES.TRANSPORTATION_PARKS,
    name: 'Transportation & Parks Authority',
    description: 'Transit planning, parks departments, recreation coordinators',
    icon: '🚌',
    color: 'bg-green-500',
    features: ['route_aqi', 'event_scheduling', 'trend_charts', 'operational_alerts'],
    aqiThreshold: 100,
    preferences: {
      showRouteAQI: true,
      eventScheduling: true,
      operationalAlerts: true,
      trendCharts: true
    }
  },
  [USER_TYPES.ECONOMIC_STAKEHOLDER]: {
    id: USER_TYPES.ECONOMIC_STAKEHOLDER,
    name: 'Economic Stakeholder',
    description: 'Insurance assessors, business operations, property risk evaluation',
    icon: '💼',
    color: 'bg-purple-500',
    features: ['historical_trends', 'risk_assessment', 'multi_location', 'data_export'],
    aqiThreshold: 100,
    preferences: {
      historicalTrends: true,
      riskAssessment: true,
      multiLocation: true,
      dataExport: true
    }
  },
  [USER_TYPES.CITIZEN_SCIENCE]: {
    id: USER_TYPES.CITIZEN_SCIENCE,
    name: 'Citizen Science Participant',
    description: 'Community members, educational engagement, data collection',
    icon: '🔬',
    color: 'bg-indigo-500',
    features: ['crowdsource_reporting', 'leaderboard', 'photo_upload', 'education'],
    aqiThreshold: 100,
    preferences: {
      crowdsourceReporting: true,
      showLeaderboard: true,
      photoUpload: true,
      educationalContent: true
    }
  }
};

export const UserProfileProvider = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  const [locations, setLocations] = useState([]);
  const [isProfileSelected, setIsProfileSelected] = useState(false);

  // Load saved profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('cleanairsight_user_profile');
    const savedPreferences = localStorage.getItem('cleanairsight_user_preferences');
    const savedLocations = localStorage.getItem('cleanairsight_user_locations');
    
    if (savedProfile) {
      setCurrentProfile(savedProfile);
      setIsProfileSelected(true);
    }
    
    if (savedPreferences) {
      try {
        setUserPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.warn('Failed to parse saved preferences');
      }
    }
    
    if (savedLocations) {
      try {
        setLocations(JSON.parse(savedLocations));
      } catch (e) {
        console.warn('Failed to parse saved locations');
      }
    }
  }, []);

  const selectProfile = (profileId, preferences = {}) => {
    const profile = USER_PROFILES[profileId];
    if (!profile) return;

    setCurrentProfile(profileId);
    setUserPreferences({ ...profile.preferences, ...preferences });
    setIsProfileSelected(true);
    
    // Save to localStorage
    localStorage.setItem('cleanairsight_user_profile', profileId);
    localStorage.setItem('cleanairsight_user_preferences', JSON.stringify({ ...profile.preferences, ...preferences }));
  };

  const updatePreferences = (newPreferences) => {
    const updatedPreferences = { ...userPreferences, ...newPreferences };
    setUserPreferences(updatedPreferences);
    localStorage.setItem('cleanairsight_user_preferences', JSON.stringify(updatedPreferences));
  };

  const addLocation = (location) => {
    const updatedLocations = [...locations, { ...location, id: Date.now() }];
    setLocations(updatedLocations);
    localStorage.setItem('cleanairsight_user_locations', JSON.stringify(updatedLocations));
  };

  const removeLocation = (locationId) => {
    const updatedLocations = locations.filter(loc => loc.id !== locationId);
    setLocations(updatedLocations);
    localStorage.setItem('cleanairsight_user_locations', JSON.stringify(updatedLocations));
  };

  const resetProfile = () => {
    setCurrentProfile(null);
    setUserPreferences({});
    setLocations([]);
    setIsProfileSelected(false);
    localStorage.removeItem('cleanairsight_user_profile');
    localStorage.removeItem('cleanairsight_user_preferences');
    localStorage.removeItem('cleanairsight_user_locations');
  };

  const getCurrentProfileData = () => {
    if (!currentProfile) return null;
    return USER_PROFILES[currentProfile];
  };

  const getAQIThreshold = () => {
    const profile = getCurrentProfileData();
    return profile ? profile.aqiThreshold : 100;
  };

  const hasFeature = (feature) => {
    const profile = getCurrentProfileData();
    return profile ? profile.features.includes(feature) : false;
  };

  const value = {
    currentProfile,
    userPreferences,
    locations,
    isProfileSelected,
    selectProfile,
    updatePreferences,
    addLocation,
    removeLocation,
    resetProfile,
    getCurrentProfileData,
    getAQIThreshold,
    hasFeature,
    USER_PROFILES,
    USER_TYPES
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};