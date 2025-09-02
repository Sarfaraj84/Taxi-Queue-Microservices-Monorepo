const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    platformCommission: {
      type: Number,
      required: true,
    },
    airportPortion: {
      type: Number,
      required: true,
    },
    terminal: {
      type: String,
      enum: ['T1', 'T3', 'T4'],
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['sedan', '7-seater', 'station-wagon', 'van'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    description: {
      type: String,
    },
    stripePaymentId: {
      type: String,
    },
    divisionType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    refundReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ driverId: 1 });
paymentSchema.index({ terminal: 1 });
paymentSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
