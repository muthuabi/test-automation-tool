const playwrightService = require('./playwrightService');
const functionExecutor = require('./functionExecutor');
const logger = require('../utils/logger');
const Run = require('../models/runsModel');
const Result = require('../models/resultsModel');
const Scenario = require('../models/scenariosModel');
const Function = require('../models/functionsModel');
const Selector = require('../models/selectorsModel');

class ExecutionEngine {
  async executeScenario(runId) {
    let contextId, page;
    const startTime = Date.now();

    try {
      const run = await Run.findById(runId).populate('scenarioId');
      if (!run) throw new Error('Run not found');

      const scenario = run.scenarioId;
      if (!scenario) throw new Error('Scenario not found');

      logger.log(`\n========== STARTING EXECUTION ==========`);
      logger.log(`Run ID: ${runId}`);
      logger.log(`Scenario: ${scenario.name}`);
      logger.log(`Environment: ${run.environment}`);
      logger.log(`Mode: ${run.mode}`);
      logger.log(`==========================================\n`);

      // Update run status to running
      run.status = 'running';
      await run.save();

      // Launch browser and create context
      const browserType = run.browserType || 'chromium';
      const { context, contextId: cId } = await playwrightService.createContext(browserType, {
        acceptDownloads: true,
      });

      contextId = cId;
      page = await playwrightService.createPage(contextId);

      // Set page timeout
      const timeout = parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 30000;
      page.setDefaultTimeout(timeout);
      page.setDefaultNavigationTimeout(timeout);

      // Get selectors for all pages
      const allSelectors = await Selector.find();

      // Execute each function in the scenario
      for (let iteration = 1; iteration <= (run.iterations || 1); iteration++) {
        logger.log(`\n--- Iteration ${iteration}/${run.iterations} ---\n`);

        for (const functionId of scenario.functionIds) {
          const func = await Function.findById(functionId);
          if (!func) {
            logger.error(`Function not found: ${functionId}`);
            continue;
          }

          const result = await this.executeFunction(
            runId,
            func,
            page,
            run.variables || {},
            allSelectors,
            iteration
          );

          // If a function fails and it's critical, stop execution
          if (!result.success && run.stopOnFailure) {
            logger.error(`\n❌ EXECUTION STOPPED: Function "${func.name}" failed\n`);
            break;
          }
        }
      }

      // Close browser resources
      await playwrightService.closePage(page);
      await playwrightService.closeContext(contextId);

      // Calculate total duration and update run
      const totalDuration = Date.now() - startTime;
      run.status = 'completed';
      run.totalDuration = totalDuration;
      await run.save();

      logger.log(`\n========== EXECUTION COMPLETED ==========`);
      logger.log(`Total Duration: ${totalDuration}ms`);
      logger.log(`==========================================\n`);

      return {
        runId,
        status: 'completed',
        totalDuration,
        message: 'Scenario executed successfully',
      };
    } catch (error) {
      logger.error(`\n❌ EXECUTION FAILED: ${error.message}\n`);

      // Close resources on error
      if (page) await playwrightService.closePage(page);
      if (contextId) await playwrightService.closeContext(contextId);

      // Update run status
      const run = await Run.findById(runId);
      if (run) {
        run.status = 'failed';
        run.totalDuration = Date.now() - startTime;
        await run.save();
      }

      throw error;
    }
  }

  async executeFunction(runId, func, page, vars, selectors, iteration = 1) {
    try {
      logger.log(`\nExecuting: ${func.name}`);

      const startTime = Date.now();
      const result = await functionExecutor.executeWithTimeout(
        func.code,
        page,
        vars,
        selectors,
        parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 30000
      );
      const duration = Date.now() - startTime;

      // Save result to database
      await Result.create({
        runId,
        scenarioName: (await Run.findById(runId)).scenarioName,
        functionName: func.name,
        functionId: func._id,
        status: result.success ? 'passed' : 'failed',
        startTime: new Date(startTime),
        endTime: new Date(),
        duration,
        logs: [result.message],
        output: result.output,
        error: result.error || null,
        iteration,
      });

      if (result.success) {
        logger.log(`✓ ${func.name} passed (${duration}ms)`);
      } else {
        logger.log(`✗ ${func.name} failed (${duration}ms): ${result.message}`);
      }

      return result;
    } catch (error) {
      logger.error(`Error executing ${func.name}: ${error.message}`);

      // Save error result to database
      await Result.create({
        runId,
        scenarioName: (await Run.findById(runId)).scenarioName,
        functionName: func.name,
        functionId: func._id,
        status: 'failed',
        startTime: new Date(),
        endTime: new Date(),
        logs: [error.message],
        error: error.message,
        iteration,
      });

      return {
        success: false,
        message: error.message,
        error: error.stack,
      };
    }
  }
}

module.exports = new ExecutionEngine();
