const cache = require('./ConfigCache');
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
        timestamp: config.updatedAt,
      };
    }

    return null;
  }

  async loadFeeConfig(
    terminal = 'default',
    vehicleType = 'default',
    forceRefresh = false
  ) {
    //const cacheKey = `${terminal}:${vehicleType}`;

    if (!forceRefresh) {
      const cached = await this.cache.getFeeConfig(terminal, vehicleType);
      if (cached) return cached;
    }

    // Load from database
    const feeConfig = await FeeConfig.findOne({
      terminal,
      vehicleType,
      isActive: true,
    });

    if (feeConfig) {
      await this.cache.setFeeConfig(feeConfig.toObject());
      return {
        ...feeConfig.toObject(),
        source: 'database',
        timestamp: feeConfig.updatedAt,
      };
    }

    // Fallback to default config
    const defaultConfig = await FeeConfig.findOne({
      terminal: 'default',
      vehicleType: 'default',
      isActive: true,
    });

    if (defaultConfig) {
      await this.cache.setFeeConfig(defaultConfig.toObject());
      return {
        ...defaultConfig.toObject(),
        source: 'database_default',
        timestamp: defaultConfig.updatedAt,
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
      refreshedAt: new Date().toISOString(),
    };
  }
}

module.exports = new ConfigLoader();
