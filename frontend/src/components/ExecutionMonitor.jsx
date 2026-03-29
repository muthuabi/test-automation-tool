import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import { apiCalls } from '../api/api';

const ExecutionMonitor = ({ open, runId, scenarioName, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('running');
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [completedAt, setCompletedAt] = useState(null);
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Fetch logs periodically
  useEffect(() => {
    if (!open || !runId) return;

    const fetchLogs = async () => {
      try {
        const response = await apiCalls.getLiveExecutionLogs(runId);
        setLogs(response.logs || []);
        setStatus(response.status || 'unknown');
        setCompletedAt(response.completedAt);

        // Stop polling if execution is complete
        if (response.status !== 'running') {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    // Fetch immediately
    fetchLogs();

    // Set up polling - every 500ms for real-time feel
    const pollInterval = setInterval(fetchLogs, 500);

    return () => clearInterval(pollInterval);
  }, [open, runId]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this execution?')) {
      setIsCancelling(true);
      try {
        await apiCalls.cancelExecution(runId);
        // The log polling will update the status
      } catch (error) {
        console.error('Error cancelling execution:', error);
        alert(`Failed to cancel: ${error.message}`);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'running':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'error':
        return 'Error';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Execution Monitor</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {scenarioName}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel()}
            color={getStatusColor()}
            icon={status === 'running' ? <CircularProgress size={20} /> : undefined}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {status === 'running' && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        <Paper
          sx={{
            p: 2,
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            height: 400,
            overflowY: 'auto',
            border: '1px solid #333',
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {logs.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#808080' }}>
              Waiting for logs...
            </Typography>
          ) : (
            logs.map((log, index) => (
              <Box
                key={index}
                sx={{
                  mb: 0.5,
                  color: getLogColor(log.level),
                  typography: 'body2',
                }}
              >
                [{log.timestamp}] {log.message}
              </Box>
            ))
          )}
          <div ref={logsEndRef} />
        </Paper>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total Logs: {logs.length}
          </Typography>
          {completedAt && (
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
              Completed at: {new Date(completedAt).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleCancel}
          color="error"
          disabled={status !== 'running' || isCancelling}
          variant="contained"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Execution'}
        </Button>
        <Button onClick={onClose} disabled={status === 'running'}>
          {status === 'running' ? 'Keep Open' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to get log color based on level
const getLogColor = (level) => {
  switch (level) {
    case 'error':
      return '#f48771'; // Light red
    case 'warning':
      return '#dcdcaa'; // Light yellow
    case 'success':
      return '#6a9955'; // Green
    case 'info':
      return '#569cd6'; // Blue
    case 'debug':
      return '#858585'; // Gray
    default:
      return '#d4d4d4'; // Default
  }
};

export default ExecutionMonitor;
