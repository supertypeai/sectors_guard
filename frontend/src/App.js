import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TableConfiguration from './pages/TableConfiguration';
import ValidationResults from './pages/ValidationResults';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IDX Data Validation Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Navigation />
        
        <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/validation-results" element={<ValidationResults />} />
            <Route path="/table-configuration" element={<TableConfiguration />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
