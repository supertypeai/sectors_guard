import { Box, Paper, Typography } from '@mui/material';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function ValidationTrendsChart({ data, loading }) {
  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Validation Trends
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" height="80%">
          <Typography>Loading...</Typography>
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
    <Paper elevation={3} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Validation Trends
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="validations" 
            stroke="#8884d8" 
            name="Total Validations"
          />
          <Line 
            type="monotone" 
            dataKey="anomalies" 
            stroke="#82ca9d" 
            name="Anomalies Detected"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ValidationTrendsChart;
