# Test Automation Tool - Issues & Fixes Analysis

## Current Status Review (April 19, 2026)

This document outlines the identified issues and the required fixes for the Test Automation Platform.

---

## 🔴 CRITICAL ISSUES IDENTIFIED

### 1. **Backend Blocking on Execution (CRITICAL)**
**Problem:** When clicking the Play button or triggering integrations, the entire backend freezes and becomes unresponsive to other API requests.

**Root Cause:**
- `executionEngine.executeScenario()` runs synchronously on the main thread
- No async/background processing - execution blocks the Express event loop
- When a long-running scenario executes, NO OTHER API endpoints can process requests
- All network requests timeout until execution completes

**Impact:**
- Users cannot interact with the UI while a test is running
- Cannot cancel execution, fetch logs, or perform any other operations
- Entire platform becomes unusable for 5+ minutes during test runs

**Solution Approach:**
- Move execution to a worker thread or child process
- Use Node.js `child_process.spawn()` with `detached: true` or
- Use `worker_threads` or a job queue (Bull, Agenda)
- Return immediately from execute endpoint while processing continues

**Priority:** 🔴 **HIGHEST - MUST FIX IMMEDIATELY**

---

### 2. **Settings Not Persisting (HIGH)**
**Problem:** Email, ADO, and Workflow preferences are not being saved to the database.

**Root Cause Analysis:**
- Frontend sends settings to `/api/settings` PUT endpoint using `bulkUpdateSettings()`
- Frontend calls: `updateSettings(updatedSettings)` which sends the entire settings object
- Backend expects: `{ ado: {...}, email: {...}, workflow: {...} }`
- **Issue:** The `bulkUpdateSettings()` controller is not correctly handling the nested structure
- Settings are being created but with wrong schema format
- No error feedback to user about what's being saved

**Current Flow:**
```
Frontend (EmailSettings.jsx)
  ↓ getSettings() → Returns array of setting docs
  ↓ updateSettings({ email: {...}, ado: {...} })
  ↓ PUT /api/settings
Backend (settingsController.bulkUpdateSettings)
  ↓ Iterates over categories
  ↓ Creates/updates in MongoDB
  ❌ Returns success but data structure is wrong
```

**Solution Approach:**
1. Fix the bulk update to properly structure data according to Settings schema
2. Return actual saved data to frontend for verification
3. Add validation before saving
4. Implement category-specific save endpoints with proper response

**Priority:** 🟠 **HIGH - Users cannot save settings**

---

### 3. **Execution Logging Not Displayed (HIGH)**
**Problem:** When tests execute, users see limited logging. Need to capture:
- Page navigation (URLs visited)
- Element selections/interactions
- Function start/end with timing
- Browser console output
- Network requests

**Current State:**
- Basic function-level logs exist
- No page navigation tracking
- No screenshot/state capture
- No browser console logs
- Limited visibility into what's happening

**Solution Approach:**
1. Add page navigation logging in `playwrightService.js`
2. Capture all page goto/navigate events
3. Add console message listener to capture logs
4. Enhance function executor to log interactions
5. Display in ExecutionMonitor with filtering options

**Priority:** 🟠 **HIGH - Required for debugging**

---

## ✅ PRIORITY ORDER FOR FIXES

### Phase 1: CRITICAL (Must complete first)
1. **Fix Backend Blocking Issue** → Implement worker thread execution
   - This unblocks the entire platform
   - Enables all other features to work
   - Users can interact with UI during test runs

### Phase 2: HIGH (Essential features)
2. **Fix Settings Persistence** → Correct database schema handling
   - Email triggers will work with saved config
   - ADO updates will use saved credentials
   - Workflow triggers will use saved webhooks

3. **Enhance Execution Logging** → Add page navigation & interaction logs
   - Better visibility during execution
   - Easier debugging of test failures
   - Real-time monitoring of what's happening

### Phase 3: MEDIUM (Additional polish)
- Add browser console capture
- Add screenshot on error
- Add network request logging
- Add execution performance metrics

---

## 📋 INTEGRATION SERVICES (HIGH PRIORITY)

### Email Trigger
- **Status:** Implementation exists but settings not persisting
- **Fix Required:** Save settings properly + implement async sending
- **Features to Add:**
  - Send email on execution complete
  - Include test report with logs
  - Configurable recipient list
  - HTML formatted reports

### ADO Updater
- **Status:** Implementation exists but needs testing
- **Fix Required:** Ensure settings persist + test with real ADO instance
- **Features:**
  - Create test run in Azure DevOps
  - Update work items with test results
  - Link execution logs to work items

### Workflow Trigger
- **Status:** Implementation exists but needs testing
- **Fix Required:** Ensure settings persist + test with real webhooks
- **Features:**
  - Send webhook on execution start/complete/fail
  - Custom payload support
  - Retry logic for failed webhooks

---

## 🎯 SPECIFIC CODE LOCATIONS TO FIX

### Backend Issues

#### 1. Blocking Execution (runs.js, line 60-72)
```javascript
// Current: Blocks everything
router.post('/:id/execute', async (req, res) => {
  // ... returns immediately but executeScenario blocks
  executionEngine.executeScenario(id).catch(...)
})
```
**Fix:** Use worker thread or child process

#### 2. Settings Persistence (settingsController.js, bulkUpdateSettings)
- Line 108-160: Settings creation logic needs review
- Schema mismatch between frontend and backend expectations
- Need proper validation and error handling

#### 3. Execution Logging (executionEngine.js)
- Line 115+: Need to capture page navigation events
- Line 250+: Enhance executeFunction to log interactions
- Add event listeners for page events

### Frontend Issues

#### 1. Settings Components (EmailSettings.jsx, AdoSettings.jsx)
- Load/save logic needs verification
- Add error handling for failed saves
- Display actual saved data from backend

---

## 📊 TESTING CHECKLIST

Once fixes are complete:
- [ ] Click Play button → Other API calls work immediately
- [ ] Save Email settings → Settings persisted in database
- [ ] Save ADO settings → Settings persisted in database
- [ ] Execute scenario → See page navigation logs
- [ ] Execute scenario → See function execution logs with timing
- [ ] Cancel execution → Still possible while test runs
- [ ] Fetch results → Logs include all details about execution

---

## 🚀 IMPLEMENTATION TIMELINE

**Estimated Effort:**
- Backend blocking fix: 2-3 hours
- Settings persistence fix: 1-2 hours
- Execution logging enhancement: 2-3 hours
- Testing & validation: 1-2 hours

**Total: ~6-10 hours**
