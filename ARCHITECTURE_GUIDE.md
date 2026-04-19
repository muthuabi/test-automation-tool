# Test Automation Tool - Architecture & Integration Services Guide

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                     │
│                         Port 5173                                 │
│  - UI Components                                                  │
│  - Form Validation                                                │
│  - Real-time Log Monitoring (500ms polling)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP Requests
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXPRESS API SERVER                             │
│                      Port 5000                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ API Routes                                                 │ │
│  │ - /users, /functions, /scenarios, /runs                  │ │
│  │ - /settings (bulk update with bulk validation)           │ │
│  │ - /runs/:id/execute (returns immediately!)              │ │
│  │ - /runs/:id/logs (real-time log retrieval)              │ │
│  └──────────────────────────┬───────────────────────────────┘ │
│                              │                                   │
│  ┌──────────────────────────▼───────────────────────────────┐ │
│  │ WORKER POOL MANAGER (Non-Blocking Execution)           │ │
│  │ ┌──────────────┬──────────────┬──────────────┐          │ │
│  │ │ Worker 1     │ Worker 2     │ Worker 3     │          │ │
│  │ │              │              │              │          │ │
│  │ │ [Running] or │ [Running] or │ [Running] or │          │ │
│  │ │ [Ready]      │ [Ready]      │ [Ready]      │          │ │
│  │ │              │              │              │          │ │
│  │ │ Executes     │ Executes     │ Executes     │          │ │
│  │ │ Scenarios    │ Scenarios    │ Scenarios    │          │ │
│  │ │ in parallel  │ in parallel  │ in parallel  │          │ │
│  │ └──────────────┴──────────────┴──────────────┘          │ │
│  │ Queue: [pending tasks...]                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Execution   │  │ MongoDB      │  │ Integrations │
    │ Tracker     │  │ Database     │  │              │
    │             │  │              │  │ - Email      │
    │ (Memory)    │  │ Collections: │  │ - ADO        │
    │             │  │ - users      │  │ - Workflow   │
    │ Stores:     │  │ - functions  │  │ (webhooks)   │
    │ - Logs      │  │ - scenarios  │  │              │
    │ - Status    │  │ - runs       │  │ Triggered    │
    │ - Duration  │  │ - results    │  │ on execution │
    │             │  │ - settings   │  │ complete     │
    └─────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔄 Execution Flow (Non-Blocking)

```
Timeline:

User clicks Play button
  │
  ├─ Sends: POST /runs/{runId}/execute
  │
  ├─ API receives request
  │
  ├─ Main Thread:
  │  ├─ Validates run ID
  │  ├─ Gets available worker (or queues)
  │  ├─ Sends message to worker thread
  │  └─ Returns immediately: { runId, message: "Execution started" }
  │        ↑
  │    FRONTEND RECEIVES - Can proceed immediately
  │
  └─ Background: Worker Thread
     ├─ Receives execution message
     ├─ Loads run config
     ├─ Loads scenario
     ├─ Loads functions
     ├─ Launches browser (Playwright)
     ├─ For each function:
     │  ├─ Attach page listeners
     │  │  ├─ page.on('load') → logs navigation
     │  │  ├─ page.on('console') → logs messages
     │  │  ├─ page.on('pageerror') → logs errors
     │  │  └─ page.on('dialog') → logs popups
     │  ├─ Execute function code
     │  ├─ Log results
     │  └─ Save to executionTracker
     ├─ Close browser
     ├─ Send completion message back to main thread
     └─ Return worker to pool

MEANWHILE - Frontend:
  ├─ Shows ExecutionMonitor dialog
  ├─ Polls /runs/{runId}/logs every 500ms
  │  ├─ Gets current logs from executionTracker
  │  ├─ Displays in monitor
  │  └─ Auto-scrolls to latest
  ├─ User can:
  │  ├─ Cancel execution
  │  ├─ Navigate to other pages
  │  ├─ Update settings
  │  └─ Create new tests
  └─ When complete:
     ├─ Logs stabilize
     ├─ Status shows "Completed"
     └─ User can save/export results
```

