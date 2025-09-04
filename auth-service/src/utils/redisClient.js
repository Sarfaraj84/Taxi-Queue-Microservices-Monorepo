// utils/redisClient.js
const redis = require('redis');
const { logger } = require('../middleware/grpcMiddleware');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 10;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            this.retryAttempts = retries;
            if (retries > this.maxRetries) {
              logger.error('Max Redis connection retries exceeded');
              return new Error('Too many retries');
            }
            const delay = Math.min(retries * 200, 5000);
            logger.warn(
              `Redis connection attempt ${retries}, retrying in ${delay}ms`
            );
            return delay;
          },
        },
        pingInterval: 30000, // Send PING every 30 seconds
      });

      // Event handlers
      this.client.on('error', (err) => {
        logger.error('Redis Client Error', {
          error: err.message,
          code: err.code,
        });
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
      });

      this.client.on('end', () => {
        logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis Client Reconnecting');
      });

      await this.client.connect();

      // Test connection
      await this.client.ping();
      logger.info('Redis connection test successful');

      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis', {
        error: error.message,
        url: process.env.REDIS_URL,
      });

      // Graceful degradation - service can work without Redis
      this.isConnected = false;
      return false;
    }
  }

  async get(key) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, returning null for get', { key });
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      logger.error('Redis GET error', {
        key,
        error: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  async set(key, value, options = {}) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skip set', { key });
      return false;
    }

    try {
      if (options.EX) {
        await this.client.setEx(key, options.EX, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error', {
        key,
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skip del', { key });
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis DEL error', {
        key,
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  async keys(pattern) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, returning empty array for keys', {
        pattern,
      });
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error', {
        pattern,
        error: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  async delPattern(pattern) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skip delPattern', { pattern });
      return false;
    }

    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(
          `Deleted ${keys.length} keys matching pattern: ${pattern}`
        );
      }
      return true;
    } catch (error) {
      logger.error('Redis DEL pattern error', {
        pattern,
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  async incr(key) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skip incr', { key });
      return 0;
    }

    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error', {
        key,
        error: error.message,
        stack: error.stack,
      });
      return 0;
    }
  }

  async expire(key, seconds) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skip expire', { key, seconds });
      return false;
    }

    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE error', {
        key,
        seconds,
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected', retryAttempts: this.retryAttempts };
    }

    try {
      await this.client.ping();
      return { status: 'connected', retryAttempts: this.retryAttempts };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        retryAttempts: this.retryAttempts,
      };
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        logger.info('Redis Client Disconnected Gracefully');
      } catch (error) {
        logger.error('Error disconnecting from Redis', {
          error: error.message,
        });
      } finally {
        this.isConnected = false;
      }
    }
  }
}

// Singleton instance with connection retry logic
const redisClient = new RedisClient();

// Connection retry with exponential backoff
const connectWithRetry = async (maxAttempts = 5, attempt = 1) => {
  try {
    await redisClient.connect();
  } catch (error) {
    if (attempt >= maxAttempts) {
      logger.error('Max Redis connection attempts reached', {
        attempts: attempt,
        error: error.message,
      });
      return;
    }

    const delay = Math.pow(2, attempt) * 1000;
    logger.warn(
      `Redis connection failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`
    );

    setTimeout(() => {
      connectWithRetry(maxAttempts, attempt + 1);
    }, delay);
  }
};

// Initialize connection
connectWithRetry();

// Graceful shutdown
const shutdownHandler = async () => {
  logger.info('Received shutdown signal, disconnecting Redis...');
  await redisClient.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);

// Health check endpoint for Docker
process.on('SIGUSR1', async () => {
  const health = await redisClient.healthCheck();
  console.log(JSON.stringify(health));
});

module.exports = redisClient;
