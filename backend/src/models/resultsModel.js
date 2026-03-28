const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    runId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Run',
      required: true,
    },
    scenarioName: String,
    functionName: String,
    functionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Function',
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'skipped'],
      default: 'passed',
    },
    startTime: Date,
    endTime: Date,
    duration: Number,
    logs: [String],
    error: {
      type: String,
      default: null,
    },
    output: mongoose.Schema.Types.Mixed,
    screenshots: [String], // Base64 encoded images or URLs
    iteration: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
