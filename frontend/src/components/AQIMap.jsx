import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AQIMap = ({ hotspots = [], center = [34.0522, -118.2437], zoom = 10 }) => {
  
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#10B981'; // Green
    if (aqi <= 100) return '#F59E0B'; // Yellow
    if (aqi <= 150) return '#F97316'; // Orange
    if (aqi <= 200) return '#EF4444'; // Red
    if (aqi <= 300) return '#8B5CF6'; // Purple
    return '#7F1D1D'; // Dark Red
  };

  const getAQIRadius = (aqi) => {
    // Larger circles for higher AQI
    return Math.max(10, Math.min(50, aqi / 3));
  };

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        {/* OpenStreetMap tiles - completely free, no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Pollution hotspots as circle markers */}
        {hotspots.map((hotspot, index) => (
          <CircleMarker
            key={index}
            center={[hotspot.lat, hotspot.lon]}
            radius={getAQIRadius(hotspot.aqi)}
            pathOptions={{
              color: getAQIColor(hotspot.aqi),
              fillColor: getAQIColor(hotspot.aqi),
              fillOpacity: 0.6,
              weight: 2
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-gray-800">{hotspot.name}</h3>
                <p className="text-gray-600">AQI: <span className="font-semibold">{hotspot.aqi}</span></p>
                <p className="text-gray-600">Trend: {hotspot.trend}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {hotspot.lat.toFixed(4)}, {hotspot.lon.toFixed(4)}
                </p>
                {hotspot.pollutant && (
                  <p className="text-xs text-gray-500">
                    Primary: {hotspot.pollutant}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Regular markers for reference points */}
        {hotspots.slice(0, 3).map((hotspot, index) => (
          <Marker key={`marker-${index}`} position={[hotspot.lat, hotspot.lon]}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold">{hotspot.name}</h3>
                <p>AQI: {hotspot.aqi}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md text-xs">
        <h4 className="font-semibold mb-2">AQI Levels</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Unhealthy for Sensitive (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Unhealthy (151-200)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Very Unhealthy (201-300)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AQIMap;