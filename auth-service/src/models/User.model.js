// models/User.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateUserId } = require('../utils/idGenerator');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      default: generateUserId,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: [
        'driver',
        'ground_operator',
        'operation_manager',
        'admin',
        'super_admin',
      ],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    driverLicenseNumber: {
      type: String,
      sparse: true, // Only required for drivers
      unique: true,
    },
    driverAccreditationNumber: {
      type: String,
      sparse: true, // Only required for drivers
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ driverLicenseNumber: 1 });
userSchema.index({ driverAccreditationNumber: 1 });
userSchema.index({ isActive: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by userId
userSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

userSchema.pre('validate', function (next) {
  // Ensure userId is set before validation
  if (this.isNew && !this.userId) {
    this.userId = generateUserId();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
