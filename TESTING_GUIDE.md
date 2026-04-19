# Test Automation Tool - Quick Testing Guide

## 🚀 How to Test the Fixes

### Prerequisites
- MongoDB running
- Backend and Frontend started
- Demo site running

---

## TEST 1: Backend is NOT Blocking ✅

### What to Test
When a test executes, other API calls should work immediately (not frozen).

### Steps:
1. **Start a long-running test:**
   ```bash
   # Create a test function that sleeps
   # Go to Functions → Create → name it "LongTest"
   # Code:
   async function LongTest(page, vars, selectors) {
     await new Promise(r => setTimeout(r, 30000)); // 30 second sleep
     return { success: true };
   }
   
   # Create scenario with this function
   # Create run with this scenario
   # Click Play button
   ```

2. **Immediately test other APIs** (should all work):
   ```bash
   # In another terminal while test is running:
   curl http://localhost:5000/api/users          # Should respond immediately
   curl http://localhost:5000/api/functions      # Should respond immediately
   curl http://localhost:5000/api/settings       # Should respond immediately
   ```

3. **Check Execution Monitor:**
   - Should show real-time logs updating
   - Should be able to cancel if needed
   - Should not freeze the UI

### Expected Result:
✅ All API calls respond immediately without waiting for execution  
✅ Can cancel execution while it runs  
✅ Can fetch other data while test executes

---

## TEST 2: Settings Are Persisting ✅

### Test 2A: Email Settings

1. **Navigate to Settings → Email Settings**

2. **Enter configuration:**
   - Enable Email Notifications: ✓ (checked)
   - SMTP Server: `smtp.gmail.com`
   - From Email Address: `test@example.com`
   - Add recipients: `admin@example.com`, `qa@example.com`

3. **Click Save Settings**
   - Should see: `✓ Settings saved successfully!`

4. **Refresh the page** (F5)
   - Should see all settings still there
   - Values unchanged

5. **Verify in database:**
   ```bash
   mongosh test-automation-tool
   db.settings.find({ category: 'email' })
   # Should see document with your settings
   ```

### Expected Result:
✅ Settings saved to database  
✅ Settings persist after page refresh  
✅ Can be retrieved via API

---

### Test 2B: ADO Settings

1. **Navigate to Settings → ADO Settings**

2. **Enter configuration:**
   - Enable ADO Integration: ✓ (checked)
   - ADO Project URL: `https://dev.azure.com/myorg/myproject`
   - Personal Access Token: (any dummy PAT)
   - Team ID: `Core Team`

3. **Click Save Settings**
   - Should see: `✓ Settings saved successfully!`

4. **Refresh the page** (F5)
   - Should see all settings still there

5. **Verify in database:**
   ```bash
   mongosh test-automation-tool
   db.settings.find({ category: 'ado' })
   # Should see document with your settings
   ```

### Expected Result:
✅ ADO settings saved  
✅ Settings persist after refresh  
✅ Can be retrieved via API

---

## TEST 3: Execution Logs Show Page Navigation ✅

### What to Test
Logs should show what pages the browser navigates to and what console messages appear.

### Steps:

1. **Create a simple test function:**
   ```
   Name: TestNavigation
   Code:
   async function TestNavigation(page, vars, selectors) {
     console.log('Starting navigation test');
     await page.goto(vars.baseUrl + '/login');
     console.log('Reached login page');
     await page.goto(vars.baseUrl + '/products');
     console.log('Reached products page');
     return { success: true };
   }
   ```

2. **Create scenario** with this function

3. **Create run** with:
   - baseUrl: `http://localhost:4000`

4. **Execute the run** (click Play)

5. **Watch Execution Monitor:**
   - Look for `[PAGE_LOAD]` entries showing URLs
   - Look for `[CONSOLE]` entries showing your console.log messages
   - Example log:
     ```
     [PAGE_LOAD] Navigated to: http://localhost:4000/login
     [CONSOLE] Starting navigation test
     [CONSOLE] Reached login page
     [PAGE_LOAD] Navigated to: http://localhost:4000/products
     [CONSOLE] Reached products page
     ```

### Expected Result:
✅ See page navigation logs (`[PAGE_LOAD]`)  
✅ See console messages (`[CONSOLE]`)  
✅ Function execution timing shown  
✅ Logs include all interactions

---

## TEST 4: Execution Monitor Shows Real-Time Logs ✅

### What to Test
As test executes, logs should update in real-time every 500ms.

### Steps:

1. **Create a 3-function scenario:**
   - Function 1: Sleep 2 seconds
   - Function 2: Sleep 2 seconds
   - Function 3: Sleep 2 seconds

2. **Execute scenario**

3. **Watch Execution Monitor:**
   - Logs should appear incrementally
   - Not all at once at the end
   - Status should show: `Running...`
   - When complete: `Completed`

4. **Try to cancel:**
   - Click "Cancel Execution" button
   - Should ask for confirmation
   - Execution should stop gracefully
   - Status changes to `Cancelled`

