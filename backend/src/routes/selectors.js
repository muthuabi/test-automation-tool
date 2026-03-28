const express = require('express');
const router = express.Router();
const selectorsController = require('../controllers/selectorsController');

router.get('/', selectorsController.getSelectors);
router.get('/by-page', selectorsController.getSelectorsbyPage);
router.get('/:id', selectorsController.getSelectorById);
router.post('/', selectorsController.createSelector);
router.put('/:id', selectorsController.updateSelector);
router.delete('/:id', selectorsController.deleteSelector);

module.exports = router;
