const grpc = require('@grpc/grpc-js');
const turf = require('@turf/turf');

class Service {
  constructor() {
    this.geofences = new Map();
  }

  healthCheck(call, callback) {
    try {
      const response = {
        status: 'OK',
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),

        geofenceCount: this.geofences.size,
      };
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  // Geo Service Methods
  isPointInGeofence(call, callback) {
    try {
      const { latitude, longitude, geofenceId } = call.request;
      const geofence = this.geofences.get(geofenceId);

      if (!geofence) {
        return callback(null, {
          success: false,
          message: 'Geofence not found',
        });
      }

      const point = turf.point([longitude, latitude]);
      const isInside = turf.booleanPointInPolygon(point, geofence.polygon);

      callback(null, {
        success: true,
        isInside,
        geofenceId,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  addGeofence(call, callback) {
    try {
      const { id, name, coordinates } = call.request;
      const polygon = turf.polygon([coordinates]);

      this.geofences.set(id, {
        id,
        name,
        polygon,
      });

      callback(null, {
        success: true,
        message: 'Geofence added successfully',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  calculateDistance(call, callback) {
    try {
      const { fromLat, fromLng, toLat, toLng } = call.request;
      const from = turf.point([fromLng, fromLat]);
      const to = turf.point([toLng, toLat]);

      const distance = turf.distance(from, to, { units: 'kilometers' });

      callback(null, {
        success: true,
        distance: Math.round(distance * 100) / 100,
        unit: 'kilometers',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }
}

module.exports = Service;
