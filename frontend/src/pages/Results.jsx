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
  Grid,
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
  const [executionLogs, setExecutionLogs] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

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
    // Load execution logs if this is a run ID
    if (result.runId) {
      loadExecutionLogs(typeof result.runId === 'object' ? result.runId._id : result.runId);
    }
  };

  const loadExecutionLogs = async (runId) => {
    setLogsLoading(true);
    try {
      const logs = await apiCalls.getExecutionLogs(runId);
      setExecutionLogs(logs);
    } catch (error) {
      console.error('Error loading execution logs:', error);
      setExecutionLogs({ 
        runId, 
        logs: ['Failed to load execution logs: ' + error.message], 
        summary: {} 
      });
    } finally {
      setLogsLoading(false);
    }
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
    link.download = `result-${result._id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        setResults(results.filter(r => r._id !== id));
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
                  <TableRow key={result._id} hover>
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
                        onClick={() => handleDelete(result._id)}
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
        <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="lg" fullWidth>
          <DialogTitle>
            Execution Details - {selectedResult.scenarioName || selectedResult.functionName}
            <Chip
              label={selectedResult.status}
              color={selectedResult.status === 'passed' ? 'success' : 'error'}
              size="small"
              sx={{ ml: 2 }}
            />
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {/* Summary Stats */}
            <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Duration
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {(selectedResult.duration || 0)}ms
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Status
                    </Typography>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {selectedResult.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Started
                    </Typography>
                    <Typography variant="body2">
                      {selectedResult.startTime ? new Date(selectedResult.startTime).toLocaleTimeString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Ended
                    </Typography>
                    <Typography variant="body2">
                      {selectedResult.endTime ? new Date(selectedResult.endTime).toLocaleTimeString() : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Execution Logs */}
            {executionLogs && (
              <Accordion defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Execution Logs ({executionLogs.logs?.length || 0} entries)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {logsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : (
                    <Paper sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
                      <List dense>
                        {executionLogs.logs && executionLogs.logs.map((log, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5, px: 1 }}>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    color: log.includes('[ERROR]') || log.includes('✗')
                                      ? '#f48771'
                                      : log.includes('[VALIDATION]') || log.includes('[BROWSER]')
                                      ? '#4ec9b0'
                                      : log.includes('✓')
                                      ? '#6a9955'
                                      : '#d4d4d4',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {log}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                        {(!executionLogs.logs || executionLogs.logs.length === 0) && (
                          <Typography variant="caption" color="textSecondary" sx={{ p: 2 }}>
                            No logs available
                          </Typography>
                        )}
                      </List>
                    </Paper>
                  )}
                  {executionLogs.summary && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Summary
                      </Typography>
                      <Typography variant="body2">
                        Status: <strong>{executionLogs.summary.status}</strong> • 
                        Functions: <strong>{executionLogs.summary.passed}</strong> passed, 
                        <strong>{executionLogs.summary.failed}</strong> failed
                        {executionLogs.summary.error && (
                          <>
                            <br />
                            <span style={{ color: '#d32f2f' }}>Error: {executionLogs.summary.error}</span>
                          </>
                        )}
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Error Details */}
            {selectedResult.error && (
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    Error Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ backgroundColor: '#ffebee', p: 2, borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {selectedResult.error}
                    </Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Output/Result Data */}
            {selectedResult.output && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Output Data
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, width: '100%', overflow: 'auto' }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {typeof selectedResult.output === 'string'
                        ? selectedResult.output
                        : JSON.stringify(selectedResult.output, null, 2)}
                    </Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailsDialog}>Close</Button>
            {selectedResult && (
              <Button
                onClick={() => handleDownload(selectedResult)}
                startIcon={<DownloadIcon />}
                variant="outlined"
              >
                Download JSON
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
       
