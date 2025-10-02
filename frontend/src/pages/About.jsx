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
      <div className="text-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 shadow-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
          <Satellite className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-6">About CleanAirSight</h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
          A cutting-edge air quality monitoring and forecasting platform that leverages NASA's TEMPO satellite data,
          ground sensors, and machine learning to provide accurate, real-time insights.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-white rounded-xl p-10 shadow-lg border-l-8 border-blue-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          CleanAirSight empowers communities, researchers, and policymakers with actionable air quality data.
          By combining NASA's revolutionary TEMPO satellite with ground-based measurements and advanced ML forecasting,
          we provide unprecedented visibility into air pollution patterns and trends.
        </p>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 shadow-md">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-10 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Ingestion</h3>
              <p className="text-gray-700 leading-relaxed">
                Automated collectors fetch data from NASA TEMPO (hourly), ground sensors (every 15 min),
                and weather APIs. Raw data is stored in both CSV and database formats.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Harmonization & Validation</h3>
              <p className="text-gray-700 leading-relaxed">
                Data from different sources is normalized to standard units (µg/m³), merged with weather context,
                and cross-validated. Discrepancies greater than 30% trigger low-confidence flags.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ML Forecasting</h3>
              <p className="text-gray-700 leading-relaxed">
                XGBoost models trained on historical patterns, weather features, and temporal cycles generate
                6-72 hour forecasts. Models retrain automatically every 24 hours.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Visualization & Alerts</h3>
              <p className="text-gray-700 leading-relaxed">
                Interactive maps, real-time dashboards, and forecasting charts make data accessible.
                AQI over 150 triggers health warnings with actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((stack, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-blue-600 mb-4 pb-2 border-b-2 border-blue-200">{stack.category}</h3>
              <ul className="space-y-3">
                {stack.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-gray-700 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* NASA TEMPO Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-10 shadow-lg border-2 border-indigo-200">
        <div className="flex items-center gap-3 mb-6">
          <Satellite className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-900">About NASA TEMPO</h2>
        </div>
        <div className="text-gray-800 space-y-4 text-lg leading-relaxed">
          <p>
            <strong className="text-indigo-700 font-bold">TEMPO</strong> (Tropospheric Emissions: Monitoring of Pollution) is NASA's
            first Earth Venture Instrument mission focused on air quality over North America.
          </p>
          <p>
            Launched in 2023, TEMPO provides <strong className="text-indigo-700">hourly daytime observations</strong> of atmospheric pollutants including
            nitrogen dioxide (NO2), ozone (O3), and formaldehyde (HCHO) at unprecedented spatial resolution (~2.1 km).
          </p>
          <p>
            This revolutionary capability enables <strong className="text-indigo-700">near-real-time air quality monitoring</strong>, helping scientists understand
            pollution sources, transport patterns, and health impacts with unmatched detail.
          </p>
        </div>
      </div>

      {/* Team & Credits */}
      <div className="text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6">
          <Globe className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-6">Built for NASA Space Apps Challenge 2025</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
          CleanAirSight demonstrates the power of combining satellite remote sensing with ground-based measurements
          and machine learning to address real-world environmental challenges.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-full">Open Source</span>
          <span className="px-4 py-2 bg-purple-600 text-white rounded-full">Community Driven</span>
          <span className="px-4 py-2 bg-green-600 text-white rounded-full">Science-Based</span>
        </div>
      </div>
    </div>
  );
};

export default About;
