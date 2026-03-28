const { chromium, firefox, webkit } = require('playwright');
const logger = require('../utils/logger');

class PlaywrightService {
  constructor() {
    this.browsers = {};
    this.contexts = {};
  }

  async launchBrowser(browserType = 'chromium', options = {}) {
    try {
      const defaultOptions = {
        headless: options.headless !== false,
        slowMo: options.slowMo || 0,
        args: options.args || [],
      };

      let browser;
      switch (browserType.toLowerCase()) {
        case 'firefox':
          browser = await firefox.launch(defaultOptions);
          break;
        case 'webkit':
          browser = await webkit.launch(defaultOptions);
          break;
        case 'chromium':
        default:
          browser = await chromium.launch(defaultOptions);
      }

      this.browsers[browserType] = browser;
      logger.log(`✓ Browser launched: ${browserType}`);
      return browser;
    } catch (error) {
      logger.error(`✗ Failed to launch browser ${browserType}: ${error.message}`);
      throw error;
    }
  }

  async createContext(browserType = 'chromium', contextOptions = {}) {
    try {
      let browser = this.browsers[browserType];
      if (!browser) {
        browser = await this.launchBrowser(browserType);
      }

      const context = await browser.newContext(contextOptions);
      const contextId = `${browserType}-${Date.now()}`;
      this.contexts[contextId] = { context, browser: browserType };

      logger.log(`✓ Browser context created: ${contextId}`);
      return { context, contextId };
    } catch (error) {
      logger.error(`✗ Failed to create context: ${error.message}`);
      throw error;
    }
  }

  async createPage(contextId) {
    try {
      const contextInfo = this.contexts[contextId];
      if (!contextInfo) throw new Error(`Context not found: ${contextId}`);

      const page = await contextInfo.context.newPage();
      logger.log(`✓ Page created in context: ${contextId}`);
      return page;
    } catch (error) {
      logger.error(`✗ Failed to create page: ${error.message}`);
      throw error;
    }
  }

  async closePage(page) {
    try {
      await page.close();
      logger.log('✓ Page closed');
    } catch (error) {
      logger.error(`✗ Failed to close page: ${error.message}`);
    }
  }

  async closeContext(contextId) {
    try {
      const contextInfo = this.contexts[contextId];
      if (contextInfo) {
        await contextInfo.context.close();
        delete this.contexts[contextId];
        logger.log(`✓ context closed: ${contextId}`);
      }
    } catch (error) {
      logger.error(`✗ Failed to close context: ${error.message}`);
    }
  }

  async closeBrowser(browserType = 'chromium') {
    try {
      const browser = this.browsers[browserType];
      if (browser) {
        await browser.close();
        delete this.browsers[browserType];
        logger.log(`✓ Browser closed: ${browserType}`);
      }
    } catch (error) {
      logger.error(`✗ Failed to close browser: ${error.message}`);
    }
  }

  async closeAll() {
    try {
      // Close all contexts
      for (const contextId in this.contexts) {
        await this.closeContext(contextId);
      }

      // Close all browsers
      for (const browserType in this.browsers) {
        await this.closeBrowser(browserType);
      }

      logger.log('✓ All browsers and contexts closed');
    } catch (error) {
      logger.error(`✗ Failed to close all: ${error.message}`);
    }
  }
}

module.exports = new PlaywrightService();
