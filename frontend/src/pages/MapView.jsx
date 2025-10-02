import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { fetchMapData } from '../utils/api';
import 'leaflet/dist/leaflet.css';
import { MapPin, Wind, Clock, CheckCircle, TrendingUp, Search, Filter, Layers, Maximize2, Globe, AlertTriangle, Info, Zap, Satellite, Navigation, RefreshCw, Download, Share2, Settings } from 'lucide-react';

// Fix Leaflet default marker icon issue with Webpack
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView = () => {
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  const [selectedAQIRange, setSelectedAQIRange] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [basemap, setBasemap] = useState('light');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState('standard');

  // Demo locations with AQI data
  const demoLocations = [
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, aqi: 85, pm25: 18.5, source: 'OpenAQ', confidence: 94 },
    { name: 'New York', lat: 40.7128, lon: -74.0060, aqi: 72, pm25: 22.3, source: 'EPA AirNow', confidence: 98 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298, aqi: 59, pm25: 16.8, source: 'OpenAQ', confidence: 91 },
    { name: 'Houston', lat: 29.7604, lon: -95.3698, aqi: 65, pm25: 14.2, source: 'EPA AirNow', confidence: 96 },
    { name: 'Phoenix', lat: 33.4484, lon: -112.0740, aqi: 47, pm25: 11.3, source: 'OpenAQ', confidence: 89 },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, aqi: 52, pm25: 13.1, source: 'EPA AirNow', confidence: 97 },
    { name: 'Seattle', lat: 47.6062, lon: -122.3321, aqi: 38, pm25: 9.2, source: 'OpenAQ', confidence: 92 },
    { name: 'Denver', lat: 39.7392, lon: -104.9903, aqi: 68, pm25: 15.7, source: 'NASA TEMPO', confidence: 87 },
  ];

  useEffect(() => {
    setMapData(demoLocations);
    setLoading(false);
  }, []);


  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#10b981'; // Green
    if (aqi <= 100) return '#f59e0b'; // Yellow
    if (aqi <= 150) return '#f97316'; // Orange
    if (aqi <= 200) return '#ef4444'; // Red
    if (aqi <= 300) return '#8b5cf6'; // Purple
    return '#7c2d12'; // Maroon
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getHealthAdvice = (aqi) => {
    if (aqi <= 50) return 'Perfect for outdoor activities!';
    if (aqi <= 100) return 'Acceptable for most people.';
    if (aqi <= 150) return 'Sensitive groups should limit outdoor time.';
    if (aqi <= 200) return 'Everyone should reduce outdoor activities.';
    if (aqi <= 300) return 'Avoid outdoor activities.';
    return 'Health emergency - stay indoors.';
  };

  const getWorstLocation = () => {
    return filteredLocations.reduce((worst, current) => 
      current.aqi > worst.aqi ? current : worst, filteredLocations[0] || {}
    );
  };

  const getBestLocation = () => {
    return filteredLocations.reduce((best, current) => 
      current.aqi < best.aqi ? current : best, filteredLocations[0] || {}
    );
  };

  const getHealthTip = (aqi) => {
    if (aqi <= 50) return 'Perfect for outdoor activities!';
    if (aqi <= 100) return 'Acceptable air quality for most people.';
    if (aqi <= 150) return 'Sensitive groups should reduce outdoor activity.';
    if (aqi <= 200) return 'Everyone should limit outdoor activities.';
    if (aqi <= 300) return 'Avoid outdoor activities.';
    return 'Health emergency: Stay indoors.';
  };

  const getMarkerRadius = (aqi) => {
    // Scale radius based on AQI: worse air = larger marker
    return 30000 + (aqi * 300);
  };

  const getTimeAgo = () => {
    const seconds = Math.floor((new Date() - lastUpdated) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    return 'Just now';
  };

  const filterByAQIRange = (location) => {
    if (!selectedAQIRange) return true;
    const { min, max } = selectedAQIRange;
    return location.aqi >= min && location.aqi <= max;
  };

  const getBasemapUrl = () => {
    switch (basemap) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      default:
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }
  };

  const getBasemapAttribution = () => {
    switch (basemap) {
      case 'satellite':
        return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'terrain':
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      case 'dark':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }
  };

  const filterBySearch = (location) => {
    if (!searchQuery) return true;
    return location.name.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const filteredLocations = mapData
    .filter(filterByAQIRange)
    .filter(filterBySearch);

  if (loading) {
    return <div className="text-center py-8">Loading map...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Header with Status */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">🗺️ Real-time Air Quality Map</h2>
            <div className="flex items-center space-x-6 text-sm text-blue-200">
              <div className="flex items-center">
                <Satellite className="w-4 h-4 mr-1" />
                <span>NASA TEMPO Live</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{filteredLocations.length} monitoring stations</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Updated {getTimeAgo()}</span>
              </div>
              {autoRefresh && (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  <span>Auto-refresh ON</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition ${
                autoRefresh ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Toggle auto-refresh"
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition" title="Export data">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition" title="Share map">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Overall Status Banner */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{getWorstLocation()?.name || 'N/A'}</div>
              <div className="text-sm text-blue-200">Worst Air Quality</div>
              <div className="text-lg font-semibold" style={{ color: '#ff6b6b' }}>AQI {getWorstLocation()?.aqi || 0}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getBestLocation()?.name || 'N/A'}</div>
              <div className="text-sm text-blue-200">Best Air Quality</div>
              <div className="text-lg font-semibold" style={{ color: '#51cf66' }}>AQI {getBestLocation()?.aqi || 0}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(filteredLocations.reduce((sum, loc) => sum + loc.aqi, 0) / filteredLocations.length) || 0}</div>
              <div className="text-sm text-blue-200">Average AQI</div>
              <div className="text-lg font-semibold text-yellow-300">Across All Stations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Enhanced Search and Controls */}
        <div className="flex flex-col lg:flex-row items-center space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Search Bar with Suggestions */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities, regions, or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-gray-900"
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                {filteredLocations.slice(0, 3).map((location, idx) => (
                  <div
                    key={idx}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedLocation(location);
                      setSearchQuery('');
                    }}
                  >
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-gray-500">AQI {location.aqi} • {getAQILevel(location.aqi)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Style Switcher */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'light', icon: '🗺️', label: 'Standard' },
              { key: 'satellite', icon: '🛰️', label: 'Satellite' },
              { key: 'terrain', icon: '🏔️', label: 'Terrain' },
              { key: 'dark', icon: '🌙', label: 'Dark' }
            ].map((map) => (
              <button
                key={map.key}
                onClick={() => setBasemap(map.key)}
                className={`px-3 py-2 text-xs font-medium rounded transition ${
                  basemap === map.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={map.label}
              >
                {map.icon}
              </button>
            ))}
          </div>

          {/* View Options */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg transition ${
                showHeatmap ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Layers className="w-4 h-4 mr-1" />
              Heatmap
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg transition ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </button>
            
            <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg transition">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Data Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                <select className="w-full p-2 border border-gray-300 rounded text-sm">
                  <option value="">All Sources</option>
                  <option value="openaq">OpenAQ</option>
                  <option value="epa">EPA AirNow</option>
                  <option value="tempo">NASA TEMPO</option>
                </select>
              </div>
              
              {/* AQI Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AQI Range</label>
                <div className="flex space-x-2">
                  <input type="number" placeholder="Min" className="w-full p-2 border border-gray-300 rounded text-sm" />
                  <input type="number" placeholder="Max" className="w-full p-2 border border-gray-300 rounded text-sm" />
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Confidence</label>
                <input type="range" min="0" max="100" className="w-full" />
                <div className="text-xs text-gray-500 mt-1">85%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative" style={{ height: '600px' }}>
        
        
        
        {/* Location Details Panel */}
        {selectedLocation && (
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedLocation.name}</h3>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* AQI Status */}
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getAQIColor(selectedLocation.aqi) }}
                ></div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: getAQIColor(selectedLocation.aqi) }}>
                    AQI {selectedLocation.aqi}
                  </div>
                  <div className="text-sm text-gray-600">{getAQILevel(selectedLocation.aqi)}</div>
                </div>
              </div>
              
              {/* Health Advice */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900 mb-1">Health Advice</div>
                <div className="text-sm text-blue-800">{getHealthAdvice(selectedLocation.aqi)}</div>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-gray-600">PM2.5</div>
                  <div className="font-semibold">{selectedLocation.pm25} µg/m³</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-gray-600">Source</div>
                  <div className="font-semibold">{selectedLocation.source}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-gray-600">Confidence</div>
                  <div className="font-semibold">{selectedLocation.confidence}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-gray-600">Coordinates</div>
                  <div className="font-semibold text-xs">{selectedLocation.lat.toFixed(2)}, {selectedLocation.lon.toFixed(2)}</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  View Forecast
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                  Share Location
                </button>
              </div>
            </div>
          </div>
        )}
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution={getBasemapAttribution()}
            url={getBasemapUrl()}
            key={basemap}
          />
          
          {filteredLocations.map((location, idx) => (
            <Circle
              key={idx}
              center={[location.lat, location.lon]}
              radius={getMarkerRadius(location.aqi)}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: getAQIColor(location.aqi),
                fillOpacity: 0.7,
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedLocation(location);
                }
              }}
            >
              {/* Only show popup if no location is selected (to avoid double display) */}
              {!selectedLocation && (
                <Popup>
                  <div className="text-center p-1">
                    <div className="font-bold">{location.name}</div>
                    <div className="text-lg font-bold" style={{ color: getAQIColor(location.aqi) }}>
                      AQI {location.aqi}
                    </div>
                    <div className="text-xs text-gray-600">{getAQILevel(location.aqi)}</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocation(location);
                      }}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              )}
            </Circle>
          ))}
        </MapContainer>
      </div>

      {/* Interactive Legend */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">AQI Scale</h3>
          {selectedAQIRange && (
            <button
              onClick={() => setSelectedAQIRange(null)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { range: '0-50', label: 'Good', color: '#00e400', min: 0, max: 50 },
            { range: '51-100', label: 'Moderate', color: '#ffff00', min: 51, max: 100 },
            { range: '101-150', label: 'Unhealthy for Sensitive', color: '#ff7e00', min: 101, max: 150 },
            { range: '151-200', label: 'Unhealthy', color: '#ff0000', min: 151, max: 200 },
            { range: '201-300', label: 'Very Unhealthy', color: '#8f3f97', min: 201, max: 300 },
            { range: '301+', label: 'Hazardous', color: '#7e0023', min: 301, max: 999 },
          ].map((item, idx) => {
            const isSelected = selectedAQIRange && 
              selectedAQIRange.min === item.min && 
              selectedAQIRange.max === item.max;
            
            return (
              <div 
                key={idx} 
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-50 border-2 border-blue-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedAQIRange(
                  isSelected ? null : { min: item.min, max: item.max }
                )}
              >
                <div
                  className={`w-4 h-4 rounded ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-xs">
                  <div className="font-medium">{item.range}</div>
                  <div className="text-gray-600">{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          💡 Click any color to filter markers by AQI range
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredLocations.filter(l => l.aqi <= 50).length}
          </div>
          <div className="text-sm text-gray-600">Good Air Quality</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredLocations.filter(l => l.aqi > 50 && l.aqi <= 100).length}
          </div>
          <div className="text-sm text-gray-600">Moderate</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {filteredLocations.filter(l => l.aqi > 100 && l.aqi <= 150).length}
          </div>
          <div className="text-sm text-gray-600">Unhealthy (SG)</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {filteredLocations.filter(l => l.aqi > 150).length}
          </div>
          <div className="text-sm text-gray-600">Unhealthy+</div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
