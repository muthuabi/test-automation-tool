import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { apiCalls } from '../api/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Integrations() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  // Runs for email selection
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState('');

  // ADO Tab State
  const [adoConfig, setAdoConfig] = useState({
    useSettings: true,
    url: '',
    pat: '',
    project: '',
    planId: '',
    suiteId: '',
  });
  const [adoTestCases, setAdoTestCases] = useState([]);
  const [adoNewTestCase, setAdoNewTestCase] = useState({ tcid: '', outcome: '' });
  const [adoLoading, setAdoLoading] = useState(false);

  // Email Tab State
  const [emailConfig, setEmailConfig] = useState({
    useSettings: true,
    service: '',
    username: '',
    password: '',
    recipients: [],
    subject: `Test Execution Report - ${new Date().toLocaleDateString()}`,
  });
  const [emailNewRecipient, setEmailNewRecipient] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Workflow Tab State
  const [workflowConfig, setWorkflowConfig] = useState({
    useSettings: true,
    webhookUrl: '',
    authorizationHeader: '',
    timeout: 10000,
  });
  const [workflowEventData, setWorkflowEventData] = useState('{}');
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // Settings Tab State
  const [adoSettings, setAdoSettings] = useState(null);
  const [emailSettings, setEmailSettings] = useState(null);
  const [workflowSettings, setWorkflowSettings] = useState(null);
  const [integrationsSummary, setIntegrationsSummary] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    loadRuns();
    loadIntegrationsSummary();
  }, []);

  const loadRuns = async () => {
    try {
      const runsData = await apiCalls.getRuns();
      setRuns(runsData);
    } catch (error) {
      console.error('Error loading runs:', error);
    }
  };

  const loadIntegrationsSummary = async () => {
    try {
      const summary = await apiCalls.getIntegrationsSummary();
      setIntegrationsSummary(summary);
    } catch (error) {
      console.error('Error loading integrations summary:', error);
    }
  };

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // ========== ADO Tab Functions ==========
  const handleAdoTestCaseAdd = () => {
    if (adoNewTestCase.tcid && adoNewTestCase.outcome) {
      setAdoTestCases([...adoTestCases, { ...adoNewTestCase, id: Date.now() }]);
      setAdoNewTestCase({ tcid: '', outcome: '' });
      showMessage('Test case added successfully', 'success');
    } else {
      showMessage('Please fill all fields', 'error');
    }
  };

  const handleAdoTestCaseRemove = (id) => {
    setAdoTestCases(adoTestCases.filter((tc) => tc.id !== id));
  };

  const triggerAdoIntegration = async () => {
    try {
      setAdoLoading(true);

      if (adoTestCases.length === 0) {
        showMessage('Please add at least one test case', 'error');
        return;
      }

      const payload = {
        testCases: adoTestCases,
        runName: `Manual Run - ${new Date().toISOString()}`,
      };

      if (!adoConfig.useSettings) {
        if (!adoConfig.url || !adoConfig.pat || !adoConfig.project) {
          showMessage('Please provide ADO credentials', 'error');
          return;
        }
        payload.url = adoConfig.url;
        payload.pat = adoConfig.pat;
        payload.project = adoConfig.project;
        payload.planId = adoConfig.planId;
        payload.suiteId = adoConfig.suiteId;
      }

      const result = await apiCalls.manualTriggerAdo(payload);

      if (result.success) {
        showMessage(`✓ ADO Results published successfully! Run ID: ${result.testRunId}`, 'success');
        setAdoTestCases([]);
      } else {
        showMessage(`✗ Error: ${result.error || result.message}`, 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setAdoLoading(false);
    }
  };

  // ========== Email Tab Functions ==========
  const handleEmailRecipientAdd = () => {
    if (emailNewRecipient && emailNewRecipient.includes('@')) {
      setEmailConfig({
        ...emailConfig,
        recipients: [...emailConfig.recipients, emailNewRecipient],
      });
      setEmailNewRecipient('');
      showMessage('Recipient added', 'success');
    } else {
      showMessage('Please enter a valid email', 'error');
    }
  };

  const handleEmailRecipientRemove = (email) => {
    setEmailConfig({
      ...emailConfig,
      recipients: emailConfig.recipients.filter((r) => r !== email),
    });
  };

  const triggerEmailIntegration = async () => {
    try {
      setEmailLoading(true);

      if (emailConfig.recipients.length === 0) {
        showMessage('Please add at least one recipient', 'error');
        return;
      }

      let executionSummary = null;
      if (selectedRun) {
        // Fetch run details and execution summary
        try {
          executionSummary = await apiCalls.getExecutionSummary(selectedRun);
        } catch (error) {
          console.warn('Could not fetch execution summary:', error);
        }
      }

      const payload = {
        recipients: emailConfig.recipients,
        subject: emailConfig.subject,
        scenarioName: 'Manual Email Trigger',
        executionSummary: executionSummary || { functions: [], logs: [] },
      };

      if (!emailConfig.useSettings) {
        if (!emailConfig.service || !emailConfig.username || !emailConfig.password) {
          showMessage('Please provide email credentials', 'error');
          return;
        }
        payload.service = emailConfig.service;
        payload.username = emailConfig.username;
        payload.password = emailConfig.password;
        payload.customConfig = true;
      }

      const result = await apiCalls.manualTriggerEmail(payload);

      if (result.success) {
        showMessage(`✓ Email sent successfully to ${emailConfig.recipients.length} recipient(s)!`, 'success');
      } else {
        showMessage(`✗ Error: ${result.error || result.message}`, 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  // ========== Workflow Tab Functions ==========
  const triggerWorkflowIntegration = async () => {
    try {
      setWorkflowLoading(true);

      if (!workflowConfig.webhookUrl && workflowConfig.useSettings === false) {
        showMessage('Please provide webhook URL', 'error');
        return;
      }

      let eventData;
      try {
        eventData = JSON.parse(workflowEventData);
      } catch (error) {
        showMessage('Invalid JSON in event data', 'error');
        return;
      }

      const payload = {
        eventData,
      };

      if (!workflowConfig.useSettings) {
        payload.webhookUrl = workflowConfig.webhookUrl;
        payload.authorizationHeader = workflowConfig.authorizationHeader;
        payload.timeout = workflowConfig.timeout;
        payload.customConfig = true;
      }

      const result = await apiCalls.manualTriggerWorkflow(payload);

      if (result.success) {
        showMessage(`✓ Webhook triggered successfully!`, 'success');
      } else {
        showMessage(`✗ Error: ${result.error || result.message}`, 'error');
      }
    } catch (error) {
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setWorkflowLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        🔌 Integration Triggers
      </Typography>

      {message && (
        <Alert severity={messageType} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Tab label="🔷 Azure DevOps" id="tab-0" />
          <Tab label="📧 Email" id="tab-1" />
          <Tab label="🔗 Workflow" id="tab-2" />
          <Tab label="⚙️ Settings" id="tab-3" />
        </Tabs>

        {/* ========== ADO Tab ========== */}
        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Manual Azure DevOps Test Results Publish
            </Typography>

            {/* Use Settings or Custom */}
            <FormControl sx={{ mb: 3, display: 'block' }}>
              <InputLabel>Configuration Source</InputLabel>
              <Select
                value={adoConfig.useSettings ? 'settings' : 'custom'}
                onChange={(e) =>
                  setAdoConfig({
                    ...adoConfig,
                    useSettings: e.target.value === 'settings',
                  })
                }
              >
                <MenuItem value="settings">Use Saved Settings</MenuItem>
                <MenuItem value="custom">Provide Credentials</MenuItem>
              </Select>
            </FormControl>

            {/* Custom ADO Config */}
            {!adoConfig.useSettings && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ADO Organization URL"
                    value={adoConfig.url}
                    onChange={(e) =>
                      setAdoConfig({ ...adoConfig, url: e.target.value })
                    }
                    placeholder="https://dev.azure.com/yourorg"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Personal Access Token (PAT)"
                    type="password"
                    value={adoConfig.pat}
                    onChange={(e) =>
                      setAdoConfig({ ...adoConfig, pat: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={adoConfig.project}
                    onChange={(e) =>
                      setAdoConfig({ ...adoConfig, project: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Plan ID"
                    value={adoConfig.planId}
                    onChange={(e) =>
                      setAdoConfig({ ...adoConfig, planId: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Suite ID"
                    value={adoConfig.suiteId}
                    onChange={(e) =>
                      setAdoConfig({ ...adoConfig, suiteId: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Test Cases */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Test Cases
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Test Case ID"
                  value={adoNewTestCase.tcid}
                  onChange={(e) =>
                    setAdoNewTestCase({ ...adoNewTestCase, tcid: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Outcome</InputLabel>
                  <Select
                    value={adoNewTestCase.outcome}
                    onChange={(e) =>
                      setAdoNewTestCase({ ...adoNewTestCase, outcome: e.target.value })
                    }
                  >
                    <MenuItem value="passed">Passed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="skipped">Skipped</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={handleAdoTestCaseAdd}
                  fullWidth
                >
                  Add Test Case
                </Button>
              </Grid>
            </Grid>

            {/* Display Test Cases */}
            {adoTestCases.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {adoTestCases.length} Test Case(s) Added:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {adoTestCases.map((tc) => (
                    <Chip
                      key={tc.id}
                      label={`${tc.tcid} - ${tc.outcome}`}
                      onDelete={() => handleAdoTestCaseRemove(tc.id)}
                      color={tc.outcome === 'passed' ? 'success' : 'error'}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={triggerAdoIntegration}
              disabled={adoLoading}
              startIcon={adoLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {adoLoading ? 'Publishing...' : 'Publish to Azure DevOps'}
            </Button>
          </CardContent>
        </TabPanel>

        {/* ========== Email Tab ========== */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Manual Email Trigger
            </Typography>

            {/* Use Settings or Custom */}
            <FormControl sx={{ mb: 3, display: 'block', minWidth: 200 }}>
              <InputLabel>Configuration Source</InputLabel>
              <Select
                value={emailConfig.useSettings ? 'settings' : 'custom'}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    useSettings: e.target.value === 'settings',
                  })
                }
              >
                <MenuItem value="settings">Use Saved Settings</MenuItem>
                <MenuItem value="custom">Provide Credentials</MenuItem>
              </Select>
            </FormControl>

            {/* Custom Email Config */}
            {!emailConfig.useSettings && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Email Service</InputLabel>
                    <Select
                      value={emailConfig.service}
                      onChange={(e) =>
                        setEmailConfig({ ...emailConfig, service: e.target.value })
                      }
                    >
                      <MenuItem value="gmail">Gmail</MenuItem>
                      <MenuItem value="smtp">SMTP</MenuItem>
                      <MenuItem value="office365">Office 365</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username/Email"
                    value={emailConfig.username}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, username: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password/App Password"
                    type="password"
                    value={emailConfig.password}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, password: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Email Recipients */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Recipients
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={emailNewRecipient}
                  onChange={(e) => setEmailNewRecipient(e.target.value)}
                  placeholder="user@example.com"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="outlined"
                  onClick={handleEmailRecipientAdd}
                  fullWidth
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {/* Display Recipients */}
            {emailConfig.recipients.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {emailConfig.recipients.length} Recipient(s):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {emailConfig.recipients.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleEmailRecipientRemove(email)}
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Email Subject & Run Selection */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Subject"
                  value={emailConfig.subject}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, subject: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Run (Optional)</InputLabel>
                  <Select
                    value={selectedRun}
                    onChange={(e) => setSelectedRun(e.target.value)}
                  >
                    <MenuItem value="">No Run Selected</MenuItem>
                    {runs.map((run) => (
                      <MenuItem key={run._id} value={run._id}>
                        {run.scenarioName} - {new Date(run.createdAt).toLocaleDateString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={triggerEmailIntegration}
              disabled={emailLoading}
              startIcon={emailLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {emailLoading ? 'Sending...' : 'Send Email Report'}
            </Button>
          </CardContent>
        </TabPanel>

        {/* ========== Workflow Tab ========== */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Manual Workflow/Webhook Trigger
            </Typography>

            {/* Use Settings or Custom */}
            <FormControl sx={{ mb: 3, display: 'block', minWidth: 200 }}>
              <InputLabel>Configuration Source</InputLabel>
              <Select
                value={workflowConfig.useSettings ? 'settings' : 'custom'}
                onChange={(e) =>
                  setWorkflowConfig({
                    ...workflowConfig,
                    useSettings: e.target.value === 'settings',
                  })
                }
              >
                <MenuItem value="settings">Use Saved Settings</MenuItem>
                <MenuItem value="custom">Provide URL</MenuItem>
              </Select>
            </FormControl>

            {/* Custom Workflow Config */}
            {!workflowConfig.useSettings && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Webhook URL"
                    value={workflowConfig.webhookUrl}
                    onChange={(e) =>
                      setWorkflowConfig({
                        ...workflowConfig,
                        webhookUrl: e.target.value,
                      })
                    }
                    placeholder="https://your-webhook.example.com/api/webhook"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Authorization Header (Optional)"
                    value={workflowConfig.authorizationHeader}
                    onChange={(e) =>
                      setWorkflowConfig({
                        ...workflowConfig,
                        authorizationHeader: e.target.value,
                      })
                    }
                    placeholder="Bearer token123"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Timeout (ms)"
                    type="number"
                    value={workflowConfig.timeout}
                    onChange={(e) =>
                      setWorkflowConfig({
                        ...workflowConfig,
                        timeout: parseInt(e.target.value),
                      })
                    }
                  />
                </Grid>
              </Grid>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Event Data */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Event Data (JSON)
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Event Payload"
              value={workflowEventData}
              onChange={(e) => setWorkflowEventData(e.target.value)}
              sx={{ mb: 3, fontFamily: 'monospace' }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={triggerWorkflowIntegration}
              disabled={workflowLoading}
              startIcon={workflowLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {workflowLoading ? 'Triggering...' : 'Trigger Workflow'}
            </Button>
          </CardContent>
        </TabPanel>

        {/* ========== Settings Tab ========== */}
        <TabPanel value={activeTab} index={3}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Integration Settings Status
            </Typography>

            {integrationsSummary ? (
              <Grid container spacing={2}>
                {/* ADO */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🔷 Azure DevOps
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {integrationsSummary.ado?.configured ? (
                        <>
                          <CheckCircleIcon sx={{ color: 'green' }} />
                          <Typography>Configured</Typography>
                        </>
                      ) : (
                        <>
                          <ErrorIcon sx={{ color: 'orange' }} />
                          <Typography>Not Configured</Typography>
                        </>
                      )}
                    </Box>
                    {integrationsSummary.ado?.configured && (
                      <>
                        <Typography variant="caption">
                          Status: {integrationsSummary.ado?.enabled ? '✓ Enabled' : '⊘ Disabled'}
                        </Typography>
                        <Typography variant="caption">
                          Project: {integrationsSummary.ado?.project || 'N/A'}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      📧 Email
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {integrationsSummary.email?.configured ? (
                        <>
                          <CheckCircleIcon sx={{ color: 'green' }} />
                          <Typography>Configured</Typography>
                        </>
                      ) : (
                        <>
                          <ErrorIcon sx={{ color: 'orange' }} />
                          <Typography>Not Configured</Typography>
                        </>
                      )}
                    </Box>
                    {integrationsSummary.email?.configured && (
                      <>
                        <Typography variant="caption">
                          Status: {integrationsSummary.email?.enabled ? '✓ Enabled' : '⊘ Disabled'}
                        </Typography>
                        <Typography variant="caption">
                          Service: {integrationsSummary.email?.service || 'N/A'}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>

                {/* Workflow */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🔗 Workflow
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {integrationsSummary.workflow?.configured ? (
                        <>
                          <CheckCircleIcon sx={{ color: 'green' }} />
                          <Typography>Configured</Typography>
                        </>
                      ) : (
                        <>
                          <ErrorIcon sx={{ color: 'orange' }} />
                          <Typography>Not Configured</Typography>
                        </>
                      )}
                    </Box>
                    {integrationsSummary.workflow?.configured && (
                      <>
                        <Typography variant="caption">
                          Status: {integrationsSummary.workflow?.enabled ? '✓ Enabled' : '⊘ Disabled'}
                        </Typography>
                        <Typography variant="caption">
                          Webhook: {integrationsSummary.workflow?.hasWebhook ? '✓ Set' : '⊘ Not Set'}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading settings...</Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Button
              variant="outlined"
              fullWidth
              onClick={loadIntegrationsSummary}
              sx={{ mt: 2 }}
            >
              Refresh Status
            </Button>
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  );
}
