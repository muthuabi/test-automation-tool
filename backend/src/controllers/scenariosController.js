const Scenario = require('../models/scenariosModel');
const Function = require('../models/functionsModel');
const { validateAndConvertId, validateAndConvertIds } = require('../utils/idValidator');

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
    const { id } = req.params;

    // Validate ID format
    try {
      validateAndConvertId(id, 'Scenario ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const scenario = await Scenario.findById(id).populate('functionIds').populate('owner');
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createScenario = async (req, res) => {
  try {
    const { name, description, functionIds, tags, owner } = req.body;

    // Validate functionIds format
    if (functionIds && functionIds.length > 0) {
      try {
        validateAndConvertIds(functionIds, 'Function IDs');
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }
    }

    // Validate owner if provided
    if (owner) {
      try {
        validateAndConvertId(owner, 'Owner ID');
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }
    }

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
    const populatedScenario = await Scenario.findById(savedScenario._id).populate('functionIds').populate('owner');
    res.status(201).json(populatedScenario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const { functionIds, owner } = req.body;

    // Validate ID format
    try {
      validateAndConvertId(id, 'Scenario ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Validate functionIds if provided
    if (functionIds && functionIds.length > 0) {
      try {
        validateAndConvertIds(functionIds, 'Function IDs');
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }
    }

    // Validate owner if provided
    if (owner) {
      try {
        validateAndConvertId(owner, 'Owner ID');
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }
    }

    let updateData = { ...req.body };
    if (functionIds) {
      const functions = await Function.find({ _id: { $in: functionIds } });
      const functionNames = functions.map((f) => f.name);
      updateData.functionNames = functionNames;
    }

    const scenario = await Scenario.findByIdAndUpdate(id, updateData, {
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
    const { id } = req.params;

    // Validate ID format
    try {
      validateAndConvertId(id, 'Scenario ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const scenario = await Scenario.findByIdAndDelete(id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ message: 'Scenario deleted successfully', scenario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
