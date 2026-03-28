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
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { apiCalls } from '../api/api';

export default function Functions() {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
  });

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    setLoading(true);
    try {
      const data = await apiCalls.getFunctions();
      setFunctions(data);
    } catch (error) {
      console.error('Error loading functions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (func = null) => {
    if (func) {
      setFormData({
        name: func.name,
        description: func.description,
        code: func.code,
      });
      setEditingId(func._id);
    } else {
      setFormData({
        name: '',
        description: '',
        code: `async function MyFunction(page, vars, selectors) {
  try {
    // await page.goto(vars.baseUrl + "/path");
    // await page.fill(selectors.selector_name, vars.variable_name);
    // await page.click(selectors.button_name);
    // await page.waitForSelector(selectors.element_name, { timeout: 5000 });
    
    return { success: true, message: 'Function executed successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}`,
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
    if (!formData.name) {
      alert('Function name is required');
      return;
    }
    if (!formData.code) {
      alert('Function code is required');
      return;
    }

    try {
      if (editingId) {
        await apiCalls.updateFunction(editingId, formData);
        setFunctions(functions.map(f => f._id === editingId ? { ...f, ...formData } : f));
      } else {
        const newFunction = await apiCalls.addFunction(formData);
        setFunctions([...functions, newFunction]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving function:', error);
      alert('Failed to save function');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this function?')) {
      try {
        await apiCalls.deleteFunction(id);
        setFunctions(functions.filter(f => f._id !== id));
      } catch (error) {
        console.error('Error deleting function:', error);
        alert('Failed to delete function');
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Automation Functions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create reusable JavaScript automation functions
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
          Create Function
        </Button>
      </Box>

      {/* Info Card */}
      <Card sx={{ mb: 3, backgroundColor: '#f0f4ff', borderLeft: '4px solid #667eea' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            📝 Function Template
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Functions receive three arguments:
          </Typography>
          <Typography variant="body2" component="div" sx={{ ml: 2, color: '#667eea', fontFamily: 'monospace' }}>
            • <strong>page</strong> - Playwright browser page object<br/>
            • <strong>vars</strong> - Runtime variables (username, password, baseUrl, etc.)<br/>
            • <strong>selectors</strong> - Page element selectors from your selector definitions
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Must return an object with success (boolean) and message (string).
          </Typography>
        </CardContent>
      </Card>

      {/* Functions Table */}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {functions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">No functions found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                functions.map((func) => (
                  <TableRow key={func._id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CodeIcon sx={{ fontSize: 20, color: '#667eea' }} />
                        {func.name}
                      </Box>
                    </TableCell>
                    <TableCell>{func.description}</TableCell>
                    <TableCell>{func.createdAt}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(func)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(func._id)}
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

      {/* Add/Edit Dialog with Code Editor */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Function' : 'Create New Function'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Function Name"
            placeholder="e.g., LoginToApp, ValidateHomePage"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="What does this function do?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
            Function Code
          </Typography>
          <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
            <Editor
              height="400px"
              defaultLanguage="javascript"
              value={formData.code}
              onChange={(value) => setFormData({ ...formData, code: value || '' })}
              theme="light"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                wordWrap: 'on',
              }}
            />
          </Box>
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
