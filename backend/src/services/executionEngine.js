const playwrightService = require('./playwrightService');
const functionExecutor = require('./functionExecutor');
const logger = require('../utils/logger');
const executionTracker = require('../utils/executionTracker');
const Run = require('../models/runsModel');
const Result = require('../models/resultsModel');
const Scenario = require('../models/scenariosModel');
const Function = require('../models/functionsModel');
const Selector = require('../models/selectorsModel');
const Settings = require('../models/settingsModel');
const { validateAndConvertId } = require('../utils/idValidator');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ExecutionEngine {
  /**
   * Check if Playwright browser drivers are installed
   */
  checkPlaywrightDrivers() {
    const playwrightPath = require.resolve('playwright');
    const baseDir = path.dirname(playwrightPath);
    const driversDir = path.join(baseDir, '..');
    
    // Check for browser binaries
    const chromiumPath = path.join(driversDir, '.playwright/chromium');
    const firefoxPath = path.join(driversDir, '.playwright/firefox');
    const webkitPath = path.join(driversDir, '.playwright/webkit');
    
    return fs.existsSync(chromiumPath) || fs.existsSync(firefoxPath) || fs.existsSync(webkitPath);
  }

  /**
   * Auto-install Playwright drivers if missing
   */
  async autoInstallPlaywrightDrivers(logs) {
    try {
      logs.push('[VALIDATION] Browser drivers not found, attempting auto-install...');
      logs.push('[VALIDATION] Running: npx playwright install');
      
      // Run playwright install with timeout
      execSync('npx playwright install', {
        stdio: 'pipe',
        timeout: 5 * 60 * 1000, // 5 minute timeout
        cwd: path.join(__dirname, '../../')
      });
      
      logs.push('[VALIDATION] ✓ Playwright drivers installed successfully');
      return true;
    } catch (error) {
      logs.push(`[VALIDATION] ✗ Failed to auto-install drivers: ${error.message}`);
      return false;
    }
  }

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

      // Check if browser drivers are installed
      const driversAvailable = this.checkPlaywrightDrivers();
      if (!driversAvailable) {
        logs.push('[VALIDATION] ⚠ Browser drivers not found locally');
        const installSuccess = await this.autoInstallPlaywrightDrivers(logs);
        if (!installSuccess) {
          throw new Error('Failed to install Playwright drivers. Please run: npx playwright install');
        }
      } else {
        logs.push('[VALIDATION] ✓ Browser drivers found');
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

    // Register execution with tracker
    const execution = executionTracker.registerExecution(runId);

    try {
      const logMsg = `Starting scenario execution for run: ${runId}`;
      executionLogs.push(`[${new Date().toISOString()}] ${logMsg}`);
      executionTracker.addLog(runId, logMsg, 'info');

      // Validate runId format
      try {
        validateAndConvertId(runId, 'Run ID');
        executionTracker.addLog(runId, 'Run ID format validated', 'info');
      } catch (validationError) {
        executionTracker.addLog(runId, `Invalid Run ID: ${validationError.message}`, 'error');
        throw new Error(`Invalid Run ID format: ${validationError.message}`);
      }

      // Fetch run data
      executionTracker.addLog(runId, 'Fetching run configuration from database...', 'info');
      const run = await Run.findById(runId).populate('scenarioId');
      if (!run) {
        executionTracker.addLog(runId, 'Run not found in database', 'error');
        throw new Error('Run not found');
      }
      executionTracker.addLog(runId, `✓ Run found: ${run.scenarioName}`, 'info');

      const scenario = run.scenarioId;
      if (!scenario) {
        executionTracker.addLog(runId, 'Associated scenario not found', 'error');
        throw new Error('Scenario not found');
      }
      executionTracker.addLog(runId, `✓ Scenario loaded: ${scenario.name} with ${scenario.functionIds.length} functions`, 'info');

      // System validation
      executionTracker.addLog(runId, 'Running pre-execution system validation...', 'info');
      const validation = await this.validateSystemReadiness();
      validation.logs.forEach(log => executionTracker.addLog(runId, log, 'info'));
      if (!validation.valid) {
        throw new Error(`System validation failed: ${validation.error}`);
      }

      // Log configuration
      executionTracker.addLog(runId, '\n=== EXECUTION SETTINGS ===', 'info');
      executionTracker.addLog(runId, `Browser: ${run.browserType || 'chromium'}`, 'info');
      executionTracker.addLog(runId, `Mode: ${run.mode || 'headless'}`, 'info');
      executionTracker.addLog(runId, `Environment: ${run.environment}`, 'info');
      executionTracker.addLog(runId, `Iterations: ${run.iterations || 1}`, 'info');
      executionTracker.addLog(runId, `Timeout: ${process.env.PLAYWRIGHT_TIMEOUT || 30000}ms`, 'info');
      executionTracker.addLog(runId, `Stop on failure: ${run.stopOnFailure || false}`, 'info');
      executionTracker.addLog(runId, '========================\n', 'info');

      // Update run status to running
      executionTracker.addLog(runId, 'Updating run status to "running"...', 'info');
      run.status = 'running';
      await run.save();
      executionTracker.addLog(runId, '✓ Run status updated', 'info');

      // Launch browser and create context
      const launchMsg = `Launching ${run.browserType || 'chromium'} browser...`;
      executionTracker.addLog(runId, launchMsg, 'info');
      const browserType = run.browserType || 'chromium';
      try {
        const { context, contextId: cId } = await playwrightService.createContext(browserType, {
          acceptDownloads: true,
        });
        contextId = cId;
        executionTracker.addLog(runId, `✓ Browser context created (ID: ${contextId})`, 'info');
      } catch (error) {
        executionTracker.addLog(runId, `✗ Failed to create browser context: ${error.message}`, 'error');
        throw new Error(`Browser launch failed: ${error.message}`);
      }

      // Create page
      executionTracker.addLog(runId, 'Creating new browser page...', 'info');
      try {
        page = await playwrightService.createPage(contextId);
        executionTracker.addLog(runId, '✓ Page created successfully', 'info');
      } catch (error) {
        executionTracker.addLog(runId, `✗ Failed to create page: ${error.message}`, 'error');
        throw new Error(`Page creation failed: ${error.message}`);
      }

      // Set page timeout
      const timeout = parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 30000;
      page.setDefaultTimeout(timeout);
      page.setDefaultNavigationTimeout(timeout);
      executionTracker.addLog(runId, `Timeouts set to ${timeout}ms`, 'info');

      // Get selectors for all pages
      executionTracker.addLog(runId, 'Loading selectors from database...', 'info');
      const allSelectors = await Selector.find();
      executionTracker.addLog(runId, `✓ Loaded ${allSelectors.length} selectors`, 'info');

      // Execute each function in the scenario
      let functionCount = 0;
      let passedCount = 0;
      let failedCount = 0;

      for (let iteration = 1; iteration <= (run.iterations || 1); iteration++) {
        executionTracker.addLog(runId, `\n--- Starting iteration ${iteration}/${run.iterations || 1} ---\n`, 'info');

        // Check if execution was cancelled
        if (executionTracker.isCancelled(runId)) {
          executionTracker.addLog(runId, 'Execution was cancelled by user', 'warning');
          break;
        }

        for (const functionId of scenario.functionIds) {
          // Check for cancellation before each function
          if (executionTracker.isCancelled(runId)) {
            executionTracker.addLog(runId, 'Execution was cancelled by user', 'warning');
            break;
          }

          // Validate functionId before querying
          try {
            validateAndConvertId(functionId, 'Function ID');
          } catch (validationError) {
            executionTracker.addLog(runId, `✗ Invalid Function ID format: ${functionId}`, 'error');
            continue;
          }

          const func = await Function.findById(functionId);
          if (!func) {
            executionTracker.addLog(runId, `✗ Function not found: ${functionId}`, 'error');
            continue;
          }

          functionCount++;
          executionTracker.addLog(runId, `\n[FUNCTION ${functionCount}] Executing: ${func.name}`, 'info');
          
          const result = await this.executeFunction(
            runId,
            func,
            page,
            run.variables || {},
            allSelectors,
            iteration,
            executionLogs,
            executionTracker
          );

          if (result.success) {
            passedCount++;
            executionTracker.addLog(runId, `[FUNCTION ${functionCount}] ✓ PASSED in ${result.duration}ms`, 'info');
          } else {
            failedCount++;
            executionTracker.addLog(runId, `[FUNCTION ${functionCount}] ✗ FAILED: ${result.message}`, 'error');
          }

          // If a function fails and it's critical, stop execution
          if (!result.success && run.stopOnFailure) {
            executionTracker.addLog(runId, `Stopping execution due to function failure (stopOnFailure enabled)`, 'warning');
            break;
          }
        }

        if (executionTracker.isCancelled(runId)) {
          break;
        }
      }

      // Close browser resources
      executionTracker.addLog(runId, 'Closing browser and resources...', 'info');
      try {
        if (page) await playwrightService.closePage(page);
        if (contextId) await playwrightService.closeContext(contextId);
        executionTracker.addLog(runId, '✓ Browser resources closed', 'info');
      } catch (error) {
        executionTracker.addLog(runId, `✗ Error closing resources: ${error.message}`, 'error');
      }

      // Calculate total duration and update run
      const totalDuration = Date.now() - startTime;
      const finalStatus = executionTracker.isCancelled(runId) ? 'cancelled' : 'completed';
      
      run.status = finalStatus;
      run.totalDuration = totalDuration;
      await run.save();

      executionTracker.addLog(runId, `\n=== SUMMARY ===`, 'info');
      executionTracker.addLog(runId, `Execution ${finalStatus}`, 'info');
      executionTracker.addLog(runId, `Total duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`, 'info');
      executionTracker.addLog(runId, `Functions executed: ${functionCount}`, 'info');
      executionTracker.addLog(runId, `Passed: ${passedCount}`, 'info');
      executionTracker.addLog(runId, `Failed: ${failedCount}`, 'info');
      executionTracker.addLog(runId, '================\n', 'info');

      // Mark execution as complete
      executionTracker.completeExecution(runId, finalStatus);

      logger.log(`\n========== EXECUTION ${finalStatus.toUpperCase()} ==========`);
      logger.log(`Run ID: ${runId}`);
      logger.log(`Total Duration: ${totalDuration}ms`);
      logger.log(`Passed: ${passedCount}, Failed: ${failedCount}`);
      logger.log(`==========================================\n`);

      // Store execution logs in a result record for visibility
      await Result.create({
        runId,
        scenarioName: scenario.name,
        functionName: '[EXECUTION_SUMMARY]',
        status: finalStatus === 'cancelled' ? 'cancelled' : (failedCount === 0 ? 'passed' : 'failed'),
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: totalDuration,
        logs: executionTracker.getLogs(runId),
        output: {
          functionCount,
          passedCount,
          failedCount,
          totalDuration,
        },
        error: finalStatus === 'cancelled' ? 'Execution was cancelled by user' : (failedCount > 0 ? `${failedCount} function(s) failed` : null),
      });

      // Publish results to integrations (ADO, Email, Workflow)
      try {
        await this.publishToIntegrations({
          runId,
          scenarioName: scenario.name,
          functionCount,
          passedCount,
          failedCount,
          totalDuration,
          executionLogs: executionTracker.getLogs(runId),
          status: finalStatus === 'cancelled' ? 'cancelled' : (failedCount === 0 ? 'success' : 'failure')
        });
      } catch (integrationError) {
        logger.warn(`Warning: Integration publishing failed: ${integrationError.message}`);
        // Don't fail execution if integrations fail
      }

      return {
        runId,
        status: finalStatus,
        totalDuration,
        message: `Scenario executed successfully (${finalStatus})`,
        logs: executionTracker.getLogs(runId),
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const errorMsg = `Execution failed at ${new Date().toISOString()}: ${error.message}`;
      executionTracker.addLog(runId, errorMsg, 'error');
      executionTracker.addLog(runId, `Stack trace: ${error.stack}`, 'debug');
      
      logger.error(`\n❌ EXECUTION FAILED: ${error.message}\n`);
      logger.error(`Stack: ${error.stack}\n`);

      // Close resources on error
      try {
        if (page) await playwrightService.closePage(page);
        if (contextId) await playwrightService.closeContext(contextId);
        executionTracker.addLog(runId, 'Closed resources on error', 'info');
      } catch (closeError) {
        executionTracker.addLog(runId, `Error closing resources: ${closeError.message}`, 'error');
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
        executionTracker.addLog(runId, `Error updating run status: ${dbError.message}`, 'error');
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
          logs: executionTracker.getLogs(runId),
          error: error.message,
          output: {
            errorType: error.constructor.name,
            totalDuration,
          },
        });
      } catch (resultError) {
        logger.error(`Failed to save execution error logs: ${resultError.message}`);
      }

      // Mark execution as complete with error status
      executionTracker.completeExecution(runId, 'error');

      throw error;
    }
  }

  async executeFunction(runId, func, page, vars, selectors, iteration = 1, executionLogs = [], executionTracker = null) {
    try {
      logger.log(`\nExecuting: ${func.name}`);
      executionLogs.push(`  [FUNCTION] File: ${func.filename || 'inline'}`);
      executionLogs.push(`  [FUNCTION] Code length: ${func.code.length} characters`);
      
      if (executionTracker) {
        executionTracker.addLog(runId, `File: ${func.filename || 'inline'}`, 'debug');
        executionTracker.addLog(runId, `Code length: ${func.code.length} characters`, 'debug');
      }

      const startTime = Date.now();
      
      executionLogs.push(`  [EXECUTION] Starting function with timeout ${process.env.PLAYWRIGHT_TIMEOUT || 30000}ms`);
      if (executionTracker) {
        executionTracker.addLog(runId, `Starting function with timeout ${process.env.PLAYWRIGHT_TIMEOUT || 30000}ms`, 'debug');
      }
      
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

  /**
   * Publish execution results to configured integrations (ADO, Email, Workflow)
   */
  async publishToIntegrations(executionData) {
    try {
      logger.info('[INTEGRATIONS] Publishing execution results to integrations');

      // Get all settings
      const adoSetting = await Settings.findOne({ settingKey: 'ado_config' });
      const emailSetting = await Settings.findOne({ settingKey: 'email_config' });
      const workflowSetting = await Settings.findOne({ settingKey: 'workflow_config' });

      const results = [];

      // Publish to Azure DevOps if enabled
      if (adoSetting && adoSetting.enabled && adoSetting.config) {
        try {
          logger.info('[INTEGRATIONS] Publishing to Azure DevOps');
          const AdoHelper = require('./adoHelper');
          const adoHelper = new AdoHelper(adoSetting.config);
          
          const adoData = {
            runName: `${executionData.scenarioName} - ${new Date().toISOString()}`,
            functions: [
              {
                functionId: executionData.runId,
                functionName: executionData.scenarioName,
                status: executionData.status === 'success' ? 'success' : 'failure',
                duration: executionData.totalDuration,
                error: executionData.status === 'failure' ? 'Execution failed' : null
              }
            ]
          };

          const adoResult = await adoHelper.publishExecutionResults(adoData);
          results.push({ service: 'ADO', ...adoResult });
          logger.info(`[INTEGRATIONS] ADO result: ${adoResult.success ? 'success' : 'failed'}`);
        } catch (adoError) {
          logger.error(`[INTEGRATIONS] ADO publishing failed: ${adoError.message}`);
          results.push({ service: 'ADO', success: false, error: adoError.message });
        }
      }

      // Publish to Email if enabled
      if (emailSetting && emailSetting.enabled && emailSetting.config) {
        try {
          logger.info('[INTEGRATIONS] Publishing to Email');
          const EmailHelper = require('./emailHelper');
          const emailHelper = new EmailHelper(emailSetting.config);

          const emailData = {
            scenarioName: executionData.scenarioName,
            functions: [
              {
                functionName: executionData.scenarioName,
                status: executionData.status === 'success' ? 'success' : 'failure',
                duration: executionData.totalDuration
              }
            ],
            logs: executionData.executionLogs
          };

          const emailResult = await emailHelper.publishExecutionResults(emailData);
          results.push({ service: 'Email', ...emailResult });
          logger.info(`[INTEGRATIONS] Email result: ${emailResult.success ? 'success' : 'failed'}`);
        } catch (emailError) {
          logger.error(`[INTEGRATIONS] Email publishing failed: ${emailError.message}`);
          results.push({ service: 'Email', success: false, error: emailError.message });
        }
      }

      // Publish to Workflow (Webhook) if enabled
      if (workflowSetting && workflowSetting.enabled && workflowSetting.config) {
        try {
          logger.info('[INTEGRATIONS] Publishing to Workflow');
          const WorkflowHelper = require('./workflowHelper');
          const workflowHelper = new WorkflowHelper(workflowSetting.config);

          const workflowData = {
            runId: executionData.runId,
            scenarioName: executionData.scenarioName,
            functions: [
              {
                functionName: executionData.scenarioName,
                status: executionData.status === 'success' ? 'success' : 'failure',
                duration: executionData.totalDuration
              }
            ],
            logs: executionData.executionLogs
          };

          const workflowResult = await workflowHelper.publishExecutionResults(workflowData);
          results.push({ service: 'Workflow', ...workflowResult });
          logger.info(`[INTEGRATIONS] Workflow result: ${workflowResult.success ? 'success' : 'failed'}`);
        } catch (workflowError) {
          logger.error(`[INTEGRATIONS] Workflow publishing failed: ${workflowError.message}`);
          results.push({ service: 'Workflow', success: false, error: workflowError.message });
        }
      }

      logger.info(`[INTEGRATIONS] Integration publishing complete: ${results.length} integrations processed`);
      return results;
    } catch (error) {
      logger.error(`[INTEGRATIONS] Error in publishToIntegrations: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ExecutionEngine();
