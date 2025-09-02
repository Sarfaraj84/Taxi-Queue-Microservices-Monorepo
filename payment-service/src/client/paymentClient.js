const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class Client {
  constructor(serviceUrl = process.env._SERVICE_URL || 'localhost:50056') {
    const PROTO_PATH = path.join(__dirname, '../proto/payment.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const paymentProto = grpc.loadPackageDefinition(packageDefinition).payment;
    this.client = new paymentProto.Service(
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

  // Payment service methods
  processPayment(driverId, amount, terminal, description, vehicleType) {
    return new Promise((resolve, reject) => {
      this.client.processPayment(
        { driverId, amount, terminal, description, vehicleType },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  getPayment(paymentId) {
    return new Promise((resolve, reject) => {
      this.client.getPayment({ paymentId }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  getDriverPayments(driverId, options = {}) {
    return new Promise((resolve, reject) => {
      this.client.getDriverPayments(
        { driverId, ...options },
        (error, response) => {
          error ? reject(error) : resolve(response);
        }
      );
    });
  }

  refundPayment(paymentId, reason) {
    return new Promise((resolve, reject) => {
      this.client.refundPayment({ paymentId, reason }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  getDriverBalance(driverId) {
    return new Promise((resolve, reject) => {
      this.client.getDriverBalance({ driverId }, (error, response) => {
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
