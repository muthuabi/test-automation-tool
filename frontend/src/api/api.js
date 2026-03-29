import axios from 'axios';
import * as mockData from '../mock/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'; // Default to false (use real API)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API calls with mock data fallback
export const apiCalls = {
  // Users
  getUsers: async () => {
    if (USE_MOCK_DATA) return mockData.mockUsers;
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.log('Failed to fetch users, using mock data', error);
      return mockData.mockUsers;
    }
  },

  addUser: async (user) => {
    if (USE_MOCK_DATA) {
      return { id: Date.now(), ...user, createdAt: new Date().toISOString() };
    }
    const response = await api.post('/users', user);
    return response.data;
  },

  updateUser: async (id, user) => {
    if (USE_MOCK_DATA) return { id, ...user };
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id) => {
    if (USE_MOCK_DATA) return { id };
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Selectors
  getSelectors: async () => {
    if (USE_MOCK_DATA) return mockData.mockSelectors;
    try {
      const response = await api.get('/selectors');
      return response.data;
    } catch (error) {
      console.log('Failed to fetch selectors, using mock data', error);
      return mockData.mockSelectors;
    }
  },

  addSelector: async (selector) => {
    if (USE_MOCK_DATA) {
      return { id: Date.now(), ...selector };
    }
    const response = await api.post('/selectors', selector);
    return response.data;
  },

  updateSelector: async (id, selector) => {
    if (USE_MOCK_DATA) return { id, ...selector };
    const response = await api.put(`/selectors/${id}`, selector);
    return response.data;
  },

  deleteSelector: async (id) => {
    if (USE_MOCK_DATA) return { id };
    const response = await api.delete(`/selectors/${id}`);
    return response.data;
  },

  // Functions
  getFunctions: async () => {
    if (USE_MOCK_DATA) return mockData.mockFunctions;
    try {
      const response = await api.get('/functions');
      return response.data;
    } catch (error) {
      console.log('Failed to fetch functions, using mock data', error);
      return mockData.mockFunctions;
    }
  },

  addFunction: async (func) => {
    if (USE_MOCK_DATA) {
      return { id: Date.now(), ...func, createdAt: new Date().toISOString() };
    }
    const response = await api.post('/functions', func);
    return response.data;
  },

  updateFunction: async (id, func) => {
    if (USE_MOCK_DATA) return { id, ...func };
    const response = await api.put(`/functions/${id}`, func);
    return response.data;
  },

  deleteFunction: async (id) => {
    if (USE_MOCK_DATA) return { id };
    const response = await api.delete(`/functions/${id}`);
    return response.data;
  },

  // Scenarios
  getScenarios: async () => {
    if (USE_MOCK_DATA) return mockData.mockScenarios;
    try {
      const response = await api.get('/scenarios');
      return response.data;
    } catch (error) {
      console.log('Failed to fetch scenarios, using mock data', error);
      return mockData.mockScenarios;
    }
  },

  addScenario: async (scenario) => {
    if (USE_MOCK_DATA) {
      return { id: Date.now(), ...scenario, createdAt: new Date().toISOString() };
    }
    const response = await api.post('/scenarios', scenario);
    return response.data;
  },

  updateScenario: async (id, scenario) => {
    if (USE_MOCK_DATA) return { id, ...scenario };
    const response = await api.put(`/scenarios/${id}`, scenario);
    return response.data;
  },

  deleteScenario: async (id) => {
    if (USE_MOCK_DATA) return { id };
    const response = await api.delete(`/scenarios/${id}`);
    return response.data;
  },

  // Runs
  getRuns: async () => {
    if (USE_MOCK_DATA) return mockData.mockRuns;
    try {
      const response = await api.get('/runs');
      return response.data;
    } catch (error) {
      console.log('Failed to fetch runs, using mock data', error);
      return mockData.mockRuns;
    }
  },

  addRun: async (run) => {
    if (USE_MOCK_DATA) {
      return { id: Date.now(), ...run, createdAt: new Date().toISOString() };
    }
    const response = await api.post('/runs', run);
    return response.data;
  },

  updateRun: async (id, run) => {
    if (USE_MOCK_DATA) return { id, ...run };
    const response = await api.put(`/runs/${id}`, run);
    return response.data;
  },

  deleteRun: async (id) => {
    if (USE_MOCK_DATA) return { id };
    const response = await api.delete(`/runs/${id}`);
    return response.data;
  },

  // Results
  getResults: async () => {
    if (USE_MOCK_DATA) return mockData.mockResults;
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error) {
      console.log('Failed to fetch results, using mock data', error);
      return mockData.mockResults;
    }
  },

  // Settings
  getSettings: async () => {
    if (USE_MOCK_DATA) return mockData.mockSettings;
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.log('Failed to fetch settings, using mock data', error);
      return mockData.mockSettings;
    }
  },

  updateSettings: async (settings) => {
    if (USE_MOCK_DATA) return settings;
    const response = await api.put('/settings', settings);
    return response.data;
  },

  // Integration settings
  validateAdoConfig: async (config) => {
    const response = await api.post('/settings/integrations/ado/validate', config);
    return response.data;
  },

  saveAdoConfig: async (config) => {
    const response = await api.post('/settings/integrations/ado/save', config);
    return response.data;
  },

  validateEmailConfig: async (config) => {
    const response = await api.post('/settings/integrations/email/validate', config);
    return response.data;
  },

  saveEmailConfig: async (config) => {
    const response = await api.post('/settings/integrations/email/save', config);
    return response.data;
  },

  validateWorkflowConfig: async (config) => {
    const response = await api.post('/settings/integrations/workflow/validate', config);
    return response.data;
  },

  saveWorkflowConfig: async (config) => {
    const response = await api.post('/settings/integrations/workflow/save', config);
    return response.data;
  },

  getIntegrationsSummary: async () => {
    const response = await api.get('/settings/integrations/summary');
    return response.data;
  },

  toggleIntegration: async (integration, enabled) => {
    const response = await api.post('/settings/integrations/toggle', { integration, enabled });
    return response.data;
  },

  // Manual triggers for integrations
  manualTriggerAdo: async (config) => {
    const response = await api.post('/settings/manual/ado-trigger', config);
    return response.data;
  },

  manualTriggerEmail: async (config) => {
    const response = await api.post('/settings/manual/email-trigger', config);
    return response.data;
  },

  manualTriggerWorkflow: async (config) => {
    const response = await api.post('/settings/manual/workflow-trigger', config);
    return response.data;
  },

  // Execution
  executeRun: async (runId) => {
    const response = await api.post(`/runs/${runId}/execute`);
    return response.data;
  },

  // Check Playwright browser installation status
  checkBrowserStatus: async () => {
    try {
      const response = await api.post('/runs/check-browser-status');
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, assume browsers are installed
      return { browsersInstalled: true, message: 'Browser status check not available' };
    }
  },

  executeScenario: async (scenarioId, config) => {
    const response = await api.post(`/execute/${scenarioId}`, config);
    return response.data;
  },

  // Execution Logs & Results
  getExecutionLogs: async (runId) => {
    try {
      const response = await api.get(`/results/run/${runId}/logs`);
      return response.data;
    } catch (error) {
      console.log('Failed to fetch execution logs', error);
      return { runId, logs: [], summary: { message: 'No logs available' } };
    }
  },

  // Get live execution logs (real-time monitoring)
  getLiveExecutionLogs: async (runId) => {
    try {
      const response = await api.get(`/runs/${runId}/logs`);
      return response.data;
    } catch (error) {
      console.log('Failed to fetch live execution logs', error);
      return { runId, logs: [], status: 'unknown', logsCount: 0 };
    }
  },

  // Get execution status
  getExecutionStatus: async (runId) => {
    try {
      const response = await api.get(`/runs/${runId}/status`);
      return response.data;
    } catch (error) {
      console.log('Failed to fetch execution status', error);
      return { found: false, status: 'unknown' };
    }
  },

  // Cancel execution
  cancelExecution: async (runId) => {
    try {
      const response = await api.post(`/runs/${runId}/cancel`);
      return response.data;
    } catch (error) {
      console.log('Failed to cancel execution', error);
      throw error;
    }
  },

  getExecutionSummary: async (runId) => {
    try {
      const response = await api.get(`/results/run/${runId}/summary`);
      return response.data;
    } catch (error) {
      console.log('Failed to fetch execution summary', error);
      return { runId, executionStatus: 'unknown', functionCount: 0 };
    }
  },
};

export default api;