### Expected Result:
✅ Logs update every 500ms in real-time  
✅ Can cancel while running  
✅ Status updates correctly  
✅ Monitor doesn't freeze

---

## TEST 5: Multiple Concurrent Executions ✅

### What to Test
Can start multiple test runs simultaneously without blocking.

### Steps:

1. **Create 3 different scenarios** (or same one 3 times)

2. **Start execution of scenario 1** → Click Play → Logs appear

3. **Immediately start execution of scenario 2** → Click Play → Logs appear

4. **Immediately start execution of scenario 3** → Click Play → Logs appear

5. **Expected:**
   - All 3 should show in execution monitor
   - All 3 should collect logs independently
   - All 3 should complete successfully
   - Can cancel one without affecting others

### Expected Result:
✅ Can run 3 tests simultaneously  
✅ All collect logs independently  
✅ No blocking between them  
✅ Max 3 concurrent (4th will queue)

---

## TEST 6: API Response Format ✅

### Settings API Format

```bash
# Call the API
curl http://localhost:5000/api/settings

# Should return (formatted):
{
  "ado": {
    "enabled": true,
    "projectUrl": "https://...",
    "pat": "****",
    "teamId": "Core Team",
    "_id": "...",
    "settingKey": "ado_config"
  },
  "email": {
    "enabled": true,
    "smtpServer": "smtp.gmail.com",
    "fromAddress": "test@example.com",
    "recipientsList": ["admin@example.com"],
    "_id": "...",
    "settingKey": "email_config"
  },
  "workflow": {
    "enabled": false,
    ...
  }
}
```

### Execution Logs API Format

```bash
# While test is running
curl http://localhost:5000/api/runs/{runId}/logs

# Should return:
{
  "runId": "...",
  "logs": [
    "[TIMESTAMP] [LEVEL] Message 1",
    "[TIMESTAMP] [LEVEL] Message 2",
    ...
  ],
  "status": "running",
  "logsCount": 25,
  "startTime": "2026-04-19T10:00:00Z",
  "completedAt": null
}

# After test completes
{
  "runId": "...",
  "logs": [...all logs...],
  "status": "completed",
  "logsCount": 42,
  "startTime": "2026-04-19T10:00:00Z",
  "completedAt": "2026-04-19T10:05:00Z",
  "finalStatus": "completed"
}
```

---

## 📋 TEST RESULTS CHECKLIST

### Critical Tests (Must Pass):
- [ ] **Non-Blocking**: API calls work while test runs
- [ ] **Settings Save**: Email settings persist
- [ ] **Settings Save**: ADO settings persist
- [ ] **Page Logs**: Can see page navigation in logs
- [ ] **Console Logs**: Can see console messages in logs

### Important Tests:
- [ ] **Concurrent Execution**: Can run multiple tests at once
- [ ] **Real-time Logs**: Logs update every 500ms
- [ ] **Cancel Execution**: Can stop a running test
- [ ] **API Format**: Settings returned in correct format
- [ ] **Error Handling**: Errors shown in logs

### Nice to Have:
- [ ] **Database Verification**: Settings in MongoDB
- [ ] **Performance**: Tests complete in reasonable time
- [ ] **UI Responsiveness**: Frontend doesn't freeze

---

## 🐛 TROUBLESHOOTING

### Issue: Settings not saving
```bash
# Check database connection
mongosh test-automation-tool
db.settings.find()

# Check backend logs for errors
# Look for: "[SETTINGS] Error updating email settings:"
```

### Issue: API still blocking
```bash
# Check worker pool is running
curl http://localhost:5000/api/health

# Check active executions
# Look for: "[POOL] Assigning run ... to worker"
```

### Issue: Logs not updating
```bash
# Check execution tracker
curl http://localhost:5000/api/runs/{runId}/logs

# Should show increasing logsCount
# If not, check backend logs for execution errors
```

### Issue: Settings appear but not in DB
```bash
# Force refresh database
mongosh test-automation-tool
db.settings.find().forEach(doc => print(doc._id, doc.category, doc.settingKey))
```

---

## TEST 6: Backend Logging is Comprehensive ✅ (NEW)

### What to Test
When clicking Play to execute a scenario, comprehensive logs should appear in the backend terminal showing the entire execution lifecycle.

### Steps:

1. **Start the backend with visible logs:**
   ```bash
   cd backend
   npm start
   ```
   
   You should immediately see:
   ```
   [POOL] ========== INITIALIZING WORKER POOL ==========
   [POOL] Max Workers: 3
   [POOL] Creating workers...
   [POOL] ✓ Worker #1 created
   [POOL] ✓ Worker #2 created
   [POOL] ✓ Worker #3 created
   [POOL] ✓ Worker pool initialized with 3 workers
   ```

