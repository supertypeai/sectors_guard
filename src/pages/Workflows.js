import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { sheetAPI } from '../services/api';

const STATUS_COLORS = {
  Success: (theme) => theme.palette.success.main,
  Failure: (theme) => theme.palette.error.main,
  Running: (theme) => theme.palette.primary.light,
  Queued: (theme) => theme.palette.warning.main,
  Unknown: (theme) => theme.palette.text.secondary,
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

export default function Workflows() {
  const theme = useTheme();
  const { data, isLoading, error } = useQuery('sheet-json', sheetAPI.getSheetJson, {
    refetchInterval: 60_000,
  });

  const rows = data?.data?.data || [];
  const httpStatus = data?.status;

  const metrics = useMemo(() => {
    const total = rows.length;
    const byStatus = rows.reduce((acc, r) => {
      const s = r['Last Run Status'] || 'Unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const successes = byStatus['Success'] || 0;
    const failures = byStatus['Failure'] || 0;
    const successRate = total ? Math.round((successes / total) * 100) : 0;
    return { total, successes, failures, byStatus, successRate };
  }, [rows]);

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
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Recent Checks</Typography>
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
                    {rows.map((r, idx) => (
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
    </Box>
  );
}
