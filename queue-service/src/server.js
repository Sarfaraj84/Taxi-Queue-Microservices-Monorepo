const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Load proto file
const PROTO_PATH = path.join(__dirname, 'proto/queue.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const queueProto = grpc.loadPackageDefinition(packageDefinition).queue;

// Import service implementation
const Service = require('./services/queueService');

class GrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || 50053;
    this.service = new Service();
  }

  start() {
    this.server.addService(queueProto.Service.service, {
      AddToQueue: this.service.addToQueue.bind(this.service),
      RemoveFromQueue: this.service.removeFromQueue.bind(this.service),
      GetQueueStatus: this.service.getQueueStatus.bind(this.service),
      GetDriverPosition: this.service.getDriverPosition.bind(this.service),
      ReleaseDrivers: this.service.releaseDrivers.bind(this.service),
      HandleAirportClosure: this.service.handleAirportClosure.bind(
        this.service
      ),
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
