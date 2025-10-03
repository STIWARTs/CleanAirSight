import React, { useState } from 'react';
import { Mail, Bell, MapPin, Settings } from 'lucide-react';
import { subscribeToAlerts } from '../utils/api';

const EmailSubscription = () => {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(100);
  const [sendTime, setSendTime] = useState('08:00');
  const [frequency, setFrequency] = useState('daily');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      setMessage('Detecting your location...');
      setMessageType('info');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude.toFixed(6));
          setLon(longitude.toFixed(6));
          
          // Try to get city name using a free reverse geocoding service
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            if (data && (data.city || data.locality || data.principalSubdivision)) {
              const cityName = data.city || data.locality || data.principalSubdivision || 'Unknown City';
              setCity(cityName);
              setMessage(`✅ Location detected: ${cityName}`);
              setMessageType('success');
            } else {
              setCity('Current Location');
              setMessage('✅ Coordinates detected successfully');
              setMessageType('success');
            }
          } catch (error) {
            console.error('Error getting city name:', error);
            setCity('Current Location');
            setMessage('✅ Coordinates detected (city name unavailable)');
            setMessageType('success');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setMessage('❌ Unable to detect location. Please enter manually.');
          setMessageType('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setMessage('❌ Geolocation is not supported by this browser.');
      setMessageType('error');
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubscribing(true);
    setMessage('');

    try {
      const data = await subscribeToAlerts({
        email,
        city,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        alert_threshold: alertThreshold,
        send_time: sendTime,
        frequency
      });

      if (data.success) {
        setMessage('✅ Successfully subscribed! Check your email for confirmation.');
        setMessageType('success');
        // Reset form
        setEmail('');
        setCity('');
        setLat('');
        setLon('');
      } else {
        setMessage(`❌ Subscription failed: ${data.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getThresholdColor = (threshold) => {
    if (threshold <= 50) return 'text-green-600';
    if (threshold <= 100) return 'text-yellow-600';
    if (threshold <= 150) return 'text-orange-600';
    return 'text-red-600';
  };

  const getThresholdLabel = (threshold) => {
    if (threshold <= 50) return 'Good';
    if (threshold <= 100) return 'Moderate';
    if (threshold <= 150) return 'Unhealthy for Sensitive Groups';
    if (threshold <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 shadow-lg border border-blue-200">
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Get Daily AQI Alerts</h3>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay informed about air quality in your area. Receive personalized alerts with forecasts and health recommendations.
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-6">
        {/* Email and Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              City
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={handleLocationDetection}
                className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                title="Detect current location"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Coordinates Row (Auto-filled or Manual) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude {lat && <span className="text-xs text-green-600">(✓ Detected)</span>}
            </label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Click 📍 to auto-detect"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 ${
                lat ? 'bg-green-50 text-green-800 border-green-300' : 'bg-gray-50 text-gray-500'
              } focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude {lon && <span className="text-xs text-green-600">(✓ Detected)</span>}
            </label>
            <input
              type="number"
              step="0.000001"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="Click 📍 to auto-detect"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 ${
                lon ? 'bg-green-50 text-green-800 border-green-300' : 'bg-gray-50 text-gray-500'
              } focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Preferences
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold
              </label>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value={50}>Alert when AQI &gt; 50 (Good)</option>
                <option value={100}>Alert when AQI &gt; 100 (Moderate)</option>
                <option value={150}>Alert when AQI &gt; 150 (Unhealthy for Sensitive)</option>
                <option value={200}>Alert when AQI &gt; 200 (Unhealthy)</option>
              </select>
              <p className={`text-sm mt-1 ${getThresholdColor(alertThreshold)}`}>
                You'll be alerted when AQI exceeds {alertThreshold} ({getThresholdLabel(alertThreshold)})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Time
              </label>
              <input
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="on_alert">Only when threshold exceeded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : messageType === 'info'
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubscribing}
            className={`px-8 py-4 rounded-lg font-semibold text-white transition-all ${
              isSubscribing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {isSubscribing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Subscribing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Subscribe to Alerts
              </div>
            )}
          </button>
        </div>

        {/* Benefits List */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h5 className="font-semibold text-blue-900 mb-3">What you'll receive:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📧</span>
              Daily AQI updates for your location
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🔮</span>
              24-hour air quality forecasts
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">💡</span>
              Personalized health recommendations
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🚨</span>
              Priority alerts for unhealthy air
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmailSubscription;