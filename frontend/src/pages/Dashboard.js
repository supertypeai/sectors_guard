import {
  AccountBalance,
  CheckCircle,
  Email,
  MonetizationOn,
  ShowChart,
  TableChart,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useQuery } from 'react-query';

import StatCard from '../components/StatCard';
import TableStatusChart from '../components/TableStatusChart';
import ValidationTrendsChart from '../components/ValidationTrendsChart';
import { dashboardAPI } from '../services/api';

const IDX_TABLES = [
  {
    name: 'idx_combine_financials_annual',
    icon: <AccountBalance />,
    description: 'Annual Financial Data',
    validationType: 'Financial Performance (Annual)',
  },
  {
    name: 'idx_combine_financials_quarterly',
    icon: <TrendingUp />,
    description: 'Quarterly Financial Data',
    validationType: 'Financial Performance (Quarterly)',
  },
  {
    name: 'idx_daily_data',
    icon: <ShowChart />,
    description: 'Daily Stock Price Data',
    validationType: 'Price Movement Monitoring',
  },
  {
    name: 'idx_dividend',
    icon: <MonetizationOn />,
    description: 'Dividend Data',
    validationType: 'Dividend Yield Analysis',
  },
  {
    name: 'idx_all_time_price',
    icon: <TableChart />,
    description: 'All-Time Price Data',
    validationType: 'Price Consistency Check',
  },
];

function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
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

  if (statsError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading dashboard data: {statsError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        IDX Data Validation Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Monitoring financial data quality and anomaly detection for Indonesian Stock Exchange
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total IDX Tables"
            value={statsLoading ? '...' : (statsData.total_tables || IDX_TABLES.length)}
            subtitle="Financial data tables"
            icon={<TableChart fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Validated Today"
            value={statsLoading ? '...' : (statsData.validated_today || '0')}
            subtitle="Validation runs completed"
            icon={<CheckCircle fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Anomalies Detected"
            value={statsLoading ? '...' : (statsData.anomalies_detected || '0')}
            subtitle="Requiring attention"
            icon={<Warning fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alerts Sent"
            value={statsLoading ? '...' : (statsData.emails_sent || '0')}
            subtitle="Email notifications"
            icon={<Email fontSize="large" />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <ValidationTrendsChart data={chartTrends} loading={trendsLoading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TableStatusChart data={chartStatus} loading={statusLoading} />
        </Grid>
      </Grid>

      {/* IDX Tables Overview */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          IDX Financial Tables Overview
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Specialized validation for Indonesian Stock Exchange financial data
        </Typography>
        
        {statsLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {IDX_TABLES.map((table, index) => (
              <ListItem key={table.name} divider={index < IDX_TABLES.length - 1}>
                <ListItemIcon>
                  {table.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {table.name}
                      </Typography>
                      <Chip 
                        label={table.validationType} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={table.description}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Validation Rules Summary */}
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Active Validation Rules
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              📊 Financial Data Rules
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Annual/Quarterly Changes" 
                  secondary="Alert if absolute change > 50% (considering average trends)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Data Consistency" 
                  secondary="Check for missing required fields and duplicates"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              📈 Market Data Rules
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Daily Price Movements" 
                  secondary="Alert if close price change > 35%"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Dividend Analysis" 
                  secondary="Alert if yield > 50% or yield change > 10%"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Price Data Integrity" 
                  secondary="Validate all-time vs. periodic highs/lows consistency"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Dashboard;
