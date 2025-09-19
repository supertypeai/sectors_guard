import { Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, setAuthToken } from '../services/api';

function Access() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const existing = getAuthToken();
    if (existing) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = token.trim();
    if (!trimmed) {
      setError('Please enter your access token');
      return;
    }
    setAuthToken(trimmed);
    navigate('/dashboard', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', p: 2, width: '100%' }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LockIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Access Required</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your API access token to continue.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="API Token"
              type={showToken ? 'text' : 'password'}
              fullWidth
              autoFocus
              value={token}
              onChange={(e) => setToken(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle token visibility"
                      onClick={() => setShowToken((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Continue
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Access;
