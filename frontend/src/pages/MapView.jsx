import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { fetchMapData } from '../utils/api';
import 'leaflet/dist/leaflet.css';
import { MapPin, Wind, Clock, CheckCircle, TrendingUp, Search, Filter, Layers, Maximize2, Globe } from 'lucide-react';

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
  const [fullscreen, setFullscreen] = useState(false);

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
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
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
      {/* Header with Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Air Quality Map</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {filteredLocations.length} locations
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Updated {getTimeAgo()}
              </div>
            </div>
          </div>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Basemap Switcher */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'light', icon: '🗺️', label: 'Light' },
              { key: 'satellite', icon: '🛰️', label: 'Satellite' },
              { key: 'terrain', icon: '🏔️', label: 'Terrain' },
              { key: 'dark', icon: '🌙', label: 'Dark' }
            ].map((map) => (
              <button
                key={map.key}
                onClick={() => setBasemap(map.key)}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-5 h-5" />
          </button>
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                weight: 2,
                fillColor: getAQIColor(location.aqi),
                fillOpacity: 0.6,
              }}
            >
              <Popup>
                <div className="min-w-[280px]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -m-2 mb-3 p-3 rounded-t-lg">
                    <h3 className="font-bold text-lg text-gray-900">{location.name}</h3>
                  </div>

                  {/* AQI Display */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">AQI</div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="text-3xl font-extrabold"
                          style={{ color: getAQIColor(location.aqi) }}
                        >
                          {location.aqi}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {getAQILevel(location.aqi)}
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white`}
                         style={{ backgroundColor: getAQIColor(location.aqi) }}>
                      {getAQILevel(location.aqi).split(' ')[0]}
                    </div>
                  </div>

                  {/* Main Pollutant */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3">
                    <div className="text-xs text-gray-600 mb-1">Main Pollutant</div>
                    <div className="font-semibold text-gray-900">PM2.5: {location.pm25} µg/m³</div>
                  </div>

                  {/* Health Tip */}
                  <div className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded mb-3">
                    <div className="text-xs font-semibold text-blue-900 mb-1">Health Tip</div>
                    <div className="text-sm text-blue-800">{getHealthTip(location.aqi)}</div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated {getTimeAgo()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{location.source}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Confidence: {location.confidence}%
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3 pt-3 border-t">
                    <button className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded hover:bg-blue-700 transition">
                      View Forecast
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 text-xs font-semibold py-2 px-3 rounded hover:bg-gray-50 transition">
                      Set Alert
                    </button>
                  </div>
                </div>
              </Popup>
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
