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
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { apiCalls } from '../api/api';

export default function AdoSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    enabled: true,
    projectUrl: '',
    pat: '',
    teamId: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiCalls.getSettings();
      if (data.ado) {
        setFormData(data.ado);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create settings object in the format backend expects
      const settingsPayload = {
        ado: {
          enabled: formData.enabled,
          projectUrl: formData.projectUrl,
          pat: formData.pat,
          teamId: formData.teamId,
          // Add other fields from formData
          ...Object.keys(formData)
            .filter(key => !['enabled', 'projectUrl', 'pat', 'teamId'].includes(key))
            .reduce((acc, key) => {
              acc[key] = formData[key];
              return acc;
            }, {}),
        },
      };

      // Call the API to save
      const response = await apiCalls.updateSettings(settingsPayload);
      
      // Verify the save was successful
      if (response.results && response.results.ado && response.results.ado.success) {
        setMessage('✓ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else if (response.saved && response.saved.ado) {
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
          ADO Settings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Configure integration with Azure DevOps
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
                label="Enable ADO Integration"
              />
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Enable or disable automatic updates to Azure DevOps work items
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ADO Project URL"
                placeholder="https://dev.azure.com/organization/project"
                value={formData.projectUrl}
                onChange={(e) =>
                  setFormData({ ...formData, projectUrl: e.target.value })
                }
                helperText="The base URL of your Azure DevOps project"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Personal Access Token (PAT)"
                type="password"
                value={formData.pat}
                onChange={(e) => setFormData({ ...formData, pat: e.target.value })}
                helperText="Your Azure DevOps PAT for authentication"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Team ID"
                placeholder="e.g., Core Team"
                value={formData.teamId}
                onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                helperText="The team or area to update work items in"
              />
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
