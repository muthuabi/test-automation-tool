const Selector = require('../models/selectorsModel');

exports.getSelectors = async (req, res) => {
  try {
    const selectors = await Selector.find();
    res.json(selectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSelectorsbyPage = async (req, res) => {
  try {
    const { page } = req.query;
    const selectors = await Selector.find({ page });
    res.json(selectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSelectorById = async (req, res) => {
  try {
    const selector = await Selector.findById(req.params.id);
    if (!selector) return res.status(404).json({ error: 'Selector not found' });
    res.json(selector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSelector = async (req, res) => {
  try {
    const selector = new Selector(req.body);
    const savedSelector = await selector.save();
    res.status(201).json(savedSelector);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSelector = async (req, res) => {
  try {
    const selector = await Selector.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!selector) return res.status(404).json({ error: 'Selector not found' });
    res.json(selector);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSelector = async (req, res) => {
  try {
    const selector = await Selector.findByIdAndDelete(req.params.id);
    if (!selector) return res.status(404).json({ error: 'Selector not found' });
    res.json({ message: 'Selector deleted successfully', selector });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
