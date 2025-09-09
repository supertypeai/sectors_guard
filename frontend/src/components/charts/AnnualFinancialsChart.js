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
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const AnnualFinancialsChart = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No annual financial data available for {symbol}. Please try a different symbol or date range.
      </Alert>
    );
  }

  // Process data for charts
  const processedData = data
    .map(item => ({
      ...item,
      year: moment(item.date).year(),
      fullDate: item.date,
      // Convert to trillions for readability
      revenue_t: (parseFloat(item.revenue) || 0) / 1e12,
      earnings_t: (parseFloat(item.earnings) || 0) / 1e12,
      total_assets_t: (parseFloat(item.total_assets) || 0) / 1e12,
      total_liabilities_t: (parseFloat(item.total_liabilities) || 0) / 1e12,
      total_equity_t: (parseFloat(item.total_equity) || 0) / 1e12,
      gross_loan_t: (parseFloat(item.gross_loan) || 0) / 1e12,
      net_loan_t: (parseFloat(item.net_loan) || 0) / 1e12,
      total_deposit_t: (parseFloat(item.total_deposit) || 0) / 1e12,
      // Growth rates (year-over-year)
      revenue_growth: 0,
      earnings_growth: 0,
      assets_growth: 0,
      // Ratios
      roe: item.total_equity ? ((parseFloat(item.earnings) || 0) / (parseFloat(item.total_equity) || 1)) * 100 : 0,
      roa: item.total_assets ? ((parseFloat(item.earnings) || 0) / (parseFloat(item.total_assets) || 1)) * 100 : 0,
      equity_ratio: item.total_assets ? ((parseFloat(item.total_equity) || 0) / (parseFloat(item.total_assets) || 1)) * 100 : 0,
      ldr: (item.gross_loan && item.total_deposit) ? ((parseFloat(item.gross_loan) || 0) / (parseFloat(item.total_deposit) || 1)) * 100 : 0
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate growth rates
  for (let i = 1; i < processedData.length; i++) {
    const current = processedData[i];
    const previous = processedData[i - 1];
    
    if (previous.revenue_t > 0) {
      current.revenue_growth = ((current.revenue_t - previous.revenue_t) / previous.revenue_t) * 100;
    }
    if (previous.earnings_t > 0) {
      current.earnings_growth = ((current.earnings_t - previous.earnings_t) / previous.earnings_t) * 100;
    }
    if (previous.total_assets_t > 0) {
      current.assets_growth = ((current.total_assets_t - previous.total_assets_t) / previous.total_assets_t) * 100;
    }
  }

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
          <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{`Year: ${label}`}</p>
          {payload.map((entry, index) => {
            let value = entry.value;
            let suffix = '';
            if (entry.dataKey.includes('_t')) {
              suffix = 'T';
            } else if (['roe', 'roa', 'equity_ratio', 'ldr', 'revenue_growth', 'earnings_growth', 'assets_growth'].includes(entry.dataKey)) {
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
        Annual Financial Data for {symbol}
      </Typography>

      <Grid container spacing={3}>
        {/* Revenue and Earnings Trend */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Revenue & Earnings Trend (Trillions)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
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
              <Line
                type="monotone"
                dataKey="revenue_t"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 5 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="earnings_t"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                name="Earnings"
              />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Balance Sheet Structure */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Balance Sheet Structure (Trillions)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData}>
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
                dataKey="total_assets_t"
                fill="#f59e0b"
                name="Total Assets"
              />
              <Bar
                dataKey="total_liabilities_t"
                stackId="a"
                fill="#ef4444"
                name="Total Liabilities"
              />
              <Bar
                dataKey="total_equity_t"
                stackId="a"
                fill="#8b5cf6"
                name="Total Equity"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Growth Rates */}
        {processedData.length > 1 && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Year-over-Year Growth Rates (%)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.slice(1)}>
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
                  dataKey="revenue_growth"
                  fill="#2563eb"
                  name="Revenue Growth"
                />
                <Bar
                  dataKey="earnings_growth"
                  fill="#10b981"
                  name="Earnings Growth"
                />
                <Bar
                  dataKey="assets_growth"
                  fill="#f59e0b"
                  name="Assets Growth"
                />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        )}

        {/* Key Financial Ratios */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Key Financial Ratios (%)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="year" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
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
              <Line
                type="monotone"
                dataKey="equity_ratio"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="Equity Ratio"
              />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Banking-Specific Metrics */}
        {processedData.some(item => item.gross_loan_t > 0) && (
          <>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Loan Portfolio Evolution (Trillions)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData}>
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
                  <Line
                    type="monotone"
                    dataKey="gross_loan_t"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    name="Gross Loans"
                  />
                  <Line
                    type="monotone"
                    dataKey="net_loan_t"
                    stroke="#0891b2"
                    strokeWidth={2}
                    dot={{ fill: '#0891b2', r: 4 }}
                    name="Net Loans"
                  />
                  {processedData.some(item => item.total_deposit_t > 0) && (
                    <Line
                      type="monotone"
                      dataKey="total_deposit_t"
                      stroke="#84cc16"
                      strokeWidth={2}
                      dot={{ fill: '#84cc16', r: 4 }}
                      name="Total Deposits"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Loan-to-Deposit Ratio (%)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.filter(item => item.ldr > 0)}>
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
                  <Line
                    type="monotone"
                    dataKey="ldr"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5 }}
                    name="LDR"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default AnnualFinancialsChart;
