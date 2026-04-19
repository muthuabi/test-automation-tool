/**
 * Execution Worker - Runs test execution in a separate thread
 * This prevents blocking the main API thread
 */

const { parentPort } = require('worker_threads');
const executionEngine = require('../services/executionEngine');
const logger = require('../utils/logger');

// Listen for execution requests from main thread
parentPort.on('message', async (message) => {
  try {
    if (message.type === 'EXECUTE_SCENARIO') {
      const { runId } = message;
      
      logger.info(`[WORKER] Starting execution for run: ${runId}`);
      
      // Execute the scenario
      const result = await executionEngine.executeScenario(runId);
      
      // Send result back to main thread
      parentPort.postMessage({
        type: 'EXECUTION_COMPLETE',
        runId,
        success: true,
        result,
      });
    }
  } catch (error) {
    logger.error(`[WORKER] Execution error: ${error.message}`);
    parentPort.postMessage({
      type: 'EXECUTION_ERROR',
      runId: message.runId,
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

// Handle thread termination gracefully
process.on('SIGTERM', () => {
  logger.info('[WORKER] Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

logger.info('[WORKER] Execution worker thread started');
