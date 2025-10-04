import React, { useState } from 'react';
import { 
  Mail, Bell, MapPin, Settings, Star, Check, Crown, 
  Zap, Shield, Globe, Clock, Calendar, Users,
  TrendingUp, BarChart3, Smartphone, MessageCircle
} from 'lucide-react';
import { subscribeToAlerts } from '../utils/api';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [isYearly, setIsYearly] = useState(false);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for basic air quality monitoring',
      icon: Bell,
      color: 'blue',
      features: [
        'Daily AQI email alerts',
        '1 location monitoring',
        'Basic health recommendations',
        'Standard alert thresholds',
        'Email support'
      ],
      limitations: [
        'Limited to 1 city',
        'Daily emails only',
        'Basic forecasts'
      ]
    },
    premium: {
      name: 'Premium',
      price: { monthly: 4.99, yearly: 49.99 },
      description: 'Enhanced monitoring with advanced features',
      icon: Star,
      color: 'purple',
      popular: true,
      features: [
        'Everything in Free',
        'Up to 5 locations',
        'Hourly alert options',
        'Advanced health insights',
        'SMS notifications',
        '7-day detailed forecasts',
        'Historical data access',
        'Custom alert thresholds',
        'Priority support'
      ],
      limitations: []
    },
    professional: {
      name: 'Professional',
      price: { monthly: 12.99, yearly: 129.99 },
      description: 'For professionals and organizations',
      icon: Crown,
      color: 'gold',
      features: [
        'Everything in Premium',
        'Unlimited locations',
        'Real-time push notifications',
        'WhatsApp alerts',
        'API access',
        '30-day forecasts',
        'Advanced analytics dashboard',
        'Team collaboration',
        'Custom reports',
        'Dedicated support'
      ],
      limitations: []
    }
  };

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
          
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            if (data && (data.city || data.locality || data.principalSubdivision)) {
              const cityName = data.city || data.locality || data.principalSubdivision;
              setCity(cityName);
              setMessage(`✅ Location detected: ${cityName}`);
              setMessageType('success');
            } else {
              setCity('Current Location');
              setMessage('✅ Coordinates detected successfully');
              setMessageType('success');
            }
          } catch (error) {
            setCity('Current Location');
            setMessage('✅ Coordinates detected');
            setMessageType('success');
          }
        },
        (error) => {
          setMessage('❌ Unable to detect location. Please enter manually.');
          setMessageType('error');
        }
      );
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubscribing(true);
    setMessage('');

    try {
      const subscriptionData = {
        email,
        city,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        alert_threshold: 100,
        send_time: "08:00",
        frequency: "daily",
        plan: selectedPlan,
        billing_cycle: isYearly ? 'yearly' : 'monthly'
      };

      const data = await subscribeToAlerts(subscriptionData);

      if (data.success) {
        setMessage(`✅ Successfully subscribed to ${plans[selectedPlan].name} plan!`);
        setMessageType('success');
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

  const getPlanColor = (plan, type = 'bg') => {
    const colors = {
      blue: type === 'bg' ? 'bg-blue-500' : type === 'border' ? 'border-blue-500' : 'text-blue-500',
      purple: type === 'bg' ? 'bg-purple-500' : type === 'border' ? 'border-purple-500' : 'text-purple-500',
      gold: type === 'bg' ? 'bg-yellow-500' : type === 'border' ? 'border-yellow-500' : 'text-yellow-500'
    };
    return colors[plan.color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">AQI Alert Subscriptions</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan to stay informed about air quality in your area. 
            From basic alerts to professional monitoring solutions.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              <div className="w-24 ml-4 flex items-center">
                {isYearly ? (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                    Save up to 17%
                  </span>
                ) : (
                  <div className="h-6"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.keys(plans).map((planKey) => {
            const plan = plans[planKey];
            const Icon = plan.icon;
            const isSelected = selectedPlan === planKey;
            const price = isYearly ? plan.price.yearly : plan.price.monthly;
            const savings = isYearly && plan.price.monthly > 0 ? 
              (plan.price.monthly * 12 - plan.price.yearly).toFixed(2) : 0;

            return (
              <div
                key={planKey}
                className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  isSelected ? `ring-4 ${getPlanColor(plan, 'border')} ring-opacity-50` : ''
                } ${plan.popular ? 'ring-2 ring-purple-300' : ''}`}
                onClick={() => setSelectedPlan(planKey)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-full ${getPlanColor(plan)} mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${price}
                    </span>
                    <span className="text-gray-600">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                    {savings > 0 && (
                      <div className="text-sm text-green-600 font-semibold mt-1">
                        Save ${savings}/year
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className="h-5 w-5 text-gray-400 flex-shrink-0">•</div>
                            <span className="text-gray-600 text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? `${getPlanColor(plan)} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Subscription Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Subscribe to {plans[selectedPlan].name} Plan
            </h2>
            <p className="text-gray-600">
              Enter your details to start receiving personalized AQI alerts
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-6">
            {/* Email and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  required
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
                  required
                />
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

            {/* Subscribe Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubscribing}
                className={`px-12 py-4 rounded-lg font-semibold text-white transition-all text-lg ${
                  isSubscribing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `${getPlanColor(plans[selectedPlan])} hover:opacity-90 hover:shadow-lg transform hover:scale-105`
                }`}
              >
                {isSubscribing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Subscribe to {plans[selectedPlan].name}
                    {plans[selectedPlan].price[isYearly ? 'yearly' : 'monthly'] > 0 && (
                      <span>
                        - ${plans[selectedPlan].price[isYearly ? 'yearly' : 'monthly']}/{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                )}
              </button>
              
              {selectedPlan !== 'free' && (
                <p className="text-sm text-gray-600 mt-4">
                  You can cancel anytime. No hidden fees.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Choose CleanAirSight Alerts?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Data</h3>
              <p className="text-gray-600">
                Powered by NASA TEMPO satellite data and ground sensors for the most accurate air quality information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Protection</h3>
              <p className="text-gray-600">
                Personalized health recommendations based on air quality levels and your sensitivity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-600">
                Monitor air quality across North America with plans for global expansion.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How accurate are the air quality predictions?
              </h3>
              <p className="text-gray-600 mb-4">
                Our system uses NASA TEMPO satellite data combined with ground sensor networks and advanced ML models, providing industry-leading accuracy for air quality forecasts.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my subscription plan?
              </h3>
              <p className="text-gray-600 mb-4">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What notification methods are available?
              </h3>
              <p className="text-gray-600 mb-4">
                Free users get email alerts. Premium users also receive SMS notifications, and Professional users get WhatsApp alerts and push notifications.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial for premium plans?
              </h3>
              <p className="text-gray-600 mb-4">
                Yes! All premium plans come with a 7-day free trial. You can cancel anytime during the trial period without being charged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;