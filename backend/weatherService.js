const axios = require('axios');

class WeatherService {
  constructor() {
    // Meteomatics API (premium weather data)
    this.meteomaticsUsername = process.env.METEOMATICS_USERNAME;
    this.meteomaticsPassword = process.env.METEOMATICS_PASSWORD;
    this.meteomaticsUrl = 'https://api.meteomatics.com';
    
    // OpenWeatherMap (fallback)
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.openWeatherUrl = 'https://api.openweathermap.org/data/2.5';
    
    // NOAA/NWS (US government data - free but US-focused)
    this.noaaUrl = 'https://api.weather.gov';
    
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes for current weather
    this.forecastCacheTimeout = 60 * 60 * 1000; // 1 hour for forecasts
  }

  /**
   * Get comprehensive weather data affecting air quality
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather data with air quality impact analysis
   */
  async getWeatherForAirQuality(lat, lon) {
    const cacheKey = `weather_${lat}_${lon}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('🔄 Using cached weather data');
        return cached.data;
      }
    }

    try {
      console.log('🌤️ Fetching weather data for air quality analysis...');
      
      // Try Meteomatics first (most comprehensive for air quality)
      if (this.meteomaticsUsername && this.meteomaticsPassword) {
        const meteomaticsData = await this.getMeteomaticsWeather(lat, lon);
        if (meteomaticsData) {
          const enhancedData = this.enhanceWeatherForAirQuality(meteomaticsData, lat, lon);
          this.cacheWeatherData(cacheKey, enhancedData);
          return enhancedData;
        }
      }
      
      // Fallback to OpenWeatherMap
      if (this.openWeatherApiKey) {
        console.log('🔄 Trying OpenWeatherMap as fallback...');
        const openWeatherData = await this.getOpenWeatherData(lat, lon);
        if (openWeatherData) {
          const enhancedData = this.enhanceWeatherForAirQuality(openWeatherData, lat, lon);
          this.cacheWeatherData(cacheKey, enhancedData);
          return enhancedData;
        }
      }
      
      // NOAA fallback for US locations
      if (this.isUSLocation(lat, lon)) {
        console.log('🔄 Trying NOAA for US location...');
        const noaaData = await this.getNOAAWeather(lat, lon);
        if (noaaData) {
          const enhancedData = this.enhanceWeatherForAirQuality(noaaData, lat, lon);
          this.cacheWeatherData(cacheKey, enhancedData);
          return enhancedData;
        }
      }
      
      // Enhanced fallback weather model
      console.log('🔄 Using enhanced weather estimation model...');
      return this.getEnhancedWeatherEstimate(lat, lon);

    } catch (error) {
      console.error('❌ Weather service error:', error.message);
      return this.getEnhancedWeatherEstimate(lat, lon);
    }
  }

  /**
   * Get weather forecast for air quality predictions
   */
  async getWeatherForecast(lat, lon, hours = 24) {
    const cacheKey = `forecast_${lat}_${lon}_${hours}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.forecastCacheTimeout) {
        console.log('🔄 Using cached weather forecast');
        return cached.data;
      }
    }

    try {
      console.log(`🌦️ Fetching ${hours}-hour weather forecast...`);
      
      let forecastData = null;
      
      // Try Meteomatics forecast
      if (this.meteomaticsUsername && this.meteomaticsPassword) {
        forecastData = await this.getMeteomaticsForecast(lat, lon, hours);
      }
      
      // Fallback to OpenWeatherMap
      if (!forecastData && this.openWeatherApiKey) {
        forecastData = await this.getOpenWeatherForecast(lat, lon, hours);
      }
      
      // Enhanced local forecast model
      if (!forecastData) {
        forecastData = await this.generateEnhancedWeatherForecast(lat, lon, hours);
      }
      
      // Enhance with air quality impact analysis
      const enhancedForecast = this.enhanceForecastForAirQuality(forecastData, lat, lon);
      
      this.cache.set(cacheKey, {
        data: enhancedForecast,
        timestamp: Date.now()
      });
      
      return enhancedForecast;

    } catch (error) {
      console.error('❌ Weather forecast error:', error.message);
      return this.generateEnhancedWeatherForecast(lat, lon, hours);
    }
  }

  /**
   * Get Meteomatics weather data (premium service)
   */
  async getMeteomaticsWeather(lat, lon) {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 19) + 'Z';
      
      // Parameters most relevant for air quality
      const parameters = [
        't_2m:C',           // Temperature at 2m
        'relative_humidity_2m:p', // Relative humidity
        'wind_speed_10m:ms',      // Wind speed at 10m
        'wind_dir_10m:d',         // Wind direction
        'precip_1h:mm',           // Precipitation
        'msl_pressure:hPa',       // Sea level pressure
        'global_rad:W',           // Solar radiation
        'uv:idx',                 // UV index
        'wind_gusts_10m_1h:ms',   // Wind gusts
        'visibility:m'            // Visibility
      ].join(',');
      
      const url = `${this.meteomaticsUrl}/${dateStr}/${parameters}/${lat},${lon}/json`;
      
      const response = await axios.get(url, {
        auth: {
          username: this.meteomaticsUsername,
          password: this.meteomaticsPassword
        },
        timeout: 10000
      });

      console.log('✅ Meteomatics weather data retrieved');
      return this.processMeteomaticsData(response.data, lat, lon);

    } catch (error) {
      console.error('❌ Meteomatics API error:', error.message);
      return null;
    }
  }

  /**
   * Get OpenWeatherMap data
   */
  async getOpenWeatherData(lat, lon) {
    try {
      const response = await axios.get(`${this.openWeatherUrl}/weather`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.openWeatherApiKey,
          units: 'metric'
        },
        timeout: 10000
      });

      console.log('✅ OpenWeatherMap data retrieved');
      return this.processOpenWeatherData(response.data, lat, lon);

    } catch (error) {
      console.error('❌ OpenWeatherMap API error:', error.message);
      return null;
    }
  }

  /**
   * Get NOAA weather data for US locations
   */
  async getNOAAWeather(lat, lon) {
    try {
      // First get the forecast office and grid coordinates
      const pointResponse = await axios.get(`${this.noaaUrl}/points/${lat},${lon}`, {
        timeout: 10000
      });

      const gridX = pointResponse.data.properties.gridX;
      const gridY = pointResponse.data.properties.gridY;
      const office = pointResponse.data.properties.gridId;

      // Get current conditions
      const forecastResponse = await axios.get(
        `${this.noaaUrl}/gridpoints/${office}/${gridX},${gridY}`, 
        { timeout: 10000 }
      );

      console.log('✅ NOAA weather data retrieved');
      return this.processNOAAData(forecastResponse.data, lat, lon);

    } catch (error) {
      console.error('❌ NOAA API error:', error.message);
      return null;
    }
  }

  /**
   * Process Meteomatics data
   */
  processMeteomaticsData(data, lat, lon) {
    const weatherData = {};
    
    for (const item of data.data) {
      const param = item.parameter;
      const value = item.coordinates[0]?.dates[0]?.value;
      
      switch (param) {
        case 't_2m:C':
          weatherData.temperature = value;
          break;
        case 'relative_humidity_2m:p':
          weatherData.humidity = value;
          break;
        case 'wind_speed_10m:ms':
          weatherData.windSpeed = value;
          break;
        case 'wind_dir_10m:d':
          weatherData.windDirection = value;
          break;
        case 'precip_1h:mm':
          weatherData.precipitation = value;
          break;
        case 'msl_pressure:hPa':
          weatherData.pressure = value;
          break;
        case 'global_rad:W':
          weatherData.solarRadiation = value;
          break;
        case 'uv:idx':
          weatherData.uvIndex = value;
          break;
        case 'wind_gusts_10m_1h:ms':
          weatherData.windGusts = value;
          break;
        case 'visibility:m':
          weatherData.visibility = value;
          break;
      }
    }

    return {
      ...weatherData,
      location: { lat, lon },
      timestamp: new Date().toISOString(),
      source: 'Meteomatics',
      quality: 'premium'
    };
  }

  /**
   * Process OpenWeatherMap data
   */
  processOpenWeatherData(data, lat, lon) {
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      windGusts: data.wind?.gust || data.wind?.speed || 0,
      visibility: data.visibility || 10000,
      precipitation: 0, // Current weather doesn't include precipitation
      uvIndex: null, // Not available in current weather
      solarRadiation: null, // Not available
      cloudCover: data.clouds.all,
      weather: data.weather[0].main,
      description: data.weather[0].description,
      location: { lat, lon },
      timestamp: new Date().toISOString(),
      source: 'OpenWeatherMap',
      quality: 'standard'
    };
  }

  /**
   * Process NOAA data
   */
  processNOAAData(data, lat, lon) {
    const properties = data.properties;
    const current = properties.periods?.[0] || {};
    
    return {
      temperature: this.fahrenheitToCelsius(current.temperature || 20),
      humidity: 60, // NOAA doesn't provide humidity in simple format
      pressure: 1013, // Standard pressure if not available
      windSpeed: this.parseWindSpeed(current.windSpeed),
      windDirection: this.parseWindDirection(current.windDirection),
      windGusts: this.parseWindSpeed(current.windSpeed) * 1.3, // Estimate
      visibility: 10000, // Default good visibility
      precipitation: 0,
      weather: current.shortForecast || 'Unknown',
      description: current.detailedForecast || '',
      location: { lat, lon },
      timestamp: new Date().toISOString(),
      source: 'NOAA/NWS',
      quality: 'government'
    };
  }

  /**
   * Enhanced weather estimation model
   */
  getEnhancedWeatherEstimate(lat, lon) {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    const season = this.getSeason(lat, month);
    
    // Base weather patterns by season and location
    const baseWeather = this.getBaseWeatherPattern(lat, lon, season, hour);
    
    // Add realistic variations
    const temperature = baseWeather.temperature + (Math.random() * 10 - 5);
    const humidity = Math.max(20, Math.min(95, baseWeather.humidity + (Math.random() * 20 - 10)));
    const pressure = baseWeather.pressure + (Math.random() * 20 - 10);
    const windSpeed = Math.max(0, baseWeather.windSpeed + (Math.random() * 4 - 2));
    
    return {
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      pressure: Math.round(pressure),
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      windGusts: windSpeed * (1.2 + Math.random() * 0.6),
      visibility: Math.max(1000, 10000 - (Math.random() * 3000)),
      precipitation: Math.random() < 0.2 ? Math.random() * 5 : 0,
      uvIndex: this.calculateUVIndex(lat, month, hour),
      solarRadiation: this.calculateSolarRadiation(lat, month, hour),
      cloudCover: Math.round(Math.random() * 100),
      location: { lat, lon },
      timestamp: now.toISOString(),
      source: 'Enhanced Weather Model',
      quality: 'estimated',
      note: 'Based on climatological patterns and location analysis'
    };
  }

  /**
   * Enhance weather data for air quality analysis
   */
  enhanceWeatherForAirQuality(weatherData, lat, lon) {
    const enhanced = { ...weatherData };
    
    // Calculate air quality impact factors
    enhanced.airQualityImpact = {
      windDispersion: this.calculateWindDispersion(weatherData.windSpeed, weatherData.windGusts),
      atmosphericStability: this.calculateAtmosphericStability(weatherData.temperature, weatherData.windSpeed),
      precipitationWashout: this.calculatePrecipitationWashout(weatherData.precipitation || 0),
      photochemicalPotential: this.calculatePhotochemicalPotential(weatherData.temperature, weatherData.solarRadiation, weatherData.uvIndex),
      inversionPotential: this.calculateInversionPotential(weatherData.temperature, weatherData.pressure, weatherData.windSpeed),
      overallImpact: 'neutral' // Will be calculated below
    };
    
    // Calculate overall impact
    enhanced.airQualityImpact.overallImpact = this.calculateOverallAQImpact(enhanced.airQualityImpact);
    
    // Add air quality recommendations
    enhanced.recommendations = this.generateWeatherBasedRecommendations(enhanced.airQualityImpact, weatherData);
    
    return enhanced;
  }

  /**
   * Calculate wind dispersion factor
   */
  calculateWindDispersion(windSpeed, windGusts = null) {
    const effectiveWind = windGusts ? (windSpeed + windGusts) / 2 : windSpeed;
    
    if (effectiveWind < 2) return { level: 'poor', score: 0.2, description: 'Very poor dispersion - pollutants will accumulate' };
    if (effectiveWind < 5) return { level: 'fair', score: 0.5, description: 'Fair dispersion - moderate pollution accumulation' };
    if (effectiveWind < 10) return { level: 'good', score: 0.8, description: 'Good dispersion - pollutants will be diluted' };
    return { level: 'excellent', score: 1.0, description: 'Excellent dispersion - rapid pollution clearance' };
  }

  /**
   * Calculate atmospheric stability
   */
  calculateAtmosphericStability(temperature, windSpeed) {
    // Simplified stability calculation
    // In reality, this would use temperature gradient, pressure tendency, etc.
    
    const hour = new Date().getHours();
    let stability = 'neutral';
    let score = 0.5;
    
    // Nighttime stable conditions
    if ((hour >= 22 || hour <= 6) && windSpeed < 3) {
      stability = 'stable';
      score = 0.3;
    }
    // Daytime unstable conditions (good for mixing)
    else if (hour >= 10 && hour <= 16 && temperature > 20) {
      stability = 'unstable';
      score = 0.8;
    }
    // Windy conditions promote mixing
    else if (windSpeed > 5) {
      stability = 'unstable';
      score = 0.7;
    }
    
    return {
      level: stability,
      score: score,
      description: this.getStabilityDescription(stability)
    };
  }

  /**
   * Calculate precipitation washout effect
   */
  calculatePrecipitationWashout(precipitation) {
    if (precipitation > 2) {
      return { level: 'high', score: 0.9, description: 'Heavy rain will wash out pollutants effectively' };
    } else if (precipitation > 0.5) {
      return { level: 'moderate', score: 0.7, description: 'Light rain will help reduce particle pollution' };
    } else if (precipitation > 0.1) {
      return { level: 'low', score: 0.3, description: 'Light drizzle may have minimal impact' };
    }
    return { level: 'none', score: 0.0, description: 'No precipitation - no washout effect' };
  }

  /**
   * Calculate photochemical potential
   */
  calculatePhotochemicalPotential(temperature, solarRadiation = null, uvIndex = null) {
    let potential = 0;
    
    // Temperature contribution
    if (temperature > 25) potential += 0.4;
    else if (temperature > 20) potential += 0.2;
    
    // Solar radiation contribution
    if (solarRadiation) {
      if (solarRadiation > 600) potential += 0.3;
      else if (solarRadiation > 300) potential += 0.2;
    } else if (uvIndex) {
      if (uvIndex > 6) potential += 0.3;
      else if (uvIndex > 3) potential += 0.2;
    } else {
      // Estimate based on time of day
      const hour = new Date().getHours();
      if (hour >= 10 && hour <= 16) potential += 0.2;
    }
    
    let level, description;
    if (potential > 0.6) {
      level = 'high';
      description = 'High potential for ozone formation from precursor pollutants';
    } else if (potential > 0.3) {
      level = 'moderate';
      description = 'Moderate photochemical activity possible';
    } else {
      level = 'low';
      description = 'Low photochemical activity - minimal ozone formation';
    }
    
    return { level, score: potential, description };
  }

  /**
   * Calculate temperature inversion potential
   */
  calculateInversionPotential(temperature, pressure, windSpeed) {
    const hour = new Date().getHours();
    let potential = 0;
    
    // Early morning conditions favor inversions
    if (hour >= 5 && hour <= 9) potential += 0.3;
    
    // Calm winds favor inversions
    if (windSpeed < 2) potential += 0.4;
    else if (windSpeed < 5) potential += 0.2;
    
    // High pressure systems can promote inversions
    if (pressure > 1020) potential += 0.2;
    
    let level, description;
    if (potential > 0.7) {
      level = 'high';
      description = 'High risk of temperature inversion trapping pollutants';
    } else if (potential > 0.4) {
      level = 'moderate';
      description = 'Moderate inversion risk - reduced vertical mixing';
    } else {
      level = 'low';
      description = 'Low inversion risk - good vertical air movement';
    }
    
    return { level, score: potential, description };
  }

  /**
   * Calculate overall air quality impact
   */
  calculateOverallAQImpact(impacts) {
    // Weighted average of different factors
    const weights = {
      windDispersion: 0.3,
      atmosphericStability: 0.25,
      precipitationWashout: 0.2,
      photochemicalPotential: -0.15, // Negative because higher photochemical = worse AQ
      inversionPotential: -0.1 // Negative because inversions trap pollutants
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [factor, weight] of Object.entries(weights)) {
      if (impacts[factor] && typeof impacts[factor].score === 'number') {
        totalScore += impacts[factor].score * weight;
        totalWeight += Math.abs(weight);
      }
    }
    
    const overallScore = totalScore / totalWeight;
    
    if (overallScore > 0.7) return 'beneficial';
    if (overallScore > 0.4) return 'neutral';
    if (overallScore > 0.2) return 'slightly_adverse';
    return 'adverse';
  }

  /**
   * Generate weather-based recommendations
   */
  generateWeatherBasedRecommendations(impacts, weatherData) {
    const recommendations = [];
    
    if (impacts.windDispersion.level === 'poor') {
      recommendations.push({
        type: 'dispersion',
        priority: 'high',
        message: 'Calm winds - expect poor pollution dispersion',
        action: 'Limit outdoor activities, especially near traffic'
      });
    }
    
    if (impacts.inversionPotential.level === 'high') {
      recommendations.push({
        type: 'inversion',
        priority: 'high',
        message: 'Temperature inversion likely - pollutants may be trapped',
        action: 'Avoid outdoor exercise during morning hours'
      });
    }
    
    if (impacts.precipitationWashout.level === 'high') {
      recommendations.push({
        type: 'washout',
        priority: 'positive',
        message: 'Rain will help clean the air',
        action: 'Air quality should improve during and after rainfall'
      });
    }
    
    if (impacts.photochemicalPotential.level === 'high') {
      recommendations.push({
        type: 'photochemical',
        priority: 'medium',
        message: 'High sun and temperature may increase ozone levels',
        action: 'Sensitive individuals should limit afternoon outdoor activities'
      });
    }
    
    if (weatherData.windSpeed > 10) {
      recommendations.push({
        type: 'wind',
        priority: 'positive',
        message: 'Strong winds will help disperse pollutants',
        action: 'Good conditions for outdoor activities from air quality perspective'
      });
    }
    
    return recommendations;
  }

  /**
   * Helper methods
   */
  getBaseWeatherPattern(lat, lon, season, hour) {
    // Very simplified weather patterns
    let baseTemp = 15; // Base temperature
    let baseHumidity = 60;
    let basePressure = 1013;
    let baseWindSpeed = 3;
    
    // Seasonal adjustments
    switch (season) {
      case 'summer':
        baseTemp += 10;
        baseHumidity += 10;
        break;
      case 'winter':
        baseTemp -= 10;
        baseHumidity -= 10;
        basePressure += 5;
        break;
      case 'spring':
      case 'autumn':
        baseWindSpeed += 2;
        break;
    }
    
    // Latitude adjustments
    if (Math.abs(lat) > 45) {
      baseTemp -= 5; // Higher latitudes are cooler
    } else if (Math.abs(lat) < 23.5) {
      baseTemp += 8; // Tropical regions are warmer
      baseHumidity += 15;
    }
    
    // Diurnal cycle
    if (hour >= 6 && hour <= 18) {
      baseTemp += 5; // Daytime warmer
      baseHumidity -= 10; // Daytime less humid
    }
    
    return {
      temperature: baseTemp,
      humidity: baseHumidity,
      pressure: basePressure,
      windSpeed: baseWindSpeed
    };
  }

  getSeason(lat, month) {
    const isNorthern = lat > 0;
    
    if (isNorthern) {
      if (month >= 3 && month <= 5) return 'spring';
      if (month >= 6 && month <= 8) return 'summer';
      if (month >= 9 && month <= 11) return 'autumn';
      return 'winter';
    } else {
      if (month >= 3 && month <= 5) return 'autumn';
      if (month >= 6 && month <= 8) return 'winter';
      if (month >= 9 && month <= 11) return 'spring';
      return 'summer';
    }
  }

  calculateUVIndex(lat, month, hour) {
    if (hour < 8 || hour > 18) return 0;
    
    // Peak UV at solar noon
    const solarNoon = 12;
    const hourFromNoon = Math.abs(hour - solarNoon);
    let uvIndex = Math.max(0, 10 - hourFromNoon * 1.5);
    
    // Seasonal adjustment
    const seasonalFactor = Math.cos((month - 6) * Math.PI / 6);
    uvIndex *= (0.7 + 0.3 * seasonalFactor);
    
    // Latitude adjustment
    uvIndex *= (1 - Math.abs(lat) / 90 * 0.5);
    
    return Math.max(0, Math.round(uvIndex));
  }

  calculateSolarRadiation(lat, month, hour) {
    if (hour < 6 || hour > 18) return 0;
    
    const solarNoon = 12;
    const hourFromNoon = Math.abs(hour - solarNoon);
    let radiation = Math.max(0, 800 - hourFromNoon * 100);
    
    // Seasonal and latitude adjustments
    const seasonalFactor = Math.cos((month - 6) * Math.PI / 6);
    radiation *= (0.6 + 0.4 * seasonalFactor);
    radiation *= (1 - Math.abs(lat) / 90 * 0.3);
    
    return Math.max(0, Math.round(radiation));
  }

  getStabilityDescription(stability) {
    switch (stability) {
      case 'stable':
        return 'Stable atmosphere - poor vertical mixing, pollutants may accumulate';
      case 'unstable':
        return 'Unstable atmosphere - good vertical mixing, helps disperse pollutants';
      default:
        return 'Neutral atmospheric conditions - moderate mixing';
    }
  }

  // Utility methods
  fahrenheitToCelsius(f) {
    return (f - 32) * 5 / 9;
  }

  parseWindSpeed(windStr) {
    if (!windStr) return 0;
    const match = windStr.match(/(\d+)/);
    return match ? parseInt(match[1]) * 0.44704 : 0; // Convert mph to m/s
  }

  parseWindDirection(dirStr) {
    if (!dirStr) return 0;
    
    const directions = {
      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    
    return directions[dirStr.toUpperCase()] || 0;
  }

  isUSLocation(lat, lon) {
    // Very simplified US boundary check
    return lat >= 24 && lat <= 49 && lon >= -125 && lon <= -66;
  }

  cacheWeatherData(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  // Forecast methods (simplified implementations)
  async getMeteomaticsForecast(lat, lon, hours) {
    // Implementation would fetch forecast data from Meteomatics
    return null; // Placeholder
  }

  async getOpenWeatherForecast(lat, lon, hours) {
    // Implementation would fetch forecast from OpenWeatherMap
    return null; // Placeholder
  }

  async generateEnhancedWeatherForecast(lat, lon, hours) {
    const currentWeather = await this.getWeatherForAirQuality(lat, lon);
    const forecast = {
      location: { lat, lon },
      timestamp: new Date().toISOString(),
      forecastHours: hours,
      source: 'Enhanced Weather Forecast Model',
      hourlyData: []
    };
    
    for (let hour = 1; hour <= hours; hour++) {
      const forecastTime = new Date(Date.now() + hour * 60 * 60 * 1000);
      const hourlyWeather = this.generateHourlyWeatherForecast(currentWeather, hour, forecastTime);
      forecast.hourlyData.push(hourlyWeather);
    }
    
    return forecast;
  }

  generateHourlyWeatherForecast(currentWeather, hourOffset, forecastTime) {
    // Simple forecast model - in reality would use much more sophisticated methods
    const tempChange = Math.sin(hourOffset * 0.3) * 3;
    const humidityChange = Math.cos(hourOffset * 0.4) * 5;
    const pressureChange = Math.sin(hourOffset * 0.1) * 2;
    const windChange = Math.random() * 2 - 1;
    
    return {
      time: forecastTime.toISOString(),
      temperature: currentWeather.temperature + tempChange,
      humidity: Math.max(0, Math.min(100, currentWeather.humidity + humidityChange)),
      pressure: currentWeather.pressure + pressureChange,
      windSpeed: Math.max(0, currentWeather.windSpeed + windChange),
      windDirection: (currentWeather.windDirection + Math.random() * 60 - 30) % 360,
      confidence: Math.max(0.3, 0.9 - hourOffset * 0.02) // Decreasing confidence
    };
  }

  enhanceForecastForAirQuality(forecastData, lat, lon) {
    // Add air quality impact analysis to each forecast hour
    if (forecastData.hourlyData) {
      forecastData.hourlyData = forecastData.hourlyData.map(hourData => {
        return this.enhanceWeatherForAirQuality(hourData, lat, lon);
      });
    }
    
    return forecastData;
  }

  clearCache() {
    this.cache.clear();
    console.log('🧹 Weather service cache cleared');
  }

  getStatus() {
    return {
      service: 'Enhanced Weather Service',
      meteomaticsConfigured: !!(this.meteomaticsUsername && this.meteomaticsPassword),
      openWeatherConfigured: !!this.openWeatherApiKey,
      cacheSize: this.cache.size,
      lastUpdate: new Date().toISOString()
    };
  }
}

module.exports = new WeatherService();