import { Analytics } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme
} from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TableConfiguration from './pages/TableConfiguration';
import ValidationResults from './pages/ValidationResults';
import Visualization from './pages/Visualization';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
    },
    background: {
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
    surface: {
      main: '#16213e',
      light: '#1e2a4a',
      dark: '#0e1627',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f0f23',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            borderColor: 'rgba(37, 99, 235, 0.4)',
            transition: 'border-color 0.2s ease',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          borderRadius: 8,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            borderColor: 'rgba(37, 99, 235, 0.4)',
            transition: 'border-color 0.2s ease',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#0f0f23',
        }}
      >
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            backgroundColor: '#1a1a2e',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Toolbar sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: '#2563eb',
                }}
              >
                <Analytics sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#ffffff',
                  }}
                >
                  Sectors Guard
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#94a3b8',
                    fontWeight: 400,
                  }}
                >
                  Indonesian Stock Exchange • Financial Data Monitoring
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexGrow: 1,
            backgroundColor: '#0f0f23',
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          <Navigation />
          
          <Container 
            component="main" 
            maxWidth="xl"
            sx={{ 
              flexGrow: 1, 
              py: 4,
              px: 3,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/validation-results" element={<ValidationResults />} />
              <Route path="/table-configuration" element={<TableConfiguration />} />
              <Route path="/visualization" element={<Visualization />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
