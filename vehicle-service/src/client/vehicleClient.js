const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class Client {
  constructor(serviceUrl = process.env._SERVICE_URL || 'localhost:50055') {
    const PROTO_PATH = path.join(__dirname, '../proto/vehicle.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const vehicleProto = grpc.loadPackageDefinition(packageDefinition).vehicle;
    this.client = new vehicleProto.Service(
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

  // Vehicle service methods
  registerVehicle(driverId, vehicleData) {
    return new Promise((resolve, reject) => {
      this.client.registerVehicle(
        { driverId, ...vehicleData },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  setActiveVehicle(driverId, vehicleId) {
    return new Promise((resolve, reject) => {
      this.client.setActiveVehicle(
        { driverId, vehicleId },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  getDriverVehicles(driverId) {
    return new Promise((resolve, reject) => {
      this.client.getDriverVehicles({ driverId }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  updateVehicle(vehicleId, updates) {
    return new Promise((resolve, reject) => {
      this.client.updateVehicle(
        { vehicleId, ...updates },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  deleteVehicle(vehicleId) {
    return new Promise((resolve, reject) => {
      this.client.deleteVehicle({ vehicleId }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
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
