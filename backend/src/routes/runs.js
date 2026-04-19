const express = require('express');
const router = express.Router();
const runsController = require('../controllers/runsController');
const executionEngine = require('../services/executionEngine');
const workerPool = require('../utils/workerPool');
const logger = require('../utils/logger');
const { validateAndConvertId } = require('../utils/idValidator');
const executionTracker = require('../utils/executionTracker');

router.get('/', runsController.getRuns);
router.get('/:id', runsController.getRunById);
router.post('/', runsController.createRun);
router.put('/:id', runsController.updateRun);
router.delete('/:id', runsController.deleteRun);

// Check Playwright browser installation status and optionally install
router.post('/check-browser-status', async (req, res) => {
  try {
    const driversAvailable = executionEngine.checkPlaywrightDrivers();
    
    if (driversAvailable) {
      return res.json({
        browsersInstalled: true,
        message: 'Playwright browsers are installed and ready',
        command: null,
      });
    }

    // Browsers not found - try auto-install
    const logs = [];
    const installSuccess = await executionEngine.autoInstallPlaywrightDrivers(logs);

    if (installSuccess) {
      return res.json({
        browsersInstalled: true,
        message: 'Playwright browsers installed successfully',
        command: null,
      });
    } else {
      // Auto-install failed
      return res.status(400).json({
        browsersInstalled: false,
        message: 'Playwright browsers not found and auto-installation failed',
        command: 'npx playwright install',
        instructions: [
          'Please install Playwright browsers manually using the command above',
          'Run it from the project root directory',
          'Wait for the installation to complete (usually 1-5 minutes)',
          'Then retry your test execution',
        ],
      });
    }
  } catch (error) {
    res.status(500).json({
      browsersInstalled: false,
      message: `Error checking browser status: ${error.message}`,
      command: 'npx playwright install',
      error: error.message,
    });
  }
});

// Execute a run (NON-BLOCKING - uses worker thread)
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the run ID before executing
    try {
      validateAndConvertId(id, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }
    
    // Check if already executing
    if (workerPool.isExecuting(id)) {
      return res.status(409).json({ 
        error: 'Run is already executing',
        runId: id,
        activeExecutions: workerPool.getActiveCount()
      });
    }
    
    logger.info(`[API] Execution request for run ${id} - delegating to worker thread`);
    
    // Start execution in worker thread (non-blocking)
    // This returns immediately while execution continues in background
    workerPool.executeScenario(id).catch((err) => {
      logger.error(`[WORKER] Execution failed for run ${id}: ${err.message}`);
    });

    // Return immediately - don't wait for execution to complete
    res.json({ 
      message: 'Scenario execution started in background',
      runId: id,
      activeExecutions: workerPool.getActiveCount(),
      pendingExecutions: workerPool.getPendingCount()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get run results
router.get('/:id/results', runsController.getRunResults);

// Get execution logs (real-time monitoring)
router.get('/:id/logs', (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the run ID
    try {
      validateAndConvertId(id, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const logs = executionTracker.getLogs(id);
    const status = executionTracker.getStatus(id);
    
    res.json({
      runId: id,
      logs,
      status: status.status,
      logsCount: logs.length,
      startTime: status.startTime,
      completedAt: status.completedAt,
      finalStatus: status.finalStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get execution status
router.get('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the run ID
    try {
      validateAndConvertId(id, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const status = executionTracker.getStatus(id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel execution
router.post('/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the run ID
    try {
      validateAndConvertId(id, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const cancelled = executionTracker.requestCancellation(id);
    if (cancelled) {
      res.json({ message: 'Cancellation requested', runId: id });
    } else {
      res.status(404).json({ error: 'Execution not found or already completed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
