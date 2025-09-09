import { Alert, Box, Chip, Grid, Typography } from '@mui/material';
import moment from 'moment';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const FilingsChart = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No filings data available for {symbol}. Please try a different symbol or date range.
      </Alert>
    );
  }

  // Process data for charts
  const processedData = data
    .filter(item => item.tickers && item.tickers.includes(symbol)) // Only filings for this symbol
    .map(item => ({
      ...item,
      date: moment(item.timestamp).format('MMM DD, YYYY'),
      shortDate: moment(item.timestamp).format('MMM DD'),
      fullDate: item.timestamp,
      month: moment(item.timestamp).format('YYYY-MM'),
      year: moment(item.timestamp).year(),
      price: parseFloat(item.price) || 0,
      holding_before: parseInt(item.holding_before) || 0,
      holding_after: parseInt(item.holding_after) || 0,
      amount_transaction: parseInt(item.amount_transaction) || 0,
      transaction_type: item.transaction_type || 'unknown',
      sector: item.sector || 'unknown',
      sub_sector: item.sub_sector || 'unknown'
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Aggregate by transaction type
  const transactionTypeData = processedData.reduce((acc, item) => {
    const type = item.transaction_type;
    if (!acc[type]) {
      acc[type] = {
        type,
        count: 0,
        totalAmount: 0,
        avgAmount: 0,
        transactions: []
      };
    }
    acc[type].count += 1;
    acc[type].totalAmount += Math.abs(item.amount_transaction);
    acc[type].transactions.push(item);
    return acc;
  }, {});

  const transactionChartData = Object.values(transactionTypeData)
    .map(typeData => ({
      ...typeData,
      avgAmount: typeData.totalAmount / typeData.count
    }));

  // Monthly activity
  const monthlyData = processedData.reduce((acc, item) => {
    const month = item.month;
    if (!acc[month]) {
      acc[month] = {
        month,
        monthLabel: moment(item.timestamp).format('MMM YYYY'),
        count: 0,
        totalAmount: 0,
        buys: 0,
        sells: 0
      };
    }
    acc[month].count += 1;
    acc[month].totalAmount += Math.abs(item.amount_transaction);
    if (item.transaction_type === 'buy') {
      acc[month].buys += 1;
    } else if (item.transaction_type === 'sell') {
      acc[month].sells += 1;
    }
    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month));

  // Holdings evolution
  let runningHoldings = 0;
  const holdingsEvolution = processedData.map(item => {
    runningHoldings = item.holding_after;
    return {
      ...item,
      runningHoldings: runningHoldings,
      holdingsChange: item.holding_after - item.holding_before
    };
  });

  // Price vs Transaction analysis
  const priceTransactionData = processedData
    .filter(item => item.price > 0)
    .map(item => ({
      ...item,
      transactionValue: Math.abs(item.amount_transaction) * item.price,
      priceLevel: item.price < 1000 ? 'Low (<1K)' :
                 item.price < 5000 ? 'Medium (1K-5K)' : 'High (>5K)'
    }));

  // Color mapping for transaction types
  const getColor = (type) => {
    const colorMap = {
      'buy': '#10b981',
      'sell': '#ef4444',
      'transfer': '#f59e0b',
      'unknown': '#6b7280'
    };
    return colorMap[type] || '#6b7280';
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#1a1a2e',
          padding: '10px',
          border: '1px solid #2563eb',
          borderRadius: '5px',
          maxWidth: '300px'
        }}>
          <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
          {data.title && (
            <p style={{ color: '#9ca3af', fontSize: '0.8em', margin: '5px 0 0 0' }}>
              {data.title.substring(0, 100)}...
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
        Filing Data for {symbol}
      </Typography>

      <Grid container spacing={3}>
        {/* Transaction Activity Timeline */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Transaction Activity Over Time
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
                dataKey="amount_transaction"
                fill="#2563eb"
                name="Transaction Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Transaction Type Distribution */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Transaction Types
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ type, count }) => `${type}: ${count}`}
              >
                {transactionChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid>

        {/* Monthly Activity */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Monthly Filing Activity
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="monthLabel" 
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
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Filing Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Holdings Evolution */}
        {holdingsEvolution.some(item => item.runningHoldings > 0) && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Holdings Evolution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={holdingsEvolution}>
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
                  dataKey="runningHoldings"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  name="Total Holdings"
                />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        )}

        {/* Buy vs Sell Comparison */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Buy vs Sell Activity
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="monthLabel" 
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
                dataKey="buys"
                fill="#10b981"
                name="Buy Transactions"
              />
              <Bar
                dataKey="sells"
                fill="#ef4444"
                name="Sell Transactions"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Price vs Transaction Volume */}
        {priceTransactionData.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Transaction Price vs Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={priceTransactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="price" 
                  name="Stock Price"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  dataKey="amount_transaction" 
                  name="Transaction Amount"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  dataKey="amount_transaction"
                  fill="#f59e0b"
                  name="Transactions"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Grid>
        )}

        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Filing Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip 
              label={`Total Filings: ${processedData.length}`} 
              color="primary" 
            />
            <Chip 
              label={`Buy Transactions: ${processedData.filter(item => item.transaction_type === 'buy').length}`} 
              sx={{ bgcolor: '#10b981', color: '#fff' }}
            />
            <Chip 
              label={`Sell Transactions: ${processedData.filter(item => item.transaction_type === 'sell').length}`} 
              sx={{ bgcolor: '#ef4444', color: '#fff' }}
            />
            <Chip 
              label={`Avg Transaction Size: ${(processedData.reduce((sum, item) => sum + Math.abs(item.amount_transaction), 0) / processedData.length).toLocaleString()}`} 
              color="secondary" 
            />
          </Box>
        </Grid>

        {/* Recent Filings */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Recent Filings
          </Typography>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            p: 2,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {processedData.slice(-5).reverse().map((item, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                py: 2,
                borderBottom: index < 4 ? 1 : 0,
                borderColor: 'divider'
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.transaction_type.toUpperCase()} - {item.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {item.title?.substring(0, 100)}...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Amount: {item.amount_transaction.toLocaleString()} shares
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip 
                    size="small"
                    label={item.transaction_type}
                    sx={{ 
                      bgcolor: getColor(item.transaction_type),
                      color: '#fff',
                      mb: 1
                    }}
                  />
                  {item.price > 0 && (
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Price: {item.price.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilingsChart;
