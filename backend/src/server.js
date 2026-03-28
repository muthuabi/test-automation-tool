const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage (In production, this would be a database)
let users = [
  { id: 1, email: 'testuser@example.com', role: 'Admin', status: 'Active', createdAt: '2025-01-15' },
  { id: 2, email: 'qa@example.com', role: 'QA Engineer', status: 'Active', createdAt: '2025-02-01' },
];

let selectors = [
  { id: 1, name: 'login_username', value: '#username', page: 'login', description: 'Username input' },
  { id: 2, name: 'login_password', value: '#password', page: 'login', description: 'Password input' },
  { id: 3, name: 'login_button', value: '#loginBtn', page: 'login', description: 'Login button' },
];

let functions = [
  {
    id: 1,
    name: 'LoginToApp',
    description: 'Login to application',
    code: 'async function LoginToApp(page, vars, selectors) { ... }',
    createdAt: '2025-03-01',
  },
];

let scenarios = [
  {
    id: 1,
    name: 'Complete Login Flow',
    description: 'Full login scenario',
    functionIds: [1],
    functionNames: ['LoginToApp'],
    createdAt: '2025-03-05',
  },
];

let runs = [];
let results = [];
let settings = {
  ado: { enabled: true, projectUrl: '', pat: '', teamId: '' },
  teams: { enabled: true, webhookUrl: '', channelId: '' },
  email: { enabled: true, smtpServer: '', fromAddress: '', recipientsList: [] },
};

// ============== USERS ENDPOINTS ==============
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  res.json(user);
});

app.delete('/api/users/:id', (req, res) => {
  users = users.filter((u) => u.id !== parseInt(req.params.id));
  res.json({ message: 'User deleted' });
});

// ============== SELECTORS ENDPOINTS ==============
app.get('/api/selectors', (req, res) => {
  res.json(selectors);
});

app.post('/api/selectors', (req, res) => {
  const newSelector = { id: Date.now(), ...req.body };
  selectors.push(newSelector);
  res.status(201).json(newSelector);
});

app.put('/api/selectors/:id', (req, res) => {
  const selector = selectors.find((s) => s.id === parseInt(req.params.id));
  if (!selector) return res.status(404).json({ error: 'Selector not found' });
  Object.assign(selector, req.body);
  res.json(selector);
});

app.delete('/api/selectors/:id', (req, res) => {
  selectors = selectors.filter((s) => s.id !== parseInt(req.params.id));
  res.json({ message: 'Selector deleted' });
});

// ============== FUNCTIONS ENDPOINTS ==============
app.get('/api/functions', (req, res) => {
  res.json(functions);
});

app.post('/api/functions', (req, res) => {
  const newFunction = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  functions.push(newFunction);
  res.status(201).json(newFunction);
});

app.put('/api/functions/:id', (req, res) => {
  const func = functions.find((f) => f.id === parseInt(req.params.id));
  if (!func) return res.status(404).json({ error: 'Function not found' });
  Object.assign(func, req.body);
  res.json(func);
});

app.delete('/api/functions/:id', (req, res) => {
  functions = functions.filter((f) => f.id !== parseInt(req.params.id));
  res.json({ message: 'Function deleted' });
});

// ============== SCENARIOS ENDPOINTS ==============
app.get('/api/scenarios', (req, res) => {
  res.json(scenarios);
});

app.post('/api/scenarios', (req, res) => {
  const newScenario = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  scenarios.push(newScenario);
  res.status(201).json(newScenario);
});

app.put('/api/scenarios/:id', (req, res) => {
  const scenario = scenarios.find((s) => s.id === parseInt(req.params.id));
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
  Object.assign(scenario, req.body);
  res.json(scenario);
});

app.delete('/api/scenarios/:id', (req, res) => {
  scenarios = scenarios.filter((s) => s.id !== parseInt(req.params.id));
  res.json({ message: 'Scenario deleted' });
});

// ============== RUNS ENDPOINTS ==============
app.get('/api/runs', (req, res) => {
  res.json(runs);
});

app.post('/api/runs', (req, res) => {
  const newRun = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  runs.push(newRun);
  res.status(201).json(newRun);
});

app.put('/api/runs/:id', (req, res) => {
  const run = runs.find((r) => r.id === parseInt(req.params.id));
  if (!run) return res.status(404).json({ error: 'Run not found' });
  Object.assign(run, req.body);
  res.json(run);
});

app.delete('/api/runs/:id', (req, res) => {
  runs = runs.filter((r) => r.id !== parseInt(req.params.id));
  res.json({ message: 'Run deleted' });
});

// ============== RESULTS ENDPOINTS ==============
app.get('/api/results', (req, res) => {
  res.json(results);
});

app.post('/api/results', (req, res) => {
  const newResult = { id: Date.now(), ...req.body };
  results.push(newResult);
  res.status(201).json(newResult);
});

app.delete('/api/results/:id', (req, res) => {
  results = results.filter((r) => r.id !== parseInt(req.params.id));
  res.json({ message: 'Result deleted' });
});

// ============== SETTINGS ENDPOINTS ==============
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  settings = req.body;
  res.json(settings);
});

// ============== EXECUTION ENDPOINT ==============
app.post('/api/execute/:scenarioId', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { runtimeVars } = req.body;

    console.log(`Executing scenario ${scenarioId} with vars:`, runtimeVars);

    // In a real implementation, this would:
    // 1. Load the scenario and its functions
    // 2. Create a Playwright browser instance
    // 3. Execute each function sequentially
    // 4. Capture logs and results
    // 5. Store results in the database

    res.json({
      success: true,
      message: 'Scenario execution started',
      scenarioId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== HEALTH CHECK ==============
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Automater Backend running on http://localhost:${PORT}`);
});
