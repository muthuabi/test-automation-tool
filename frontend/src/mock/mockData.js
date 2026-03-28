// Mock data for Test Automater Platform

export const mockUsers = [
  { id: 1, email: 'testuser@example.com', role: 'Admin', status: 'Active', createdAt: '2025-01-15' },
  { id: 2, email: 'qa@example.com', role: 'QA Engineer', status: 'Active', createdAt: '2025-02-01' },
  { id: 3, email: 'dev@example.com', role: 'Developer', status: 'Active', createdAt: '2025-02-10' },
  { id: 4, email: 'tester@example.com', role: 'Test Engineer', status: 'Inactive', createdAt: '2025-01-20' },
];

export const mockSelectors = [
  {
    id: 1,
    name: 'login_username',
    value: '#username',
    page: 'login',
    description: 'Username input field on login page'
  },
  {
    id: 2,
    name: 'login_password',
    value: '#password',
    page: 'login',
    description: 'Password input field on login page'
  },
  {
    id: 3,
    name: 'login_button',
    value: '#loginBtn',
    page: 'login',
    description: 'Login button on login page'
  },
  {
    id: 4,
    name: 'success_message',
    value: '.success-message',
    page: 'home',
    description: 'Success message on home page'
  },
  {
    id: 5,
    name: 'navbar_logout',
    value: '#logoutBtn',
    page: 'home',
    description: 'Logout button in navbar'
  },
];

export const mockFunctions = [
  {
    id: 1,
    name: 'LoginToApp',
    description: 'Login to application with username and password',
    code: `async function LoginToApp(page, vars, selectors) {
  try {
    await page.goto(vars.baseUrl + '/login');
    await page.fill(selectors.login_username, vars.username);
    await page.fill(selectors.login_password, vars.password);
    await page.click(selectors.login_button);
    await page.waitForSelector(selectors.success_message, { timeout: 5000 });
    return { success: true, message: 'Login successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}`,
    createdAt: '2025-03-01',
  },
  {
    id: 2,
    name: 'ValidateHomePage',
    description: 'Validate that home page loaded correctly',
    code: `async function ValidateHomePage(page, vars, selectors) {
  try {
    const pageTitle = await page.title();
    const text = await page.textContent('body');
    return { 
      success: true, 
      message: 'Home page validated',
      data: { pageTitle }
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}`,
    createdAt: '2025-03-02',
  },
  {
    id: 3,
    name: 'UpdateADO',
    description: 'Simulate updating ADO work item',
    code: `async function UpdateADO(page, vars, selectors) {
  // Simulated ADO update - just logging
  console.log('ADO updated successfully');
  return { 
    success: true, 
    message: 'ADO updated successfully',
    data: { workItemId: 'ADO-12345' }
  };
}`,
    createdAt: '2025-03-03',
  },
  {
    id: 4,
    name: 'TriggerMail',
    description: 'Trigger email notification',
    code: `async function TriggerMail(page, vars, selectors) {
  // Simulated mail trigger - just logging
  console.log('Mail triggered to ' + vars.username);
  return { 
    success: true, 
    message: 'Mail triggered successfully',
    data: { recipients: [vars.username + '@example.com'] }
  };
}`,
    createdAt: '2025-03-04',
  },
];

export const mockScenarios = [
  {
    id: 1,
    name: 'Complete Login Flow',
    description: 'Full login and validation scenario',
    functionIds: [1, 2],
    functionNames: ['LoginToApp', 'ValidateHomePage'],
    createdAt: '2025-03-05',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Login with ADO Update',
    description: 'Login and update ADO with results',
    functionIds: [1, 2, 3],
    functionNames: ['LoginToApp', 'ValidateHomePage', 'UpdateADO'],
    createdAt: '2025-03-06',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Full Notification Flow',
    description: 'Login, validate, update ADO, and send email',
    functionIds: [1, 2, 3, 4],
    functionNames: ['LoginToApp', 'ValidateHomePage', 'UpdateADO', 'TriggerMail'],
    createdAt: '2025-03-07',
    status: 'Active',
  },
];

