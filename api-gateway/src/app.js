const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Service discovery and routing configuration
const services = {
  auth: {
    target: `http://${process.env.AUTH_SERVICE_HOST || 'auth-service'}:${process.env.AUTH_SERVICE_PORT || 3001}`,
    path: '/api/auth',
  },
  users: {
    target: `http://${process.env.USER_SERVICE_HOST || 'user-service'}:${process.env.USER_SERVICE_PORT || 3002}`,
    path: '/api/users',
  },
  queue: {
    target: `http://${process.env.QUEUE_SERVICE_HOST || 'queue-service'}:${process.env.QUEUE_SERVICE_PORT || 3003}`,
    path: '/api/queue',
  },
  geo: {
    target: `http://${process.env.GEO_SERVICE_HOST || 'geo-service'}:${process.env.GEO_SERVICE_PORT || 3004}`,
    path: '/api/geo',
  },
  payment: {
    target: `http://${process.env.PAYMENT_SERVICE_HOST || 'payment-service'}:${process.env.PAYMENT_SERVICE_PORT || 3005}`,
    path: '/api/payment',
  },
  vehicles: {
    target: `http://${process.env.VEHICLE_SERVICE_HOST || 'vehicle-service'}:${process.env.VEHICLE_SERVICE_PORT || 3006}`,
    path: '/api/vehicles',
  },
  config: {
    target: `http://${process.env.CONFIG_SERVICE_HOST || 'config-service'}:${process.env.CONFIG_SERVICE_PORT || 3007}`,
    path: '/api/config',
  },
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Service status endpoint
app.get('/status', async (req, res) => {
  const status = {};

  for (const [serviceName, serviceConfig] of Object.entries(services)) {
    try {
      // This would be enhanced with actual health checks in production
      status[serviceName] = 'healthy';
    } catch (error) {
      status[serviceName] = 'unhealthy';
    }
  }

  res.json(status);
});

// Set up proxies for each service
Object.entries(services).forEach(([serviceName, serviceConfig]) => {
  app.use(
    serviceConfig.path,
    createProxyMiddleware({
      target: serviceConfig.target,
      changeOrigin: true,
      pathRewrite: {
        [`^${serviceConfig.path}`]: '',
      },
      onError: (err, req, res) => {
        console.error(`Error proxying to ${serviceName}:`, err);
        res.status(503).json({
          error: `Service ${serviceName} is temporarily unavailable`,
        });
      },
      timeout: 10000, // 10 second timeout
    })
  );
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available services:');
  Object.entries(services).forEach(([serviceName, serviceConfig]) => {
    console.log(`  ${serviceName}: ${serviceConfig.target}`);
  });
});
