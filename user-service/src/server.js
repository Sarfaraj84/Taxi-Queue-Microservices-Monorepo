const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Load proto file
const PROTO_PATH = path.join(__dirname, 'proto/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Import service implementation
const Service = require('./services/userService');

class GrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || 50052;
    this.service = new Service();
  }

  start() {
    this.server.addService(userProto.Service.service, {
      GetUser: this.service.getUser.bind(this.service),
      GetUsers: this.service.getUsers.bind(this.service),
      UpdateUser: this.service.updateUser.bind(this.service),
      DeleteUser: this.service.deleteUser.bind(this.service),
      CreateUser: this.service.createUser.bind(this.service),
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
