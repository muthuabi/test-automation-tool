import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Container,
  Divider,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  Settings as SettingsIcon,
  PlayCircle as PlayCircleIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  AutoFixHigh as AutoFixHighIcon,
  Extension as ExtensionIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../theme/theme';
import '../index.css';

const DRAWER_WIDTH = 280;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Users', icon: <PeopleIcon />, path: '/users' },
  { label: 'Selectors', icon: <LocationOnIcon />, path: '/selectors' },
  { label: 'Functions', icon: <CodeIcon />, path: '/functions' },
  { label: 'Scenarios', icon: <AutoFixHighIcon />, path: '/scenarios' },
  { label: 'Runs', icon: <PlayCircleIcon />, path: '/runs' },
  { label: 'Results', icon: <CheckCircleIcon />, path: '/results' },
  { label: 'Integrations', icon: <ExtensionIcon />, path: '/integrations' },
];

const settingsItems = [
  { label: 'ADO Settings', icon: <SettingsIcon />, path: '/settings/ado' },
  { label: 'Teams Settings', icon: <SettingsIcon />, path: '/settings/teams' },
  { label: 'Email Settings', icon: <SettingsIcon />, path: '/settings/email' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          backgroundColor: colors.primary,
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Test Automation
        </Typography>
        <Typography variant="caption">Tool</Typography>
      </Box>

      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                backgroundColor: isActive(item.path) ? alpha(colors.primary, 0.1) : 'transparent',
                borderLeft: isActive(item.path) ? `4px solid ${colors.primary}` : 'none',
                pl: isActive(item.path) ? '20px' : '24px',
                color: isActive(item.path) ? colors.primary : 'inherit',
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.05),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? colors.primary : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: 'block',
            fontWeight: 'bold',
            color: colors.textSecondary,
            textTransform: 'uppercase',
          }}
        >
          Settings
        </Typography>
        {settingsItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                backgroundColor: isActive(item.path) ? alpha(colors.primary, 0.1) : 'transparent',
                borderLeft: isActive(item.path) ? `4px solid ${colors.primary}` : 'none',
                pl: isActive(item.path) ? '20px' : '24px',
                color: isActive(item.path) ? colors.primary : 'inherit',
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.05),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? colors.primary : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: colors.primary,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Test Automation Tool
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar /> {/* This creates spacing under the AppBar */}
        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
