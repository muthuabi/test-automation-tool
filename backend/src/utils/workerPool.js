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
    
    // Initialize worker pool
    for (let i = 0; i < maxWorkers; i++) {
      this.createWorker();
    }
  }

  /**
   * Create a new worker thread
   */
  createWorker() {
    const worker = new Worker(path.join(__dirname, 'executionWorker.js'));
    
    worker.on('error', (err) => {
      logger.error(`[POOL] Worker error: ${err.message}`);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        logger.warn(`[POOL] Worker exited with code ${code}`);
      }
      // Remove from available pool
      const idx = this.workerPool.indexOf(worker);
      if (idx > -1) {
        this.workerPool.splice(idx, 1);
      }
    });
    
    this.workerPool.push(worker);
    return worker;
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
          this.pendingTasks.push(() => executeWhenWorkerAvailable());
          return;
        }

        // Get available worker
        const worker = this.workerPool.pop();
        this.activeWorkers.set(runId, worker);

        logger.info(`[POOL] Assigning run ${runId} to worker (${this.activeWorkers.size} active)`);

        // One-time message handler for this execution
        const messageHandler = (message) => {
          if (message.runId === runId) {
            worker.off('message', messageHandler);
            
            // Return worker to pool
            this.activeWorkers.delete(runId);
            
            // Process pending tasks if any
            if (this.pendingTasks.length > 0) {
              const nextTask = this.pendingTasks.shift();
              nextTask();
            } else {
              this.workerPool.push(worker);
            }

            logger.info(`[POOL] Run ${runId} completed (${this.activeWorkers.size} active)`);

            if (message.success) {
              resolve(message.result);
            } else {
              reject(new Error(message.error));
            }
          }
        };

        worker.on('message', messageHandler);

        // Send execution request
        worker.postMessage({
          type: 'EXECUTE_SCENARIO',
          runId,
        });

        // 10 minute timeout for execution
        setTimeout(() => {
          if (this.activeWorkers.has(runId)) {
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
    logger.info('[POOL] Shutting down worker pool...');
    
    for (const [runId, worker] of this.activeWorkers) {
      logger.warn(`[POOL] Terminating worker for run ${runId}`);
      await worker.terminate();
    }
    
    for (const worker of this.workerPool) {
      await worker.terminate();
    }
    
    this.activeWorkers.clear();
    this.workerPool = [];
    logger.info('[POOL] Worker pool shutdown complete');
  }
}

// Create singleton instance
const workerPool = new WorkerPoolManager(3);

// Graceful shutdown on process termination
process.on('SIGTERM', async () => {
  logger.info('[POOL] Received SIGTERM, gracefully shutting down workers');
  await workerPool.shutdown();
  process.exit(0);
});

module.exports = workerPool;
