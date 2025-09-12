import { Box, Paper, Typography } from '@mui/material';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function ValidationTrendsChart({ data, loading }) {
  if (loading) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          height: 400,
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(37, 99, 235, 0.2)',
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" height="80%">
          <Typography sx={{ color: '#94a3b8' }}>Loading...</Typography>
        </Box>
      </Paper>
    );
  }

  const chartData = data?.dates?.map((date, index) => ({
    date,
    validations: data.validations[index],
    anomalies: data.anomalies[index],
  })) || [];

  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: 400,
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(37, 99, 235, 0.2)',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', fontWeight: 500 }}>
        Validation Trends
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="validations" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Total Validations"
          />
          <Line 
            type="monotone" 
            dataKey="anomalies" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Anomalies Detected"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ValidationTrendsChart;
