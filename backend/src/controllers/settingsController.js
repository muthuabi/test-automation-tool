const Settings = require('../models/settingsModel');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await Settings.find({ category });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ settingKey: key });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOneAndUpdate({ settingKey: key }, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSettingById = async (req, res) => {
  try {
    const setting = await Settings.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const setting = new Settings(req.body);
    const savedSetting = await setting.save();
    res.status(201).json(savedSetting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const setting = await Settings.findByIdAndDelete(req.params.id);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json({ message: 'Setting deleted successfully', setting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
