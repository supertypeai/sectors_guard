import { Analytics } from '@mui/icons-material';
import { AppBar, Box, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TableConfiguration from './pages/TableConfiguration';
import ValidationResults from './pages/ValidationResults';
import Visualization from './pages/Visualization';
import Workflows from './pages/Workflows';
import Access from './pages/Access';
import { getAuthToken } from './services/api';

function ProtectedRoute({ children }) {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/access" replace />;
  }
  return children;
}

function App() {
  const location = useLocation();
  const isAccessPage = location.pathname === '/access';
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
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
                  backgroundColor: (theme) => theme.palette.primary.main,
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
                    color: (theme) => theme.palette.text.primary,
                  }}
                >
                  Sectors Guard
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: (theme) => theme.palette.text.secondary,
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
            backgroundColor: (theme) => theme.palette.background.default,
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          {!isAccessPage && <Navigation />}
          
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
              <Route path="/access" element={<Access />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/validation-results" element={
                <ProtectedRoute>
                  <ValidationResults />
                </ProtectedRoute>
              } />
              <Route path="/table-configuration" element={
                <ProtectedRoute>
                  <TableConfiguration />
                </ProtectedRoute>
              } />
              <Route path="/visualization" element={
                <ProtectedRoute>
                  <Visualization />
                </ProtectedRoute>
              } />
              <Route path="/workflows" element={
                <ProtectedRoute>
                  <Workflows />
                </ProtectedRoute>
              } />
            </Routes>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default App;
