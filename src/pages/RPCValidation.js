import {
  AttachMoney,
  Business,
  Code,
  Description,
  Insights,
  MonetizationOn,
  NewReleases,
  Security,
  ShowChart,
  Speed,
  TrendingDown,
  TrendingUp,
  Workspaces
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  Paper,
  Snackbar,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { validationAPI } from '../services/api';

const RPC_FUNCTIONS = [
  {
    name: 'get_idx_mcap_data_1m',
    icon: <MonetizationOn />,
    description: 'Market Cap Data - 1 Month',
    color: '#1976D2',
    category: 'Market Data'
  },
  {
    name: 'get_indices_price_changes',
    icon: <ShowChart />,
    description: 'Indices Price Changes',
    color: '#1976D2',
    category: 'Market Data'
  },
  {
    name: 'get_top_mcap_gainers',
    icon: <TrendingUp />,
    description: 'Top Market Cap Gainers',
    color: '#388E3C',
    category: 'Top Movers'
  },
  {
    name: 'get_top_mcap_losers',
    icon: <TrendingDown />,
    description: 'Top Market Cap Losers',
    color: '#D32F2F',
    category: 'Top Movers'
  },
  {
    name: 'get_top_gainers',
    icon: <TrendingUp />,
    description: 'Top Price Gainers',
    color: '#388E3C',
    category: 'Top Movers'
  },
  {
    name: 'get_top_losers',
    icon: <TrendingDown />,
    description: 'Top Price Losers',
    color: '#D32F2F',
    category: 'Top Movers'
  },
  {
    name: 'get_peers_and_idx_valuation_summary',
    icon: <Insights />,
    description: 'Peers & IDX Valuation Summary',
    color: '#7B1FA2',
    category: 'Valuation'
  },
  {
    name: 'get_idx_peers_growth_and_forecasts',
    icon: <ShowChart />,
    description: 'Peers Growth & Forecasts',
    color: '#7B1FA2',
    category: 'Valuation'
  },
  {
    name: 'get_news_per_dimensions_by_ticker_subsector',
    icon: <Description />,
    description: 'News by Ticker & Subsector',
    color: '#0097A7',
    category: 'News & Reports'
  },
  {
    name: 'get_idx_yield_ttm',
    icon: <AttachMoney />,
    description: 'IDX Yield (TTM)',
    color: '#689F38',
    category: 'Dividends'
  },
  {
    name: 'get_companies_loan_quality',
    icon: <Security />,
    description: 'Companies Loan Quality',
    color: '#E64A19',
    category: 'Financial Health'
  },
  {
    name: 'get_idx_resilience',
    icon: <Security />,
    description: 'IDX Resilience',
    color: '#E64A19',
    category: 'Financial Health'
  },
  {
    name: 'get_companies_state_owned',
    icon: <Business />,
    description: 'State-Owned Companies',
    color: '#455A64',
    category: 'Company Info'
  },
  {
    name: 'get_upcoming_dividends_and_splits',
    icon: <NewReleases />,
    description: 'Upcoming Dividends & Splits',
    color: '#F57C00',
    category: 'Corporate Actions'
  },
  {
    name: 'get_idx_most_traded',
    icon: <Speed />,
    description: 'Most Traded Stocks',
    color: '#C2185B',
    category: 'Trading'
  },
  {
    name: 'get_idx_volume',
    icon: <Workspaces />,
    description: 'IDX Trading Volume',
    color: '#C2185B',
    category: 'Trading'
  }
];

const RPCValidation = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [loadingFunctions, setLoadingFunctions] = useState({});
  const [selectedResult, setSelectedResult] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch validation results from database with auto-refresh
  const { data: validationResults, isLoading: resultsLoading } = useQuery(
    'validation-results',
    () => validationAPI.getResults(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Build results map from database data
  const results = {};
  const allResults = validationResults?.data?.data?.results || [];
  
  if (Array.isArray(allResults)) {
    allResults.forEach(result => {
      // Check if this is an RPC validation result (table_name starts with 'rpc_')
      if (result.table_name && result.table_name.startsWith('rpc_')) {
        // Extract function name from table_name (e.g., "rpc_get_idx_mcap_data_1m" -> "get_idx_mcap_data_1m")
        const functionName = result.table_name.replace('rpc_', '');
        
        // Keep only the latest result for each function (results are sorted by timestamp desc)
        if (!results[functionName]) {
          results[functionName] = result;
        }
      }
    });
  }

  const handleValidate = async (functionName) => {
    setLoadingFunctions(prev => ({ ...prev, [functionName]: true }));
    
    try {
      const response = await validationAPI.runSingleRPCValidation(functionName);
      const result = response.data || response;
      
      // Invalidate queries to refresh data from database
      queryClient.invalidateQueries('validation-results');
      
      setSnackbar({
        open: true,
        message: `Validation completed for ${functionName}`,
        severity: result.status === 'success' ? 'success' : 'warning'
      });
    } catch (error) {
      console.error(`Error validating ${functionName}:`, error);
      setSnackbar({
        open: true,
        message: `Failed to validate ${functionName}`,
        severity: 'error'
      });
    } finally {
      setLoadingFunctions(prev => ({ ...prev, [functionName]: false }));
    }
  };

  const handleViewDetails = (functionName) => {
    const result = results[functionName];
    if (result) {
      setSelectedResult({ 
        functionName, 
        data: {
          ...result,
          // Parse anomalies if it's a string
          anomalies: (() => {
            if (!result.anomalies) return [];
            if (typeof result.anomalies === 'string') {
              try {
                return JSON.parse(result.anomalies);
              } catch (e) {
                return [];
              }
            }
            return result.anomalies;
          })()
        }
      });
      setDialogOpen(true);
    }
  };

  const getStatusChip = (result) => {
    if (!result) {
      return <Chip label="Not Run" size="small" />;
    }
    
    const isSuccess = result.status === 'success';
    const anomalyCount = result.anomalies_count || 0;
    
    return (
      <Chip
        label={isSuccess ? '✓ Valid' : `⚠ ${anomalyCount} Issue${anomalyCount !== 1 ? 's' : ''}`}
        size="small"
        color={isSuccess ? 'success' : 'error'}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const groupedFunctions = RPC_FUNCTIONS.reduce((acc, func) => {
    if (!acc[func.category]) {
      acc[func.category] = [];
    }
    acc[func.category].push(func);
    return acc;
  }, {});

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Code sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              RPC Functions Validation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Test individual Supabase RPC functions
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Loading State */}
      {resultsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* RPC Functions Grid - Grouped by Category */}
      {!resultsLoading && Object.entries(groupedFunctions).map(([category, functions]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: theme.palette.text.secondary }}>
            {category}
          </Typography>
          
          <Grid container spacing={2}>
            {functions.map((func, index) => {
              const result = results[func.name];
              const isLoading = loadingFunctions[func.name];

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={func.name}>
                  <Fade in timeout={300 + index * 50}>
                    <Card
                      elevation={result ? 3 : 1}
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s ease',
                        borderLeft: `4px solid ${func.color}`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8],
                        }
                      }}
                    >
                      <CardContent>
                        {/* Icon and Status */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box
                            sx={{
                              bgcolor: alpha(func.color, 0.1),
                              color: func.color,
                              p: 1,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {func.icon}
                          </Box>
                          {getStatusChip(result)}
                        </Box>

                        {/* Function Name */}
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, wordBreak: 'break-word' }}>
                          {func.name}
                        </Typography>

                        {/* Description */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                          {func.description}
                        </Typography>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleValidate(func.name)}
                            disabled={isLoading}
                            fullWidth
                            sx={{
                              bgcolor: func.color,
                              '&:hover': { bgcolor: alpha(func.color, 0.8) }
                            }}
                          >
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Validate'}
                          </Button>
                          
                          {result && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewDetails(func.name)}
                              sx={{ minWidth: '80px' }}
                            >
                              Details
                            </Button>
                          )}
                        </Box>

                        {/* Last Run Info */}
                        {result && result.validation_timestamp && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Last run: {(() => {
                              try {
                                const date = new Date(result.validation_timestamp);
                                return isNaN(date.getTime()) ? 'Just now' : date.toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              } catch (e) {
                                return 'Just now';
                              }
                            })()}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedResult && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                  {selectedResult.functionName}
                </Typography>
                {getStatusChip(selectedResult.data)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Timestamp</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {(() => {
                        try {
                          const date = new Date(selectedResult.data.validation_timestamp);
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('id-ID');
                        } catch (e) {
                          return 'N/A';
                        }
                      })()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Anomalies Found</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedResult.data.anomalies_count || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {selectedResult.data.anomalies && selectedResult.data.anomalies.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Anomalies Detected:
                  </Typography>
                  {selectedResult.data.anomalies.map((anomaly, idx) => (
                    <Alert severity={anomaly.severity || 'warning'} key={idx} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">{anomaly.type}</Typography>
                      <Typography variant="body2">{anomaly.message}</Typography>
                      {anomaly.expected_date && (
                        <Typography variant="caption" display="block">
                          Expected: {anomaly.expected_date} | Actual: {anomaly.actual_date}
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </Box>
              ) : (
                <Alert severity="success">
                  ✅ No anomalies detected. Function is working correctly!
                </Alert>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RPCValidation;
