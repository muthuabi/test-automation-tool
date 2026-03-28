const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    settingKey: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['ado', 'teams', 'email', 'general'],
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    config: mongoose.Schema.Types.Mixed,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
