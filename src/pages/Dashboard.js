import {
  AccountBalance,
  CheckCircle,
  Email,
  MonetizationOn,
  ShowChart,
  TableChart,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Fade,
  Grid,
  Grow,
  Typography,
  Zoom,
  alpha,
  useTheme
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
    description: 'Annual Financial Data - Revenue, earnings, assets validation',
    validationType: 'Financial Performance (Annual)',
  validationRule: 'Year-over-year changes >50% vs multi-year average'
  },
  {
    name: 'idx_combine_financials_quarterly',
    icon: <TrendingUp />,
    description: 'Quarterly Financial Data - Revenue, earnings, assets validation',
    validationType: 'Financial Performance (Quarterly)',
  validationRule: 'Quarter-over-quarter changes >50% vs seasonal average'
  },
  {
    name: 'idx_daily_data',
    icon: <ShowChart />,
    description: 'Daily Stock Price Data - Price movement monitoring (last 7 days)',
    validationType: 'Price Movement Monitoring',
  validationRule: 'Daily close change >35% or abnormal volume spike (last 7 days)'
  },
  {
    name: 'idx_dividend',
    icon: <MonetizationOn />,
    description: 'Dividend Data - Yield analysis and change detection',
    validationType: 'Dividend Analysis',
  validationRule: 'Average annual yield ≥30% or year-on-year yield change ≥10%'
  },
  {
    name: 'idx_all_time_price',
    icon: <TableChart />,
    description: 'All-Time Price Data - Price consistency validation',
    validationType: 'Price Consistency Check',
  validationRule: 'Cross-check price tiers for inconsistencies (90d < YTD < 52w < all-time)'
  },
  {
    name: 'idx_filings',
    icon: <Warning />,
    description: 'Filing Price Validation - Compare with daily prices',
    validationType: 'Filing Price Validation',
    validationRule: 'Filing price deviates ≥50% from daily close at filing timestamp'
  },
  {
    name: 'idx_stock_split',
    icon: <CheckCircle />,
    description: 'Stock Split Timing Validation',
    validationType: 'Stock Split Analysis',
  validationRule: 'Multiple stock splits within 14 days for the same symbol'
  },
];

function Dashboard() {
  const theme = useTheme();
  
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
      {/* Simple Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: '#ffffff',
            }}
          >
            Sectors Guard Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#94a3b8',
              mb: 3,
            }}
          >
            Real-time monitoring and anomaly detection for Indonesian Stock Exchange
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards with staggered animation */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grow in timeout={600}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total IDX Tables"
              value={statsLoading ? '...' : (statsData.total_tables || IDX_TABLES.length)}
              subtitle="Financial data tables"
              icon={<TableChart />}
            />
          </Grid>
        </Grow>
        <Grow in timeout={800}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Validated Today"
              value={statsLoading ? '...' : (statsData.validated_today || '0')}
              subtitle="Validation runs completed"
              icon={<CheckCircle />}
            />
          </Grid>
        </Grow>
        <Grow in timeout={1000}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Anomalies Detected"
              value={statsLoading ? '...' : (statsData.anomalies_detected || '0')}
              subtitle="Requiring attention"
              icon={<Warning />}
            />
          </Grid>
        </Grow>
        <Grow in timeout={1200}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Alerts Sent"
              value={statsLoading ? '...' : (statsData.emails_sent || '0')}
              subtitle="Email notifications"
              icon={<Email />}
            />
          </Grid>
        </Grow>
      </Grid>

      {/* Charts Section */}
      <Fade in timeout={1000}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: 2,
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ffffff' }}>
                  Validation Trends
                </Typography> */}
                <ValidationTrendsChart data={chartTrends} loading={trendsLoading} />
              {/* </CardContent> */}
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 2,
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <TableStatusChart data={chartStatus} loading={statusLoading} />
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* Tables Overview */}
      <Fade in timeout={1200}>
        <Card
          sx={{
            borderRadius: 2,
            backgroundColor: '#1a1a2e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                }}
              >
                <TableChart />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  IDX Financial Tables Overview
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Specialized validation for Indonesian Stock Exchange financial data
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              {IDX_TABLES.map((table, index) => (
                <Zoom 
                  key={table.name} 
                  in 
                  timeout={1000 + (index * 100)}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Grid item xs={12} md={6} lg={4}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        background: 'rgba(22, 33, 62, 0.6)',
                        backdropFilter: 'blur(15px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: alpha(theme.palette.primary.main, 0.2),
                              color: theme.palette.primary.main,
                            }}
                          >
                            {table.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#f1f5f9',
                                mb: 0.5,
                                fontSize: '0.95rem',
                              }}
                            >
                              {table.name.replace('idx_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                            <Chip
                              label={table.validationType}
                              size="small"
                              sx={{
                                background: alpha(theme.palette.secondary.main, 0.2),
                                color: theme.palette.secondary.main,
                                fontWeight: 500,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#94a3b8', 
                            mb: 2,
                            lineHeight: 1.5,
                          }}
                        >
                          {table.description}
                        </Typography>
                        
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.warning.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.warning.light,
                              fontWeight: 500,
                              display: 'block',
                            }}
                          >
                            Validation Rule:
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#cbd5e1',
                              fontWeight: 400,
                            }}
                          >
                            {table.validationRule}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Zoom>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

export default Dashboard;
