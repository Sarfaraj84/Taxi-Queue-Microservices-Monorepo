const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Load proto file
const PROTO_PATH = path.join(__dirname, 'proto/auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Import service implementation
const Service = require('./services/authService');

class GrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || 50051;
    this.service = new Service();
  }

  start() {
    this.server.addService(authProto.Service.service, {
      Login: this.service.login.bind(this.service),
      Register: this.service.register.bind(this.service),
      VerifyToken: this.service.verifyToken.bind(this.service),
      RefreshToken: this.service.refreshToken.bind(this.service),
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