---

## 📊 Settings & Configuration

### Settings Storage Structure

```
MongoDB Collection: settings

Document 1 (Email Settings):
{
  _id: ObjectId(...),
  settingKey: "email_config",
  category: "email",
  enabled: true,
  config: {
    service: "gmail",
    username: "test@gmail.com",
    appPassword: "****",
    smtpServer: "smtp.gmail.com",
    fromAddress: "test@gmail.com",
    recipientsList: ["admin@example.com", "qa@example.com"]
  },
  description: "Email integration settings",
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}

Document 2 (ADO Settings):
{
  _id: ObjectId(...),
  settingKey: "ado_config",
  category: "ado",
  enabled: true,
  config: {
    url: "https://dev.azure.com/myorg",
    pat: "****",
    project: "TestProject",
    planId: "123",
    suiteId: "456"
  },
  description: "Azure DevOps integration settings",
  ...
}

Document 3 (Workflow Settings):
{
  _id: ObjectId(...),
  settingKey: "workflow_config",
  category: "workflow",
  enabled: true,
  config: {
    webhookUrl: "https://webhook.example.com/automation",
    customHeaders: {
      "Authorization": "Bearer token..."
    },
    authorizationHeader: "Bearer token..."
  },
  description: "Workflow webhook settings",
  ...
}
```

### API Format (Frontend ↔ Backend)

**Frontend sends:**
```javascript
{
  email: {
    enabled: true,
    smtpServer: "smtp.gmail.com",
    fromAddress: "test@example.com",
    recipientsList: ["admin@example.com"]
  },
  ado: {
    enabled: false,
    projectUrl: "https://...",
    pat: "****",
    teamId: "Team"
  },
  workflow: {
    enabled: true,
    webhookUrl: "https://...",
    customHeaders: {}
  }
}
```

**Backend returns (same format for easy round-tripping):**
```javascript
{
  email: {
    enabled: true,
    smtpServer: "smtp.gmail.com",
    fromAddress: "test@example.com",
    recipientsList: ["admin@example.com"],
    _id: "ObjectId...",
    settingKey: "email_config"
  },
  ado: { ... },
  workflow: { ... }
}
```

---

## 🔌 Integration Services

### 1. EMAIL TRIGGER SERVICE

**Location:** `/backend/src/services/emailHelper.js`

**Supported Services:**
- Gmail (with app password)
- Office 365
- Custom SMTP

**Configuration:**
```javascript
{
  enabled: true,
  service: "gmail",              // gmail, office365, smtp
  username: "user@gmail.com",
  appPassword: "xxxx xxxx xxxx xxxx",  // Gmail app password
  fromAddress: "user@gmail.com",
  recipientsList: ["admin@test.com"]
}
```

**Trigger Points:**
```javascript
// On execution completion
await emailHelper.sendExecutionSummary(executionData, recipients);

// Sends:
// - Test report HTML
// - Summary (passed/failed/duration)
// - Execution logs as attachment
// - Function results
```

**API Endpoints:**
- `POST /settings/integrations/email/validate` - Test configuration
- `POST /settings/integrations/email/save` - Save config
- `POST /settings/manual/email-trigger` - Send test email

---

### 2. ADO UPDATER SERVICE

**Location:** `/backend/src/services/adoHelper.js`

**Integration Points:**
- Create test runs in Azure DevOps
- Update work items with results
- Link execution logs to test cases

**Configuration:**
```javascript
{
  enabled: true,
  url: "https://dev.azure.com/myorg",
  pat: "Personal Access Token",      // From ADO
  project: "MyProject",
  planId: "123",                     // Test Plan ID
  suiteId: "456"                     // Test Suite ID
}
```

