import { Alert, Box, Grid, Typography } from '@mui/material';
import moment from 'moment';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const DividendChart = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No dividend data available for {symbol}. Please try a different symbol or date range.
      </Alert>
    );
  }

  // Process data for charts
  const processedData = data
    .filter(item => item.dividend && item.dividend > 0) // Only show actual dividends
    .map(item => ({
      ...item,
      date: moment(item.date).format('MMM DD, YYYY'),
      shortDate: moment(item.date).format('MMM DD'),
      fullDate: item.date,
      year: moment(item.date).year(),
      quarter: `Q${Math.ceil(moment(item.date).month() + 1 / 3)}`,
      dividend: parseFloat(item.dividend) || 0,
      yield: parseFloat(item.yield) || 0,
      yieldPercent: (parseFloat(item.yield) || 0) * 100
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Aggregate by year
  const yearlyData = processedData.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) {
      acc[year] = {
        year,
        totalDividend: 0,
        avgYield: 0,
        count: 0,
        dividends: []
      };
    }
    acc[year].totalDividend += item.dividend;
    acc[year].avgYield += item.yieldPercent;
    acc[year].count += 1;
    acc[year].dividends.push(item);
    return acc;
  }, {});

  const yearlyChartData = Object.values(yearlyData)
    .map(yearData => ({
      ...yearData,
      avgYield: yearData.avgYield / yearData.count
    }))
    .sort((a, b) => a.year - b.year);

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
          <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
              {`${entry.dataKey === 'dividend' ? 'Dividend' : 
                 entry.dataKey === 'yieldPercent' ? 'Yield (%)' : 
                 entry.dataKey === 'totalDividend' ? 'Total Dividend' :
                 entry.dataKey === 'avgYield' ? 'Avg Yield (%)' :
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
        Dividend Data for {symbol}
      </Typography>

      <Grid container spacing={3}>
        {/* Individual Dividends Timeline */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Dividend Payments Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="shortDate" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="dividend"
                fill="#2563eb"
                name="Dividend Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Yield Over Time */}
        {processedData.some(item => item.yieldPercent > 0) && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Dividend Yield Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="shortDate" 
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
                  dataKey="yieldPercent"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Yield (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        )}

        {/* Yearly Summary */}
        {yearlyChartData.length > 1 && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Annual Dividend Summary
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={yearlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
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
                  dataKey="totalDividend"
                  fill="#f59e0b"
                  name="Total Dividend"
                />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        )}

        {/* Dividend vs Yield Scatter */}
        {processedData.some(item => item.yieldPercent > 0) && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Dividend Amount vs Yield Relationship
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="dividend" 
                  name="Dividend Amount"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  dataKey="yieldPercent" 
                  name="Yield (%)"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter
                  dataKey="yieldPercent"
                  fill="#ef4444"
                  name="Dividend Events"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DividendChart;
