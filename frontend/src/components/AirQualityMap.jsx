import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';

const AirQualityMap = ({ locations, center, zoom }) => {
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

  return (
    <MapContainer
      center={center || [39.8283, -98.5795]}
      zoom={zoom || 4}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {locations.map((location, idx) => (
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
              <h3 className="font-bold text-lg mb-2">{location.name || location.city}</h3>
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
                {location.pm25 && (
                  <div className="flex justify-between">
                    <span>PM2.5:</span>
                    <span>{location.pm25} µg/m³</span>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

AirQualityMap.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    aqi: PropTypes.number.isRequired,
    name: PropTypes.string,
    city: PropTypes.string,
    pm25: PropTypes.number,
  })).isRequired,
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
};

export default AirQualityMap;
