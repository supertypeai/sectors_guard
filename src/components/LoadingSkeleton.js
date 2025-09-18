import { Box, Card, CardContent, Skeleton } from '@mui/material';

function LoadingSkeleton({ type = 'card', count = 1 }) {
  if (type === 'statCard') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} sx={(theme) => ({ borderRadius: 2, height: '100%', backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` })}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Box>
                <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (type === 'chart') {
    return (
      <Card sx={(theme) => ({ borderRadius: 2, height: '100%', backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` })}>
        <CardContent sx={{ p: 4 }}>
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (type === 'table') {
    return (
      <Card sx={(theme) => ({ borderRadius: 4, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` })}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  // Default card skeleton
  return (
    <Card sx={(theme) => ({ borderRadius: 4, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` })}>
      <CardContent sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </CardContent>
    </Card>
  );
}

export default LoadingSkeleton;
