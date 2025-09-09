import { Alert, Box, Typography } from '@mui/material';
import moment from 'moment';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const DailyDataChart = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No daily data available for {symbol}. Please try a different symbol or date range.
      </Alert>
    );
  }

  // Process data for charts
  const processedData = data
    .map(item => ({
      ...item,
      date: moment(item.date).format('MMM DD'),
      fullDate: item.date,
      close: parseFloat(item.close) || 0,
      volume: parseInt(item.volume) || 0,
      market_cap: parseFloat(item.market_cap) || 0,
      volume_millions: Math.round((parseInt(item.volume) || 0) / 1000000),
      market_cap_billions: Math.round((parseFloat(item.market_cap) || 0) / 1000000000000)
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#1a1a2e',
          padding: '10px',
          border: '1px solid #2563eb',
          borderRadius: '5px'
        }}>
          <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{`Date: ${data.fullDate}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
              {`${entry.dataKey === 'close' ? 'Close Price' : 
                 entry.dataKey === 'volume_millions' ? 'Volume (M)' : 
                 entry.dataKey === 'market_cap_billions' ? 'Market Cap (B)' : 
                 entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Daily Stock Data for {symbol}
      </Typography>

      {/* Price Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Stock Price Movement
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              name="Close Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Volume Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Trading Volume (Millions)
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="volume_millions"
              fill="#10b981"
              name="Volume (M)"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Market Cap Chart */}
      {processedData.some(item => item.market_cap_billions > 0) && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Market Capitalization (Billions)
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="market_cap_billions"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Market Cap (B)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default DailyDataChart;
