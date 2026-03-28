const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.get('/category/:category', settingsController.getSettingsByCategory);
router.get('/key/:key', settingsController.getSetting);
router.post('/', settingsController.createSetting);
router.put('/:id', settingsController.updateSettingById);
router.put('/key/:key', settingsController.updateSetting);
router.delete('/:id', settingsController.deleteSetting);

module.exports = router;
