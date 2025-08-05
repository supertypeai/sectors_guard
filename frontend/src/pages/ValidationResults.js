import { PlayArrow, Refresh } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import moment from 'moment';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { validationAPI } from '../services/api';

function ValidationResults() {
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tables, isLoading: tablesLoading } = useQuery(
    'validation-tables',
    validationAPI.getTables
  );

  const { data: results, isLoading: resultsLoading } = useQuery(
    'validation-results',
    validationAPI.getResults,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const runValidationMutation = useMutation(
    (tableName) => validationAPI.runValidation(tableName),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('validation-results');
        queryClient.invalidateQueries('dashboard-stats');
      },
    }
  );

  const handleRunValidation = (tableName) => {
    runValidationMutation.mutate(tableName);
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

  const tablesData = tables?.data?.tables || [];
  const resultsData = results?.data?.results || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Validation Results
      </Typography>

      {/* Tables Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Available Tables
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={() => queryClient.invalidateQueries('validation-tables')}
            disabled={tablesLoading}
          >
            Refresh
          </Button>
        </Box>

        {tablesLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Table Name</TableCell>
                  <TableCell>Last Validated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tablesData.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell>{table.name}</TableCell>
                    <TableCell>
                      {table.last_validated 
                        ? moment(table.last_validated).fromNow()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => handleRunValidation(table.name)}
                        disabled={runValidationMutation.isLoading}
                      >
                        {runValidationMutation.isLoading ? 'Running...' : 'Run Validation'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Results Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Validation Results
        </Typography>

        {runValidationMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error running validation: {runValidationMutation.error?.message}
          </Alert>
        )}

        {runValidationMutation.isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Validation completed successfully!
          </Alert>
        )}

        {resultsLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Table Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Anomalies</TableCell>
                  <TableCell>Validated At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultsData.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.table_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={result.status.toUpperCase()} 
                        color={getStatusColor(result.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={result.anomalies_count}
                        color={result.anomalies_count > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {moment(result.created_at).format('MMM DD, YYYY HH:mm')}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(result)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Validation Details: {selectedResult?.table_name}
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Status" 
                    secondary={selectedResult.status.toUpperCase()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Anomalies Found" 
                    secondary={selectedResult.anomalies_count}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Validation Time" 
                    secondary={moment(selectedResult.created_at).format('MMMM DD, YYYY HH:mm:ss')}
                  />
                </ListItem>
              </List>

              {selectedResult.details && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detailed Results
                  </Typography>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(selectedResult.details, null, 2)}
                  </pre>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ValidationResults;
