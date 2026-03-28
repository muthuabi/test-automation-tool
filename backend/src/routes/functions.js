const express = require('express');
const router = express.Router();
const functionsController = require('../controllers/functionsController');

router.get('/', functionsController.getFunctions);
router.get('/:id', functionsController.getFunctionById);
router.post('/', functionsController.createFunction);
router.put('/:id', functionsController.updateFunction);
router.delete('/:id', functionsController.deleteFunction);
router.post('/:id/test', functionsController.testFunction);

module.exports = router;
