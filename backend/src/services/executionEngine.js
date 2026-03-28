const playwrightService = require('./playwrightService');
const functionExecutor = require('./functionExecutor');
const logger = require('../utils/logger');
const Run = require('../models/runsModel');
const Result = require('../models/resultsModel');
const Scenario = require('../models/scenariosModel');
const Function = require('../models/functionsModel');
const Selector = require('../models/selectorsModel');
const { validateAndConvertId } = require('../utils/idValidator');

class ExecutionEngine {
  /**
   * Pre-execution validation to check system readiness
   */
  async validateSystemReadiness() {
    const logs = [];
    try {
      logs.push('[VALIDATION] Starting system readiness checks...');
      
      // Check if Playwright is available
      try {
        const playwright = require('playwright');
        logs.push('[VALIDATION] ✓ Playwright module loaded successfully');
      } catch (error) {
        logs.push(`[VALIDATION] ✗ Playwright module NOT found: ${error.message}`);
        throw new Error('Playwright is not installed or not accessible');
      }

      // Check if required browsers are available
      try {
        const { chromium, firefox, webkit } = require('playwright');
        logs.push('[VALIDATION] ✓ Browser modules accessible');
      } catch (error) {
        logs.push(`[VALIDATION] ✗ Browser modules error: ${error.message}`);
        throw new Error('Browser modules not accessible');
      }

      // Check environment variables
      const requiredEnvVars = ['PLAYWRIGHT_TIMEOUT'];
      const missingVars = requiredEnvVars.filter(v => !process.env[v]);
      if (missingVars.length > 0) {
        logs.push(`[VALIDATION] ⚠ Missing recommended env vars: ${missingVars.join(', ')}`);
      } else {
        logs.push('[VALIDATION] ✓ All environment variables configured');
      }

      logs.push('[VALIDATION] System is ready for execution');
      return { valid: true, logs };
    } catch (error) {
      logs.push(`[VALIDATION] ✗ System validation failed: ${error.message}`);
      return { valid: false, logs, error: error.message };
    }
  }

