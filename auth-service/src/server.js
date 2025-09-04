// server.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
//const { InterceptingCall } = require('@grpc/grpc-js');

// Import generated gRPC service
//const { AuthService } = require('./generated/auth_grpc_pb');
const authHandler = require('./handlers/authHandler');
const {
  logger /*authInterceptor, validationInterceptor*/,
} = require('./middleware/grpcMiddleware');
const { connectRedis } = require('./utils/redisClient');

// Load environment variables
require('dotenv').config();

const PROTO_PATH = path.join(__dirname, 'proto', 'auth.proto');
const PORT = process.env.PORT || 50051;

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const AuthService = protoDescriptor.auth.AuthServiceService;

// Create gRPC server
const server = new grpc.Server();

// Add service to server with interceptors
server.addService(AuthService, authHandler);

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('Received shutdown signal. Shutting down gracefully...');

  try {
    // Try to shut down gracefully
    server.tryShutdown(async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error(
        'Could not close connections in time, forcefully shutting down'
      );
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Connect to Redis
    await connectRedis();
    console.log('Connected to Redis');

    // Start gRPC server
    server.bindAsync(
      `0.0.0.0:${PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to bind server:', error);
          process.exit(1);
        }
        console.log(`Auth gRPC server running on port ${port}`);
        logger.info(`Auth gRPC server started on port ${port}`);
      }
    );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = server;
