import { ExpandMore, Search } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { useMemo, useState } from 'react';

function formatTitle(checkType) {
  return (checkType || 'anomaly').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function groupByCheck(anomalies) {
  const groups = {};

  anomalies.forEach((anomaly) => {
    if (!groups[anomaly.type]) {
      groups[anomaly.type] = { type: anomaly.type, severity: anomaly.severity, rows: [] };
    }

    groups[anomaly.type].rows.push(anomaly);
  });

  // Flagged checks first, then the biggest groups
  return Object.values(groups).sort((first, second) => {
    if (first.severity !== second.severity) {
      return first.severity === 'flagged' ? -1 : 1;
    }

    return second.rows.length - first.rows.length;
  });
}

// Anomalies grouped by type, one collapsible table per type.
// columns: [{ label, value: (row) => text, bold, muted }], the Detail column is
// always the anomaly's message. descriptions: { type: 'shown under the title' }
function GroupedAnomalies({ anomalies, columns, descriptions }) {
  const [symbolFilter, setSymbolFilter] = useState('');

  const groups = useMemo(() => {
    const filter = symbolFilter.trim().toUpperCase();

    const filtered = filter
      ? anomalies.filter((anomaly) => (anomaly.symbol || '').toUpperCase().includes(filter))
      : anomalies;

    return groupByCheck(filtered);
  }, [anomalies, symbolFilter]);

  return (
    <Box>
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}
      >
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          Anomalies by check
        </Typography>
        <TextField
          size="small"
          placeholder="Filter by symbol, e.g. D05"
          value={symbolFilter}
          onChange={(event) => setSymbolFilter(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {groups.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No anomalies for this symbol
        </Typography>
      )}

      {groups.map((group) => (
        <Accordion
          key={group.type}
          disableGutters
          sx={{
            mb: 1,
            borderRadius: 2,
            '&:before': { display: 'none' },
            background: (theme) => alpha(theme.palette.background.paper, 0.6),
            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ flex: 1, pr: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {formatTitle(group.type)}
                </Typography>
                <Chip label={group.rows.length} size="small" />
                {/* Same severity chip as the plain anomaly list in ValidationResults */}
                <Chip
                  label={(group.severity || 'info').toUpperCase()}
                  size="small"
                  sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12), color: 'warning.main' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {descriptions[group.type] || ''}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ pt: 0 }}>
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.label}>{column.label}</TableCell>
                    ))}
                    <TableCell>Detail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.rows.map((row, index) => (
                    <TableRow key={index} hover>
                      {columns.map((column) => (
                        <TableCell
                          key={column.label}
                          sx={{
                            whiteSpace: 'nowrap',
                            fontWeight: column.bold ? 600 : 400,
                            color: column.muted ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {column.value(row) || '-'}
                        </TableCell>
                      ))}
                      <TableCell>{row.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

export default GroupedAnomalies;
