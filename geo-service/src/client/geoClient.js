const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class Client {
  constructor(serviceUrl = process.env._SERVICE_URL || 'localhost:50054') {
    const PROTO_PATH = path.join(__dirname, '../proto/geo.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const geoProto = grpc.loadPackageDefinition(packageDefinition).geo;
    this.client = new geoProto.Service(
      serviceUrl,
      grpc.credentials.createInsecure()
    );
  }

  // Health check
  healthCheck() {
    return new Promise((resolve, reject) => {
      this.client.healthCheck({}, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  // Geo service methods
  isPointInGeofence(latitude, longitude, geofenceId) {
    return new Promise((resolve, reject) => {
      this.client.isPointInGeofence(
        { latitude, longitude, geofenceId },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  addGeofence(id, name, coordinates) {
    return new Promise((resolve, reject) => {
      this.client.addGeofence({ id, name, coordinates }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  calculateDistance(fromLat, fromLng, toLat, toLng) {
    return new Promise((resolve, reject) => {
      this.client.calculateDistance(
        { fromLat, fromLng, toLat, toLng },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  // Close connection
  close() {
    if (this.client) {
      this.client.close();
    }
  }

  // Get client state
  getState() {
    return {
      connected: !!this.client,
      serviceUrl: this.client?.getChannel().getTarget(),
    };
  }

  // Wait for connection
  waitForReady(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeout;
      this.client.waitForReady(deadline, (error) => {
        error ? reject(error) : resolve();
      });
    });
  }
}

module.exports = Client;
