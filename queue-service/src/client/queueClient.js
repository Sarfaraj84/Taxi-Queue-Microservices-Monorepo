const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class Client {
  constructor(serviceUrl = process.env._SERVICE_URL || 'localhost:50053') {
    const PROTO_PATH = path.join(__dirname, '../proto/queue.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const queueProto = grpc.loadPackageDefinition(packageDefinition).queue;
    this.client = new queueProto.Service(
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

  // Queue service methods
  addToQueue(driverId, vehicleType, queueType = 'primary') {
    return new Promise((resolve, reject) => {
      this.client.addToQueue(
        { driverId, vehicleType, queueType },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  removeFromQueue(driverId, queueType) {
    return new Promise((resolve, reject) => {
      this.client.removeFromQueue(
        { driverId, queueType },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  getQueueStatus(queueType, vehicleType) {
    return new Promise((resolve, reject) => {
      this.client.getQueueStatus(
        { queueType, vehicleType },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  getDriverPosition(driverId, queueType) {
    return new Promise((resolve, reject) => {
      this.client.getDriverPosition(
        { driverId, queueType },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  releaseDrivers(queueType, count, terminal, vehicleRequirements = {}) {
    return new Promise((resolve, reject) => {
      this.client.releaseDrivers(
        { queueType, count, terminal, vehicleRequirements },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  handleAirportClosure(reason = 'end-of-day', priorityExpiryHours = 12) {
    return new Promise((resolve, reject) => {
      this.client.handleAirportClosure(
        { reason, priorityExpiryHours },
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
