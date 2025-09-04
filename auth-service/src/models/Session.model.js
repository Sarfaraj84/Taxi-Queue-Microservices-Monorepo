// models/Session.model.js
const mongoose = require('mongoose');
const { generateSessionId } = require('../utils/idGenerator');

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      default: generateSessionId,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
    },
    deviceInfo: {
      ipAddress: String,
      userAgent: String,
      deviceType: String,
      os: String,
      browser: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
sessionSchema.index({ userId: 1 });
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ location: '2dsphere' });

// Static method to find valid session
sessionSchema.statics.findValidSession = function (sessionId) {
  return this.findOne({
    sessionId,
    isValid: true,
    expiresAt: { $gt: new Date() },
  });
};

// Method to invalidate session
sessionSchema.methods.invalidate = function () {
  this.isValid = false;
  this.logoutTime = new Date();
  return this.save();
};

sessionSchema.pre('validate', function (next) {
  if (this.isNew && !this.sessionId) {
    this.sessionId = generateSessionId();
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
