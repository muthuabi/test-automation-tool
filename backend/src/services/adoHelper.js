const axios = require('axios');
const logger = require('../utils/logger');

class AdoHelper {
  constructor(config) {
    this.url = config.url; // Azure DevOps organization URL (e.g., https://dev.azure.com/myorg)
    this.pat = config.pat; // Personal Access Token
    this.project = config.project; // Project name
    this.planId = config.planId; // Test Plan ID
    this.suiteId = config.suiteId; // Test Suite ID
    
    // Create axios instance with authentication
    this.axiosInstance = axios.create({
      baseURL: this.url,
      auth: {
        username: '',
        password: this.pat
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Validate ADO configuration
   */
  async validateConfig() {
    try {
      if (!this.url || !this.pat || !this.project) {
        throw new Error('Missing required ADO configuration: url, pat, project');
      }

      // Test connection to Azure DevOps
      const response = await this.axiosInstance.get(
        `/${this.project}/_apis/test/plans?api-version=7.0`
      );

      if (response.status === 200) {
        return { valid: true, message: 'ADO configuration is valid' };
      }
      throw new Error('Failed to validate ADO configuration');
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        details: 'Please verify your ADO URL, PAT token, and Project name'
      };
    }
  }

  /**
   * Create a test run in Azure DevOps
   * @param {Array} testCases - Array of test cases with outcomes
   * @param {String} runName - Name for the test run
   * @returns {Object} - Test run result
   */
  async createTestRun(testCases, runName) {
    try {
      logger.info(`[ADO] Creating test run: ${runName}`);

      if (!testCases || testCases.length === 0) {
        throw new Error('No test cases provided');
      }

      if (!this.planId || !this.suiteId) {
        throw new Error('Test Plan ID and Suite ID are required');
      }

      // Create test run
      const createRunPayload = {
        name: runName,
        plan: { id: parseInt(this.planId) },
        pointIds: [], // Will be populated from test cases
        isAutomated: true
      };

      const createRunResponse = await this.axiosInstance.post(
        `/${this.project}/_apis/test/runs?api-version=7.0`,
        createRunPayload
      );

      const testRunId = createRunResponse.data.id;
      logger.info(`[ADO] Test run created with ID: ${testRunId}`);

      // Add test results to the run
      const results = await this.addTestResults(testRunId, testCases);

      // Update run state to completed
      const updatePayload = {
        state: 'Completed',
        completedDate: new Date().toISOString()
      };

      await this.axiosInstance.patch(
        `/${this.project}/_apis/test/runs/${testRunId}?api-version=7.0`,
        updatePayload
      );

      logger.info(`[ADO] Test run ${testRunId} completed with ${results.length} results`);

      return {
        success: true,
        testRunId,
        testRunUrl: `${this.url}/${this.project}/_test/runs/${testRunId}`,
        resultsCount: results.length,
        results
      };
    } catch (error) {
      logger.error(`[ADO] Error creating test run: ${error.message}`);
      return {
        success: false,
        error: error.message,
        details: 'Failed to create test run in Azure DevOps'
      };
    }
  }

  /**
   * Add test results to a test run
   * @param {Number} testRunId - The test run ID
   * @param {Array} testCases - Array of test cases with outcomes
   * @returns {Array} - Array of added results
   */
  async addTestResults(testRunId, testCases) {
    try {
      const results = [];

      for (const testCase of testCases) {
        try {
          // Map outcome to ADO format
          const adoOutcome = this.mapOutcomeToAdo(testCase.outcome);

          const resultPayload = {
            outcome: adoOutcome,
            testCase: { id: testCase.id },
            durationInMs: testCase.duration || 0
          };

          if (testCase.errorMessage) {
            resultPayload.comment = `Error: ${testCase.errorMessage}`;
          }

          if (testCase.stackTrace) {
            resultPayload.stackTrace = testCase.stackTrace;
          }

          const response = await this.axiosInstance.post(
            `/${this.project}/_apis/test/runs/${testRunId}/results?api-version=7.0`,
            [resultPayload]
          );

          if (response.data.value && response.data.value.length > 0) {
            results.push(response.data.value[0]);
            logger.info(`[ADO] Result added for test case ${testCase.id}: ${adoOutcome}`);
          }
        } catch (error) {
          logger.warn(`[ADO] Failed to add result for test case ${testCase.id}: ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      logger.error(`[ADO] Error adding test results: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map test outcome to Azure DevOps format
   */
  mapOutcomeToAdo(outcome) {
    const outcomeMap = {
      'passed': 'Passed',
      'pass': 'Passed',
      'true': 'Passed',
      'failed': 'Failed',
      'fail': 'Failed',
      'false': 'Failed',
      'skipped': 'NotExecuted',
      'skip': 'NotExecuted',
      'blocked': 'Blocked'
    };

    const normalized = String(outcome).toLowerCase().trim();
    return outcomeMap[normalized] || 'NotExecuted';
  }

  /**
   * Get test results from a run
   * @param {Number} testRunId - The test run ID
   * @returns {Array} - Array of test results
   */
  async getTestResults(testRunId) {
    try {
      const response = await this.axiosInstance.get(
        `/${this.project}/_apis/test/runs/${testRunId}/results?api-version=7.0`
      );

      return response.data.value || [];
    } catch (error) {
      logger.error(`[ADO] Error fetching test results: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a test result
   * @param {Number} testRunId - The test run ID
   * @param {Number} resultId - The result ID
   * @param {Object} updates - Fields to update
   */
  async updateTestResult(testRunId, resultId, updates) {
    try {
      const response = await this.axiosInstance.patch(
        `/${this.project}/_apis/test/runs/${testRunId}/results/${resultId}?api-version=7.0`,
        updates
      );

      return response.data;
    } catch (error) {
      logger.error(`[ADO] Error updating test result: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish execution results to ADO
   * This is the main integration point from the execution engine
   */
  async publishExecutionResults(executionData) {
    try {
      logger.info('[ADO] Publishing execution results to Azure DevOps');

      // Validate required fields
      if (!executionData.runName) {
        executionData.runName = `Automated Run - ${new Date().toISOString()}`;
      }

      // Convert execution logs to test cases format
      const testCases = this.convertExecutionToTestCases(executionData);

      if (testCases.length === 0) {
        logger.warn('[ADO] No test cases to publish');
        return { success: false, error: 'No test cases found in execution data' };
      }

      // Create run and add results
      const result = await this.createTestRun(testCases, executionData.runName);

      return result;
    } catch (error) {
      logger.error(`[ADO] Error publishing results: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert execution data to ADO test cases format
   */
  convertExecutionToTestCases(executionData) {
    const testCases = [];

    if (!executionData.functions || executionData.functions.length === 0) {
      return testCases;
    }

    executionData.functions.forEach((func, index) => {
      testCases.push({
        id: func.functionId || index + 1,
        name: func.functionName,
        outcome: func.status === 'success' ? 'Passed' : 'Failed',
        duration: func.duration || 0,
        errorMessage: func.error,
        stackTrace: func.stackTrace
      });
    });

    return testCases;
  }
}

module.exports = AdoHelper;
