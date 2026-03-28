const express = require('express');
const router = express.Router();
const runsController = require('../controllers/runsController');
const executionEngine = require('../services/executionEngine');
const logger = require('../utils/logger');
const { validateAndConvertId } = require('../utils/idValidator');

router.get('/', runsController.getRuns);
router.get('/:id', runsController.getRunById);
router.post('/', runsController.createRun);
router.put('/:id', runsController.updateRun);
router.delete('/:id', runsController.deleteRun);

// Execute a run
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the run ID before executing
    try {
      validateAndConvertId(id, 'Run ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }
    
    // Start execution asynchronously
    executionEngine.executeScenario(id).catch((err) => {
      logger.error(`Execution failed for run ${id}: ${err.message}`);
    });

    res.json({ message: 'Scenario execution started', runId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get run results
router.get('/:id/results', runsController.getRunResults);

module.exports = router;
