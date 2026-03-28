const Result = require('../models/resultsModel');

exports.getResults = async (req, res) => {
  try {
    const results = await Result.find().populate('runId').populate('functionId');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate('runId').populate('functionId');
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResultsByRun = async (req, res) => {
  try {
    const results = await Result.find({ runId: req.params.runId }).populate('functionId');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResultsByScenario = async (req, res) => {
  try {
    const scenarioName = req.params.scenarioName;
    const results = await Result.find({ scenarioName }).populate('runId').populate('functionId');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json({ message: 'Result deleted successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
