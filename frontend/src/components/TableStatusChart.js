import { Box, Paper, Typography } from '@mui/material';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  healthy: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
};

function TableStatusChart({ data, loading }) {
  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Table Status Distribution
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" height="80%">
          <Typography>Loading...</Typography>
        </Box>
      </Paper>
    );
  }

  const chartData = Object.entries(data || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: COLORS[status] || '#999',
  }));

  return (
    <Paper elevation={3} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Table Status Distribution
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default TableStatusChart;