export const mockRuns = [
  {
    id: 1,
    scenarioId: 1,
    scenarioName: 'Complete Login Flow',
    status: 'Completed',
    executionTime: 2345,
    createdAt: '2025-03-10 10:30',
    environment: 'staging',
    runMode: 'headless',
    runCount: 1,
    userIds: [1, 2],
  },
  {
    id: 2,
    scenarioId: 2,
    scenarioName: 'Login with ADO Update',
    status: 'Completed',
    executionTime: 3421,
    createdAt: '2025-03-10 11:15',
    environment: 'production',
    runMode: 'headed',
    runCount: 1,
    userIds: [1],
  },
  {
    id: 3,
    scenarioId: 1,
    scenarioName: 'Complete Login Flow',
    status: 'In Progress',
    executionTime: 1234,
    createdAt: '2025-03-10 13:45',
    environment: 'staging',
    runMode: 'headless',
    runCount: 5,
    userIds: [2, 3],
  },
];

export const mockResults = [
  {
    id: 1,
    scenarioName: 'Complete Login Flow',
    runId: 1,
    status: 'Passed',
    executionTime: 2345,
    startTime: '2025-03-10 10:30:00',
    endTime: '2025-03-10 10:30:02',
    environment: 'staging',
    runMode: 'headless',
    logs: [
      '[10:30:00] Starting scenario: Complete Login Flow',
      '[10:30:00] Executing function: LoginToApp',
      '[10:30:01] Login successful',
      '[10:30:01] Executing function: ValidateHomePage',
      '[10:30:02] Home page validated',
      '[10:30:02] Scenario completed successfully',
    ],
    functionResults: [
      { functionName: 'LoginToApp', status: 'Passed', duration: 1200 },
      { functionName: 'ValidateHomePage', status: 'Passed', duration: 1145 },
    ],
  },
  {
    id: 2,
    scenarioName: 'Login with ADO Update',
    runId: 2,
    status: 'Passed',
    executionTime: 3421,
    startTime: '2025-03-10 11:15:00',
    endTime: '2025-03-10 11:15:03',
    environment: 'production',
    runMode: 'headed',
    logs: [
      '[11:15:00] Starting scenario: Login with ADO Update',
      '[11:15:00] Executing function: LoginToApp',
      '[11:15:01] Login successful',
      '[11:15:01] Executing function: ValidateHomePage',
      '[11:15:02] Home page validated',
      '[11:15:02] Executing function: UpdateADO',
      '[11:15:03] ADO updated successfully',
      '[11:15:03] Scenario completed successfully',
    ],
    functionResults: [
      { functionName: 'LoginToApp', status: 'Passed', duration: 1200 },
      { functionName: 'ValidateHomePage', status: 'Passed', duration: 1145 },
      { functionName: 'UpdateADO', status: 'Passed', duration: 1076 },
    ],
  },
  {
    id: 3,
    scenarioName: 'Complete Login Flow',
    runId: 3,
    status: 'Failed',
    executionTime: 1234,
    startTime: '2025-03-10 13:45:00',
    endTime: '2025-03-10 13:45:01',
    environment: 'staging',
    runMode: 'headless',
    logs: [
      '[13:45:00] Starting scenario: Complete Login Flow',
      '[13:45:00] Executing function: LoginToApp',
      '[13:45:01] ERROR: Connection timeout',
    ],
    functionResults: [
      { functionName: 'LoginToApp', status: 'Failed', duration: 1234, error: 'Connection timeout' },
    ],
  },
];

export const mockSettings = {
  ado: {
    enabled: true,
    projectUrl: 'https://dev.azure.com/myorg/myproject',
    pat: '***hidden***',
    teamId: 'Core Team',
  },
  teams: {
    enabled: true,
    webhookUrl: 'https://outlook.webhook.office.com/webhookb2/...',
    channelId: 'automation-results',
  },
  email: {
    enabled: true,
    smtpServer: 'smtp.gmail.com',
    fromAddress: 'automation@example.com',
    recipientsList: ['qa-team@example.com'],
  },
  baseUrl: 'http://localhost:4000',
};
