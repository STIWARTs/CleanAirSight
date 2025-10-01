import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { fetchMapData } from '../utils/api';
import 'leaflet/dist/leaflet.css';
import { MapPin, Wind } from 'lucide-react';

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

  // Demo locations with AQI data
  const demoLocations = [
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, aqi: 85, pm25: 18.5 },
    { name: 'New York', lat: 40.7128, lon: -74.0060, aqi: 72, pm25: 22.3 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298, aqi: 59, pm25: 16.8 },
    { name: 'Houston', lat: 29.7604, lon: -95.3698, aqi: 65, pm25: 14.2 },
    { name: 'Phoenix', lat: 33.4484, lon: -112.0740, aqi: 47, pm25: 11.3 },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, aqi: 52, pm25: 13.1 },
    { name: 'Seattle', lat: 47.6062, lon: -122.3321, aqi: 38, pm25: 9.2 },
    { name: 'Denver', lat: 39.7392, lon: -104.9903, aqi: 68, pm25: 15.7 },
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

  if (loading) {
    return <div className="text-center py-8">Loading map...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Air Quality Map</h2>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          {mapData.length} locations
        </div>
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
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mapData.map((location, idx) => (
            <Circle
              key={idx}
              center={[location.lat, location.lon]}
              radius={50000}
              pathOptions={{
                color: getAQIColor(location.aqi),
                fillColor: getAQIColor(location.aqi),
                fillOpacity: 0.4,
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>AQI:</span>
                      <span className="font-semibold" style={{ color: getAQIColor(location.aqi) }}>
                        {location.aqi}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="font-medium">{getAQILevel(location.aqi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PM2.5:</span>
                      <span>{location.pm25} µg/m³</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-800 mb-3">AQI Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { range: '0-50', label: 'Good', color: '#00e400' },
            { range: '51-100', label: 'Moderate', color: '#ffff00' },
            { range: '101-150', label: 'Unhealthy for Sensitive', color: '#ff7e00' },
            { range: '151-200', label: 'Unhealthy', color: '#ff0000' },
            { range: '201-300', label: 'Very Unhealthy', color: '#8f3f97' },
            { range: '301+', label: 'Hazardous', color: '#7e0023' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-xs">
                <div className="font-medium">{item.range}</div>
                <div className="text-gray-600">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
