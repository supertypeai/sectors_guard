import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardAPI, sheetAPI } from '../services/api';
import { getCachedSheet, setCachedSheet } from '../services/sheetCache';

const STATUS_COLORS = {
  Success: (theme) => theme.palette.success.main,
  success: (theme) => theme.palette.success.main,
  Failure: (theme) => theme.palette.error.main,
  failure: (theme) => theme.palette.error.main,
  Running: (theme) => theme.palette.primary.light,
  in_progress: (theme) => theme.palette.primary.light,
  Queued: (theme) => theme.palette.warning.main,
  queued: (theme) => theme.palette.warning.main,
  Unknown: (theme) => theme.palette.text.secondary,
  unknown: (theme) => theme.palette.text.secondary,
  cancelled: (theme) => theme.palette.text.secondary,
};

function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={status || 'Unknown'}
      sx={{
        backgroundColor: (theme) => `${(STATUS_COLORS[status] || STATUS_COLORS.Unknown)(theme)}33`,
        color: (theme) => (STATUS_COLORS[status] || STATUS_COLORS.Unknown)(theme),
        fontWeight: 600,
      }}
    />
  );
}

// Helper to sort runs by created_at desc and return top N (default 3)
function topRuns(runs = [], limit = 3) {
  try {
    return (runs || [])
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  } catch (e) {
    return (runs || []).slice(0, limit);
  }
}

export default function Workflows() {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState('all');
  // Cache-aware fetcher: try localStorage (today) first; only hit network if missing
  const fetchSheet = async () => {
    const cached = getCachedSheet();
    if (cached && Array.isArray(cached)) {
      // mimic axios-like shape expected below by returning { data: { data: cached } }
      return { data: { data: cached } };
    }
    const resp = await sheetAPI.getSheetJson();
    const rows = resp?.data?.data || [];
    setCachedSheet(rows);
    return resp;
  };

  const { data, isLoading, error } = useQuery('sheet-json', fetchSheet, {
    refetchInterval: 60_000,
  });

  const { data: githubActionsData, isLoading: githubActionsLoading, error: githubActionsError } = useQuery(
    'github-actions',
    dashboardAPI.getGithubActionsStatus,
    {
      refetchInterval: 86400_000, // Refresh every 24 hours
    }
  );

  const rows = data?.data?.data || [];
  const httpStatus = data?.status;
  const githubActions = githubActionsData?.data || {};

  // Filter rows based on selected status
  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') {
      return rows;
    }
    return rows.filter(row => row['Last Run Status'] === statusFilter);
  }, [rows, statusFilter]);

  // Get unique status values for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(rows.map(row => row['Last Run Status']).filter(Boolean))];
    return statuses.sort();
  }, [rows]);

  const metrics = useMemo(() => {
    const currentRows = data?.data?.data || [];
    const total = currentRows.length;
    const byStatus = currentRows.reduce((acc, r) => {
      const s = r['Last Run Status'] || 'Unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const successes = byStatus['Success'] || 0;
    const failures = byStatus['Failure'] || 0;
    const successRate = total ? Math.round((successes / total) * 100) : 0;
    return { total, successes, failures, byStatus, successRate };
  }, [data?.data?.data]);

  const pieData = useMemo(() => {
    return Object.entries(metrics.byStatus).map(([name, value]) => ({ name, value }));
  }, [metrics]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Workflows Monitor
      </Typography>

      {httpStatus === 204 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No cached sheet found yet. Trigger a fetch on the backend, then refresh.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load sheet data: {error.message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Total Workflows</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{metrics.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Successes</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: (theme) => theme.palette.success.main }}>{metrics.successes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Failures</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: (theme) => theme.palette.error.main }}>{metrics.failures}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Success Rate</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{metrics.successRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Status Distribution</Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
                      {pieData.map((entry, index) => {
                        const getColor = STATUS_COLORS[entry.name] || STATUS_COLORS.Unknown;
                        return <Cell key={`cell-${index}`} fill={getColor(theme)} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Checks</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status Filter"
                  >
                    <MenuItem value="all">All</MenuItem>
                    {uniqueStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Repo</TableCell>
                      <TableCell>Workflow</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Success</TableCell>
                      <TableCell>Last Failure</TableCell>
                      <TableCell>Last Checked</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{r.Owner}/{r.Repo}</TableCell>
                        <TableCell>{r['Workflow File']}</TableCell>
                        <TableCell><StatusChip status={r['Last Run Status']} /></TableCell>
                        <TableCell>{r['Last Success'] || '—'}</TableCell>
                        <TableCell>{r['Last Failure'] || '—'}</TableCell>
                        <TableCell>{r['Last Checked'] || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* GitHub Actions Status Section */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, mt: 4 }}>
        GitHub Actions Status
      </Typography>

      {githubActionsError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Failed to load GitHub Actions status: {githubActionsError.message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Check API Workflow */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Periwatch API Check
              </Typography>
              {githubActionsLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status:</Typography>
                    <StatusChip status={githubActions.check_api?.status || 'unknown'} />
                  </Box>
                  {githubActions.check_api?.last_run && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Last Run: {new Date(githubActions.check_api.last_run).toLocaleString()}
                    </Typography>
                  )}
                  {githubActions.check_api?.last_success && (
                    <Typography variant="body2" sx={{ color: 'success.main', mb: 1 }}>
                      Last Success: {new Date(githubActions.check_api.last_success).toLocaleString()}
                    </Typography>
                  )}
                  {githubActions.check_api?.last_failure && (
                    <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
                      Last Failure: {new Date(githubActions.check_api.last_failure).toLocaleString()}
                    </Typography>
                  )}
                  {githubActions.check_api?.runs?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Recent Runs:
                      </Typography>
                        {topRuns(githubActions.check_api.runs, 3).map((run, idx) => (
                        <Box key={run.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <StatusChip status={run.status} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date(run.created_at).toLocaleString()}
                          </Typography>
                          {run.html_url && (
                            <Link 
                              href={run.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ fontSize: '0.75rem' }}
                            >
                              View
                            </Link>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Fetch Sheet Workflow */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Sheet Fetch Workflow
              </Typography>
              {githubActionsLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status:</Typography>
                    <StatusChip status={githubActions.fetch_sheet?.status || 'unknown'} />
                  </Box>
                  {githubActions.fetch_sheet?.last_run && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Last Run: {new Date(githubActions.fetch_sheet.last_run).toLocaleString()}
                    </Typography>
                  )}
                  {githubActions.fetch_sheet?.last_success && (
                    <Typography variant="body2" sx={{ color: 'success.main', mb: 1 }}>
                      Last Success: {new Date(githubActions.fetch_sheet.last_success).toLocaleString()}
                    </Typography>
                  )}
                  {githubActions.fetch_sheet?.last_failure && (
                    <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
                      Last Failure: {new Date(githubActions.fetch_sheet.last_failure).toLocaleString()}
                    </Typography>
                  )}
                  {githubActions.fetch_sheet?.runs?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Recent Runs:
                      </Typography>
                      {topRuns(githubActions.fetch_sheet.runs, 3).map((run, idx) => (
                        <Box key={run.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <StatusChip status={run.status} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date(run.created_at).toLocaleString()}
                          </Typography>
                          {run.html_url && (
                            <Link 
                              href={run.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ fontSize: '0.75rem' }}
                            >
                              View
                            </Link>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
