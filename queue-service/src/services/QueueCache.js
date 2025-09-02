const cache = require('../config/redis');

class QueueCache {
  constructor() {
    this.prefix = 'queue:';
    this.ttl = 30; // 30 seconds for real-time data
  }

  async getQueueStatus(queueType) {
    const key = this.prefix + 'status:' + queueType;
    return await cache.get(key);
  }

  async setQueueStatus(queueType, status) {
    const key = this.prefix + 'status:' + queueType;
    await cache.set(key, status, this.ttl);
  }

  async getDriverPosition(driverId) {
    const key = this.prefix + 'position:' + driverId;
    return await cache.get(key);
  }

  async setDriverPosition(driverId, position) {
    const key = this.prefix + 'position:' + driverId;
    await cache.set(key, position, this.ttl);
  }

  async invalidateQueue(queueType) {
    const key = this.prefix + 'status:' + queueType;
    await cache.del(key);
  }
}

module.exports = new QueueCache();