  async executeScenario(runId) {
    let contextId, page;
    const startTime = Date.now();
    const executionLogs = [];

    try {
      executionLogs.push(`[${new Date().toISOString()}] Starting scenario execution for run: ${runId}`);

      // Validate runId format
      try {
        validateAndConvertId(runId, 'Run ID');
        executionLogs.push('[VALIDATION] Run ID format validated');
      } catch (validationError) {
        executionLogs.push(`[ERROR] Invalid Run ID: ${validationError.message}`);
        throw new Error(`Invalid Run ID format: ${validationError.message}`);
      }

      // Fetch run data
      executionLogs.push('[DATABASE] Fetching run configuration from database...');
      const run = await Run.findById(runId).populate('scenarioId');
      if (!run) {
        executionLogs.push('[ERROR] Run not found in database');
        throw new Error('Run not found');
      }
      executionLogs.push(`[DATABASE] ✓ Run found: ${run.scenarioName}`);

      const scenario = run.scenarioId;
      if (!scenario) {
        executionLogs.push('[ERROR] Associated scenario not found');
        throw new Error('Scenario not found');
      }
      executionLogs.push(`[SCENARIO] ✓ Scenario loaded: ${scenario.name} with ${scenario.functionIds.length} functions`);

      // System validation
      executionLogs.push('[SYSTEM] Running pre-execution system validation...');
      const validation = await this.validateSystemReadiness();
      executionLogs.push(...validation.logs);
      if (!validation.valid) {
        throw new Error(`System validation failed: ${validation.error}`);
      }

      // Log configuration
      executionLogs.push(`\n[CONFIG] Execution Settings:`);
      executionLogs.push(`  - Browser: ${run.browserType || 'chromium'}`);
      executionLogs.push(`  - Mode: ${run.mode || 'headless'}`);
      executionLogs.push(`  - Environment: ${run.environment}`);
      executionLogs.push(`  - Iterations: ${run.iterations || 1}`);
      executionLogs.push(`  - Timeout: ${process.env.PLAYWRIGHT_TIMEOUT || 30000}ms`);
      executionLogs.push(`  - Stop on failure: ${run.stopOnFailure || false}`);

      logger.log(`\n========== STARTING EXECUTION ==========`);
      logger.log(`Run ID: ${runId}`);
      logger.log(`Scenario: ${scenario.name}`);
      logger.log(`Environment: ${run.environment}`);
      logger.log(`Mode: ${run.mode}`);
      logger.log(`==========================================\n`);

      // Update run status to running
      executionLogs.push('[DATABASE] Updating run status to "running"...');
      run.status = 'running';
      await run.save();
      executionLogs.push('[DATABASE] ✓ Run status updated');

      // Launch browser and create context
      executionLogs.push(`[BROWSER] Launching ${run.browserType || 'chromium'} browser...`);
      const browserType = run.browserType || 'chromium';
      try {
        const { context, contextId: cId } = await playwrightService.createContext(browserType, {
          acceptDownloads: true,
        });
        contextId = cId;
        executionLogs.push(`[BROWSER] ✓ Browser context created (ID: ${contextId})`);
      } catch (error) {
        executionLogs.push(`[BROWSER] ✗ Failed to create browser context: ${error.message}`);
        throw new Error(`Browser launch failed: ${error.message}`);
      }

      // Create page
      executionLogs.push('[PAGE] Creating new browser page...');
      try {
        page = await playwrightService.createPage(contextId);
        executionLogs.push('[PAGE] ✓ Page created successfully');
      } catch (error) {
        executionLogs.push(`[PAGE] ✗ Failed to create page: ${error.message}`);
        throw new Error(`Page creation failed: ${error.message}`);
      }

      // Set page timeout
      const timeout = parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 30000;
      page.setDefaultTimeout(timeout);
      page.setDefaultNavigationTimeout(timeout);
      executionLogs.push(`[PAGE] Timeouts set to ${timeout}ms`);

      // Get selectors for all pages
      executionLogs.push('[SELECTORS] Loading selectors from database...');
      const allSelectors = await Selector.find();
      executionLogs.push(`[SELECTORS] ✓ Loaded ${allSelectors.length} selectors`);

      // Execute each function in the scenario
      let functionCount = 0;
      let passedCount = 0;
      let failedCount = 0;

      for (let iteration = 1; iteration <= (run.iterations || 1); iteration++) {
        executionLogs.push(`\n[ITERATION] Starting iteration ${iteration}/${run.iterations || 1}`);
        logger.log(`\n--- Iteration ${iteration}/${run.iterations} ---\n`);

        for (const functionId of scenario.functionIds) {
          // Validate functionId before querying
          try {
            validateAndConvertId(functionId, 'Function ID');
          } catch (validationError) {
            executionLogs.push(`[FUNCTION] ✗ Invalid Function ID format: ${functionId}`);
            logger.error(`Invalid Function ID format: ${functionId}`);
            continue;
          }

          const func = await Function.findById(functionId);
          if (!func) {
            executionLogs.push(`[FUNCTION] ✗ Function not found: ${functionId}`);
            logger.error(`Function not found: ${functionId}`);
            continue;
          }

          functionCount++;
          executionLogs.push(`\n[FUNCTION ${functionCount}] Executing: ${func.name}`);
          
          const result = await this.executeFunction(
            runId,
            func,
            page,
            run.variables || {},
            allSelectors,
            iteration,
            executionLogs
          );

          if (result.success) {
            passedCount++;
            executionLogs.push(`[FUNCTION ${functionCount}] ✓ PASSED in ${result.duration}ms`);
          } else {
            failedCount++;
            executionLogs.push(`[FUNCTION ${functionCount}] ✗ FAILED: ${result.message}`);
          }

          // If a function fails and it's critical, stop execution
          if (!result.success && run.stopOnFailure) {
            executionLogs.push(`\n[EXECUTION] Stopping execution due to function failure (stopOnFailure enabled)`);
            logger.error(`\n❌ EXECUTION STOPPED: Function "${func.name}" failed\n`);
            break;
          }
        }
      }

      // Close browser resources
      executionLogs.push(`\n[BROWSER] Closing browser and resources...`);
      try {
        if (page) await playwrightService.closePage(page);
        if (contextId) await playwrightService.closeContext(contextId);
        executionLogs.push('[BROWSER] ✓ Browser resources closed');
      } catch (error) {
        executionLogs.push(`[BROWSER] ✗ Error closing resources: ${error.message}`);
      }

      // Calculate total duration and update run
      const totalDuration = Date.now() - startTime;
      run.status = 'completed';
      run.totalDuration = totalDuration;
      await run.save();

      executionLogs.push(`\n[SUMMARY] Execution completed successfully`);
      executionLogs.push(`  - Total duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      executionLogs.push(`  - Functions executed: ${functionCount}`);
      executionLogs.push(`  - Passed: ${passedCount}`);
      executionLogs.push(`  - Failed: ${failedCount}`);

      logger.log(`\n========== EXECUTION COMPLETED ==========`);
      logger.log(`Total Duration: ${totalDuration}ms`);
      logger.log(`Passed: ${passedCount}, Failed: ${failedCount}`);
      logger.log(`==========================================\n`);

      // Store execution logs in a result record for visibility
      await Result.create({
        runId,
        scenarioName: scenario.name,
        functionName: '[EXECUTION_SUMMARY]',
        status: failedCount === 0 ? 'passed' : 'failed',
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: totalDuration,
        logs: executionLogs,
        output: {
          functionCount,
          passedCount,
          failedCount,
          totalDuration,
        },
        error: failedCount > 0 ? `${failedCount} function(s) failed` : null,
      });

      return {
        runId,
        status: 'completed',
        totalDuration,
        message: 'Scenario executed successfully',
        logs: executionLogs,
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      executionLogs.push(`\n[ERROR] Execution failed at ${new Date().toISOString()}`);
      executionLogs.push(`[ERROR] Error message: ${error.message}`);
      executionLogs.push(`[ERROR] Stack trace: ${error.stack}`);
      
      logger.error(`\n❌ EXECUTION FAILED: ${error.message}\n`);
      logger.error(`Stack: ${error.stack}\n`);

      // Close resources on error
      try {
        if (page) await playwrightService.closePage(page);
        if (contextId) await playwrightService.closeContext(contextId);
        executionLogs.push('[BROWSER] Closed resources on error');
      } catch (closeError) {
        executionLogs.push(`[BROWSER] Error closing resources: ${closeError.message}`);
      }

      // Update run status
      try {
        const run = await Run.findById(runId);
        if (run) {
          run.status = 'failed';
          run.totalDuration = totalDuration;
          await run.save();
        }
      } catch (dbError) {
        executionLogs.push(`[DATABASE] Error updating run status: ${dbError.message}`);
      }

      // Store failure logs in a result record
      try {
        await Result.create({
          runId,
          functionName: '[EXECUTION_ERROR]',
          status: 'failed',
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: totalDuration,
          logs: executionLogs,
          error: error.message,
          output: {
            errorType: error.constructor.name,
            totalDuration,
          },
        });
      } catch (resultError) {
        logger.error(`Failed to save execution error logs: ${resultError.message}`);
      }

      throw error;
    }
  }

  async executeFunction(runId, func, page, vars, selectors, iteration = 1, executionLogs = []) {
    try {
      logger.log(`\nExecuting: ${func.name}`);
      executionLogs.push(`  [FUNCTION] File: ${func.filename || 'inline'}`);
      executionLogs.push(`  [FUNCTION] Code length: ${func.code.length} characters`);

      const startTime = Date.now();
      
      executionLogs.push(`  [EXECUTION] Starting function with timeout ${process.env.PLAYWRIGHT_TIMEOUT || 30000}ms`);
      
      const result = await functionExecutor.executeWithTimeout(
        func.code,
        page,
        vars,
        selectors,
        parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 30000
      );
      const duration = Date.now() - startTime;

      // Save result to database
      const resultRecord = await Result.create({
        runId,
        scenarioName: (await Run.findById(runId)).scenarioName,
        functionName: func.name,
        functionId: func._id,
        status: result.success ? 'passed' : 'failed',
        startTime: new Date(startTime),
        endTime: new Date(),
        duration,
        logs: [result.message || 'Function executed'],
        output: result.output,
        error: result.error || null,
        iteration,
      });

      if (result.success) {
        logger.log(`✓ ${func.name} passed (${duration}ms)`);
      } else {
        logger.log(`✗ ${func.name} failed (${duration}ms): ${result.message}`);
      }

      return {
        ...result,
        duration,
      };
    } catch (error) {
      logger.error(`Error executing ${func.name}: ${error.message}`);
      const startTime = Date.now();

      // Save error result to database
      try {
        await Result.create({
          runId,
          scenarioName: (await Run.findById(runId)).scenarioName,
          functionName: func.name,
          functionId: func._id,
          status: 'failed',
          startTime: new Date(startTime),
          endTime: new Date(),
          logs: [error.message, error.stack],
          error: error.message,
          iteration,
          output: {
            errorType: error.constructor.name,
          },
        });
      } catch (resultError) {
        logger.error(`Failed to save function error result: ${resultError.message}`);
      }

      return {
        success: false,
        message: error.message,
        error: error.stack,
        duration: Date.now() - startTime,
      };
    }
  }
}

module.exports = new ExecutionEngine();
