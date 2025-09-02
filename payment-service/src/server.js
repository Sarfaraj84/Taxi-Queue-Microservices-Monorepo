const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Load proto file
const PROTO_PATH = path.join(__dirname, 'proto/payment.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const paymentProto = grpc.loadPackageDefinition(packageDefinition).payment;

// Import service implementation
const Service = require('./services/paymentService');

class GrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || 50056;
    this.service = new Service();
  }

  start() {
    this.server.addService(paymentProto.Service.service, {
      ProcessPayment: this.service.processPayment.bind(this.service),
      GetPayment: this.service.getPayment.bind(this.service),
      GetDriverPayments: this.service.getDriverPayments.bind(this.service),
      RefundPayment: this.service.refundPayment.bind(this.service),
      GetDriverBalance: this.service.getDriverBalance.bind(this.service),
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
