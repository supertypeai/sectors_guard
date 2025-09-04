import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

function StatCard({ title, value, subtitle, icon }) {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{
        backgroundColor: '#1a1a2e',
        borderRadius: 2,
        border: '1px solid rgba(37, 99, 235, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'rgba(37, 99, 235, 0.5)',
          transition: 'border-color 0.2s ease',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#94a3b8',
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                color: '#ffffff',
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#94a3b8',
                  fontWeight: 400,
                  fontSize: '0.875rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 1.5,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                '& .MuiSvgIcon-root': {
                  fontSize: 24,
                },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;
