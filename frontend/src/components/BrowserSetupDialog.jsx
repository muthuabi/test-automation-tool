import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  TextField,
  IconButton,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const BrowserSetupDialog = ({ open, browsersInstalled, command, instructions, onRetry, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (browsersInstalled) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: 'success.main' }} />
            Browser Setup Complete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Playwright browsers are installed and ready to use!
          </Alert>
          <Typography>
            Your test execution can now proceed without any issues. Click "Continue" to start your tests.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: 'warning.main' }} />
          Browser Drivers Not Found
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          Playwright browser drivers are not installed on your system. They need to be installed before tests can run.
        </Alert>

        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
          Installation Command:
        </Typography>
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <span style={{ fontSize: '0.9rem', overflow: 'auto' }}>{command}</span>
          <IconButton
            size="small"
            onClick={handleCopyCommand}
            sx={{ ml: 1 }}
            title="Copy command"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Paper>
        {copied && (
          <Typography variant="caption" sx={{ color: 'success.main', display: 'block', mb: 2 }}>
            ✓ Command copied to clipboard
          </Typography>
        )}

        {instructions && instructions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Steps to Install:
            </Typography>
            <List dense>
              {instructions.map((instruction, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {index + 1}.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText primary={instruction} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Installation takes 1-5 minutes</strong> and downloads browser binaries. Make sure you have stable internet
            connection.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onRetry} variant="contained">
          Retry (Check if installed)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrowserSetupDialog;
