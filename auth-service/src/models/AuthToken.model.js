// models/AuthToken.model.js
const mongoose = require('mongoose');
const { generateTokenId } = require('../utils/idGenerator');

const authTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      unique: true,
      default: generateTokenId,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['access', 'refresh', 'reset_password', 'verify_email'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
authTokenSchema.index({ userId: 1, type: 1 });
authTokenSchema.index({ token: 1 });
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to find valid token
authTokenSchema.statics.findValidToken = function (token, type) {
  return this.findOne({
    token,
    type,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

// Method to revoke token
authTokenSchema.methods.revoke = function () {
  this.isRevoked = true;
  return this.save();
};

authTokenSchema.pre('validate', function (next) {
  if (this.isNew && !this.tokenId) {
    this.tokenId = generateTokenId();
  }
  next();
});

module.exports = mongoose.model('AuthToken', authTokenSchema);
