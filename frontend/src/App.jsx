import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProfileProvider } from './contexts/UserProfileContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Forecast from './pages/Forecast';
import About from './pages/About';
import SubscriptionPage from './pages/SubscriptionPage';

function App() {
  return (
    <UserProfileProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/about" element={<About />} />
            <Route path="/subscribe" element={<SubscriptionPage />} />
          </Routes>
        </Layout>
      </Router>
    </UserProfileProvider>
  );
}

export default App;
