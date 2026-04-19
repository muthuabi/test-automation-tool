/**
 * Execution Worker - Runs test execution in a separate thread
 * This prevents blocking the main API thread
 */

const { parentPort } = require('worker_threads');

console.log('[WORKER] Execution worker thread initialized');
console.log(`[WORKER] Process ID: ${process.pid}`);

let executionEngine;
let logger;

try {
  executionEngine = require('../services/executionEngine');
  logger = require('../utils/logger');
  console.log('[WORKER] ✓ Loaded executionEngine');
  console.log('[WORKER] ✓ Loaded logger');
} catch (err) {
  console.error('[WORKER] ✗ Failed to load modules:', err.message);
  process.exit(1);
}

// Listen for execution requests from main thread
parentPort.on('message', async (message) => {
  try {
    if (message.type === 'EXECUTE_SCENARIO') {
      const { runId } = message;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[WORKER] ========== EXECUTION START ==========`);
      console.log(`[WORKER] Run ID: ${runId}`);
      console.log(`[WORKER] Time: ${new Date().toISOString()}`);
      console.log(`[WORKER] Process: ${process.pid}`);
      console.log(`${'='.repeat(60)}\n`);
      
      logger.info(`\n[WORKER] Starting execution for run: ${runId}`);
      
      // Execute the scenario
      const result = await executionEngine.executeScenario(runId);
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[WORKER] ========== EXECUTION COMPLETE ==========`);
      console.log(`[WORKER] Run ID: ${runId}`);
      console.log(`[WORKER] Status: ${result.status}`);
      console.log(`[WORKER] Duration: ${result.totalDuration}ms`);
      console.log(`${'='.repeat(60)}\n`);
      
      // Send result back to main thread
      parentPort.postMessage({
        type: 'EXECUTION_COMPLETE',
        runId,
        success: true,
        result,
      });
    }
  } catch (error) {
    console.error(`\n[WORKER] ✗ EXECUTION ERROR: ${error.message}`);
    console.error(`[WORKER] Stack:`, error.stack);
    console.error(`\n`);
    
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
  console.log('[WORKER] Received SIGTERM, shutting down gracefully');
  logger.info('[WORKER] Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

console.log('[WORKER] Execution worker ready and waiting for messages');
