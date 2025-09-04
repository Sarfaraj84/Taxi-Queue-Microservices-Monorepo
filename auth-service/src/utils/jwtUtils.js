// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const { AuthToken } = require('../models');
const { logger } = require('../middleware/grpcMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Generate JWT token
function generateToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Generate refresh token
function generateRefreshToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    throw new Error('Invalid or expired token');
  }
}

// Verify refresh token
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    logger.error('Refresh token verification failed', { error: error.message });
    throw new Error('Invalid or expired refresh token');
  }
}

// Store token in database
async function storeToken(userId, token, type, expiresAt, metadata = {}) {
  try {
    const authToken = new AuthToken({
      userId,
      token,
      type,
      expiresAt,
      metadata,
    });

    return await authToken.save();
  } catch (error) {
    logger.error('Failed to store token', { error: error.message });
    throw error;
  }
}

// Revoke token
async function revokeToken(tokenId) {
  try {
    const token = await AuthToken.findOne({ tokenId });
    if (token) {
      return await token.revoke();
    }
    return null;
  } catch (error) {
    logger.error('Failed to revoke token', { error: error.message });
    throw error;
  }
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  storeToken,
  revokeToken,
};
