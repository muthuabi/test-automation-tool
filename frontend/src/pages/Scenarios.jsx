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
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { apiCalls } from '../api/api';

export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    functionIds: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scenariosData, functionsData] = await Promise.all([
        apiCalls.getScenarios(),
        apiCalls.getFunctions(),
      ]);
      setScenarios(scenariosData);
      setFunctions(functionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (scenario = null) => {
    if (scenario) {
      setFormData({
        name: scenario.name,
        description: scenario.description,
        functionIds: [...scenario.functionIds],
      });
      setEditingId(scenario.id);
    } else {
      setFormData({
        name: '',
        description: '',
        functionIds: [],
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleAddFunction = (funcId) => {
    if (!formData.functionIds.includes(funcId)) {
      setFormData({
        ...formData,
        functionIds: [...formData.functionIds, funcId],
      });
    }
  };

  const handleRemoveFunction = (index) => {
    setFormData({
      ...formData,
      functionIds: formData.functionIds.filter((_, i) => i !== index),
    });
  };

  const handleMoveFunction = (index, direction) => {
    const newIds = [...formData.functionIds];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
    setFormData({ ...formData, functionIds: newIds });
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Scenario name is required');
      return;
    }
    if (formData.functionIds.length === 0) {
      alert('Please add at least one function');
      return;
    }

    try {
      const functionNames = formData.functionIds.map((id) => {
        const func = functions.find((f) => f.id === id);
        return func ? func.name : '';
      });

      const dataToSave = {
        name: formData.name,
        description: formData.description,
        functionIds: formData.functionIds,
        functionNames: functionNames,
      };

      if (editingId) {
        await apiCalls.updateScenario(editingId, dataToSave);
        setScenarios(scenarios.map(s => s.id === editingId ? { ...s, ...dataToSave } : s));
      } else {
        const newScenario = await apiCalls.addScenario(dataToSave);
        setScenarios([...scenarios, newScenario]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving scenario:', error);
      alert('Failed to save scenario');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scenario?')) {
      try {
        await apiCalls.deleteScenario(id);
        setScenarios(scenarios.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting scenario:', error);
        alert('Failed to delete scenario');
      }
    }
  };

  const selectedFunctionNames = formData.functionIds.map((id) => {
    const func = functions.find((f) => f.id === id);
    return func ? func.name : '';
  });

  const availableFunctions = functions.filter(
    (f) => !formData.functionIds.includes(f.id)
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Test Scenarios
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Build test scenarios by combining automation functions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Create Scenario
        </Button>
      </Box>

      {/* Scenarios Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Functions</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scenarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">No scenarios found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                scenarios.map((scenario) => (
                  <TableRow key={scenario.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{scenario.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {scenario.functionNames && scenario.functionNames.map((name, idx) => (
                          <Chip
                            key={idx}
                            label={name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{scenario.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={scenario.status || 'Active'}
                        color={scenario.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(scenario)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(scenario.id)}
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
          {editingId ? 'Edit Scenario' : 'Create New Scenario'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Scenario Name"
            placeholder="e.g., Complete Login Flow"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="What does this scenario test?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            Selected Functions (Execution Order)
          </Typography>

          {formData.functionIds.length > 0 ? (
            <Paper sx={{ backgroundColor: '#f9f9f9', mb: 2 }}>
              <List dense>
                {formData.functionIds.map((funcId, index) => {
                  const func = functions.find((f) => f.id === funcId);
                  return (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            edge="end"
                            size="small"
                            disabled={index === 0}
                            onClick={() => handleMoveFunction(index, 'up')}
                          >
                            <ArrowUpIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            disabled={index === formData.functionIds.length - 1}
                            onClick={() => handleMoveFunction(index, 'down')}
                          >
                            <ArrowDownIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={`${index + 1}. ${func?.name || 'Unknown'}`}
                        secondary={func?.description}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          ) : (
            <Card sx={{ mb: 2, backgroundColor: '#f0f4ff' }}>
              <CardContent>
                <Typography color="textSecondary" align="center">
                  No functions added yet. Select functions below.
                </Typography>
              </CardContent>
            </Card>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Available Functions
          </Typography>
          {availableFunctions.length > 0 ? (
            <FormControl fullWidth>
              <InputLabel>Add Function</InputLabel>
              <Select
                label="Add Function"
                onChange={(e) => {
                  handleAddFunction(e.target.value);
                  e.target.value = '';
                }}
                value=""
              >
                <MenuItem value="">-- Select a function --</MenuItem>
                {availableFunctions.map((func) => (
                  <MenuItem key={func.id} value={func.id}>
                    {func.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2" color="textSecondary">
              All available functions have been added.
            </Typography>
          )}
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
