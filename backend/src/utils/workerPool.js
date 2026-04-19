/**
 * Worker Pool Manager - Manages execution worker threads
 * Prevents main thread blocking and allows concurrent execution monitoring
 */

const { Worker } = require('worker_threads');
const path = require('path');
const logger = require('../utils/logger');

class WorkerPoolManager {
  constructor(maxWorkers = 3) {
    this.maxWorkers = maxWorkers;
    this.activeWorkers = new Map(); // runId -> worker instance
    this.workerPool = [];
    this.pendingTasks = [];
    
    console.log(`\n[POOL] ========== INITIALIZING WORKER POOL ==========`);
    console.log(`[POOL] Max Workers: ${maxWorkers}`);
    console.log(`[POOL] Creating workers...`);
    
    // Initialize worker pool
    for (let i = 0; i < maxWorkers; i++) {
      this.createWorker();
    }
    
    console.log(`[POOL] ✓ Worker pool initialized with ${this.workerPool.length} workers`);
    console.log(`[POOL] ====================================\n`);
  }

  /**
   * Create a new worker thread
   */
  createWorker() {
    const workerPath = path.join(__dirname, '../workers/executionWorker.js');
    
    try {
      const worker = new Worker(workerPath);
      
      worker.on('error', (err) => {
        console.error(`[POOL] ✗ Worker error: ${err.message}`);
        logger.error(`[POOL] Worker error: ${err.message}`);
      });
      
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.warn(`[POOL] ⚠ Worker exited with code ${code}`);
          logger.warn(`[POOL] Worker exited with code ${code}`);
        }
        // Remove from available pool
        const idx = this.workerPool.indexOf(worker);
        if (idx > -1) {
          this.workerPool.splice(idx, 1);
        }
      });
      
      this.workerPool.push(worker);
      console.log(`[POOL] ✓ Worker #${this.workerPool.length} created`);
      return worker;
    } catch (err) {
      console.error(`[POOL] ✗ Failed to create worker: ${err.message}`);
      console.error(`[POOL] Worker path: ${workerPath}`);
      logger.error(`[POOL] Failed to create worker: ${err.message}`);
      throw err;
    }
  }

  /**
   * Execute scenario in a worker thread
   * @param {string} runId - The run ID to execute
   * @returns {Promise} - Resolves when execution completes
   */
  async executeScenario(runId) {
    return new Promise((resolve, reject) => {
      // Wait for worker availability
      const executeWhenWorkerAvailable = async () => {
        // If no workers available, add to queue
        if (this.workerPool.length === 0) {
          console.log(`[POOL] ⏳ No workers available, queuing run ${runId}`);
          console.log(`[POOL]   Queue size: ${this.pendingTasks.length + 1}`);
          logger.warn(`[POOL] No workers available, queuing run ${runId}`);
          this.pendingTasks.push(() => executeWhenWorkerAvailable());
          return;
        }

        // Get available worker
        const worker = this.workerPool.pop();
        this.activeWorkers.set(runId, worker);

        console.log(`\n[POOL] ✓ ========== ASSIGNING WORKER ==========`);
        console.log(`[POOL] Run ID: ${runId}`);
        console.log(`[POOL] Active Executions: ${this.activeWorkers.size}/${this.maxWorkers}`);
        console.log(`[POOL] Queued Tasks: ${this.pendingTasks.length}`);
        console.log(`[POOL] Available Workers: ${this.workerPool.length}`);
        console.log(`[POOL] ========================================\n`);

        logger.info(`[POOL] Assigning run ${runId} to worker (${this.activeWorkers.size}/${this.maxWorkers} active)`);

        // One-time message handler for this execution
        const messageHandler = (message) => {
          if (message.runId === runId) {
            worker.off('message', messageHandler);
            
            // Return worker to pool
            this.activeWorkers.delete(runId);
            
            console.log(`\n[POOL] ✓ ========== WORKER RELEASED ==========`);
            console.log(`[POOL] Run ID: ${runId}`);
            console.log(`[POOL] Result: ${message.success ? '✓ SUCCESS' : '✗ FAILED'}`);
            if (message.result && message.result.totalDuration) {
              console.log(`[POOL] Duration: ${message.result.totalDuration}ms`);
            }
            console.log(`[POOL] Active Executions: ${this.activeWorkers.size}/${this.maxWorkers}`);
            console.log(`[POOL] Queued Tasks: ${this.pendingTasks.length}`);
            console.log(`[POOL] Available Workers: ${this.workerPool.length + 1}`);
            console.log(`[POOL] ===========================================\n`);
            
            // Process pending tasks if any
            if (this.pendingTasks.length > 0) {
              console.log(`[POOL] ⏩ Processing next task from queue...`);
              const nextTask = this.pendingTasks.shift();
              nextTask();
            } else {
              this.workerPool.push(worker);
            }

            logger.info(`[POOL] Run ${runId} completed (${this.activeWorkers.size}/${this.maxWorkers} active)`);

            if (message.success) {
              resolve(message.result);
            } else {
              reject(new Error(message.error));
            }
          }
        };

        worker.on('message', messageHandler);

        // Send execution request
        console.log(`[POOL] Sending EXECUTE_SCENARIO message to worker for run ${runId}`);
        worker.postMessage({
          type: 'EXECUTE_SCENARIO',
          runId,
        });

        // 10 minute timeout for execution
        setTimeout(() => {
          if (this.activeWorkers.has(runId)) {
            console.log(`[POOL] ✗ Execution timeout for run ${runId}`);
            worker.off('message', messageHandler);
            this.activeWorkers.delete(runId);
            this.workerPool.push(worker);
            reject(new Error(`Execution timeout for run ${runId} after 10 minutes`));
          }
        }, 10 * 60 * 1000);
      };

      executeWhenWorkerAvailable();
    });
  }

  /**
   * Check if a run is currently executing
   */
  isExecuting(runId) {
    return this.activeWorkers.has(runId);
  }

  /**
   * Get count of active executions
   */
  getActiveCount() {
    return this.activeWorkers.size;
  }

  /**
   * Get pending task count
   */
  getPendingCount() {
    return this.pendingTasks.length;
  }

  /**
   * Gracefully shutdown all workers
   */
  async shutdown() {
    console.log(`[POOL] Shutting down worker pool...`);
    logger.info('[POOL] Shutting down worker pool...');
    
    for (const [runId, worker] of this.activeWorkers) {
      console.log(`[POOL] Terminating worker for run ${runId}`);
      logger.warn(`[POOL] Terminating worker for run ${runId}`);
      await worker.terminate();
    }
    
    for (const worker of this.workerPool) {
      await worker.terminate();
    }
    
    this.activeWorkers.clear();
    this.workerPool = [];
    console.log(`[POOL] ✓ Worker pool shutdown complete`);
    logger.info('[POOL] Worker pool shutdown complete');
  }
}

// Create singleton instance
console.log(`\n[POOL] Creating global worker pool instance...`);
const workerPool = new WorkerPoolManager(3);
console.log(`[POOL] ✓ Global worker pool ready\n`);

// Graceful shutdown on process termination
process.on('SIGTERM', async () => {
  console.log(`[POOL] Received SIGTERM, gracefully shutting down workers`);
  logger.info('[POOL] Received SIGTERM, gracefully shutting down workers');
  await workerPool.shutdown();
  process.exit(0);
});

module.exports = workerPool;
