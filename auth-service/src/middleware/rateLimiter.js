const cache = require('../config/redis');

class RateLimiter {
  constructor() {
    this.limits = {
      login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 15 minutes
      tokenRefresh: { maxAttempts: 10, windowMs: 3600000 }, // 1 hour
    };
  }

  async checkRateLimit(key, type) {
    const limit = this.limits[type];
    if (!limit) return true;

    const current = (await cache.get(key)) || 0;
    if (current >= limit.maxAttempts) {
      return false;
    }

    await cache.set(key, current + 1, limit.windowMs / 1000);
    return true;
  }

  async resetRateLimit(key) {
    await cache.del(key);
  }
}

module.exports = new RateLimiter();
