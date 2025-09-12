import { Alert, Box, Grid, Typography } from '@mui/material';
import moment from 'moment';
import {
  Area,
  AreaChart,
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

const QuarterlyFinancialsChart = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No quarterly financial data available for {symbol}. Please try a different symbol or date range.
      </Alert>
    );
  }

  // Process data for charts
  const processedData = data
    .map(item => ({
      ...item,
      date: moment(item.date).format('YYYY-Q[Q]'),
      fullDate: item.date,
      quarter: `${moment(item.date).year()}-Q${Math.ceil((moment(item.date).month() + 1) / 3)}`,
      // Convert to billions for readability
      total_revenue_b: (parseFloat(item.total_revenue) || 0) / 1e12,
      earnings_b: (parseFloat(item.earnings) || 0) / 1e12,
      total_assets_b: (parseFloat(item.total_assets) || 0) / 1e12,
      total_liabilities_b: (parseFloat(item.total_liabilities) || 0) / 1e12,
      total_equity_b: (parseFloat(item.total_equity) || 0) / 1e12,
      gross_loan_b: (parseFloat(item.gross_loan) || 0) / 1e12,
      net_loan_b: (parseFloat(item.net_loan) || 0) / 1e12,
      total_deposit_b: (parseFloat(item.total_deposit) || 0) / 1e12,
      // Ratios
      roe: item.total_equity ? ((parseFloat(item.earnings) || 0) / (parseFloat(item.total_equity) || 1)) * 100 : 0,
      roa: item.total_assets ? ((parseFloat(item.earnings) || 0) / (parseFloat(item.total_assets) || 1)) * 100 : 0,
      ldr: (item.gross_loan && item.total_deposit) ? ((parseFloat(item.gross_loan) || 0) / (parseFloat(item.total_deposit) || 1)) * 100 : 0
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1a1a2e',
          padding: '10px',
          border: '1px solid #2563eb',
          borderRadius: '5px'
        }}>
          <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{`Quarter: ${label}`}</p>
          {payload.map((entry, index) => {
            let value = entry.value;
            let suffix = '';
            if (entry.dataKey.includes('_b')) {
              suffix = 'T';
            } else if (['roe', 'roa', 'ldr'].includes(entry.dataKey)) {
              suffix = '%';
              value = value.toFixed(2);
            }
            return (
              <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                {`${entry.name}: ${value.toLocaleString()}${suffix}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quarterly Financial Data for {symbol}
      </Typography>

      <Grid container spacing={3}>
        {/* Revenue and Earnings */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Revenue & Earnings (Trillions)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
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
                dataKey="total_revenue_b"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 4 }}
                name="Total Revenue"
              />
              <Line
                type="monotone"
                dataKey="earnings_b"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Earnings"
              />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Assets vs Liabilities vs Equity */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Balance Sheet Components (Trillions)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
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
                dataKey="total_assets_b"
                fill="#f59e0b"
                name="Total Assets"
              />
              <Bar
                dataKey="total_liabilities_b"
                stackId="a"
                fill="#ef4444"
                name="Total Liabilities"
              />
              <Bar
                dataKey="total_equity_b"
                stackId="a"
                fill="#8b5cf6"
                name="Total Equity"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Loan Portfolio */}
        {processedData.some(item => item.gross_loan_b > 0) && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Loan Portfolio (Trillions)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
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
                  dataKey="gross_loan_b"
                  fill="#06b6d4"
                  name="Gross Loan"
                />
                <Bar
                  dataKey="net_loan_b"
                  fill="#0891b2"
                  name="Net Loan"
                />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        )}

        {/* Key Ratios */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Key Financial Ratios (%)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                scale="log"
                domain={['auto', 'auto']}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="roe"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                name="ROE"
              />
              <Line
                type="monotone"
                dataKey="roa"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="ROA"
              />
              {processedData.some(item => item.ldr > 0) && (
                <Line
                  type="monotone"
                  dataKey="ldr"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  name="LDR"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Deposits */}
        {processedData.some(item => item.total_deposit_b > 0) && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Total Deposits (Trillions)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
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
                <Area
                  type="monotone"
                  dataKey="total_deposit_b"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.6}
                  name="Total Deposits"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default QuarterlyFinancialsChart;
