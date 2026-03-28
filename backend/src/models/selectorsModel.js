const mongoose = require('mongoose');

const selectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    page: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['css', 'xpath', 'id', 'class'],
      default: 'css',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Selector', selectorSchema);
