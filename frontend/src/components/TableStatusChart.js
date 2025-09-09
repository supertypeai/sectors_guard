import { Box, Paper, Typography } from '@mui/material';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  healthy: '#10b981', // Green for healthy
  warning: '#f59e0b', // Orange for warning
  error: '#ef4444',   // Red for error
};

function TableStatusChart({ data, loading }) {
  if (loading) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          height: 400,
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', fontWeight: 500 }}>
          Table Status Distribution
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" height="80%">
          <Typography sx={{ color: '#94a3b8' }}>Loading...</Typography>
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
    <Paper 
      sx={{ 
        p: 3, 
        height: 400,
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(37, 99, 235, 0.2)',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', fontWeight: 500 }}>
        Table Status
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
