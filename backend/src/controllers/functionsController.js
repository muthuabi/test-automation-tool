const Function = require('../models/functionsModel');
const { validateAndConvertId } = require('../utils/idValidator');

exports.getFunctions = async (req, res) => {
  try {
    const functions = await Function.find();
    res.json(functions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFunctionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      validateAndConvertId(id, 'Function ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const func = await Function.findById(id);
    if (!func) return res.status(404).json({ error: 'Function not found' });
    res.json(func);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFunction = async (req, res) => {
  try {
    const func = new Function(req.body);
    const savedFunction = await func.save();
    res.status(201).json(savedFunction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateFunction = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      validateAndConvertId(id, 'Function ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const func = await Function.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!func) return res.status(404).json({ error: 'Function not found' });
    res.json(func);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFunction = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      validateAndConvertId(id, 'Function ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const func = await Function.findByIdAndDelete(id);
    if (!func) return res.status(404).json({ error: 'Function not found' });
    res.json({ message: 'Function deleted successfully', func });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.testFunction = async (req, res) => {
  try {
    const { id } = req.params;
    const { vars, selectors } = req.body;

    try {
      validateAndConvertId(id, 'Function ID');
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const func = await Function.findById(id);
    if (!func) return res.status(404).json({ error: 'Function not found' });

    // Function testing will be implemented in the execution engine
    res.json({ message: 'Function test endpoint - to be implemented', functionId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