**Trigger Points:**
```javascript
// On execution completion
await adoHelper.createTestRun(testCases, runName);

// Creates:
// - Test run in ADO
// - Test results for each function
// - Links execution data
// - Updates test case status
```

**API Endpoints:**
- `POST /settings/integrations/ado/validate` - Test connection
- `POST /settings/integrations/ado/save` - Save config
- `POST /settings/manual/ado-trigger` - Create test run

---

### 3. WORKFLOW TRIGGER SERVICE

**Location:** `/backend/src/services/workflowHelper.js`

**Supported Webhook Systems:**
- Zapier
- Microsoft Flow
- Custom webhooks
- GitHub Actions
- Jenkins

**Configuration:**
```javascript
{
  enabled: true,
  webhookUrl: "https://webhook.example.com/automation",
  customHeaders: {
    "X-Custom-Header": "value"
  },
  authorizationHeader: "Bearer token..."  // Optional
}
```

**Trigger Events:**
```javascript
// Event 1: Execution Start
{
  event: "execution_start",
  timestamp: "2026-04-19T10:00:00Z",
  executionId: "runId",
  scenarioName: "Login Test",
  metadata: { environment: "production", version: "1.0.0" }
}

// Event 2: Execution Complete
{
  event: "execution_complete",
  timestamp: "2026-04-19T10:05:00Z",
  executionId: "runId",
  scenarioName: "Login Test",
  summary: {
    totalFunctions: 3,
    passed: 3,
    failed: 0,
    passRate: "100.00"
  },
  functions: [
    { functionName: "Login", status: "success", duration: 1250 },
    ...
  ]
}

// Event 3: Execution Failure
{
  event: "execution_failure",
  timestamp: "2026-04-19T10:02:30Z",
  executionId: "runId",
  scenarioName: "Login Test",
  error: {
    message: "Element not found",
    stack: "..."
  }
}
```

**API Endpoints:**
- `POST /settings/integrations/workflow/validate` - Test webhook
- `POST /settings/integrations/workflow/save` - Save config
- `POST /settings/manual/workflow-trigger` - Send test webhook

---

## 🔄 Integration Execution Flow

```
Scenario Execution Completes
    │
    ├─ Store result in MongoDB
    │
    ├─ Trigger Integration Publishing
    │
    ├─ Email Integration
    │  ├─ Check if enabled
    │  ├─ Load email config from settings
    │  ├─ Format execution data
    │  ├─ Generate HTML report
    │  ├─ Attach logs
    │  └─ Send to recipients
    │
    ├─ ADO Integration
    │  ├─ Check if enabled
    │  ├─ Load ADO config from settings
    │  ├─ Map results to ADO test cases
    │  ├─ Create test run in ADO
    │  ├─ Update work items
    │  └─ Return test run URL
    │
    └─ Workflow Integration
       ├─ Check if enabled
       ├─ Load webhook config from settings
       ├─ Create webhook payload
       ├─ Send POST request to webhook URL
       ├─ Retry on failure (3 attempts)
       └─ Log response
```

---

## 🧵 Execution Logging Details

### Log Levels
- **info** - General information (blue)
- **warning** - Warnings (yellow)
- **error** - Errors (red)
- **debug** - Debug info (gray)

### Log Format
```
[TIMESTAMP] [LEVEL] [CATEGORY] Message

Examples:
[2026-04-19T10:00:00.123Z] [INFO] [VALIDATION] System readiness checks...
[2026-04-19T10:00:00.456Z] [INFO] [BROWSER] ✓ Browser context created
[2026-04-19T10:00:01.789Z] [INFO] [PAGE_LOAD] Navigated to: http://localhost:4000/login
[2026-04-19T10:00:02.012Z] [INFO] [CONSOLE] Login form loaded
[2026-04-19T10:00:03.345Z] [ERROR] [PAGE_ERROR] Cannot read property 'value' of null
```

