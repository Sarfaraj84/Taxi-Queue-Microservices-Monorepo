const grpc = require('@grpc/grpc-js');

class Service {
  constructor() {
    this.configs = new Map();
    this.feeConfigs = new Map();
    this.initializeDefaultConfigs();
  }

  initializeDefaultConfigs() {
    // System configurations
    this.configs.set('system.name', {
      key: 'system.name',
      value: 'Taxi Queue System',
      updatedAt: new Date().toISOString(),
    });

    this.configs.set('system.version', {
      key: 'system.version',
      value: '1.0.0',
      updatedAt: new Date().toISOString(),
    });

    // Fee configurations
    const defaultFeeConfig = {
      terminal: 'default',
      vehicleType: 'default',
      divisionType: 'percentage',
      platformShare: 15,
      airportShare: 85,
      minFee: 5,
      maxFee: 50,
      updatedAt: new Date().toISOString(),
    };

    this.feeConfigs.set('default:default', defaultFeeConfig);
  }

  healthCheck(call, callback) {
    try {
      const response = {
        status: 'OK',
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),

        configCount: this.configs.size,
        feeConfigCount: this.feeConfigs.size,
      };
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  // Config Service Methods
  getConfig(call, callback) {
    try {
      const { key } = call.request;

      const config = this.configs.get(key);
      if (!config) {
        return callback(null, {
          success: false,
          message: 'Config not found',
        });
      }

      callback(null, {
        success: true,
        message: 'Config found',
        config,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  updateConfig(call, callback) {
    try {
      const { key, value } = call.request;

      const config = {
        key,
        value,
        updatedAt: new Date().toISOString(),
      };

      this.configs.set(key, config);

      callback(null, {
        success: true,
        message: 'Config updated successfully',
        config,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getFeeConfig(call, callback) {
    try {
      const { terminal, vehicleType } = call.request;

      const configKey = `${terminal || 'default'}:${vehicleType || 'default'}`;
      let config = this.feeConfigs.get(configKey);

      // Fallback to default config if specific config not found
      if (!config) {
        config = this.feeConfigs.get('default:default');
      }

      callback(null, {
        success: true,
        message: 'Fee config found',
        config,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  updateFeeConfig(call, callback) {
    try {
      const {
        terminal,
        vehicleType,
        divisionType,
        platformShare,
        airportShare,
        minFee,
        maxFee,
        applicableTerminals,
        applicableVehicleTypes,
      } = call.request;

      const configKey = `${terminal || 'default'}:${vehicleType || 'default'}`;
      const config = {
        terminal: terminal || 'default',
        vehicleType: vehicleType || 'default',
        divisionType,
        platformShare,
        airportShare,
        minFee,
        maxFee,
        applicableTerminals: applicableTerminals || [],
        applicableVehicleTypes: applicableVehicleTypes || [],
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      this.feeConfigs.set(configKey, config);

      callback(null, {
        success: true,
        message: 'Fee config updated successfully',
        config,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getSystemConfig(call, callback) {
    try {
      const { section } = call.request;

      let configs = {};
      if (section) {
        // Return only configs for the specified section
        Array.from(this.configs.entries()).forEach(([key, value]) => {
          if (key.startsWith(`${section}.`)) {
            configs[key] = value.value;
          }
        });
      } else {
        // Return all configs
        Array.from(this.configs.entries()).forEach(([key, value]) => {
          configs[key] = value.value;
        });
      }

      callback(null, {
        success: true,
        message: 'System config retrieved',
        configs,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }
}

module.exports = Service;
