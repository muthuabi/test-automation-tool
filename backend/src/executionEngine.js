const { chromium } = require('playwright');

/**
 * Execution Engine - Handles scenario execution with Playwright
 */

async function executeScenario(scenario, functions, selectors, runtimeVars, options = {}) {
  const { headless = true, timeout = 30000 } = options;
  
  let browser;
  let page;
  const logs = [];
  const functionResults = [];
  const startTime = new Date();

  try {
    // Launch browser
    logs.push(`[${getTimestamp()}] Launching browser (${headless ? 'headless' : 'headed'} mode)`);
    browser = await chromium.launch({ headless });
    page = await browser.newContext().then(ctx => ctx.newPage());

    // Set timeout for page operations
    page.setDefaultTimeout(timeout);

    logs.push(`[${getTimestamp()}] Browser launched successfully`);
    logs.push(`[${getTimestamp()}] Starting scenario: ${scenario.name}`);

    // Prepare function context
    const selectorMap = {};
    selectors.forEach((sel) => {
      selectorMap[sel.name] = sel.value;
    });

    // Execute each function in sequence
    for (const funcDef of functions) {
      const funcStartTime = Date.now();
      logs.push(`[${getTimestamp()}] ⏳ Executing function: ${funcDef.name}`);

      try {
        // Create function executor
        const functionExecutor = new Function(
          'page',
          'vars',
          'selectors',
          funcDef.code
        );

        // Execute function
        const result = await functionExecutor(page, runtimeVars, selectorMap);

        const duration = Date.now() - funcStartTime;

        if (result && result.success) {
          logs.push(`[${getTimestamp()}] ✓ ${funcDef.name}: ${result.message}`);
          functionResults.push({
            functionName: funcDef.name,
            status: 'Passed',
            duration,
            message: result.message,
          });
        } else {
          logs.push(`[${getTimestamp()}] ✗ ${funcDef.name}: ${result?.message || 'Unknown error'}`);
          functionResults.push({
            functionName: funcDef.name,
            status: 'Failed',
            duration,
            error: result?.message || 'Unknown error',
          });
        }
      } catch (error) {
        const duration = Date.now() - funcStartTime;
        logs.push(`[${getTimestamp()}] ✗ ERROR in ${funcDef.name}: ${error.message}`);
        functionResults.push({
          functionName: funcDef.name,
          status: 'Failed',
          duration,
          error: error.message,
        });
      }
    }

    const endTime = new Date();
    const executionTime = endTime - startTime;
    const allPassed = functionResults.every((r) => r.status === 'Passed');

    logs.push(`[${getTimestamp()}] Scenario execution completed`);
    logs.push(`[${getTimestamp()}] Status: ${allPassed ? '✓ PASSED' : '✗ FAILED'}`);
    logs.push(`[${getTimestamp()}] Total time: ${(executionTime / 1000).toFixed(2)}s`);

    return {
      success: allPassed,
      status: allPassed ? 'Passed' : 'Failed',
      logs,
      functionResults,
      executionTime,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
  } catch (error) {
    logs.push(`[${getTimestamp()}] FATAL ERROR: ${error.message}`);
    return {
      success: false,
      status: 'Failed',
      logs,
      functionResults,
      executionTime: Date.now() - startTime,
      error: error.message,
    };
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
      logs.push(`[${getTimestamp()}] Browser closed`);
    }
  }
}

function getTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
}

module.exports = {
  executeScenario,
};
