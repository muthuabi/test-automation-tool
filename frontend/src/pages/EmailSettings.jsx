import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { apiCalls } from '../api/api';

export default function EmailSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [formData, setFormData] = useState({
    enabled: true,
    smtpServer: '',
    fromAddress: '',
    recipientsList: [],
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiCalls.getSettings();
      if (data.email) {
        setFormData(data.email);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient && !formData.recipientsList.includes(newRecipient)) {
      setFormData({
        ...formData,
        recipientsList: [...formData.recipientsList, newRecipient],
      });
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email) => {
    setFormData({
      ...formData,
      recipientsList: formData.recipientsList.filter((e) => e !== email),
    });
  };

  const handleSave = async () => {
    if (!formData.smtpServer || !formData.fromAddress) {
      setMessage('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Create settings object in the format backend expects
      const settingsPayload = {
        email: {
          enabled: formData.enabled,
          smtpServer: formData.smtpServer,
          fromAddress: formData.fromAddress,
          recipientsList: formData.recipientsList,
          // Add other fields from formData
          ...Object.keys(formData)
            .filter(key => !['enabled', 'smtpServer', 'fromAddress', 'recipientsList'].includes(key))
            .reduce((acc, key) => {
              acc[key] = formData[key];
              return acc;
            }, {}),
        },
      };

      // Call the API to save
      const response = await apiCalls.updateSettings(settingsPayload);
      
      // Verify the save was successful
      if (response.results && response.results.email && response.results.email.success) {
        setMessage('✓ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else if (response.saved && response.saved.email) {
        setMessage('✓ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('⚠ Settings saved but verification failed. Please reload to confirm.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage(`❌ Failed to save settings: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Email Settings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Configure email notifications for test results
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, enabled: e.target.checked })
                    }
                  />
                }
                label="Enable Email Notifications"
              />
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Enable or disable email delivery of test results
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SMTP Server"
                placeholder="e.g., smtp.gmail.com"
                value={formData.smtpServer}
                onChange={(e) =>
                  setFormData({ ...formData, smtpServer: e.target.value })
                }
                required
                helperText="SMTP server address for sending emails"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="From Email Address"
                type="email"
                placeholder="automation@example.com"
                value={formData.fromAddress}
                onChange={(e) =>
                  setFormData({ ...formData, fromAddress: e.target.value })
                }
                required
                helperText="Email address that will send the notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Recipients Email List
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  type="email"
                  placeholder="recipient@example.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddRecipient();
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddRecipient}>
                  Add
                </Button>
              </Box>

              {formData.recipientsList.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.recipientsList.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveRecipient(email)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" color="textSecondary">
                  No recipients added yet
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Emails will be sent to all recipients in the list after each test execution
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
