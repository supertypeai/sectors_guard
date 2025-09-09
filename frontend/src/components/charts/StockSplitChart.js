import { Alert, Box, Chip, Grid, Typography } from '@mui/material';
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

const StockSplitChart = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No stock split data available for {symbol}. Please try a different symbol or date range.
      </Alert>
    );
  }

  // Process data for charts
  const processedData = data
    .map(item => ({
      ...item,
      date: moment(item.date).format('MMM DD, YYYY'),
      shortDate: moment(item.date).format('MMM DD'),
      fullDate: item.date,
      year: moment(item.date).year(),
      split_ratio: parseFloat(item.split_ratio) || 1,
      applied_on: item.applied_on ? moment(item.applied_on).format('MMM DD, YYYY') : 'N/A',
      updated_on: item.updated_on ? moment(item.updated_on).format('MMM DD, YYYY') : 'N/A'
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Aggregate by year
  const yearlyData = processedData.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) {
      acc[year] = {
        year,
        count: 0,
        totalRatio: 0,
        avgRatio: 0,
        splits: []
      };
    }
    acc[year].count += 1;
    acc[year].totalRatio += item.split_ratio;
    acc[year].splits.push(item);
    return acc;
  }, {});

  const yearlyChartData = Object.values(yearlyData)
    .map(yearData => ({
      ...yearData,
      avgRatio: yearData.totalRatio / yearData.count
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate cumulative split effect
  let cumulativeMultiplier = 1;
  const cumulativeData = processedData.map(item => {
    cumulativeMultiplier *= item.split_ratio;
    return {
      ...item,
      cumulativeMultiplier: cumulativeMultiplier
    };
  });

  // Get split ratio categories
  const ratioCategories = processedData.reduce((acc, item) => {
    const ratio = item.split_ratio;
    const category = ratio < 2 ? '< 2:1' :
                    ratio < 3 ? '2:1' :
                    ratio < 5 ? '3-4:1' :
                    ratio < 10 ? '5-9:1' : '10:1+';
    
    if (!acc[category]) {
      acc[category] = { category, count: 0, splits: [] };
    }
    acc[category].count += 1;
    acc[category].splits.push(item);
    return acc;
  }, {});

  const categoryData = Object.values(ratioCategories);

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
          <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
              {`${entry.name}: ${entry.value.toLocaleString()}${
                entry.dataKey.includes('ratio') || entry.dataKey.includes('Multiplier') ? ':1' : ''
              }`}
            </p>
          ))}
          {data.applied_on && (
            <p style={{ color: '#9ca3af', fontSize: '0.8em', margin: '5px 0 0 0' }}>
              Applied: {data.applied_on}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stock Split Data for {symbol}
      </Typography>

      <Grid container spacing={3}>
        {/* Split Events Timeline */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Stock Split Events Timeline
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
                dataKey="split_ratio"
                fill="#2563eb"
                name="Split Ratio"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Cumulative Split Effect */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Cumulative Split Effect
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData}>
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
              <Line
                type="monotone"
                dataKey="cumulativeMultiplier"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                name="Cumulative Multiplier"
              />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Yearly Summary */}
        {yearlyChartData.length > 1 && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Annual Split Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
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
                  dataKey="count"
                  fill="#f59e0b"
                  name="Number of Splits"
                />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        )}

        {/* Split Ratio Distribution */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Split Ratio Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
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
                dataKey="count"
                fill="#8b5cf6"
                name="Number of Events"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Split Ratios Scatter Plot */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Split Ratios Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="year" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                dataKey="split_ratio"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                dataKey="split_ratio"
                fill="#ef4444"
                name="Split Ratio"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Grid>

        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Split Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip 
              label={`Total Splits: ${processedData.length}`} 
              color="primary" 
            />
            <Chip 
              label={`Avg Split Ratio: ${(processedData.reduce((sum, item) => sum + item.split_ratio, 0) / processedData.length).toFixed(1)}:1`} 
              color="secondary" 
            />
            <Chip 
              label={`Max Split: ${Math.max(...processedData.map(item => item.split_ratio))}:1`} 
              color="success" 
            />
            <Chip 
              label={`Min Split: ${Math.min(...processedData.map(item => item.split_ratio))}:1`} 
              color="warning" 
            />
            <Chip 
              label={`Total Multiplier: ${cumulativeData[cumulativeData.length - 1]?.cumulativeMultiplier.toFixed(1)}:1`} 
              color="error" 
            />
          </Box>
        </Grid>

        {/* Detailed Data Table */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Split Events Detail
          </Typography>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            p: 2,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {processedData.map((item, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                py: 1,
                borderBottom: index < processedData.length - 1 ? 1 : 0,
                borderColor: 'divider'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Applied: {item.applied_on}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  {item.split_ratio}:1
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockSplitChart;
