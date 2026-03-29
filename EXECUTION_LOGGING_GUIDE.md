# Test Automation Tool - Complete Setup & Usage Guide

## 🎨 1. THEME SYSTEM UPDATES

### Simple Blue/White/Black Theme
✅ **Completed**: All gradients removed, using simple solid colors

**Current Theme Colors:**
- **Primary**: `#1976d2` (Professional Blue)
- **Secondary**: `#212121` (Dark Gray/Black)
- **Text Primary**: `#212121`
- **Background**: `#ffffff` (White)

**Where to Customize:**
📄 File: `frontend/src/theme/theme.js` (lines 17-58)

To change colors, edit the `colors` object:
```javascript
const colors = {
  primary: '#1976d2',      // Change this for primary color
  secondary: '#212121',    // Change this for secondary color
  // ... other colors
};
```

**Theme Updates Applied:**
- ✅ Removed gradient from sidebar header (now solid blue)
- ✅ Removed gradient from top AppBar
- ✅ Removed hardcoded `#999` color for settings label
- ✅ Removed all hardcoded color values from Layout.jsx
- ✅ All menu active states use theme colors
- ✅ No component edits needed - all theme-driven

---

## 🔍 2. EXECUTION LOGGING & MONITORING

### Live Execution Logs
When you click the **Play** (Execute) button on any run:

1. **Execution Monitor Dialog** opens showing:
   - Real-time execution logs
   - Execution status badge (Running/Completed/Cancelled/Error)
   - Total log count
   - Auto-scrolling to latest logs
   - **500ms refresh rate** for real-time feeling

2. **What you'll see:**
   - `[TIMESTAMP] [LEVEL] Message` format
   - Color-coded log levels:
     - 🔵 **Blue** = Info
     - 🟡 **Yellow** = Warning
     - 🔴 **Red** = Error
     - ⚫ **Gray** = Debug
   - Progress indicator while running

### Backend Logging Enhancement
**New Tracker System:** `backend/src/utils/executionTracker.js`

Features:
- Registers all executions
- Tracks logs in memory with timestamps
- Supports execution cancellation
- Auto-cleanup on completion

**Execution Stages Logged:**
```
[VALIDATION] System readiness checks
[DATABASE] Run/scenario/selector loading
[BROWSER] Browser launch and context creation
[PAGE] Page creation and setup
[FUNCTION n] Individual function execution
[CONFIG] Configuration settings
[ITERATION n] Iteration progress
[SUMMARY] Final execution summary
[ERROR] Error tracking with stack traces
```

### New API Endpoints
```
GET  /runs/:id/logs         → Get live execution logs
GET  /runs/:id/status       → Get execution status
POST /runs/:id/cancel       → Cancel running execution
```

---

## ❌ 3. EXECUTION CANCELLATION

### Cancel Button in Monitor
- ✅ **Available during execution**
- ✅ **Disabled after completion**
- Shows confirmation dialog
- Requests soft cancellation (graceful shutdown)
- Updates logs with cancellation message

### How It Works
1. User clicks "Cancel Execution" button
2. System sends cancellation signal to abort execution
3. Current function completes, but iteration stops
4. Browser resources are cleaned up
5. Final status marked as "cancelled"
6. All logs preserved for review

**Status Values:**
- `running` - Execution in progress
- `completed` - Finished successfully
- `cancelled` - User cancelled
- `error` - Execution failed

---

## 🔧 4. PLAYWRIGHT BROWSER INSTALLATION

### Automatic Detection & Installation

When you execute a test run:

1. **System checks** if Playwright browsers are installed
2. **If found**: Proceeds with execution
3. **If missing**:
   - Shows **BrowserSetupDialog**
   - Provides npm command: `npx playwright install`
   - Offers copy-to-clipboard button
   - Shows step-by-step instructions
   - Allows "Retry" to check again after manual installation

### Browser Setup Dialog Features
- ✅ Copy command button
- ✅ Copy confirmation ("✓ Command copied")
- ✅ Installation time estimate (1-5 minutes)
- ✅ Internet requirement warning
- ✅ Step-by-step instructions
- ✅ Retry button after installation

### Manual Installation Steps

```bash
# Step 1: Open terminal in project root
cd /path/to/test-automation-tool

# Step 2: Run browser installation
npx playwright install

# Output should show:
# ✓ chromium
# ✓ firefox
# ✓ webkit

# Step 3: Wait for completion
# (Usually 1-5 minutes depending on connection)

# Step 4: Return to app and click "Retry"
```

### Auto-Install on Backend
If auto-install is enabled (it tries automatically):
- Timeout: 5 minutes
- Downloads chromium, firefox, webkit
- Success notified in logs
- Failure returns manual steps

**Location:** `backend/src/services/executionEngine.js` (lines 37-50)

---

## 📊 LOGGING FLOW DIAGRAM

```
Frontend Click Play Button
    ↓
Check Browser Installation Status
    ├─ Browsers Found → Show ExecutionMonitor
    └─ Browsers Missing → Show BrowserSetupDialog
    
ExecutionMonitor Dialog Opens
    ↓
Backend executeScenario() starts
    ↓
ExecutionTracker.registerExecution()
    ↓
For each step:
  - validator.addLog(runId, message, level)
  - Log appears in frontend (500ms poll)
  - User sees real-time progress
    ↓
ExecutionTracker.completeExecution()
    ↓
Dialog shows "Completed" status
User can close and see results
```

