// middleware/grpcMiddleware.js
//const grpc = require('@grpc/grpc-js');
//const { status } = require('@grpc/grpc-js');
const { verifyToken } = require('../utils/jwtUtils');
const { InterceptingCall } = require('@grpc/grpc-js');

// Logger setup
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console(),
  ],
});

// Authentication interceptor
const authInterceptor = (options, nextCall) => {
  return new InterceptingCall(nextCall(options), {
    start: function (metadata, listener, next) {
      try {
        // Extract token from metadata
        const authHeader = metadata.get('authorization');

        if (authHeader && authHeader.length > 0) {
          const token = authHeader[0];
          if (typeof token === 'string' && token.startsWith('Bearer ')) {
            const cleanedToken = token.replace('Bearer ', '');
            const decoded = verifyToken(cleanedToken);

            // Add user info to metadata for downstream processing
            metadata.add('user-id', decoded.userId);
            metadata.add('user-role', decoded.role);
            metadata.add('user-email', decoded.email);

            logger.info('Authentication successful', {
              userId: decoded.userId,
              role: decoded.role,
            });
          }
        }
      } catch (error) {
        // Log authentication error but don't fail the request
        // Let the service handle authentication requirements
        logger.warn('Authentication attempt failed', {
          error: error.message,
          metadata: metadata.getMap(),
        });

        // Add authentication failure flag for services to handle
        metadata.add('auth-failed', 'true');
      }

      next(metadata, listener);
    },
  });
};
// Validation interceptor
const validationInterceptor = (options, nextCall) => {
  return new InterceptingCall(nextCall(options), {
    start: function (metadata, listener, next) {
      const methodName = options.method_definition.path;

      try {
        // Add basic request validation
        const contentType = metadata.get('content-type')[0] || '';
        if (!contentType.includes('application/grpc')) {
          logger.warn('Invalid content-type', {
            method: methodName,
            contentType: contentType,
          });
        }

        // Validate required headers for specific methods
        if (methodName.includes('Register') || methodName.includes('Login')) {
          const userAgent = metadata.get('user-agent')[0];
          if (!userAgent) {
            logger.warn('Missing user-agent header', { method: methodName });
          }
        }
      } catch (error) {
        logger.error('Validation interceptor error', {
          method: methodName,
          error: error.message,
        });
      }

      next(metadata, listener);
    },
  });
};

// Logging interceptor
const loggingInterceptor = (options, nextCall) => {
  return new InterceptingCall(nextCall(options), {
    start: function (metadata, listener, next) {
      const startTime = Date.now();
      const method = options.method_definition.path;

      const newListener = {
        onReceiveMessage: (message, next) => {
          const duration = Date.now() - startTime;
          logger.info('gRPC call', {
            method,
            duration,
            status: 'success',
          });
          next(message);
        },
        onReceiveStatus: (status, next) => {
          const duration = Date.now() - startTime;
          if (status.code !== status.OK) {
            logger.error('gRPC call failed', {
              method,
              duration,
              status: status.code,
              details: status.details,
            });
          }
          next(status);
        },
      };

      next(metadata, newListener);
    },
  });
};

module.exports = {
  logger,
  authInterceptor,
  validationInterceptor,
  loggingInterceptor,
};
