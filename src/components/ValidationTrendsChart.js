import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function ValidationTrendsChart({ data, loading }) {
  const theme = useTheme();
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
        <Box display="flex" justifyContent="center" alignItems="center" height="80%">
          <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>Loading...</Typography>
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
      sx={(theme) => ({ 
        p: 3, 
        height: 400,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Typography variant="h6" gutterBottom sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 500 }}>
        Validation Trends
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
          <YAxis stroke={theme.palette.text.secondary} />
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              color: theme.palette.text.primary,
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="validations" 
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            name="Total Validations"
          />
          <Line 
            type="monotone" 
            dataKey="anomalies" 
            stroke={theme.palette.error.main}
            strokeWidth={2}
            name="Anomalies Detected"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ValidationTrendsChart;