---

## 🎯 QUICK START: RUNNING YOUR FIRST TEST

### 1. Browser Setup (One-time)
If this is your first run:
```bash
cd test-automation-tool/backend
npx playwright install
# Wait for completion...
```

### 2. Start Frontend & Backend
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 3. Create & Run a Test
1. Go to **Runs** page
2. Click **"New Run"** button
3. Select a scenario
4. Click **"Create"**
5. Find your run and click **Play** icon ▶️

### 4. Monitor Execution
- Execution Monitor dialog opens
- Watch logs stream in real-time
- See colors and timestamps
- Click **"Cancel Execution"** to stop (if needed)
- Dialog auto-closes when done

---

## 🔧 TROUBLESHOOTING

### Issue: "Playwright browsers not found"
**Solution 1: Auto-install (automatic)**
- System will try to download and install automatically
- Shows progress in logs

**Solution 2: Manual install**
```bash
npx playwright install
```
Then click "Retry" in the dialog

### Issue: Execution stuck loading
**Check:**
1. Backend running? Check terminal for logs
2. Is it downloading browsers? (Check internet, takes time)
3. Use "Cancel Execution" button to stop

### Issue: No logs appearing
**Check:**
1. Backend `/runs/:id/logs` endpoint responding?
2. Is polling working? (500ms interval)
3. Execution started? Check execution status

### Issue: Browsers installed but still not found
**Try:**
```bash
cd backend
npm install playwright  # Re-install
npx playwright install   # Re-download browsers
```

---

## 📁 NEW FILES CREATED

```
backend/
  └─ src/utils/executionTracker.js    (140 lines) - Execution tracking
  └─ src/routes/runs.js               (Enhanced with 4 new endpoints)
  └─ src/services/executionEngine.js  (Updated with tracker integration)

frontend/
  └─ src/components/ExecutionMonitor.jsx      (120 lines) - Live logs dialog
  └─ src/components/BrowserSetupDialog.jsx    (130 lines) - Browser setup
  └─ src/pages/Runs.jsx                       (Updated with monitors)
  └─ src/api/api.js                           (Updated with new methods)
  └─ src/theme/theme.js                       (Updated colors)
  └─ src/layout/Layout.jsx                    (Removed gradients, solid colors)
```

---

## 🚀 PERFORMANCE NOTES

### Logging Performance
- **Poll Interval:** 500ms (balance between responsiveness and server load)
- **Max Logs Stored:** Unlimited (in memory during execution)
- **Cleanup:** Automatic after execution completes

### Browser Installation
- **One-time only** - installed browsers persist
- **Size:** ~600MB total for 3 browsers
- **Time:** First install 1-5 minutes, subsequent runs instant

### Multi-threading
- **Execution:** Single async thread per run
- **Polling:** Separate request thread for logs
- **Status:** No blocking operations

---

## 📋 API REFERENCE

### New Endpoints

```javascript
// Check browser installation status
POST /runs/check-browser-status
Response: {
  browsersInstalled: boolean,
  message: string,
  command?: 'npx playwright install',
  instructions?: string[]
}

// Get live execution logs
GET /runs/:id/logs
Response: {
  runId: string,
  logs: [{timestamp, level, message}],
  status: 'running'|'completed'|'cancelled'|'error',
  logsCount: number,
  startTime: ISO datetime,
  completedAt?: ISO datetime,
  finalStatus?: string
}

// Get execution status
GET /runs/:id/status
Response: {
  found: boolean,
  runId: string,
  status: string,
  startTime: ISO datetime,
  completedAt?: ISO datetime,
  finalStatus?: string,
  logsCount: number
}

// Cancel execution
POST /runs/:id/cancel
Response: {
  message: 'Cancellation requested',
  runId: string
}
```

---

## ✅ WHAT'S WORKING NOW

- ✅ Simple blue/white/black theme (no gradients)
- ✅ All colors theme-driven (single source of truth)
- ✅ Real-time execution monitoring with live logs
- ✅ Color-coded log levels
- ✅ Auto-scroll to latest logs
- ✅ Execution cancellation with confirmation
- ✅ Playwright browser detection
- ✅ Auto-install with fallback to manual
- ✅ Browser setup dialog with copy button
- ✅ Complete execution tracking
- ✅ Timestamp on all logs
- ✅ Memory-efficient polling

---

## 📝 NEXT STEPS (Optional Enhancements)

- [ ] WebSocket for truly real-time logs (instead of 500ms polling)
- [ ] Download logs as file
- [ ] Filter logs by level
- [ ] Search logs
- [ ] Custom theme selection (dark/light mode)
- [ ] Browser performance metrics
- [ ] Parallel execution tracking for multiple runs

---

## 💡 TIP: CUSTOMIZE YOUR THEME

To change theme colors globally:

1. Open `frontend/src/theme/theme.js`
2. Edit the colors object (lines 17-58)
3. Save file - website auto-reloads
4. **All** colors (sidebar, header, buttons, text) update instantly

Example:
```javascript
const colors = {
  primary: '#00b050',      // Change to green
  secondary: '#000000',    // Dark black
  // ... rest of colors
};
```

---

Generated: March 29, 2026
Tool Version: 1.0
