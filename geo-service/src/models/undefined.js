const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['primary', 'secondary', 'terminal'],
      required: true,
    },
    terminal: {
      type: String,
      enum: ['T1', 'T3', 'T4', 'none'],
      default: 'none',
    },
    coordinates: [
      [
        {
          longitude: { type: Number, required: true },
          latitude: { type: Number, required: true },
        },
      ],
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geospatial queries
geofenceSchema.index({ coordinates: '2dsphere' });
geofenceSchema.index({ type: 1, terminal: 1 });

module.exports = mongoose.model('Geofence', geofenceSchema);
