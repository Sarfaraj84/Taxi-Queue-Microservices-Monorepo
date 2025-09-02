const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class Client {
  constructor(serviceUrl = process.env._SERVICE_URL || 'localhost:50057') {
    const PROTO_PATH = path.join(__dirname, '../proto/config.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const configProto = grpc.loadPackageDefinition(packageDefinition).config;
    this.client = new configProto.Service(
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

  // Config service methods
  getConfig(key) {
    return new Promise((resolve, reject) => {
      this.client.getConfig({ key }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  updateConfig(key, value) {
    return new Promise((resolve, reject) => {
      this.client.updateConfig({ key, value }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  getFeeConfig(terminal, vehicleType) {
    return new Promise((resolve, reject) => {
      this.client.getFeeConfig({ terminal, vehicleType }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  updateFeeConfig(configData) {
    return new Promise((resolve, reject) => {
      this.client.updateFeeConfig(configData, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  getSystemConfig(section) {
    return new Promise((resolve, reject) => {
      this.client.getSystemConfig({ section }, (error, response) => {
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
