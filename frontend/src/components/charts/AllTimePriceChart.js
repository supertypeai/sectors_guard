import { Alert, Box, Chip, Grid, Typography } from '@mui/material';
import moment from 'moment';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const AllTimePriceChart = ({ data, symbol }) => {
  try {
    if (!data || data.length === 0) {
      return (
        <Alert severity="info">
          No all-time price data available for {symbol}. Please try a different symbol or date range.
        </Alert>
      );
    }

  // Process data for charts
  const processedData = data
    .filter(item => item && item.type) // Filter out items without type
    .map(item => ({
      ...item,
      date: moment(item.date).format('MMM DD, YYYY'),
      fullDate: item.date,
      price: parseFloat(item.price) || 0,
      type_clean: (item.type || '').replace(/_/g, ' ').toUpperCase()
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Group by type for better visualization
  const typeGroups = processedData.reduce((acc, item) => {
    const type = item.type || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  // Create hierarchical data for high/low comparison
  const hierarchyData = [];
  const types = ['all_time_high', 'all_time_low', '52_w_high', '52_w_low', '90_d_high', '90_d_low', 'ytd_high', 'ytd_low'];
  
  types.forEach(type => {
    const items = typeGroups[type] || [];
    items.forEach(item => {
      hierarchyData.push({
        ...item,
        period: type.includes('all_time') ? 'All Time' :
                type.includes('52_w') ? '52 Weeks' :
                type.includes('90_d') ? '90 Days' :
                type.includes('ytd') ? 'YTD' : 'Unknown',
        highLow: type.includes('high') ? 'High' : 'Low'
      });
    });
  });

  // Create comparison data (High vs Low for each period)
  const comparisonData = [];
  const periods = ['all_time', '52_w', '90_d', 'ytd'];
  
  periods.forEach(period => {
    const highs = typeGroups[`${period}_high`] || [];
    const lows = typeGroups[`${period}_low`] || [];
    
    if (highs.length > 0 || lows.length > 0) {
      const periodName = period === 'all_time' ? 'All Time' :
                        period === '52_w' ? '52 Weeks' :
                        period === '90_d' ? '90 Days' :
                        period === 'ytd' ? 'YTD' : period;
      
      comparisonData.push({
        period: periodName,
        high: highs.length > 0 ? highs[0].price : 0,
        low: lows.length > 0 ? lows[0].price : 0,
        range: (highs.length > 0 && lows.length > 0) ? highs[0].price - lows[0].price : 0,
        highDate: highs.length > 0 ? highs[0].date : '',
        lowDate: lows.length > 0 ? lows[0].date : ''
      });
    }
  });

  // Color mapping for different types
  const getColor = (type) => {
    const colorMap = {
      'all_time_high': '#ef4444',
      'all_time_low': '#10b981',
      '52_w_high': '#f59e0b',
      '52_w_low': '#84cc16',
      '90_d_high': '#8b5cf6',
      '90_d_low': '#06b6d4',
      'ytd_high': '#ec4899',
      'ytd_low': '#14b8a6'
    };
    return colorMap[type] || '#6b7280';
  };

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
              {`${entry.name}: ${entry.value.toLocaleString()}`}
              {data.highDate && entry.dataKey === 'high' && (
                <span style={{ fontSize: '0.8em', opacity: 0.8 }}> ({data.highDate})</span>
              )}
              {data.lowDate && entry.dataKey === 'low' && (
                <span style={{ fontSize: '0.8em', opacity: 0.8 }}> ({data.lowDate})</span>
              )}
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
        All-Time Price Data for {symbol}
      </Typography>

      <Grid container spacing={3}>
        {/* Price Range Comparison */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Price Ranges by Period
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="period" 
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
                dataKey="high"
                fill="#ef4444"
                name="High Price"
              />
              <Bar
                dataKey="low"
                fill="#10b981"
                name="Low Price"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Individual Price Points */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            All Price Points
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="type_clean" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                dataKey="price"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter dataKey="price" fill="#2563eb">
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Grid>

        {/* Price Range Chart */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Price Range by Period
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisonData.filter(d => d.range > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="period" 
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
                dataKey="range"
                fill="#8b5cf6"
                name="Price Range (High - Low)"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Price Type Legend */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Data Points Available
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.keys(typeGroups).map((type) => (
              <Chip
                key={type}
                label={`${(type || 'unknown').replace(/_/g, ' ').toUpperCase()} (${typeGroups[type].length})`}
                sx={{
                  bgcolor: getColor(type),
                  color: '#fff',
                  '&:hover': {
                    bgcolor: getColor(type),
                    opacity: 0.8
                  }
                }}
              />
            ))}
          </Box>
        </Grid>

        {/* Data Table */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Detailed Price Points
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
                    {item.type_clean}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.date}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: getColor(item.type) }}>
                  {item.price.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
  } catch (error) {
    console.error('Error in AllTimePriceChart:', error);
    return (
      <Alert severity="error">
        Error loading all-time price chart: {error.message || 'Unknown error'}
      </Alert>
    );
  }
};

export default AllTimePriceChart;
