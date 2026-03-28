const mongoose = require('mongoose');

const runSchema = new mongoose.Schema(
  {
    scenarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scenario',
      required: true,
    },
    scenarioName: {
      type: String,
      required: true,
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'staging',
    },
    mode: {
      type: String,
      enum: ['headless', 'headed'],
      default: 'headless',
    },
    variables: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    iterations: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    totalDuration: Number,
    browserType: {
      type: String,
      enum: ['chromium', 'firefox', 'webkit'],
      default: 'chromium',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Run', runSchema);
