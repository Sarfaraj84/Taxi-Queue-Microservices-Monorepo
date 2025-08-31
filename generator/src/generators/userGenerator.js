const BaseGenerator = require('./baseGenerator');
const path = require('path');
const FileUtils = require('../utils/fileUtils');

class UserGenerator extends BaseGenerator {
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
    await this.createUserCacheService();
  }

  async createUserCacheService() {
    const cacheServiceContent = `const cache = require('../config/redis');

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
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/services/UserCache.js'),
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

module.exports = UserGenerator;
