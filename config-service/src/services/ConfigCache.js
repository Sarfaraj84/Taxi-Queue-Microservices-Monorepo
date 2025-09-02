const cache = require('../config/redis');

class ConfigCache {
  constructor() {
    this.prefix = 'config:';
    this.defaultTtl = 3600; // 1 hour
  }

  async getConfig(key) {
    const cacheKey = this.prefix + key;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return {
        value: cached,
        source: 'cache',
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  async setConfig(key, value, ttl = this.defaultTtl) {
    const cacheKey = this.prefix + key;
    await cache.set(cacheKey, value, ttl);

    // Also store in hash for bulk operations
    await cache.set(
      `${this.prefix}hash:${key}`,
      { value, updatedAt: new Date().toISOString() },
      ttl
    );
  }

  async getFeeConfig(terminal, vehicleType) {
    const cacheKey = this.prefix + `fee:${terminal}:${vehicleType}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return {
        ...cached,
        source: 'cache',
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  async setFeeConfig(config, ttl = this.defaultTtl) {
    const { terminal, vehicleType } = config;
    const cacheKey = this.prefix + `fee:${terminal}:${vehicleType}`;

    await cache.set(cacheKey, config, ttl);

    // Store in sorted set for config versioning
    const versionKey = this.prefix + `fee_versions:${terminal}:${vehicleType}`;
    await cache.zadd(versionKey, Date.now(), JSON.stringify(config));

    // Keep only last 5 versions
    await cache.zremrangebyrank(versionKey, 0, -6);
  }

  async invalidateConfig(key) {
    const cacheKey = this.prefix + key;
    await cache.del(cacheKey);

    const hashKey = this.prefix + 'hash:' + key;
    await cache.del(hashKey);
  }

  async invalidateFeeConfig(terminal, vehicleType) {
    const cacheKey = this.prefix + `fee:${terminal}:${vehicleType}`;
    await cache.del(cacheKey);
  }

  async getConfigVersionHistory(terminal, vehicleType, limit = 5) {
    const versionKey = this.prefix + `fee_versions:${terminal}:${vehicleType}`;
    const versions = await cache.zrevrange(versionKey, 0, limit - 1);

    return versions
      .map((v) => {
        try {
          return { ...JSON.parse(v), source: 'cache_history' };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  async preloadConfigs() {
    // Preload frequently accessed configs on startup
    const preloadConfigs = [
      'system.name',
      'system.version',
      'fee:default:default',
      'queue.settings',
      'payment.commission_rate',
    ];

    for (const key of preloadConfigs) {
      const cacheKey = this.prefix + key;
      await cache.set(cacheKey, { preloaded: true }, 300); // 5 minute TTL for preload markers
    }
  }
}

module.exports = new ConfigCache();
