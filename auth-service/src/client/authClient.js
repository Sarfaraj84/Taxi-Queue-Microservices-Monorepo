const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class Client {
  constructor(serviceUrl = process.env._SERVICE_URL || 'localhost:50051') {
    const PROTO_PATH = path.join(__dirname, '../proto/auth.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const authProto = grpc.loadPackageDefinition(packageDefinition).auth;
    this.client = new authProto.Service(
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

  // Auth service methods
  login(email, password) {
    return new Promise((resolve, reject) => {
      this.client.login({ email, password }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  register(userData) {
    return new Promise((resolve, reject) => {
      this.client.register(userData, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  verifyToken(token) {
    return new Promise((resolve, reject) => {
      this.client.verifyToken({ token }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  refreshToken(token) {
    return new Promise((resolve, reject) => {
      this.client.refreshToken({ token }, (error, response) => {
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
