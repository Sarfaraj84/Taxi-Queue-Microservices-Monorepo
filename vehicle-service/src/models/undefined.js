const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['sedan', '7-seater', 'station-wagon', 'van'],
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure only one active vehicle per driver
vehicleSchema.pre('save', async function (next) {
  if (this.isActive && this.isModified('isActive')) {
    await this.constructor.updateMany(
      { driverId: this.driverId, _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

vehicleSchema.index({ driverId: 1 });
vehicleSchema.index({ registrationNumber: 1 });
vehicleSchema.index({ vehicleType: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
