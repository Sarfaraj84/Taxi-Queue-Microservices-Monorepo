const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const FileUtils = require('../utils/fileUtils');

class AuthGenerator extends BaseGenerator {
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

  // KEEP these types of methods in service generators:

  async createAdditionalFiles() {
    // Auth-specific additional files
    await this.createAuthConfig();
    await this.addJwtDependencies();
    await this.createRateLimiter();
  }

  async createRateLimiter() {
    const rateLimiterContent = `const cache = require('../config/redis');

class RateLimiter {
  constructor() {
    this.limits = {
      login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 15 minutes
      tokenRefresh: { maxAttempts: 10, windowMs: 3600000 } // 1 hour
    };
  }

  async checkRateLimit(key, type) {
    const limit = this.limits[type];
    if (!limit) return true;

    const current = await cache.get(key) || 0;
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
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/middleware/rateLimiter.js'),
      rateLimiterContent
    );
  }

  async createAuthConfig() {
    // Create auth-specific configuration
    const authConfig = `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
};
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/config/auth.js'),
      authConfig
    );
  }

  async addJwtDependencies() {
    // Add auth-specific dependencies to package.json
    const packageJsonPath = path.join(this.servicePath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.dependencies = {
      ...packageJson.dependencies,
      bcryptjs: '^2.4.3',
      jsonwebtoken: '^8.5.1',
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  async initializeSampleData() {
    // Service-specific data initialization
  }

  async setupSpecialDependencies() {
    // Service-specific dependency setup
  }
}

module.exports = AuthGenerator;
