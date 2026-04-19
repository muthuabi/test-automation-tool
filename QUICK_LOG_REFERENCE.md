# 🎯 Quick Reference - Execution Logging

## Start Your Test Automation

### Terminal 1: Backend (Main Logs Here)
```bash
cd backend
npm start
```
✅ Should show: `[POOL] ✓ Worker pool initialized with 3 workers`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
✅ Should show: `VITE v... ready in ... ms`

### Terminal 3: Open Browser
```
http://localhost:5173
```

---

## Execute a Test

1. Navigate to **Scenarios** → Select or create scenario
2. Click **Play** button
3. **Watch Terminal 1** for logs (don't close it!)

---

## Expected Log Output

### Phase 1: Execution Requested
```
========== EXECUTION REQUEST ==========
✓ Run ID validation passed
Active Executions: 0/3
Queued Tasks: 0
========== END EXECUTION REQUEST ==========
```
**⏱️ When**: Immediately after clicking Play

### Phase 2: Worker Assigned
```
[POOL] ✓ ========== ASSIGNING WORKER ==========
[POOL] Active Executions: 1/3
[POOL] Available Workers: 2
[POOL] ========================================
```
**⏱️ When**: Within 1 second

### Phase 3: Execution Starts
```
[WORKER] 📋 ========== EXECUTION START ==========
[WORKER] Run ID: <uuid>
[WORKER] Process ID: <number>
[WORKER] Timestamp: <time>
```
**⏱️ When**: As soon as browser launches

### Phase 4: Steps Executing
```
[WORKER] 🔍 Step 1: Navigate to page
[WORKER] ✓ Page opened
[WORKER] 📍 Step 2: Find element
[WORKER] ✓ Element found
```
**⏱️ When**: During test execution

### Phase 5: Completed
```
[WORKER] ✓ ========== EXECUTION COMPLETED ==========
[WORKER] Result: ✓ SUCCESS
[WORKER] Duration: 2345ms
```
**⏱️ When**: After all steps finish

### Phase 6: Worker Released
```
[POOL] ✓ ========== WORKER RELEASED ==========
[POOL] Result: ✓ SUCCESS
[POOL] Duration: 2345ms
[POOL] Active Executions: 0/3
[POOL] Available Workers: 3
```
**⏱️ When**: Immediately after completion

---

## Log Prefixes

| Prefix | Meaning | Example |
|--------|---------|---------|
| `[POOL]` | Worker pool operations | Worker assignment/release |
| `[WORKER]` | Individual worker executing | Test steps, navigation |
| `[EXECUTE API]` | Execution request received | API endpoint hit |
| (no prefix) | Status messages | Validation, queue info |

---

## Status Icons

| Icon | Meaning |
|------|---------|
| ✓ | Success ✅ |
| ✗ | Error ❌ |
| ⚠ | Warning |
| 🔍 | Finding/Searching |
| 📍 | Navigation |
| 🎯 | Target Element |
| 📋 | Information |
| ⏳ | Waiting |
| ⏩ | Processing |

---

## Quick Troubleshooting

### 🔴 No logs in terminal?
```bash
# 1. Verify backend is running
ps aux | grep node

# 2. Run verification
bash verify-logging.sh

# 3. Check for errors in backend
# Look for: "ERROR", "Cannot find module", "Worker error"
```

### 🔴 Only partial logs showing?
```bash
# 1. Check if test has an error
# Look for: [WORKER] ✗

# 2. Try simpler test (just navigate)

# 3. Check browser console (F12) for JavaScript errors
```

### 🔴 "Cannot find module" error?
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### 🔴 Settings validation error?
```bash
# Clear browser cache
# Or reload page: Ctrl+Shift+R
```

---

## Queue Management Example

### Running 3 Tests Quickly:

```
Test 1 Start
[POOL] ✓ ========== ASSIGNING WORKER ========== (1/3 active)
  ↓
Test 2 Requested
[POOL] ⏳ No workers available, queuing run...
  ↓
Test 3 Requested
[POOL] ⏳ No workers available, queuing run...
[POOL] Queued Tasks: 2
  ↓
Test 1 Completes
[POOL] ✓ ========== WORKER RELEASED ==========
[POOL] ⏩ Processing next task from queue...
[POOL] ✓ ========== ASSIGNING WORKER ========== (Test 2 starts)
  ↓
Test 2 Completes
[POOL] ⏩ Processing next task from queue...
[POOL] ✓ ========== ASSIGNING WORKER ========== (Test 3 starts)
  ↓
Test 3 Completes
[POOL] ✓ ========== WORKER RELEASED ==========
[POOL] Available Workers: 3
```

---

## Verify Installation

```bash
bash verify-logging.sh
```

Expected output:
```
✓ Worker file found at backend/src/workers/executionWorker.js
✓ Worker pool file found
✓ Worker pool has logging enabled
✓ Execute endpoint has logging
✓ Execution worker has logging
✓ Settings has default structure
================================================
   Verification Complete
================================================
```

---

## Performance Baseline

| Metric | Expected Value |
|--------|---|
| Time to show "EXECUTION REQUEST" | < 1 second |
| Time to assign worker | < 1 second |
| Time to see first [WORKER] log | < 5 seconds |
| Queue processing | Instant when worker free |
| Worker cycle time | 5-30 seconds (depends on test) |
| Pool initialization | < 1 second at startup |

---

## Common Test Scenarios

### 1. Single Test
```
Click Play
├─ ========== EXECUTION REQUEST ==========
├─ [POOL] ✓ ========== ASSIGNING WORKER ==========
├─ [WORKER] 📋 Executing...
└─ [POOL] ✓ ========== WORKER RELEASED ==========
Duration: ~30 seconds total
```

### 2. Two Quick Tests
```
Click Play (Test 1)
├─ ========== EXECUTION REQUEST ==========
├─ [POOL] ✓ ========== ASSIGNING WORKER ========== (1/3)

Click Play (Test 2) immediately
├─ ========== EXECUTION REQUEST ==========
├─ [POOL] ⏳ No workers available, queuing...
└─ Queued Tasks: 1

(Test 1 completes)
├─ [POOL] ✓ ========== WORKER RELEASED ==========
├─ [POOL] ⏩ Processing next task from queue...
└─ [POOL] ✓ ========== ASSIGNING WORKER ========== (Test 2 starts)
```

### 3. Three Tests (Max Capacity)
```
First 3 clicks: All assigned immediately (3/3 workers)
Next clicks: Show queuing
Completed tests: Show queue processing
```

---

## Pro Tips

1. **Filter logs**: Use `grep` to see specific logs
   ```bash
   tail -f backend.log | grep "\[POOL\]"
   ```

2. **Timestamps**: Each major event has timestamp for debugging

3. **Process IDs**: `[WORKER]` shows process ID for multi-worker tracking

4. **Queue depth**: Check `Queued Tasks: N` to see if system is overloaded

5. **Duration tracking**: Final duration shows total execution time

---

## What to Show Others

Share this terminal output to demonstrate logging:
```
[✓] Worker pool initialized
[✓] Execution request received 
[✓] Worker assigned (1/3 active)
[✓] Scenario executing with real-time progress
[✓] Completed in 2345ms
[✓] Worker released (0/3 active)
```

---

**Ready to test?** 🚀

```bash
cd backend && npm start
```

Then: `http://localhost:5173` and click Play!
