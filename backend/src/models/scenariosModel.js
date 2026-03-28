const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    functionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Function',
      },
    ],
    functionNames: [String],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Testing'],
      default: 'Active',
    },
    tags: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scenario', scenarioSchema);
