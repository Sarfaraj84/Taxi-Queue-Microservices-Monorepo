const cache = require('../config/redis');

class UserCache {
  constructor() {
    this.prefix = 'user:';
    this.ttl = 1800; // 30 minutes
  }

  async getUser(userId) {
    const key = this.prefix + userId;
    const cached = await cache.get(key);
    if (cached) return cached;

    // Cache miss - will be filled by service layer
    return null;
  }

  async setUser(user) {
    const key = this.prefix + user.id;
    await cache.set(key, user, this.ttl);

    // Also cache by email for lookups
    const emailKey = this.prefix + 'email:' + user.email;
    await cache.set(emailKey, user.id, this.ttl);
  }

  async invalidateUser(userId) {
    const key = this.prefix + userId;
    await cache.del(key);
  }

  async getUserByEmail(email) {
    const key = this.prefix + 'email:' + email;
    const userId = await cache.get(key);
    return userId ? this.getUser(userId) : null;
  }
}

module.exports = new UserCache();
