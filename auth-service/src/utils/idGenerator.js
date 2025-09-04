// utils/idGenerator.js
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique user ID following industry standards
 * @returns {string} UUID v4
 */
function generateUserId() {
  return uuidv4();
}

/**
 * Generate a unique session ID
 * @returns {string} UUID v4
 */
function generateSessionId() {
  return uuidv4();
}

/**
 * Generate a unique token ID
 * @returns {string} UUID v4
 */
function generateTokenId() {
  return uuidv4();
}

module.exports = {
  generateUserId,
  generateSessionId,
  generateTokenId,
};
