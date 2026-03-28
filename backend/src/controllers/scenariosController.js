const Scenario = require('../models/scenariosModel');
const Function = require('../models/functionsModel');

exports.getScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find().populate('functionIds').populate('owner');
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScenarioById = async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id).populate('functionIds').populate('owner');
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createScenario = async (req, res) => {
  try {
    const { name, description, functionIds, tags, owner } = req.body;

    // Fetch function names from IDs
    const functions = await Function.find({ _id: { $in: functionIds } });
    const functionNames = functions.map((f) => f.name);

    const scenario = new Scenario({
      name,
      description,
      functionIds,
      functionNames,
      tags,
      owner,
    });

    const savedScenario = await scenario.save();
    res.status(201).json(savedScenario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateScenario = async (req, res) => {
  try {
    const { functionIds } = req.body;

    // If functionIds are being updated, fetch new names
    let updateData = { ...req.body };
    if (functionIds) {
      const functions = await Function.find({ _id: { $in: functionIds } });
      const functionNames = functions.map((f) => f.name);
      updateData.functionNames = functionNames;
    }

    const scenario = await Scenario.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('functionIds').populate('owner');

    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(scenario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteScenario = async (req, res) => {
  try {
    const scenario = await Scenario.findByIdAndDelete(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ message: 'Scenario deleted successfully', scenario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
