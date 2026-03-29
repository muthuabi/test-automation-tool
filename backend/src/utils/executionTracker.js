/**
 * Execution Tracker - Manages running executions and allows cancellation
 */

class ExecutionTracker {
  constructor() {
    this.executions = new Map(); // Map of runId -> execution info
  }

  /**
   * Register a new execution
   * @param {string} runId - The run ID
   * @param {object} abortController - AbortController for cancellation
   */
  registerExecution(runId, abortController = null) {
    const executionId = {
      runId,
      startTime: new Date(),
      status: 'running',
      logs: [],
      abortController: abortController || new AbortController(),
      completedAt: null,
      finalStatus: null,
    };
    
    this.executions.set(runId, executionId);
    console.log(`[TRACKER] Execution registered for run: ${runId}`);
    return executionId;
  }

  /**
   * Add a log entry to an execution
   * @param {string} runId - The run ID
   * @param {string} message - Log message
   * @param {string} level - Log level (info, warning, error, debug)
   */
  addLog(runId, message, level = 'info') {
    const execution = this.executions.get(runId);
    if (execution) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
      };
      execution.logs.push(logEntry);
      
      // Also log to console with timestamp and level
      const levelColors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warning: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      const color = levelColors[level] || '\x1b[0m';
      console.log(`${color}[RUN ${runId} - ${level.toUpperCase()}]${reset} ${message}`);
    }
  }

  /**
   * Get execution logs
   * @param {string} runId - The run ID
   * @returns {array} Array of log entries
   */
  getLogs(runId) {
    const execution = this.executions.get(runId);
    return execution ? execution.logs : [];
  }

  /**
   * Get execution status
   * @param {string} runId - The run ID
   * @returns {object} Execution status info
   */
  getStatus(runId) {
    const execution = this.executions.get(runId);
    if (!execution) {
      return { found: false, status: 'unknown' };
    }

    return {
      found: true,
      runId,
      status: execution.status,
      startTime: execution.startTime,
      completedAt: execution.completedAt,
      finalStatus: execution.finalStatus,
      logsCount: execution.logs.length,
    };
  }

  /**
   * Mark execution as completed
   * @param {string} runId - The run ID
   * @param {string} finalStatus - Final status (passed, failed, error, cancelled)
   */
  completeExecution(runId, finalStatus = 'completed') {
    const execution = this.executions.get(runId);
    if (execution) {
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.finalStatus = finalStatus;
      console.log(`[TRACKER] Execution completed for run: ${runId} with status: ${finalStatus}`);
    }
  }

  /**
   * Request cancellation of an execution
   * @param {string} runId - The run ID
   * @returns {boolean} True if cancellation was requested
   */
  requestCancellation(runId) {
    const execution = this.executions.get(runId);
    if (execution) {
      console.log(`[TRACKER] Cancellation requested for run: ${runId}`);
      execution.abortController.abort();
      this.addLog(runId, 'Execution cancellation requested by user', 'warning');
      return true;
    }
    return false;
  }

  /**
   * Get abort signal for an execution (for use with fetch, etc)
   * @param {string} runId - The run ID
   * @returns {AbortSignal} Abort signal or null
   */
  getAbortSignal(runId) {
    const execution = this.executions.get(runId);
    return execution ? execution.abortController.signal : null;
  }

  /**
   * Check if execution was cancelled
   * @param {string} runId - The run ID
   * @returns {boolean} True if execution was cancelled
   */
  isCancelled(runId) {
    const execution = this.executions.get(runId);
    return execution ? execution.abortController.signal.aborted : false;
  }

  /**
   * Clean up execution (remove from tracker)
   * @param {string} runId - The run ID
   */
  cleanup(runId) {
    this.executions.delete(runId);
    console.log(`[TRACKER] Execution cleaned up for run: ${runId}`);
  }

  /**
   * Get all running executions
   * @returns {array} Array of running execution IDs
   */
  getRunningExecutions() {
    const running = [];
    for (const [runId, execution] of this.executions) {
      if (execution.status === 'running') {
        running.push({
          runId,
          startTime: execution.startTime,
          logsCount: execution.logs.length,
        });
      }
    }
    return running;
  }

  /**
   * Clear all tracked executions (useful for server restart)
   */
  clearAll() {
    this.executions.clear();
    console.log('[TRACKER] All executions cleared');
  }
}

// Export singleton instance
module.exports = new ExecutionTracker();
