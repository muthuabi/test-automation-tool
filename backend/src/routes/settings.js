const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Basic CRUD operations
router.get('/', settingsController.getSettings);
router.get('/category/:category', settingsController.getSettingsByCategory);
router.get('/key/:key', settingsController.getSetting);
router.post('/', settingsController.createSetting);
router.put('/:id', settingsController.updateSettingById);
router.put('/key/:key', settingsController.updateSetting);
router.delete('/:id', settingsController.deleteSetting);

// Integration summary
router.get('/integrations/summary', settingsController.getIntegrationsSummary);

// Azure DevOps configuration
router.post('/integrations/ado/validate', settingsController.validateAdoConfig);
router.post('/integrations/ado/save', settingsController.saveAdoConfig);

// Email configuration
router.post('/integrations/email/validate', settingsController.validateEmailConfig);
router.post('/integrations/email/save', settingsController.saveEmailConfig);

// Workflow configuration
router.post('/integrations/workflow/validate', settingsController.validateWorkflowConfig);
router.post('/integrations/workflow/save', settingsController.saveWorkflowConfig);

// Toggle integrations
router.post('/integrations/toggle', settingsController.toggleIntegration);

// Manual triggers for integrations
router.post('/manual/ado-trigger', settingsController.manualTriggerAdo);
router.post('/manual/email-trigger', settingsController.manualTriggerEmail);
router.post('/manual/workflow-trigger', settingsController.manualTriggerWorkflow);

module.exports = router;
