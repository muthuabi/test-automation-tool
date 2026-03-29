const axios = require('axios');
const logger = require('../utils/logger');

class WorkflowHelper {
  constructor(config) {
    this.config = config;
  }

  /**
   * Validate workflow configuration
   */
  async validateConfig() {
    try {
      if (!this.config.webhookUrl) {
        throw new Error('Missing required workflow configuration: webhookUrl');
      }

      // Test webhook endpoint
      const response = await axios.post(
        this.config.webhookUrl,
        {
          event: 'validation',
          timestamp: new Date().toISOString()
        },
        {
          timeout: 5000
        }
      );

      if (response.status >= 200 && response.status < 300) {
        return { valid: true, message: 'Workflow configuration is valid' };
      }
      throw new Error(`Webhook returned status ${response.status}`);
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        details: `Please verify your webhook URL is accessible and properly configured`
      };
    }
  }

  /**
   * Trigger workflow on execution start
   */
  async onExecutionStart(executionData) {
    try {
      logger.info('[WORKFLOW] Triggering workflow on execution start');

      const payload = {
        event: 'execution_start',
        timestamp: new Date().toISOString(),
        executionId: executionData.runId,
        scenarioName: executionData.scenarioName,
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0'
        }
      };

      return await this.sendWebhook(payload);
    } catch (error) {
      logger.error(`[WORKFLOW] Error on execution start: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger workflow on execution completion
   */
  async onExecutionComplete(executionData) {
    try {
      logger.info('[WORKFLOW] Triggering workflow on execution complete');

      const totalFunctions = executionData.functions ? executionData.functions.length : 0;
      const passedCount = executionData.functions
        ? executionData.functions.filter(f => f.status === 'success').length
        : 0;
      const failedCount = totalFunctions - passedCount;

      const payload = {
        event: 'execution_complete',
        timestamp: new Date().toISOString(),
        executionId: executionData.runId,
        scenarioName: executionData.scenarioName,
        summary: {
          totalFunctions,
          passed: passedCount,
          failed: failedCount,
          passRate: totalFunctions > 0 ? ((passedCount / totalFunctions) * 100).toFixed(2) : 0
        },
        functions: executionData.functions || [],
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0'
        }
      };

      return await this.sendWebhook(payload);
    } catch (error) {
      logger.error(`[WORKFLOW] Error on execution complete: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger workflow on execution failure
   */
  async onExecutionFailure(executionData, error) {
    try {
      logger.info('[WORKFLOW] Triggering workflow on execution failure');

      const payload = {
        event: 'execution_failure',
        timestamp: new Date().toISOString(),
        executionId: executionData.runId,
        scenarioName: executionData.scenarioName,
        error: {
          message: error.message,
          stack: error.stack
        },
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0'
        }
      };

      return await this.sendWebhook(payload);
    } catch (workflowError) {
      logger.error(`[WORKFLOW] Error on execution failure: ${workflowError.message}`);
      return { success: false, error: workflowError.message };
    }
  }

  /**
   * Send webhook request
   */
  async sendWebhook(payload) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add custom headers if provided
      if (this.config.customHeaders) {
        Object.assign(headers, this.config.customHeaders);
      }

      // Add authorization if provided
      if (this.config.authorizationHeader) {
        headers['Authorization'] = this.config.authorizationHeader;
      }

      const config = {
        headers,
        timeout: this.config.timeout || 10000
      };

      const response = await axios.post(this.config.webhookUrl, payload, config);

      logger.info(`[WORKFLOW] Webhook sent successfully: ${response.status}`);

      return {
        success: true,
        status: response.status,
        responseData: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`[WORKFLOW] Webhook request failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Publish execution results via webhook
   */
  async publishExecutionResults(executionData) {
    try {
      if (!this.config.webhookUrl) {
        logger.warn('[WORKFLOW] No webhook configured');
        return { success: false, error: 'No webhook configured' };
      }

      const payload = {
        event: 'execution_results',
        timestamp: new Date().toISOString(),
        executionId: executionData.runId,
        scenarioName: executionData.scenarioName,
        results: {
          functions: executionData.functions || [],
          logs: executionData.logs || [],
          summary: {
            totalFunctions: executionData.functions ? executionData.functions.length : 0,
            passed: executionData.functions
              ? executionData.functions.filter(f => f.status === 'success').length
              : 0,
            failed: executionData.functions
              ? executionData.functions.filter(f => f.status === 'failed').length
              : 0
          }
        }
      };

      return await this.sendWebhook(payload);
    } catch (error) {
      logger.error(`[WORKFLOW] Error publishing results: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Custom webhook trigger
   */
  async triggerCustomEvent(eventName, data) {
    try {
      logger.info(`[WORKFLOW] Triggering custom event: ${eventName}`);

      const payload = {
        event: eventName,
        timestamp: new Date().toISOString(),
        data
      };

      return await this.sendWebhook(payload);
    } catch (error) {
      logger.error(`[WORKFLOW] Error triggering custom event: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = WorkflowHelper;
