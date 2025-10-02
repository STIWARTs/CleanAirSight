import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const ForecastChart = ({ data, height = 400 }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.time}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}{entry.name.includes('Confidence') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis stroke="#666" />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="aqi" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ r: 4, fill: '#3b82f6' }}
          activeDot={{ r: 6 }}
          name="AQI"
        />
        {data[0]?.pm25 !== undefined && (
          <Line 
            type="monotone" 
            dataKey="pm25" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="PM2.5 (µg/m³)"
          />
        )}
        {data[0]?.confidence !== undefined && (
          <Line 
            type="monotone" 
            dataKey="confidence" 
            stroke="#f59e0b" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            name="Confidence"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

ForecastChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    time: PropTypes.string.isRequired,
    aqi: PropTypes.number.isRequired,
    pm25: PropTypes.number,
    confidence: PropTypes.number,
  })).isRequired,
  height: PropTypes.number,
};

export default ForecastChart;