2. **Create and execute a scenario:**
   - Go to Scenarios page
   - Create a simple test (or use existing)
   - Click the Play button
   - **Watch the backend terminal** (Don't close it!)

3. **Verify logging at each stage:**

   **Stage 1: Execution Request Received** (Immediate):
   ```
   ========== EXECUTION REQUEST ==========
   Run ID: <uuid>
   ✓ Run ID validation passed
   ✓ Run found in database
   Active Executions: 0/3
   Pending Queue Size: 0
   Delegating to worker pool for execution...
   ========== END EXECUTION REQUEST ==========
   ```

   **Stage 2: Worker Assigned** (Within 1 second):
   ```
   [POOL] ✓ ========== ASSIGNING WORKER ==========
   [POOL] Run ID: <uuid>
   [POOL] Active Executions: 1/3
   [POOL] Queued Tasks: 0
   [POOL] Available Workers: 2
   [POOL] ========================================
   [POOL] Sending EXECUTE_SCENARIO message to worker for run <uuid>
   ```

   **Stage 3: Worker Executes** (Ongoing):
   ```
   [WORKER] 📋 ========== EXECUTION START ==========
   [WORKER] Run ID: <uuid>
   [WORKER] Process ID: <number>
   [WORKER] Timestamp: <ISO datetime>
   [WORKER] ==========================================
   [WORKER] ✓ Received EXECUTE_SCENARIO message
   [WORKER] 🔍 Executing scenario: "Scenario Name"
   [WORKER] 📍 Step 1: Navigate to page...
   [WORKER] ✓ Page opened
   [WORKER] 📍 Step 2: Find element...
   ... (more steps)
   ```

   **Stage 4: Execution Completes** (After scenario finishes):
   ```
   [WORKER] ✓ ========== EXECUTION COMPLETED ==========
   [WORKER] Result: ✓ SUCCESS (or ✗ FAILED)
   [WORKER] Total Duration: XXXms
   [WORKER] ==========================================
   ```

   **Stage 5: Worker Released** (Immediate after completion):
   ```
   [POOL] ✓ ========== WORKER RELEASED ==========
   [POOL] Run ID: <uuid>
   [POOL] Result: ✓ SUCCESS
   [POOL] Duration: XXXms
   [POOL] Active Executions: 0/3
   [POOL] Queued Tasks: 0
   [POOL] Available Workers: 3
   [POOL] ===========================================
   ```

### Expected Result:
✅ See "INITIALIZATION" logs when backend starts  
✅ See "EXECUTION REQUEST" logs immediately after clicking Play  
✅ See "[POOL]" logs for worker assignment  
✅ See "[WORKER]" logs showing execution progress  
✅ See "WORKER RELEASED" logs when done  
✅ All stages appear in correct order

### What NOT to Do:
❌ Don't close the backend terminal - you need to see the logs!  
❌ Don't expect frontend to show the logs - they're in the **backend terminal only**  
❌ Don't run the backend in background without redirecting output

### Troubleshooting:

**Problem: No logs appear**
- Solution: Verify backend is actually running with `ps aux | grep node`
- Solution: Try running backend with explicit output: `npm start 2>&1 | tee backend.log`

**Problem: "Cannot find module" error**
- Solution: Run verification: `bash verify-logging.sh`
- Solution: Check `/backend/src/workers/executionWorker.js` exists

**Problem: Only see some logs, not all**
- Solution: Check if scenario has errors that stop execution
- Solution: Try a simpler test scenario (just navigate to a page)
- Solution: Check browser console for JavaScript errors

**Problem: Logs have different timestamps**
- This is normal - frontend time vs backend time may differ slightly
- Check the `[POOL]` and `[WORKER]` prefixes to identify which logs are which

### Test Queue Management (Advanced):

To test that multiple executions are queued properly:

1. Have 2-3 scenarios ready
2. Start execution of Scenario #1 (watch logs)
3. Immediately (within 5 seconds) click Play for Scenario #2
4. Immediately click Play for Scenario #3
5. Watch backend logs for:
   ```
   [POOL] ⏳ No workers available, queuing run <uuid2>
   [POOL] Queued Tasks: 1
   ```
   ```
   [POOL] ⏳ No workers available, queuing run <uuid3>
   [POOL] Queued Tasks: 2
   ```
6. As workers complete, watch for:
   ```
   [POOL] ⏩ Processing next task from queue...
   ```

Expected behavior: Queue grows, then shrinks as workers complete tasks.

---

## 📞 SUPPORT

If tests fail, check:

1. **MongoDB**: `mongosh` should connect
2. **Backend**: `npm start` should show "✓ Test Automation API running"
3. **Frontend**: `npm run dev` should show "VITE dev server is ready"
4. **Demo Site**: `node server.js` should show "Server running on :4000"
5. **Logging**: Backend terminal should show `[POOL]` logs immediately when started

All must be running for full testing. Most importantly, **keep the backend terminal open** to see the logs!

---

## 📝 NOTES

- Tests can be run in any order
- Can re-run same test multiple times
- Clear data between test runs if needed: `db.settings.deleteMany({})`
- Worker pool resets when backend restarts
- Logs auto-cleanup after 30 days (configured in tracker)

---

**Ready to test!** 🎉
