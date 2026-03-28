const express = require('express');
const router = express.Router();
const scenariosController = require('../controllers/scenariosController');

router.get('/', scenariosController.getScenarios);
router.get('/:id', scenariosController.getScenarioById);
router.post('/', scenariosController.createScenario);
router.put('/:id', scenariosController.updateScenario);
router.delete('/:id', scenariosController.deleteScenario);

module.exports = router;
