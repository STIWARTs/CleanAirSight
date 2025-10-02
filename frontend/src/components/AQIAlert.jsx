import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, X, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const AQIAlert = ({ aqi, city, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 10 seconds for moderate alerts
    if (aqi <= 150) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [aqi, onClose]);

  const getAlertConfig = (aqiValue) => {
    if (aqiValue <= 50) {
      return {
        level: 'Good',
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        icon: CheckCircle,
        message: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        action: 'Enjoy outdoor activities!'
      };
    }
    if (aqiValue <= 100) {
      return {
        level: 'Moderate',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        icon: Bell,
        message: 'Air quality is acceptable. However, there may be a risk for some people.',
        action: 'Unusually sensitive people should consider limiting prolonged outdoor exertion.'
      };
    }
    if (aqiValue <= 150) {
      return {
        level: 'Unhealthy for Sensitive Groups',
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        icon: AlertTriangle,
        message: 'Members of sensitive groups may experience health effects.',
        action: 'Children, elderly, and people with respiratory conditions should limit outdoor exposure.'
      };
    }
    if (aqiValue <= 200) {
      return {
        level: 'Unhealthy',
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        icon: AlertTriangle,
        message: 'Everyone may begin to experience health effects.',
        action: 'Sensitive groups should avoid outdoor activities. Everyone else should limit prolonged exposure.'
      };
    }
    if (aqiValue <= 300) {
      return {
        level: 'Very Unhealthy',
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        icon: AlertTriangle,
        message: 'Health alert: everyone may experience more serious health effects.',
        action: 'Everyone should avoid outdoor activities.'
      };
    }
    return {
      level: 'Hazardous',
      color: 'red',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-400',
      textColor: 'text-red-900',
      icon: AlertTriangle,
      message: 'Health warning of emergency conditions: everyone is more likely to be affected.',
      action: 'Everyone should remain indoors and keep activity levels low.'
    };
  };

  if (!isVisible) return null;

  const config = getAlertConfig(aqi);
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4 shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Icon className={`w-6 h-6 ${config.textColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-bold ${config.textColor}`}>
                {city} - {config.level}
              </h4>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${config.bgColor} ${config.textColor}`}>
                AQI: {aqi}
              </span>
            </div>
            <p className={`text-sm ${config.textColor} mb-2`}>
              {config.message}
            </p>
            <p className={`text-sm ${config.textColor} font-medium`}>
              <strong>Recommendation:</strong> {config.action}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className={`${config.textColor} hover:opacity-75 flex-shrink-0`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

AQIAlert.propTypes = {
  aqi: PropTypes.number.isRequired,
  city: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

export default AQIAlert;
