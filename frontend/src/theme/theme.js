import { createTheme } from '@mui/material/styles';

/**
 * CENTRALIZED THEME CONFIGURATION
 * 
 * Edit this file to change colors across the entire application.
 * No need to update colors in individual components - they inherit from this theme.
 * 
 * For Caterpillar Branding:
 * - Primary: Caterpillar yellow (#FFEB3B or similar)
 * - Secondary: Caterpillar gray/black
 * - Accent: Caterpillar green (optional)
 */

// ============================================
// COLOR PALETTE CONFIGURATION
// ============================================
const colors = {
  // PRIMARY COLORS - Clean blue
  primary: '#1976d2',           // Professional blue
  primaryLight: '#42a5f5',
  primaryDark: '#1565c0',

  // SECONDARY COLORS - Dark gray/black
  secondary: '#212121',         // Dark text/background
  secondaryLight: '#424242',
  secondaryDark: '#000000',

  // ACCENT COLORS - Light gray for neutral
  accent: '#757575',            // Medium gray
  accentLight: '#bdbdbd',
  accentDark: '#424242',

  // TEXT COLORS
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#bdbdbd',
  textHint: '#9e9e9e',

  // BACKGROUND COLORS
  background: '#ffffff',
  backgroundLight: '#f5f5f5',
  backgroundAlt: '#fafafa',

  // STATUS COLORS
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',

  // BORDER & DIVIDER
  border: '#e0e0e0',
  divider: '#e0e0e0',

  // SURFACE COLORS
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
};

// ============================================
// THEME CREATION
// ============================================
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
    info: {
      main: colors.info,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textDisabled,
      hint: colors.textHint,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    divider: colors.divider,
  },

  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.textPrimary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: colors.textPrimary,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: colors.textPrimary,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.textPrimary,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.textPrimary,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: colors.textPrimary,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: colors.textSecondary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: colors.textSecondary,
    },
    body1: {
      fontSize: '1rem',
      color: colors.textPrimary,
    },
    body2: {
      fontSize: '0.875rem',
      color: colors.textSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  components: {
    // AppBar customization
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },

    // Button customization
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        outlined: {
          borderColor: colors.border,
        },
      },
    },

    // Card customization
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.border}`,
        },
      },
    },

    // TextField customization
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },

    // Drawer customization
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
        },
      },
    },

    // Chip customization
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },

    // Tab customization
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 700,
          },
        },
      },
    },

    // Alert customization
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },

  shape: {
    borderRadius: 8,
  },

  spacing: 8,
});

// ============================================
// CUSTOM COLOR EXPORT
// ============================================
export { colors };
export default theme;
