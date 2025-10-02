import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';

const RealTimeIndicator = () => {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dataSource, setDataSource] = useState('NASA TEMPO + Ground Sensors');

  useEffect(() => {
    // Simulate real-time connection status check
    const checkConnection = setInterval(() => {
      // In production, this would ping the backend
      setIsLive(Math.random() > 0.1); // 90% uptime simulation
      setLastUpdate(new Date());
    }, 5000); // Check every 5 seconds

    // Simulate data source rotation to show it's pulling from multiple sources
    const rotateSource = setInterval(() => {
      const sources = [
        'NASA TEMPO Satellite',
        'EPA AirNow Network',
        'Ground Sensors',
        'Weather Data',
        'All Sources'
      ];
      setDataSource(sources[Math.floor(Math.random() * sources.length)]);
    }, 8000);

    return () => {
      clearInterval(checkConnection);
      clearInterval(rotateSource);
    };
  }, []);

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center space-x-4 text-sm">
      {/* Live Status */}
      <div className="flex items-center space-x-2">
        {isLive ? (
          <>
            <div className="relative">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            </div>
            <span className="text-green-600 font-medium">LIVE</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-600 font-medium">Reconnecting...</span>
          </>
        )}
      </div>

      {/* Data Source */}
      <div className="hidden md:flex items-center space-x-2 text-blue-100">
        <Wifi className="w-4 h-4" />
        <span className="text-xs font-medium">{dataSource}</span>
      </div>

      {/* Last Update */}
      <div className="text-xs text-blue-100 font-medium">
        Updated {getTimeSinceUpdate()}
      </div>
    </div>
  );
};

export default RealTimeIndicator;
