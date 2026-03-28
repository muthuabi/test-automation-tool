const logger = require('../utils/logger');

class FunctionExecutor {
  async executeFunction(functionCode, page, vars = {}, selectors = {}) {
    try {
      // Sanitize and validate selectors object
      const selectorsMap = this.formatSelectors(selectors);

      // Create a safe function that has access to page, vars, and selectors
      const fn = new Function('page', 'vars', 'selectors', `return (${functionCode})(page, vars, selectors)`);

      const startTime = Date.now();
      const result = await fn(page, vars, selectorsMap);
      const duration = Date.now() - startTime;

      logger.log(`✓ Function executed successfully in ${duration}ms`);

      return {
        success: result.success !== false,
        message: result.message,
        output: result.data,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - (this.startTime || Date.now());
      logger.error(`✗ Function execution error: ${error.message}`);

      return {
        success: false,
        message: error.message,
        error: error.stack,
        duration,
        timestamp: new Date().toISOString(),
      };
    }
  }

  formatSelectors(selectors) {
    // Convert selector array to object using name as key and value as selector string
    const selectorMap = {};

    if (Array.isArray(selectors)) {
      selectors.forEach((selector) => {
        selectorMap[selector.name] = selector.value;
      });
    } else if (typeof selectors === 'object') {
      Object.keys(selectors).forEach((key) => {
        if (typeof selectors[key] === 'object' && selectors[key].value) {
          selectorMap[key] = selectors[key].value;
        } else {
          selectorMap[key] = selectors[key];
        }
      });
    }

    return selectorMap;
  }

  async executeWithTimeout(functionCode, page, vars, selectors, timeout = 30000) {
    return Promise.race([
      this.executeFunction(functionCode, page, vars, selectors),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Function execution timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }
}

module.exports = new FunctionExecutor();
