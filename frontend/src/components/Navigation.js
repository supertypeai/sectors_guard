import {
    Assessment as AssessmentIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    BarChart as VisualizationIcon
} from '@mui/icons-material';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: 'Validation',
    icon: <AssessmentIcon />,
    path: '/validation-results',
  },
  {
    text: 'Visualization',
    icon: <VisualizationIcon />,
    path: '/visualization',
  },
  {
    text: 'Table Configuration',
    icon: <SettingsIcon />,
    path: '/table-configuration',
  },
];

function Navigation() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          position: 'relative',
          backgroundColor: '#1a1a2e',
          border: 'none',
          borderRight: '1px solid rgba(37, 99, 235, 0.2)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 1.5,
                  color: '#94a3b8',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: '#ffffff',
                    '& .MuiListItemIcon-root': {
                      color: '#2563eb',
                    },
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.dark,
                    color: '#ffffff',
                    '& .MuiListItemIcon-root': {
                      color: '#2563eb',
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Navigation;
