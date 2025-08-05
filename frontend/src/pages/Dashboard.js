import {
    CheckCircle,
    Email,
    TableChart,
    Warning,
} from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { useQuery } from 'react-query';

import StatCard from '../components/StatCard';
import TableStatusChart from '../components/TableStatusChart';
import ValidationTrendsChart from '../components/ValidationTrendsChart';
import { dashboardAPI } from '../services/api';

function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    dashboardAPI.getStats,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: trendsData, isLoading: trendsLoading } = useQuery(
    'validation-trends',
    dashboardAPI.getValidationTrends,
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const { data: statusData, isLoading: statusLoading } = useQuery(
    'table-status',
    dashboardAPI.getTableStatus,
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const statsData = stats?.data || {};
  const chartTrends = trendsData?.data || {};
  const chartStatus = statusData?.data || {};

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Data Validation Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Monitor your data quality and validation status in real-time
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tables"
            value={statsLoading ? '...' : statsData.total_tables || 0}
            subtitle="Being monitored"
            icon={<TableChart />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Validated Today"
            value={statsLoading ? '...' : statsData.validated_today || 0}
            subtitle="Out of total tables"
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Anomalies Detected"
            value={statsLoading ? '...' : statsData.anomalies_detected || 0}
            subtitle="Requiring attention"
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Emails Sent"
            value={statsLoading ? '...' : statsData.emails_sent || 0}
            subtitle="Alert notifications"
            icon={<Email />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <ValidationTrendsChart 
            data={chartTrends} 
            loading={trendsLoading}
          />
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <TableStatusChart 
            data={chartStatus} 
            loading={statusLoading}
          />
        </Grid>
      </Grid>

      {/* Last Update Info */}
      {statsData.last_validation && (
        <Box mt={3}>
          <Typography variant="body2" color="textSecondary">
            Last validation: {new Date(statsData.last_validation).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
