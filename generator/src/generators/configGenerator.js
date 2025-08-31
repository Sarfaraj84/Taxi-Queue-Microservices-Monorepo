const BaseGenerator = require('./baseGenerator');
const path = require('path');
const FileUtils = require('../utils/fileUtils');

class ConfigGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    await this.createProtoFile();
    await this.createServerFile();
    await this.createServiceFile();
    await this.createClientFile();
    await this.createModelFiles();
    await this.createAdditionalFiles();
  }

  async createAdditionalFiles() {
    await this.createConfigCacheService();
    await this.createConfigLoader();
  }

  async createConfigCacheService() {
    const cacheServiceContent = `const cache = require('../config/redis');

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
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  async setConfig(key, value, ttl = this.defaultTtl) {
    const cacheKey = this.prefix + key;
    await cache.set(cacheKey, value, ttl);
    
    // Also store in hash for bulk operations
    await cache.set(\`\${this.prefix}hash:\${key}\`, { value, updatedAt: new Date().toISOString() }, ttl);
  }

  async getFeeConfig(terminal, vehicleType) {
    const cacheKey = this.prefix + \`fee:\${terminal}:\${vehicleType}\`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return {
        ...cached,
        source: 'cache',
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  async setFeeConfig(config, ttl = this.defaultTtl) {
    const { terminal, vehicleType } = config;
    const cacheKey = this.prefix + \`fee:\${terminal}:\${vehicleType}\`;
    
    await cache.set(cacheKey, config, ttl);
    
    // Store in sorted set for config versioning
    const versionKey = this.prefix + \`fee_versions:\${terminal}:\${vehicleType}\`;
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
    const cacheKey = this.prefix + \`fee:\${terminal}:\${vehicleType}\`;
    await cache.del(cacheKey);
  }

  async getConfigVersionHistory(terminal, vehicleType, limit = 5) {
    const versionKey = this.prefix + \`fee_versions:\${terminal}:\${vehicleType}\`;
    const versions = await cache.zrevrange(versionKey, 0, limit - 1);
    
    return versions.map(v => {
      try {
        return { ...JSON.parse(v), source: 'cache_history' };
      } catch {
        return null;
      }
    }).filter(Boolean);
  }

  async preloadConfigs() {
    // Preload frequently accessed configs on startup
    const preloadConfigs = [
      'system.name',
      'system.version',
      'fee:default:default',
      'queue.settings',
      'payment.commission_rate'
    ];

    for (const key of preloadConfigs) {
      const cacheKey = this.prefix + key;
      await cache.set(cacheKey, { preloaded: true }, 300); // 5 minute TTL for preload markers
    }
  }
}

module.exports = new ConfigCache();
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/services/ConfigCache.js'),
      cacheServiceContent
    );
  }

  async createConfigLoader() {
    const configLoaderContent = `const cache = require('./ConfigCache');
const { Config, FeeConfig } = require('../models/Config');

class ConfigLoader {
  constructor() {
    this.cache = cache;
  }

  async loadConfig(key, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await this.cache.getConfig(key);
      if (cached) return cached;
    }

    // Cache miss or forced refresh - load from database
    const config = await Config.findOne({ key, isActive: true });
    if (config) {
      await this.cache.setConfig(key, config.value);
      return {
        value: config.value,
        source: 'database',
        timestamp: config.updatedAt
      };
    }

    return null;
  }

  async loadFeeConfig(terminal = 'default', vehicleType = 'default', forceRefresh = false) {
    const cacheKey = \`\${terminal}:\${vehicleType}\`;
    
    if (!forceRefresh) {
      const cached = await this.cache.getFeeConfig(terminal, vehicleType);
      if (cached) return cached;
    }

    // Load from database
    const feeConfig = await FeeConfig.findOne({
      terminal,
      vehicleType,
      isActive: true
    });

    if (feeConfig) {
      await this.cache.setFeeConfig(feeConfig.toObject());
      return {
        ...feeConfig.toObject(),
        source: 'database',
        timestamp: feeConfig.updatedAt
      };
    }

    // Fallback to default config
    const defaultConfig = await FeeConfig.findOne({
      terminal: 'default',
      vehicleType: 'default',
      isActive: true
    });

    if (defaultConfig) {
      await this.cache.setFeeConfig(defaultConfig.toObject());
      return {
        ...defaultConfig.toObject(),
        source: 'database_default',
        timestamp: defaultConfig.updatedAt
      };
    }

    return null;
  }

  async refreshAllConfigs() {
    // Refresh all configs in background
    const configs = await Config.find({ isActive: true });
    
    for (const config of configs) {
      await this.cache.setConfig(config.key, config.value);
    }

    const feeConfigs = await FeeConfig.find({ isActive: true });
    
    for (const config of feeConfigs) {
      await this.cache.setFeeConfig(config.toObject());
    }

    return {
      configs: configs.length,
      feeConfigs: feeConfigs.length,
      refreshedAt: new Date().toISOString()
    };
  }
}

module.exports = new ConfigLoader();
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/services/ConfigLoader.js'),
      configLoaderContent
    );
  }
}

module.exports = ConfigGenerator;