### Log Categories
| Category | Purpose | Example |
|----------|---------|---------|
| VALIDATION | System checks | Browser installation, env vars |
| DATABASE | DB operations | Loading runs, scenarios |
| BROWSER | Browser ops | Launch, context creation |
| PAGE | Page operations | Create, close, navigation |
| PAGE_LOAD | Page navigation | URL changes |
| NAVIGATION | Frame navigation | Frame navigated |
| CONSOLE | Browser console | Console output |
| PAGE_ERROR | JS errors | Uncaught exceptions |
| DIALOG | Alerts/confirms | Alert shown |
| FUNCTION n | Function exec | Function start/end |
| CONFIG | Configuration | Settings applied |
| ITERATION n | Loop progress | Iteration start/end |
| SUMMARY | Results summary | Final stats |
| ERROR | Errors | Exception info |

---

## 💾 Database Collections

### settings collection
```javascript
{
  settingKey: String,           // unique identifier
  category: String,             // ado, email, workflow, teams, general
  enabled: Boolean,             // activation flag
  config: Mixed,                // integration-specific config
  description: String,          // human-readable description
  createdAt: Date,
  updatedAt: Date
}
```

### runs collection
```javascript
{
  name: String,                 // "Login Flow Test"
  scenarioId: ObjectId,         // reference to scenario
  scenarioName: String,         // denormalized for performance
  status: String,               // pending, running, completed, failed, cancelled
  environment: String,          // staging, production, development
  browserType: String,          // chromium, firefox, webkit
  mode: String,                 // headless, headed
  variables: Object,            // {baseUrl, username, password, ...}
  iterations: Number,           // how many times to repeat
  stopOnFailure: Boolean,       // halt on first failure
  totalDuration: Number,        // milliseconds
  createdAt: Date,
  updatedAt: Date
}
```

### results collection
```javascript
{
  runId: ObjectId,              // reference to run
  scenarioName: String,
  functionName: String,         // or "[EXECUTION_SUMMARY]"
  functionId: ObjectId,         // reference to function
  status: String,               // passed, failed, cancelled
  startTime: Date,
  endTime: Date,
  duration: Number,             // milliseconds
  logs: [String],               // execution logs
  output: Mixed,                // function return value
  error: String,                // error message if failed
  iteration: Number,            // which iteration this was
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Considerations

### Sensitive Data Protection
```javascript
// PATs, passwords, and tokens are:
// 1. Stored encrypted in settings (using MongoDB)
// 2. Never logged to execution logs
// 3. Never sent back to frontend (except on initial display)
// 4. Sent in request headers for API calls

// When displaying in UI:
// - Show as dots: ****
// - Allow "Show/Hide" toggle
// - Clear on page refresh
```

### Access Control
```javascript
// In production, add:
// - API authentication (JWT, OAuth)
// - Role-based access control (RBAC)
// - Audit logging of all changes
// - Encryption at rest for sensitive fields
```

---

## 🚀 Deployment Checklist

- [ ] All services configured in environment
- [ ] MongoDB connection verified
- [ ] Playwright browsers installed
- [ ] Email service validated
- [ ] ADO credentials tested
- [ ] Webhook URLs responding
- [ ] CORS configured correctly
- [ ] Logs directory permissions set
- [ ] Worker pool size optimized for hardware
- [ ] Timeouts configured appropriately

---

## 📞 SUPPORT & DEBUGGING

### Common Issues

**"Execution blocked the API"**
- Solution: Ensure worker pool is initialized
- Check: Worker threads in use

**"Settings not saving"**
- Solution: Check MongoDB connection
- Check: Settings schema has correct enums

**"Logs not showing"**
- Solution: Verify execution tracker initialized
- Check: Page listeners attached

**"Email not sent"**
- Solution: Verify email config saved
- Check: Email service credentials valid
- Check: Test with "Send Test Email"

---

**Complete Architecture Reference** ✅
