import { Link, useLocation } from 'react-router-dom';
import { Home, Map, TrendingUp, Info } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import RealTimeIndicator from './RealTimeIndicator';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/forecast', icon: TrendingUp, label: 'Forecast' },
    { path: '/about', icon: Info, label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">CleanAirSight</h1>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                NASA TEMPO
              </span>
              <div className="hidden lg:block">
                <RealTimeIndicator />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Link>
              );
            })}
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
