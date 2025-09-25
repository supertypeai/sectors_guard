import {
  AccessTime,
  Analytics,
  BugReport,
  CheckCircle,
  Close,
  DataArray,
  Error,
  Info,
  PlayArrow,
  PlaylistPlay,
  Refresh,
  Visibility,
  Warning,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import moment from 'moment';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { validationAPI } from '../services/api';

function ValidationResults() {
  const theme = useTheme();
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const queryClient = useQueryClient();

  const { data: tables, isLoading: tablesLoading } = useQuery(
    'validation-tables',
    validationAPI.getTables
  );

  const { data: results, isLoading: resultsLoading } = useQuery(
    'validation-results',
    () => validationAPI.getResults(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const runValidationMutation = useMutation(
    ({ tableName, startDate, endDate }) => validationAPI.runValidation(tableName, startDate, endDate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('validation-results');
        queryClient.invalidateQueries('dashboard-stats');
      },
    }
  );

  const runAllValidationMutation = useMutation(
    ({ startDate, endDate }) => validationAPI.runAllValidations(startDate, endDate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('validation-results');
        queryClient.invalidateQueries('dashboard-stats');
      },
    }
  );

  const handleApplyFilters = () => {
    console.log('🔍 Applying date filters:', { startDate, endDate });
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing date filters');
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
  };

  const handleRunValidation = (tableName) => {
    const filterData = { 
      tableName, 
      startDate: appliedStartDate || null, 
      endDate: appliedEndDate || null 
    };
    console.log('🚀 Running validation with filters:', filterData);
    runValidationMutation.mutate(filterData);
  };

  const handleRunAllValidations = () => {
    const filterData = { 
      startDate: appliedStartDate || null, 
      endDate: appliedEndDate || null 
    };
    console.log('🚀 Running ALL validations with filters:', filterData);
    runAllValidationMutation.mutate(filterData);
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setDetailsOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'warning':
        return <Warning sx={{ color: 'warning.main' }} />;
      case 'error':
        return <Error sx={{ color: 'error.main' }} />;
      default:
        return <Info sx={{ color: 'primary.main' }} />;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <Error sx={{ color: 'error.main', fontSize: 18 }} />;
      case 'warning':
        return <Warning sx={{ color: 'warning.main', fontSize: 18 }} />;
      case 'info':
        return <Info sx={{ color: 'primary.main', fontSize: 18 }} />;
      default:
        return <BugReport sx={{ color: 'text.secondary', fontSize: 18 }} />;
    }
  };

  const tablesData = tables?.data?.tables || [];
  const resultsData = results?.data?.results || results?.data?.data?.results || [];

  return (
    <Box>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={(theme) => ({ width: 48, height: 48, backgroundColor: theme.palette.primary.main })}>
              <Analytics sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Validation
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Monitor validation status and anomaly details
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Date Filter Section */}
      <Fade in timeout={700}>
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Date Filter (Optional)
              </Typography>
              {(appliedStartDate || appliedEndDate) && (
                <Chip
                  label={`Active: ${appliedStartDate || 'All'} to ${appliedEndDate || 'All'}`}
                  color="primary"
                  size="small"
                  sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2), color: 'text.primary' }}
                />
              )}
            </Box>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true, sx: { color: 'text.secondary' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                      },
                      '&:hover fieldset': {
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true, sx: { color: 'text.secondary' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                      },
                      '&:hover fieldset': {
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  disabled={startDate === appliedStartDate && endDate === appliedEndDate}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Apply Filters
                </Button>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: (theme) => alpha(theme.palette.primary.main, 0.3), '&:hover': { borderColor: 'primary.main', background: (theme) => alpha(theme.palette.primary.main, 0.05) } }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Quick Actions Section */}
      <Fade in timeout={800}>
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DataArray sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Available Tables ({tablesData.length})
                </Typography>
              </Box>
                <Button
                startIcon={<Refresh />}
                onClick={() => queryClient.invalidateQueries('validation-tables')}
                disabled={tablesLoading}
                variant="outlined"
                  sx={{ borderRadius: 2, textTransform: 'none', borderColor: (theme) => alpha(theme.palette.primary.main, 0.3), '&:hover': { borderColor: 'primary.main', background: (theme) => alpha(theme.palette.primary.main, 0.05) } }}
              >
                Refresh Tables
              </Button>
            </Box>

            {tablesLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {tablesData.map((table, index) => (
                  <Grid item xs={12} sm={6} md={4} key={table.name}>
                    <Card sx={{ borderRadius: 3, transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)' } }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ fontWeight: 600, color: 'text.primary', mb: 1, wordBreak: 'break-word' }}
                        >
                          {table.name.replace('idx_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'text.secondary', mb: 2, minHeight: 40 }}
                        >
                          {table.description || 'IDX financial data validation'}
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => handleRunValidation(table.name)}
                          disabled={runValidationMutation.isLoading || runAllValidationMutation.isLoading}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          {runValidationMutation.isLoading ? 'Running...' : 'Run Validation'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Run All Button */}
            {!tablesLoading && tablesData.length > 0 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlaylistPlay />}
                  onClick={handleRunAllValidations}
                  disabled={runAllValidationMutation.isLoading || runValidationMutation.isLoading}
                  sx={{ borderRadius: 3, textTransform: 'none', px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
                >
                  {runAllValidationMutation.isLoading 
                    ? 'Running All Validations...' 
                    : `Run All Validations (${tablesData.length} tables)`
                  }
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Validation Results Section */}
      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <AccessTime sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Recent Validation Results ({resultsData.length})
              </Typography>
            </Box>

            {resultsLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : resultsData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <BugReport sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No validation results yet
                </Typography>
                <Typography variant="body2">
                  Run a validation to see results here
                </Typography>
              </Box>
            ) : (
              <Box sx={{ overflow: 'hidden', borderRadius: 3 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Table Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Validations</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Rows</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Anomalies</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultsData.map((result, index) => (
                        <TableRow 
                          key={result.id || index}
                          sx={{
                            '&:hover': {
                              background: alpha(theme.palette.primary.main, 0.02),
                            },
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusIcon(result.status)}
                              <Chip
                                label={result.status}
                                color={getStatusColor(result.status)}
                                size="small"
                                sx={{ 
                                  textTransform: 'capitalize',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {result.table_name?.replace('idx_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {result.table_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {Array.isArray(result.validations_performed) && result.validations_performed.length > 0 ? (
                              result.validations_performed.map((v, i) => (
                                <Chip key={i} label={v.replace(/_/g, ' ')} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                              ))
                            ) : (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {result.total_rows?.toLocaleString?.() ?? result.total_rows ?? '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {moment(result.validation_timestamp).format('MMM DD, YYYY HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: (theme) => (result.anomalies_count > 0 ? theme.palette.warning.main : theme.palette.success.main) }}>
                                {result.anomalies_count || 0}
                              </Typography>
                              {result.anomalies_count > 0 && (<Warning sx={{ fontSize: 16, color: 'warning.main' }} />)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {moment(result.created_at).format('MMM DD, YYYY HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleViewDetails(result)}
                                size="small"
                                sx={{
                                  background: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    background: alpha(theme.palette.primary.main, 0.2),
                                  },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: (theme) => alpha(theme.palette.primary.main, 0.1), color: 'text.primary', fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedResult && getStatusIcon(selectedResult.status)}
            Validation Details: {selectedResult?.table_name}
          </Box>
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedResult && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, background: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Status</Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      {selectedResult.status}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, background: (theme) => alpha(theme.palette.warning.main, 0.05) }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Anomalies</Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      {selectedResult.anomalies_count || 0}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {selectedResult.anomalies && selectedResult.anomalies.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                    Anomalies Detected
                  </Typography>
                  <List sx={{ background: (theme) => alpha(theme.palette.background.default, 0.2), borderRadius: 2, p: 2 }}>
                    {selectedResult.anomalies.map((anomaly, index) => (
                        <ListItem key={index} sx={{ border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`, borderRadius: 2, mb: 1, background: (theme) => alpha(theme.palette.background.paper, 0.6), alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ mt: 0.5 }}>
                          {getSeverityIcon(anomaly.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {anomaly.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Anomaly'}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                {anomaly.date && (
                                  <Chip label={moment(anomaly.date).format('YYYY-MM-DD')} size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.background.default, 0.3), color: 'text.secondary' }} />
                                )}
                                {anomaly.metric && (
                                  <Chip label={anomaly.metric} size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.background.default, 0.3), color: 'text.secondary' }} />
                                )}
                                {anomaly.id && (
                                  <Chip label={`ID: ${anomaly.id}`} size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.background.default, 0.3), color: 'text.secondary' }} />
                                )}
                                {anomaly.symbol && (
                                  <Chip label={`Symbol: ${anomaly.symbol}`} size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.background.default, 0.3), color: 'text.secondary' }} />
                                )}
                                {anomaly.severity && (
                                  <Chip label={anomaly.severity.toUpperCase()} size="small" sx={{ bgcolor: (theme) => alpha(anomaly.severity === 'error' ? theme.palette.error.main : theme.palette.warning.main, 0.12), color: anomaly.severity === 'error' ? 'error.light' : 'warning.main' }} />
                                )}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {anomaly.message}
                              </Typography>
                              {anomaly.difference !== undefined && (<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>Difference: {Number(anomaly.difference).toLocaleString()} ({Number(anomaly.difference_pct || 0).toFixed(2)}%)</Typography>)}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {(!selectedResult.anomalies || selectedResult.anomalies.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4, background: (theme) => alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <CheckCircle sx={{ fontSize: 48, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h6" sx={{ color: theme.palette.success.main }}>
                    No Anomalies Detected
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    All validations passed successfully
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDetailsOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Alerts */}
      {runValidationMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Validation failed: {runValidationMutation.error?.message || 'Unknown error'}
        </Alert>
      )}
      
      {runValidationMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Validation completed successfully!
        </Alert>
      )}

      {runAllValidationMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Run All Validations failed: {runAllValidationMutation.error?.message || 'Unknown error'}
        </Alert>
      )}
      
      {runAllValidationMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              All Validations Completed Successfully!
            </Typography>
            {runAllValidationMutation.data?.summary && (
              <Typography variant="body2">
                Processed {runAllValidationMutation.data.summary.total_tables} tables, 
                {runAllValidationMutation.data.summary.successful_validations} successful validations, 
                {runAllValidationMutation.data.summary.total_anomalies} total anomalies found.
              </Typography>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
}

export default ValidationResults;
