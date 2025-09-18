import { Box, Card, CardContent, Typography } from '@mui/material';

function StatCard({ title, value, subtitle, icon }) {
  
  return (
    <Card 
      elevation={0}
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          transition: 'border-color 0.2s ease',
        },
      })}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={(theme) => ({ 
                color: theme.palette.text.secondary,
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              })}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={(theme) => ({ 
                color: theme.palette.text.primary,
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                lineHeight: 1.2,
              })}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={(theme) => ({ 
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  fontSize: '0.875rem',
                })}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box 
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 1.5,
                backgroundColor: `${theme.palette.primary.main}1A`,
                color: theme.palette.primary.main,
                '& .MuiSvgIcon-root': {
                  fontSize: 24,
                },
              })}
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
