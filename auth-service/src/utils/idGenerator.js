// utils/idGenerator.js
const { v4: uuidv4 } = require('uuid');
const redisClient = require('./redisClient');

/**
 * Generate a unique user ID with optional sequence number for better indexing
 */
async function generateUserId() {
  try {
    // Use Redis to maintain a sequence counter for better database indexing
    const sequence = await redisClient.incr('user:id:sequence');
    const uuid = uuidv4();

    // Combine sequence number with UUID for better database performance
    return `usr_${sequence}_${uuid}`;
  } catch (error) {
    // Fallback to plain UUID if Redis is unavailable
    return `usr_${uuidv4()}`;
  }
}

/**
 * Generate a unique session ID
 */
async function generateSessionId() {
  try {
    const sequence = await redisClient.incr('session:id:sequence');
    const uuid = uuidv4();
    return `sess_${sequence}_${uuid}`;
  } catch (error) {
    return `sess_${uuidv4()}`;
  }
}

/**
 * Generate a unique token ID
 */
async function generateTokenId() {
  try {
    const sequence = await redisClient.incr('token:id:sequence');
    const uuid = uuidv4();
    return `tok_${sequence}_${uuid}`;
  } catch (error) {
    return `tok_${uuidv4()}`;
  }
}

module.exports = {
  generateUserId,
  generateSessionId,
  generateTokenId,
};
