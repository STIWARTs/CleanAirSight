import { Satellite, Database, Brain, Globe, Shield, Zap } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Satellite,
      title: 'NASA TEMPO Data',
      description: 'Hourly satellite measurements of NO2, O3, and HCHO across North America with high spatial resolution.',
    },
    {
      icon: Database,
      title: 'Multi-Source Integration',
      description: 'Combines satellite data with ground sensors (OpenAQ, EPA AirNow) and weather data for comprehensive coverage.',
    },
    {
      icon: Brain,
      title: 'ML Forecasting',
      description: 'XGBoost and Random Forest models predict air quality up to 72 hours ahead with continuous learning.',
    },
    {
      icon: Shield,
      title: 'Data Validation',
      description: 'Cross-validation between satellite and ground measurements ensures high data quality and confidence scoring.',
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Automated data collection every 15-60 minutes keeps information current and actionable.',
    },
    {
      icon: Globe,
      title: 'Cloud-Ready',
      description: 'Designed for deployment on Google Cloud, Azure, or AWS with scalable architecture.',
    },
  ];

  const techStack = [
    { category: 'Backend', items: ['Python', 'FastAPI', 'MongoDB/PostgreSQL'] },
    { category: 'ML/Data', items: ['XGBoost', 'scikit-learn', 'Pandas', 'NumPy'] },
    { category: 'Frontend', items: ['React', 'TailwindCSS', 'Leaflet.js', 'Recharts'] },
    { category: 'APIs', items: ['NASA TEMPO', 'OpenAQ', 'EPA AirNow', 'OpenWeatherMap'] },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">About CleanAirSight</h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          A cutting-edge air quality monitoring and forecasting platform that leverages NASA's TEMPO satellite data,
          ground sensors, and machine learning to provide accurate, real-time insights.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-8 border border-blue-800">
        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          CleanAirSight empowers communities, researchers, and policymakers with actionable air quality data.
          By combining NASA's revolutionary TEMPO satellite with ground-based measurements and advanced ML forecasting,
          we provide unprecedented visibility into air pollution patterns and trends.
        </p>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Data Ingestion</h3>
              <p className="text-slate-400">
                Automated collectors fetch data from NASA TEMPO (hourly), ground sensors (every 15 min),
                and weather APIs. Raw data is stored in both CSV and database formats.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Harmonization & Validation</h3>
              <p className="text-slate-400">
                Data from different sources is normalized to standard units (µg/m³), merged with weather context,
                and cross-validated. Discrepancies >30% trigger low-confidence flags.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">ML Forecasting</h3>
              <p className="text-slate-400">
                XGBoost models trained on historical patterns, weather features, and temporal cycles generate
                6-72 hour forecasts. Models retrain automatically every 24 hours.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              4
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Visualization & Alerts</h3>
              <p className="text-slate-400">
                Interactive maps, real-time dashboards, and forecasting charts make data accessible.
                AQI >150 triggers health warnings with actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((stack, idx) => (
            <div
              key={idx}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-4">{stack.category}</h3>
              <ul className="space-y-2">
                {stack.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-slate-300 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* NASA TEMPO Info */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8 border border-purple-800">
        <h2 className="text-2xl font-bold text-white mb-4">About NASA TEMPO</h2>
        <div className="text-slate-300 space-y-3">
          <p>
            <strong className="text-white">TEMPO</strong> (Tropospheric Emissions: Monitoring of Pollution) is NASA's
            first Earth Venture Instrument mission focused on air quality over North America.
          </p>
          <p>
            Launched in 2023, TEMPO provides hourly daytime observations of atmospheric pollutants including
            nitrogen dioxide (NO2), ozone (O3), and formaldehyde (HCHO) at unprecedented spatial resolution (~2.1 km).
          </p>
          <p>
            This revolutionary capability enables near-real-time air quality monitoring, helping scientists understand
            pollution sources, transport patterns, and health impacts with unmatched detail.
          </p>
        </div>
      </div>

      {/* Team & Credits */}
      <div className="text-center bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">Built for NASA Space Apps Challenge 2025</h2>
        <p className="text-slate-400 mb-4">
          CleanAirSight demonstrates the power of combining satellite remote sensing with ground-based measurements
          and machine learning to address real-world environmental challenges.
        </p>
        <div className="flex justify-center gap-4 text-sm text-slate-500">
          <span>Open Source</span>
          <span>•</span>
          <span>Community Driven</span>
          <span>•</span>
          <span>Science-Based</span>
        </div>
      </div>
    </div>
  );
};

export default About;
