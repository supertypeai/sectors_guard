import { ShowChart } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme
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
  const theme = useTheme();
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
  const API_HOST = process.env.REACT_APP_API_URL || 'http://localhost:8000' || 'http://localhost:8080';
  const API_BASE = `${API_HOST.replace(/\/+$/, '')}/api`;

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

  // Load available symbols on component mount
  useEffect(() => {
    loadAvailableSymbols();
  }, [loadAvailableSymbols]);

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
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            <ShowChart />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
              IDX Data Visualization
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Interactive charts for Indonesian Stock Exchange data tables
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Controls */}
      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Parameters</Typography>
          </Box>
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
        </CardContent>
      </Card>

      {/* Table Tabs */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
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
        </CardContent>
      </Card>

      {/* Table Info */}
      <Card sx={{ borderRadius: 2, mb: 3, background: (theme) => alpha(theme.palette.primary.main, 0.06), border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant={"h6"} sx={{ color: 'text.primary' }}>{currentTable.name}</Typography>
          <Typography variant={"body2"} sx={{ color: 'text.secondary' }}>{currentTable.description}</Typography>
          <Typography variant={"caption"} sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
            Table: {currentTable.id}
          </Typography>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Chart */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3, minHeight: 500 }}>
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
        </CardContent>
      </Card>

      {/* Data Summary */}
      {!loading && data.length > 0 && (
        <Card sx={{ borderRadius: 2, mt: 3, background: (theme) => alpha(theme.palette.success.main, 0.06), border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant={"h6"} sx={{ color: 'success.main' }}>Data Summary</Typography>
            <Typography variant={"body2"} sx={{ color: 'text.secondary' }}>
              Loaded {data.length} records for {selectedSymbol} from {startDate} to {endDate}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Visualization;
