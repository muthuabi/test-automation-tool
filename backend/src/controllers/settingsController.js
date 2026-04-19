const Settings = require('../models/settingsModel');
const { validateAndConvertId } = require('../utils/idValidator');
const AdoHelper = require('../services/adoHelper');
const EmailHelper = require('../services/emailHelper');
const WorkflowHelper = require('../services/workflowHelper');
const logger = require('../utils/logger');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    
    // Transform database format to frontend format
    // Frontend expects: { ado: {...}, email: {...}, workflow: {...} }
    // Database stores: [{ settingKey, category, config, enabled, ... }]
    const result = {
      ado: { enabled: false },
      email: { enabled: false },
      workflow: { enabled: false },
      teams: { enabled: false },
      general: { enabled: false }
    };
    
    for (const setting of settings) {
      // Use category as the key, and merge config with enabled flag
      result[setting.category] = {
        enabled: setting.enabled,
        ...setting.config, // Spread the actual configuration
        _id: setting._id,
        settingKey: setting.settingKey,
      };
    }
    
    logger.info(`[SETTINGS] Returning ${Object.keys(settings).length} saved settings`);
    res.json(result);
  } catch (error) {
    logger.error(`[SETTINGS] Error getting settings: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await Settings.find({ category });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ settingKey: key });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOneAndUpdate({ settingKey: key }, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSettingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      validateAndConvertId(id, 'Settings ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const setting = await Settings.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const setting = new Settings(req.body);
    const savedSetting = await setting.save();
    res.status(201).json(savedSetting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      validateAndConvertId(id, 'Settings ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const setting = await Settings.findByIdAndDelete(id);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json({ message: 'Setting deleted successfully', setting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Bulk update settings - accepts an object with categories as keys
 * Frontend sends: { ado: {...}, email: {...}, workflow: {...}, ... }
 * This method updates/creates settings for each category
 */
exports.bulkUpdateSettings = async (req, res) => {
  try {
    const settingsObject = req.body;
    const updateResults = {};
    const savedData = {};

    // List of valid categories in the settings model
    const validCategories = ['ado', 'teams', 'email', 'general', 'workflow'];

    for (const [key, value] of Object.entries(settingsObject)) {
      // Skip if not a valid category
      if (!validCategories.includes(key)) {
        logger.warn(`[SETTINGS] Skipping invalid category: ${key}`);
        continue;
      }

      // Skip if value is null or undefined
      if (!value) {
        logger.info(`[SETTINGS] Skipping empty category: ${key}`);
        continue;
      }

      try {
        // Check if this is an object with configuration
        if (typeof value === 'object' && value !== null) {
          // Extract the enabled flag - defaults to true if provided
          const enabled = value.enabled !== undefined ? value.enabled : true;
          
          // Create a copy without the _id and settingKey fields for storage
          const configToStore = { ...value };
          delete configToStore._id;
          delete configToStore.settingKey;
          delete configToStore.enabled; // Don't duplicate enabled flag in config
          
          logger.info(`[SETTINGS] Updating ${key} settings with enabled=${enabled}`);

          // Update or create the setting
          const setting = await Settings.findOneAndUpdate(
            { settingKey: `${key}_config`, category: key },
            {
              settingKey: `${key}_config`,
              category: key,
              enabled,
              config: configToStore,
              description: `${key.charAt(0).toUpperCase() + key.slice(1)} integration settings`,
            },
            {
              new: true,
              upsert: true,
              runValidators: true,
            }
          );

          // Transform to frontend format for response
          savedData[key] = {
            enabled: setting.enabled,
            ...setting.config,
          };

          updateResults[key] = {
            success: true,
            message: `${key} settings saved successfully`,
            saved: true,
          };

          logger.info(`[SETTINGS] ✓ ${key} settings saved successfully`);
        }
      } catch (categoryError) {
        logger.error(`[SETTINGS] Error updating ${key} settings: ${categoryError.message}`);
        updateResults[key] = {
          success: false,
          error: categoryError.message,
          saved: false,
        };
      }
    }

    res.json({
      message: 'Settings update completed',
      results: updateResults,
      saved: savedData, // Return what was actually saved
    });
  } catch (error) {
    logger.error(`[SETTINGS] Bulk update error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Validate Azure DevOps configuration
 */
exports.validateAdoConfig = async (req, res) => {
  try {
    const { url, pat, project, planId, suiteId } = req.body;

    if (!url || !pat || !project) {
      return res.status(400).json({
        success: false,
        error: 'Missing required ADO configuration: url, pat, project'
      });
    }

    const adoHelper = new AdoHelper({ url, pat, project, planId, suiteId });
    const result = await adoHelper.validateConfig();

    res.json(result);
  } catch (error) {
    logger.error(`[SETTINGS] ADO validation error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Save Azure DevOps configuration
 */
exports.saveAdoConfig = async (req, res) => {
  try {
    const { url, pat, project, planId, suiteId } = req.body;

    // Validate first
    const adoHelper = new AdoHelper({ url, pat, project, planId, suiteId });
    const validation = await adoHelper.validateConfig();

    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    const setting = await Settings.findOneAndUpdate(
      { settingKey: 'ado_config' },
      {
        settingKey: 'ado_config',
        category: 'ado',
        enabled: true,
        config: { url, pat, project, planId, suiteId },
        description: 'Azure DevOps integration configuration'
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, setting });
  } catch (error) {
    logger.error(`[SETTINGS] Error saving ADO config: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Validate Email configuration
 */
exports.validateEmailConfig = async (req, res) => {
  try {
    const config = req.body;

    const emailHelper = new EmailHelper(config);
    const result = await emailHelper.validateConfig();

    res.json(result);
  } catch (error) {
    logger.error(`[SETTINGS] Email validation error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Save Email configuration
 */
exports.saveEmailConfig = async (req, res) => {
  try {
    const config = req.body;

    // Validate first
    const emailHelper = new EmailHelper(config);
    const validation = await emailHelper.validateConfig();

    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    const setting = await Settings.findOneAndUpdate(
      { settingKey: 'email_config' },
      {
        settingKey: 'email_config',
        category: 'email',
        enabled: true,
        config,
        description: 'Email notification configuration'
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, setting });
  } catch (error) {
    logger.error(`[SETTINGS] Error saving Email config: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Validate Workflow (Webhook) configuration
 */
exports.validateWorkflowConfig = async (req, res) => {
  try {
    const config = req.body;

    const workflowHelper = new WorkflowHelper(config);
    const result = await workflowHelper.validateConfig();

    res.json(result);
  } catch (error) {
    logger.error(`[SETTINGS] Workflow validation error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Save Workflow configuration
 */
exports.saveWorkflowConfig = async (req, res) => {
  try {
    const config = req.body;

    // Validate first
    const workflowHelper = new WorkflowHelper(config);
    const validation = await workflowHelper.validateConfig();

    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    const setting = await Settings.findOneAndUpdate(
      { settingKey: 'workflow_config' },
      {
        settingKey: 'workflow_config',
        category: 'general',
        enabled: true,
        config,
        description: 'Workflow webhook configuration'
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, setting });
  } catch (error) {
    logger.error(`[SETTINGS] Error saving Workflow config: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get integration settings summary
 */
exports.getIntegrationsSummary = async (req, res) => {
  try {
    const adoSetting = await Settings.findOne({ settingKey: 'ado_config' });
    const emailSetting = await Settings.findOne({ settingKey: 'email_config' });
    const workflowSetting = await Settings.findOne({ settingKey: 'workflow_config' });

    res.json({
      ado: {
        configured: !!adoSetting,
        enabled: adoSetting?.enabled || false,
        project: adoSetting?.config?.project || null
      },
      email: {
        configured: !!emailSetting,
        enabled: emailSetting?.enabled || false,
        service: emailSetting?.config?.service || null
      },
      workflow: {
        configured: !!workflowSetting,
        enabled: workflowSetting?.enabled || false,
        hasWebhook: !!workflowSetting?.config?.webhookUrl
      }
    });
  } catch (error) {
    logger.error(`[SETTINGS] Error getting integrations summary: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Enable/disable integration
 */
exports.toggleIntegration = async (req, res) => {
  try {
    const { integration, enabled } = req.body;

    const keyMap = {
      'ado': 'ado_config',
      'email': 'email_config',
      'workflow': 'workflow_config'
    };

    const settingKey = keyMap[integration];
    if (!settingKey) {
      return res.status(400).json({ error: 'Invalid integration type' });
    }

    const setting = await Settings.findOneAndUpdate(
      { settingKey },
      { enabled },
      { new: true }
    );

    if (!setting) {
      return res.status(404).json({ error: 'Integration not found. Please configure it first.' });
    }

    res.json({ success: true, setting });
  } catch (error) {
    logger.error(`[SETTINGS] Error toggling integration: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Manual trigger: Publish to Azure DevOps
 */
exports.manualTriggerAdo = async (req, res) => {
  try {
    const { url, pat, project, planId, suiteId, testCases, runName } = req.body;

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases provided' });
    }

    // Use provided config or saved setting
    const adoConfig = url ? 
      { url, pat, project, planId, suiteId } :
      (await Settings.findOne({ settingKey: 'ado_config' }))?.config;

    if (!adoConfig) {
      return res.status(400).json({ error: 'ADO configuration not found. Please provide credentials or configure ADO.' });
    }

    const AdoHelper = require('../services/adoHelper');
    const adoHelper = new AdoHelper(adoConfig);

    // Validate config before executing
    const validation = await adoHelper.validateConfig();
    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    // Prepare execution data
    const executionData = {
      runName: runName || `Manual Run - ${new Date().toISOString()}`,
      functions: testCases.map((tc, index) => ({
        functionId: tc.id || index,
        functionName: tc.name || `Test Case ${index + 1}`,
        status: tc.outcome === 'passed' ? 'success' : 'failure',
        duration: tc.duration || 0,
        error: tc.error || null
      }))
    };

    const result = await adoHelper.publishExecutionResults(executionData);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error(`[SETTINGS] ADO manual trigger error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Manual trigger: Send Email
 */
exports.manualTriggerEmail = async (req, res) => {
  try {
    const { service, username, password, recipients, subject, scenarioName, executionSummary, customConfig } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    // Use provided config or saved setting
    let emailConfig = customConfig ? 
      { service, username, password, recipients } :
      (await Settings.findOne({ settingKey: 'email_config' }))?.config;

    if (!emailConfig) {
      return res.status(400).json({ error: 'Email configuration not found. Please provide credentials or configure Email.' });
    }

    // Override recipients to use provided ones
    emailConfig.recipients = recipients;

    const EmailHelper = require('../services/emailHelper');
    const emailHelper = new EmailHelper(emailConfig);

    // Validate config
    const validation = await emailHelper.validateConfig();
    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    // Prepare execution data
    const executionData = {
      scenarioName: scenarioName || 'Execution Report',
      functions: executionSummary?.functions || [],
      logs: executionSummary?.logs || []
    };

    const result = await emailHelper.sendExecutionSummary(executionData, recipients);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error(`[SETTINGS] Email manual trigger error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Manual trigger: Send to Workflow/Webhook
 */
exports.manualTriggerWorkflow = async (req, res) => {
  try {
    const { webhookUrl, authorizationHeader, timeout, eventData, customConfig } = req.body;

    if (!eventData) {
      return res.status(400).json({ error: 'No event data provided' });
    }

    // Use provided config or saved setting
    let workflowConfig = customConfig ?
      { webhookUrl, authorizationHeader, timeout } :
      (await Settings.findOne({ settingKey: 'workflow_config' }))?.config;

    if (!workflowConfig) {
      return res.status(400).json({ error: 'Workflow configuration not found. Please provide URL or configure Workflow.' });
    }

    const WorkflowHelper = require('../services/workflowHelper');
    const workflowHelper = new WorkflowHelper(workflowConfig);

    // Validate config
    const validation = await workflowHelper.validateConfig();
    if (!validation.valid) {
      return res.status(400).json(validation);
    }

    const result = await workflowHelper.sendWebhook(eventData);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error(`[SETTINGS] Workflow manual trigger error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
