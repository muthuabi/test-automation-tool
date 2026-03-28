const Run = require('../models/runsModel');
const Scenario = require('../models/scenariosModel');

exports.getRuns = async (req, res) => {
  try {
    const runs = await Run.find().populate('scenarioId').populate('executedBy');
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRunById = async (req, res) => {
  try {
    const run = await Run.findById(req.params.id).populate('scenarioId').populate('executedBy');
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRun = async (req, res) => {
  try {
    const { scenarioId, environment, mode, variables, iterations, executedBy, browserType } = req.body;

    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const run = new Run({
      scenarioId,
      scenarioName: scenario.name,
      environment: environment || 'staging',
      mode: mode || 'headless',
      variables: variables || {},
      iterations: iterations || 1,
      executedBy,
      browserType: browserType || 'chromium',
      status: 'pending',
    });

    const savedRun = await run.save();
    res.status(201).json(savedRun);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRun = async (req, res) => {
  try {
    const run = await Run.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('scenarioId').populate('executedBy');

    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteRun = async (req, res) => {
  try {
    const run = await Run.findByIdAndDelete(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json({ message: 'Run deleted successfully', run });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.runScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const run = await Run.findById(id);
    if (!run) return res.status(404).json({ error: 'Run not found' });

    // Update status to running
    run.status = 'running';
    await run.save();

    // Trigger execution - this will be called from execution engine
    res.json({ message: 'Scenario execution started', runId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRunResults = async (req, res) => {
  try {
    const Result = require('../models/resultsModel');
    const results = await Result.find({ runId: req.params.id });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
