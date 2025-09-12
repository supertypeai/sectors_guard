import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';

// Chart components for each table
import AllTimePriceChart from '../components/charts/AllTimePriceChart';
import AnnualFinancialsChart from '../components/charts/AnnualFinancialsChart';
import DailyDataChart from '../components/charts/DailyDataChart';
import DividendChart from '../components/charts/DividendChart';
import FilingsChart from '../components/charts/FilingsChart';
import QuarterlyFinancialsChart from '../components/charts/QuarterlyFinancialsChart';
import StockSplitChart from '../components/charts/StockSplitChart';

const Visualization = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSymbols, setAvailableSymbols] = useState([]);

  // Table configurations
  const tables = [
    {
      id: 'idx_daily_data',
      name: 'Daily Data',
      description: 'Daily stock prices, volume, and market cap',
      component: DailyDataChart
    },
    {
      id: 'idx_dividend',
      name: 'Dividend',
      description: 'Dividend payments and yields',
      component: DividendChart
    },
    {
      id: 'idx_combine_financials_quarterly',
      name: 'Quarterly Financials',
      description: 'Quarterly financial statements',
      component: QuarterlyFinancialsChart
    },
    {
      id: 'idx_combine_financials_annual',
      name: 'Annual Financials',
      description: 'Annual financial statements',
      component: AnnualFinancialsChart
    },
    {
      id: 'idx_all_time_price',
      name: 'All-Time Prices',
      description: 'Historical highs and lows',
      component: AllTimePriceChart
    },
    {
      id: 'idx_stock_split',
      name: 'Stock Splits',
      description: 'Stock split events',
      component: StockSplitChart
    },
    {
      id: 'idx_filings',
      name: 'Filings',
      description: 'Corporate filings and insider trading',
      component: FilingsChart
    }
  ];

  const currentTable = tables[activeTab];

  // Base API URL from env with fallback to localhost for local dev.
  const API_HOST = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const API_BASE = `${API_HOST.replace(/\/+$/, '')}/api`;

  // Load available symbols on component mount
  useEffect(() => {
    loadAvailableSymbols();
  }, [loadAvailableSymbols]);

  const loadAvailableSymbols = useCallback(async () => {
    try {
      // Get unique symbols from daily data as it has the most comprehensive symbol list
  const response = await axios.get(`${API_BASE}/dashboard/table-data/idx_daily_data`, {
        params: {
          start_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
          end_date: moment().format('YYYY-MM-DD'),
          limit: 500
        }
      });
      
      if (response.data && response.data.data) {
        const symbols = [...new Set(response.data.data.map(item => item.symbol))].sort();
        setAvailableSymbols(symbols);
        if (symbols.length > 0 && !selectedSymbol) {
          setSelectedSymbol(symbols[0]); // Set first symbol as default
        }
      }
    } catch (err) {
      console.error('Error loading symbols:', err);
      // Fallback to common Indonesian stock symbols
      setAvailableSymbols(['BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'TLKM.JK', 'ASII.JK']);
      if (!selectedSymbol) {
        setSelectedSymbol('BBCA.JK');
      }
    }
  }, [API_BASE, selectedSymbol]);

  const loadData = useCallback(async () => {
    if (!selectedSymbol) {
      setError('Please select a symbol');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        symbol: selectedSymbol,
        start_date: startDate,
        end_date: endDate,
        limit: 1000
      };

  const response = await axios.get(`${API_BASE}/dashboard/table-data/${currentTable.id}`, {
        params
      });

      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setData([]);
        setError('No data found for the selected parameters');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.detail || 'Error loading data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, startDate, endDate, currentTable.id, API_BASE]);

  // Auto-load data when parameters change
  useEffect(() => {
    if (selectedSymbol) {
      loadData();
    }
  }, [activeTab, selectedSymbol, loadData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ChartComponent = currentTable.component;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
        IDX Data Visualization
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Interactive charts for Indonesian Stock Exchange data tables
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Stock Symbol</InputLabel>
              <Select
                value={selectedSymbol}
                label="Stock Symbol"
                onChange={(e) => setSelectedSymbol(e.target.value)}
              >
                {availableSymbols.map((symbol) => (
                  <MenuItem key={symbol} value={symbol}>
                    {symbol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              onClick={loadData}
              fullWidth
              disabled={loading || !selectedSymbol}
            >
              {loading ? <CircularProgress size={24} /> : 'Load Data'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tables.map((table, index) => (
            <Tab
              key={table.id}
              label={table.name}
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Table Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.dark', color: 'info.contrastText' }}>
        <Typography variant="h6">{currentTable.name}</Typography>
        <Typography variant="body2">{currentTable.description}</Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Table: {currentTable.id}
        </Typography>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Chart */}
      <Paper sx={{ p: 3, minHeight: 500 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress />
          </Box>
        ) : (
          <ChartComponent 
            data={data} 
            symbol={selectedSymbol}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </Paper>

      {/* Data Summary */}
      {!loading && data.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.dark', color: 'success.contrastText' }}>
          <Typography variant="h6">Data Summary</Typography>
          <Typography variant="body2">
            Loaded {data.length} records for {selectedSymbol} from {startDate} to {endDate}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Visualization;
