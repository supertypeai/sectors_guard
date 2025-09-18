import { alpha, createTheme } from '@mui/material/styles';

const baseColors = {
  primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
  secondary: { main: '#64748b', light: '#94a3b8', dark: '#475569' },
  background: { default: '#0f1117', paper: '#151923' },
  surface: { main: '#16213e', light: '#1e2a4a', dark: '#0e1627' },
  success: { main: '#10b981', light: '#34d399', dark: '#047857' },
  error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
  warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
  text: { primary: '#ffffff', secondary: '#94a3b8' },
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: baseColors.primary,
    secondary: baseColors.secondary,
    background: baseColors.background,
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    text: baseColors.text,
    divider: alpha('#ffffff', 0.12),
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: baseColors.background.default, minHeight: '100vh' },
        '*': { boxSizing: 'border-box' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.background.paper,
          borderBottom: `1px solid ${alpha('#ffffff', 0.12)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: baseColors.background.paper,
          borderRight: `1px solid ${alpha('#ffffff', 0.12)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.background.paper,
          border: `1px solid ${alpha(baseColors.primary.main, 0.18)}`,
          boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.background.paper,
          border: `1px solid ${alpha(baseColors.primary.main, 0.18)}`,
          boxShadow: '0 6px 16px rgba(0,0,0,0.28)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: 'none' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: alpha(baseColors.primary.main, 0.18),
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha(baseColors.primary.main, 0.26),
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: baseColors.text.primary,
            backgroundColor: alpha('#ffffff', 0.04),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
