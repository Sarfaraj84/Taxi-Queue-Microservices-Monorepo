const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Load proto file
const PROTO_PATH = path.join(__dirname, 'proto/config.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const configProto = grpc.loadPackageDefinition(packageDefinition).config;

// Import service implementation
const Service = require('./services/configService');

class GrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || 50057;
    this.service = new Service();
  }

  start() {
    this.server.addService(configProto.Service.service, {
      GetConfig: this.service.getConfig.bind(this.service),
      UpdateConfig: this.service.updateConfig.bind(this.service),
      GetFeeConfig: this.service.getFeeConfig.bind(this.service),
      UpdateFeeConfig: this.service.updateFeeConfig.bind(this.service),
      GetSystemConfig: this.service.getSystemConfig.bind(this.service),
      HealthCheck: this.service.healthCheck.bind(this.service),
    });

    this.server.bindAsync(
      `0.0.0.0:${this.port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to start gRPC server:', error);
          return;
        }
        console.log(`Service gRPC server running on port ${port}`);
        this.server.start();
      }
    );
  }

  stop() {
    this.server.forceShutdown();
  }
}

module.exports = GrpcServer;
