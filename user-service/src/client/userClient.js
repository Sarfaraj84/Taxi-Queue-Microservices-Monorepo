const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class Client {
  constructor(serviceUrl = process.env._SERVICE_URL || 'localhost:50052') {
    const PROTO_PATH = path.join(__dirname, '../proto/user.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const userProto = grpc.loadPackageDefinition(packageDefinition).user;
    this.client = new userProto.Service(
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

  // User service methods
  getUser(userId) {
    return new Promise((resolve, reject) => {
      this.client.getUser({ userId }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  getUsers(options = {}) {
    return new Promise((resolve, reject) => {
      this.client.getUsers(options, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  updateUser(userId, updates) {
    return new Promise((resolve, reject) => {
      this.client.updateUser({ userId, ...updates }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  deleteUser(userId) {
    return new Promise((resolve, reject) => {
      this.client.deleteUser({ userId }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  createUser(userData) {
    return new Promise((resolve, reject) => {
      this.client.createUser(userData, (error, response) => {
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
