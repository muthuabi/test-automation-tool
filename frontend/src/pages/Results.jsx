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
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { apiCalls } from '../api/api';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await apiCalls.getResults();
      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedResult(null);
  };

  const handleDownload = (result) => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `result-${result.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        setResults(results.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting result:', error);
        alert('Failed to delete result');
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Execution Results
          </Typography>
          <Typography variant="body2" color="textSecondary">
            View and analyze test execution results
          </Typography>
        </Box>
        <Button variant="outlined" onClick={loadResults}>
          Refresh
        </Button>
      </Box>

      {/* Results Table */}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Environment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Executed At</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                      No results found. Execute a scenario to see results.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{result.scenarioName}</TableCell>
                    <TableCell>
                      <Chip
                        label={result.status}
                        color={result.status === 'Passed' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{result.environment}</TableCell>
                    <TableCell>{(result.executionTime / 1000).toFixed(2)}s</TableCell>
                    <TableCell>{result.startTime}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(result)}
                        color="primary"
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(result)}
                        color="primary"
                        title="Download JSON"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(result.id)}
                        color="error"
                        title="Delete"
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

      {/* Details Dialog */}
      {selectedResult && (
        <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Execution Details - {selectedResult.scenarioName}
            <Chip
              label={selectedResult.status}
              color={selectedResult.status === 'Passed' ? 'success' : 'error'}
              size="small"
              sx={{ ml: 2 }}
            />
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {/* Summary */}
            <Card sx={{ mb: 2, backgroundColor: '#f9f9f9' }}>
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Execution Time
                    </Typography>
                    <Typography variant="h6">
                      {(selectedResult.executionTime / 1000).toFixed(2)}s
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Environment
                    </Typography>
                    <Typography variant="h6">{selectedResult.environment}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Run Mode
                    </Typography>
                    <Typography variant="h6">{selectedResult.runMode}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Started At
                    </Typography>
                    <Typography variant="h6">{selectedResult.startTime}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Function Results */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Function Results
            </Typography>
            {selectedResult.functionResults && selectedResult.functionResults.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {selectedResult.functionResults.map((funcResult, idx) => (
                  <Accordion key={idx}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Chip
                        label={funcResult.status}
                        color={funcResult.status === 'Passed' ? 'success' : 'error'}
                        size="small"
                        sx={{ mr: 2 }}
                      />
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {funcResult.functionName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto', mr: 1 }}>
                        {(funcResult.duration / 1000).toFixed(2)}s
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {funcResult.error && (
                        <Box sx={{ mb: 2, p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#c62828' }}>
                            {funcResult.error}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="caption" color="textSecondary">
                        Duration: {(funcResult.duration / 1000).toFixed(2)}s
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No function results available.
              </Typography>
            )}

            {/* Logs */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Execution Logs
            </Typography>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'monospace',
                fontSize: '12px',
                overflowX: 'auto',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {selectedResult.logs && selectedResult.logs.length > 0 ? (
                selectedResult.logs.map((log, idx) => (
                  <div key={idx} style={{ margin: '4px 0' }}>
                    {log}
                  </div>
                ))
              ) : (
                <div>No logs available.</div>
              )}
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleDownload(selectedResult)}
              startIcon={<DownloadIcon />}
              variant="outlined"
            >
              Download JSON
            </Button>
            <Button onClick={handleCloseDetailsDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
