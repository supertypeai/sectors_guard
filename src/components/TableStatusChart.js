import { alpha, Box, Paper, Typography, useTheme } from '@mui/material';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const mapColors = (theme) => ({
  healthy: theme.palette.success.main,
  warning: theme.palette.warning.main,
  error: theme.palette.error.main,
});

function TableStatusChart({ data, loading }) {
  const theme = useTheme();
  const COLORS = mapColors(theme);
  if (loading) {
    return (
      <Paper 
        sx={(theme) => ({ 
          p: 3, 
          height: 400,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography variant="h6" gutterBottom sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600 }}>
          Table Status
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" height="80%">
          <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>Loading...</Typography>
        </Box>
      </Paper>
    );
  }

  const chartData = Object.entries(data || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: COLORS[status] || theme.palette.text.secondary,
  }));

  return (
    <Paper 
      sx={(theme) => ({ 
        p: 3, 
        height: 400,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Typography variant="h6" gutterBottom sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 600 }}>
        Table Status
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill={theme.palette.primary.main}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 8,
              color: theme.palette.text.primary,
            }}
            itemStyle={{ color: theme.palette.text.primary }}
            labelStyle={{ color: theme.palette.text.secondary }}
          />
          <Legend
            wrapperStyle={{ color: theme.palette.text.secondary }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default TableStatusChart;
