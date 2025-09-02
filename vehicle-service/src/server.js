const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Load proto file
const PROTO_PATH = path.join(__dirname, 'proto/vehicle.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const vehicleProto = grpc.loadPackageDefinition(packageDefinition).vehicle;

// Import service implementation
const Service = require('./services/vehicleService');

class GrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || 50055;
    this.service = new Service();
  }

  start() {
    this.server.addService(vehicleProto.Service.service, {
      RegisterVehicle: this.service.registerVehicle.bind(this.service),
      SetActiveVehicle: this.service.setActiveVehicle.bind(this.service),
      GetDriverVehicles: this.service.getDriverVehicles.bind(this.service),
      UpdateVehicle: this.service.updateVehicle.bind(this.service),
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
