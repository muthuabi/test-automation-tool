const mongoose = require('mongoose');

const functionSchema = new mongoose.Schema(
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
    code: {
      type: String,
      required: true,
    },
    parameters: {
      type: [String],
      default: ['page', 'vars', 'selectors'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Testing'],
      default: 'Active',
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Function', functionSchema);
