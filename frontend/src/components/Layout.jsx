import { Link, useLocation } from 'react-router-dom';
import { Home, Map, TrendingUp, Info, Satellite, Zap, Globe, Activity } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import RealTimeIndicator from './RealTimeIndicator';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/forecast', icon: TrendingUp, label: 'Forecast' },
    { path: '/subscribe', icon: Zap, label: 'Subscribe' },
    { path: '/about', icon: Info, label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Logo with Icon */}
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <Satellite className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">CleanAirSight</h1>
                  <div className="text-xs text-blue-200">Real-time Air Quality Monitoring</div>
                </div>
              </div>
              
              {/* Enhanced Badges */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="px-3 py-1 text-xs bg-white/90 text-blue-800 rounded-full backdrop-blur-sm border border-white/50 font-medium">
                  🛰️ NASA TEMPO
                </span>
                <span className="px-3 py-1 text-xs bg-green-500/90 text-white rounded-full backdrop-blur-sm border border-green-400/50 font-medium">
                  <div className="w-2 h-2 bg-white rounded-full inline-block mr-1 animate-pulse"></div>
                  LIVE
                </span>
                <span className="px-3 py-1 text-xs bg-orange-500/90 text-white rounded-full backdrop-blur-sm border border-orange-400/50 font-medium">
                  📊 Real-time Data
                </span>
              </div>
              
              <div className="hidden lg:block">
                <RealTimeIndicator />
              </div>
            </div>
            
            {/* Enhanced Right Side */}
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-4 text-white">
                <div className="text-right">
                  <div className="text-xs text-white font-medium">Last Update</div>
                  <div className="text-sm font-bold text-yellow-200">{new Date().toLocaleTimeString()}</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-right">
                  <div className="text-xs text-white font-medium">Monitoring</div>
                  <div className="text-sm font-bold text-green-200">5 Cities</div>
                </div>
              </div>
              <NotificationCenter />
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Main Navigation */}
            <div className="flex space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`group relative flex items-center px-4 py-4 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 transition-all duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                    }`} />
                    {label}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 rounded-t-lg transition-all duration-200 ${
                      isActive ? 'bg-blue-500/5' : 'bg-transparent group-hover:bg-blue-500/5'
                    }`}></div>
                  </Link>
                );
              })}
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              {/* Status Indicators */}
              <div className="hidden md:flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1 text-green-600">
                  <Activity className="w-3 h-3" />
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <Globe className="w-3 h-3" />
                  <span>5 Sources</span>
                </div>
                <div className="flex items-center space-x-1 text-purple-600">
                  <Zap className="w-3 h-3" />
                  <span>ML Active</span>
                </div>
              </div>
              
              {/* Quick Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <div className="w-1 h-1 bg-current rounded-full mb-1"></div>
                <div className="w-1 h-1 bg-current rounded-full mb-1"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            CleanAirSight - NASA Space Apps Challenge 2025 | Real-time Air Quality Monitoring
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
