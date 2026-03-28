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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { apiCalls } from '../api/api';

export default function Selectors() {
  const [selectors, setSelectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    page: '',
    description: '',
  });

  useEffect(() => {
    loadSelectors();
  }, []);

  const loadSelectors = async () => {
    setLoading(true);
    try {
      const data = await apiCalls.getSelectors();
      setSelectors(data);
    } catch (error) {
      console.error('Error loading selectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (selector = null) => {
    if (selector) {
      setFormData({
        name: selector.name,
        value: selector.value,
        page: selector.page,
        description: selector.description,
      });
      setEditingId(selector._id);
    } else {
      setFormData({
        name: '',
        value: '',
        page: '',
        description: '',
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
    if (!formData.name || !formData.value) {
      alert('Name and Value are required');
      return;
    }

    try {
      if (editingId) {
        await apiCalls.updateSelector(editingId, formData);
        setSelectors(selectors.map(s => s._id === editingId ? { ...s, ...formData } : s));
      } else {
        const newSelector = await apiCalls.addSelector(formData);
        setSelectors([...selectors, newSelector]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving selector:', error);
      alert('Failed to save selector');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this selector?')) {
      try {
        await apiCalls.deleteSelector(id);
        setSelectors(selectors.filter(s => s._id !== id));
      } catch (error) {
        console.error('Error deleting selector:', error);
        alert('Failed to delete selector');
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Selectors
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Define page element selectors for automation
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
          Add Selector
        </Button>
      </Box>

      {/* Selectors Table */}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Page</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">No selectors found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                selectors.map((selector) => (
                  <TableRow key={selector._id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>
                      {selector.name}
                    </TableCell>
                    <TableCell>
                      <code>{selector.value}</code>
                    </TableCell>
                    <TableCell>{selector.page}</TableCell>
                    <TableCell>{selector.description}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(selector)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(selector._id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Selector' : 'Add New Selector'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Selector Name"
            placeholder="e.g., login_username"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="CSS/XPath Selector"
            placeholder="e.g., #username or .login-input"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Page"
            placeholder="e.g., login, home, settings"
            value={formData.page}
            onChange={(e) => setFormData({ ...formData, page: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="What does this selector target?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
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
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
