import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { apiCalls } from '../api/api';

export default function Runs() {
  const [runs, setRuns] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    scenarioId: '',
    userIds: [],
    environment: 'staging',
    runMode: 'headless',
    runCount: 1,
    runtimeVars: {
      username: 'testuser',
      password: 'pass123',
      baseUrl: 'http://localhost:4000',
      expectedText: 'Login successful',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [runsData, scenariosData, usersData] = await Promise.all([
        apiCalls.getRuns(),
        apiCalls.getScenarios(),
        apiCalls.getUsers(),
      ]);
      setRuns(runsData);
      setScenarios(scenariosData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (run = null) => {
    if (run) {
      setFormData({
        scenarioId: run.scenarioId,
        userIds: run.userIds || [],
        environment: run.environment,
        runMode: run.runMode,
        runCount: run.runCount,
        runtimeVars: run.runtimeVars || formData.runtimeVars,
      });
      setEditingId(run.id);
    } else {
      setFormData({
        scenarioId: '',
        userIds: [],
        environment: 'staging',
        runMode: 'headless',
        runCount: 1,
        runtimeVars: {
          username: 'testuser',
          password: 'pass123',
          baseUrl: 'http://localhost:4000',
          expectedText: 'Login successful',
        },
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.scenarioId) {
      alert('Please select a scenario');
      return;
    }

    try {
      const scenario = scenarios.find((s) => s.id === parseInt(formData.scenarioId));
      const dataToSave = {
        ...formData,
        scenarioId: parseInt(formData.scenarioId),
        scenarioName: scenario?.name,
      };

      if (editingId) {
        await apiCalls.updateRun(editingId, dataToSave);
        setRuns(runs.map(r => r.id === editingId ? { ...r, ...dataToSave } : r));
      } else {
        const newRun = await apiCalls.addRun(dataToSave);
        setRuns([...runs, newRun]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving run:', error);
      alert('Failed to save run');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this run?')) {
      try {
        await apiCalls.deleteRun(id);
        setRuns(runs.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting run:', error);
        alert('Failed to delete run');
      }
    }
  };

  const handleExecute = async (runId) => {
    const run = runs.find(r => r.id === runId);
    if (!run) return;

    try {
      alert(
        `Executing scenario: ${run.scenarioName}\nMode: ${run.runMode}\nEnvironment: ${run.environment}\n\nThis would send the request to the backend in a live environment.`
      );
      // In a real app, you would call: await apiCalls.executeScenario(runId, run);
    } catch (error) {
      console.error('Error executing run:', error);
      alert('Failed to execute run');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Test Runs
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure and execute test scenarios
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          New Run
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Create and configure test runs with your scenarios. Each run can be executed in headless or headed mode.
      </Alert>

      {/* Runs Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Scenario</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Environment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mode</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Run Count</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">No runs configured</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                  <TableRow key={run.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{run.scenarioName}</TableCell>
                    <TableCell>
                      <Chip label={run.environment} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={run.runMode}
                        size="small"
                        color={run.runMode === 'headless' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{run.runCount}x</TableCell>
                    <TableCell>
                      <Chip
                        label={run.status}
                        color={
                          run.status === 'Completed'
                            ? 'success'
                            : run.status === 'In Progress'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleExecute(run.id)}
                        color="success"
                        title="Execute"
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(run)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(run.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Run Configuration' : 'Create New Run'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Scenario</InputLabel>
                <Select
                  value={formData.scenarioId}
                  label="Scenario"
                  onChange={(e) => setFormData({ ...formData, scenarioId: e.target.value })}
                >
                  <MenuItem value="">-- Select Scenario --</MenuItem>
                  {scenarios.map((scenario) => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={formData.environment}
                  label="Environment"
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                >
                  <MenuItem value="staging">Staging</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="development">Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Run Mode</InputLabel>
                <Select
                  value={formData.runMode}
                  label="Run Mode"
                  onChange={(e) => setFormData({ ...formData, runMode: e.target.value })}
                >
                  <MenuItem value="headless">Headless</MenuItem>
                  <MenuItem value="headed">Headed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Run Count"
                value={formData.runCount}
                onChange={(e) =>
                  setFormData({ ...formData, runCount: parseInt(e.target.value) || 1 })
                }
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Runtime Variables (JSON)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={JSON.stringify(formData.runtimeVars, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({
                      ...formData,
                      runtimeVars: JSON.parse(e.target.value),
                    });
                  } catch (err) {
                    // Keep the original if JSON is invalid
                  }
                }}
                sx={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                Update the runtime variables that will be used during execution. These are accessible
                as `vars` inside your functions.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
