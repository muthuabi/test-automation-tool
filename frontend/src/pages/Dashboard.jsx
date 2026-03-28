import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { apiCalls } from '../api/api';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, functionsData, scenariosData, resultsData] = await Promise.all([
        apiCalls.getUsers(),
        apiCalls.getFunctions(),
        apiCalls.getScenarios(),
        apiCalls.getResults(),
      ]);
      setUsers(usersData);
      setFunctions(functionsData);
      setScenarios(scenariosData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      color: '#667eea',
      icon: '👥',
    },
    {
      title: 'Automation Functions',
      value: functions.length,
      color: '#764ba2',
      icon: '⚙️',
    },
    {
      title: 'Test Scenarios',
      value: scenarios.length,
      color: '#f093fb',
      icon: '🎯',
    },
    {
      title: 'Execution Results',
      value: results.length,
      color: '#4facfe',
      icon: '✅',
    },
  ];

  const recentResults = results.slice(0, 5);

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Overview of your test automation platform
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                borderLeft: `4px solid ${stat.color}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="h4">{stat.icon}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<AddIcon />} href="/users">
              Add User
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} href="/functions">
              Create Function
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} href="/scenarios">
              Build Scenario
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} href="/runs">
              Execute Run
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Results */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Recent Execution Results
            </Typography>
            <Button size="small" href="/results">
              View All
            </Button>
          </Box>

          {recentResults.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Scenario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Environment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Executed At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentResults.map((result) => (
                    <TableRow key={result._id} hover>
                      <TableCell>{result.scenarioName}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
              No results yet. Execute a scenario to see results.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
