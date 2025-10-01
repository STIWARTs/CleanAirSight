const Forecast = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Air Quality Forecast</h2>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">ML-powered forecasts coming soon!</p>
        <p className="text-sm text-gray-500 mt-2">6-72 hour predictions using XGBoost</p>
      </div>
    </div>
  );
};

export default Forecast;
