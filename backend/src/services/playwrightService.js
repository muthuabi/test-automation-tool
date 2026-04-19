const { chromium, firefox, webkit } = require('playwright');
const logger = require('../utils/logger');

class PlaywrightService {
  constructor() {
    this.browsers = {};
    this.contexts = {};
    this.pageListeners = new Map(); // Track page event listeners
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

  async createPage(contextId, executionTracker, runId) {
    try {
      const contextInfo = this.contexts[contextId];
      if (!contextInfo) throw new Error(`Context not found: ${contextId}`);

      const page = await contextInfo.context.newPage();
      
      // Set up page event listeners for logging (if tracking is provided)
      if (executionTracker && runId) {
        this._setupPageListeners(page, executionTracker, runId, contextId);
      }
      
      logger.log(`✓ Page created in context: ${contextId}`);
      return page;
    } catch (error) {
      logger.error(`✗ Failed to create page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set up listeners on page for logging navigation and console messages
   */
  _setupPageListeners(page, executionTracker, runId, contextId) {
    try {
      const pageId = `${contextId}-page-${Date.now()}`;

      // Track page load/navigation
      page.on('load', () => {
        const url = page.url();
        executionTracker.addLog(runId, `[PAGE_LOAD] Navigated to: ${url}`, 'info');
      });

      // Track navigation events
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) {
          const url = page.url();
          executionTracker.addLog(runId, `[NAVIGATION] URL changed to: ${url}`, 'info');
        }
      });

      // Track console messages
      page.on('console', (msg) => {
        const logType = msg.type();
        let level = 'info';
        if (logType === 'error') level = 'error';
        else if (logType === 'warning') level = 'warning';
        
        executionTracker.addLog(runId, `[CONSOLE] ${msg.text()}`, level);
      });

      // Track page errors
      page.on('pageerror', (error) => {
        executionTracker.addLog(runId, `[PAGE_ERROR] ${error.message}`, 'error');
      });

      // Track dialog (alerts, confirms, prompts)
      page.on('dialog', (dialog) => {
        executionTracker.addLog(runId, `[DIALOG] ${dialog.type()}: ${dialog.message()}`, 'info');
      });

      // Store listeners for cleanup
      this.pageListeners.set(pageId, { page, runId });
      
      logger.log(`[LISTENERS] Attached logging listeners to page ${pageId}`);
    } catch (error) {
      logger.warn(`[LISTENERS] Failed to setup page listeners: ${error.message}`);
      // Don't throw - page can still work without listeners
    }
  }

  async closePage(page) {
    try {
      // Clean up any listeners we added
      this.pageListeners.forEach((info, pageId) => {
        if (info.page === page) {
          this.pageListeners.delete(pageId);
        }
      });

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
        // Clean up any listeners in this context
        this.pageListeners.forEach((info, pageId) => {
          if (pageId.startsWith(contextId)) {
            this.pageListeners.delete(pageId);
          }
        });

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

      // Clear listeners
      this.pageListeners.clear();

      logger.log('✓ All browsers and contexts closed');
    } catch (error) {
      logger.error(`✗ Failed to close all: ${error.message}`);
    }
  }
}

module.exports = new PlaywrightService();
