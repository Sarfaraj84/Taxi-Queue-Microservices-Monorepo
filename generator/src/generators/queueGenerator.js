const BaseGenerator = require('./baseGenerator');
const path = require('path');
const FileUtils = require('../utils/fileUtils');

class QueueGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    // These are now handled by the base class
    await this.createProtoFile();
    await this.createServerFile();
    await this.createServiceFile();
    await this.createClientFile();
    await this.createModelFiles();

    // Service-specific additional setup
    await this.createAdditionalFiles();
  }

  async createAdditionalFiles() {
    await this.createQueueCacheService();
  }

  async createQueueCacheService() {
    const cacheServiceContent = `const cache = require('../config/redis');

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
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/services/QueueCache.js'),
      cacheServiceContent
    );
  }

  async initializeSampleData() {
    // Service-specific data initialization
  }

  async setupSpecialDependencies() {
    // Service-specific dependency setup
  }
}

module.exports = QueueGenerator;
