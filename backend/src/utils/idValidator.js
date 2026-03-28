const mongoose = require('mongoose');

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string ID to valid MongoDB ObjectId, throw error if invalid
 * @param {string} id - The ID string to convert
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - Valid ObjectId
 * @throws {Error} - If ID is not a valid ObjectId
 */
const validateAndConvertId = (id, fieldName = 'ID') => {
  if (!id) {
    throw new Error(`${fieldName} is required`);
  }

  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format: ${id}`);
  }

  return new mongoose.Types.ObjectId(id);
};

/**
 * Validate multiple IDs at once
 * @param {Array} ids - Array of ID strings
 * @param {string} fieldName - Field name for error message
 * @returns {Array} - Array of valid ObjectIds
 * @throws {Error} - If any ID is invalid
 */
const validateAndConvertIds = (ids, fieldName = 'IDs') => {
  if (!Array.isArray(ids)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return ids.map((id, index) => {
    if (!isValidObjectId(id)) {
      throw new Error(`Invalid ${fieldName} at index ${index}: ${id}`);
    }
    return id;
  });
};

module.exports = {
  isValidObjectId,
  validateAndConvertId,
  validateAndConvertIds,
};
