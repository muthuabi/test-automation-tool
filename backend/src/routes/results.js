const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

router.get('/', resultsController.getResults);
router.get('/:id', resultsController.getResultById);
router.get('/run/:runId', resultsController.getResultsByRun);
router.get('/scenario/:scenarioName', resultsController.getResultsByScenario);
router.delete('/:id', resultsController.deleteResult);

module.exports = router;
