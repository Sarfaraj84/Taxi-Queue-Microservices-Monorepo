const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');

class ConfigGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    await this.createProtoFile();
    await this.createServiceFile();
    await this.createClientFile();
  }

  async createProtoFile() {
    const protoContent = `syntax = "proto3";

package config;

service ConfigService {
  rpc HealthCheck (HealthRequest) returns (HealthResponse) {};
  rpc GetConfig (ConfigRequest) returns (ConfigResponse) {};
  rpc UpdateConfig (UpdateConfigRequest) returns (ConfigResponse) {};
  rpc GetFeeConfig (FeeConfigRequest) returns (FeeConfigResponse) {};
  rpc UpdateFeeConfig (UpdateFeeConfigRequest) returns (FeeConfigResponse) {};
}

message HealthRequest {
  string service = 1;
}

message HealthResponse {
  string status = 1;
  string message = 2;
  string timestamp = 3;
}

message ConfigRequest {
  string key = 1;
}

message UpdateConfigRequest {
  string key = 1;
  string value = 2;
}

message FeeConfigRequest {
  string terminal = 1;
  string vehicleType = 2;
}

message UpdateFeeConfigRequest {
  string terminal = 1;
  string vehicleType = 2;
  string divisionType = 3;
  double platformShare = 4;
  double airportShare = 5;
  double minFee = 6;
  double maxFee = 7;
}

message ConfigResponse {
  bool success = 1;
  string message = 2;
  Config config = 3;
}

message FeeConfigResponse {
  bool success = 1;
  string message = 2;
  FeeConfig config = 3;
}

message Config {
  string key = 1;
  string value = 2;
  string updatedAt = 3;
}

message FeeConfig {
  string terminal = 1;
  string vehicleType = 2;
  string divisionType = 3;
  double platformShare = 4;
  double airportShare = 5;
  double minFee = 6;
  double maxFee = 7;
  string updatedAt = 8;
}
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/proto', 'config.proto'),
      protoContent
    );
  }

  async createServiceFile() {
    const serviceContent = `const grpc = require('@grpc/grpc-js');

class ConfigService {
  constructor() {
    this.configs = new Map();
    this.feeConfigs = new Map();
    this.initializeDefaultConfigs();
  }

  initializeDefaultConfigs() {
    // Default system configurations
    this.configs.set('system.name', { 
      key: 'system.name', 
      value: 'Taxi Queue System', 
      updatedAt: new Date().toISOString() 
    });
    
    this.configs.set('system.version', { 
      key: 'system.version', 
      value: '1.0.0', 
      updatedAt: new Date().toISOString() 
    });

    // Default fee configurations
    const defaultFeeConfig = {
      terminal: 'default',
      vehicleType: 'default',
      divisionType: 'percentage',
      platformShare: 15,
      airportShare: 85,
      minFee: 5,
      maxFee: 50,
      updatedAt: new Date().toISOString()
    };
    
    this.feeConfigs.set('default:default', defaultFeeConfig);
  }

  getConfig(call, callback) {
    try {
      const { key } = call.request;
      
      const config = this.configs.get(key);
      if (!config) {
        return callback(null, { 
          success: false, 
          message: 'Config not found' 
        });
      }

      callback(null, { 
        success: true, 
        message: 'Config found',
        config 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  updateConfig(call, callback) {
    try {
      const { key, value } = call.request;
      
      const config = {
        key,
        value,
        updatedAt: new Date().toISOString()
      };

      this.configs.set(key, config);

      callback(null, { 
        success: true, 
        message: 'Config updated successfully',
        config 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  getFeeConfig(call, callback) {
    try {
      const { terminal, vehicleType } = call.request;
      
      const configKey = \`\${terminal || 'default'}:\${vehicleType || 'default'}\`;
      let config = this.feeConfigs.get(configKey);

      // Fallback to default config if specific config not found
      if (!config) {
        config = this.feeConfigs.get('default:default');
      }

      callback(null, { 
        success: true, 
        message: 'Fee config found',
        config 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  updateFeeConfig(call, callback) {
    try {
      const { terminal, vehicleType, divisionType, platformShare, airportShare, minFee, maxFee } = call.request;
      
      const configKey = \`\${terminal || 'default'}:\${vehicleType || 'default'}\`;
      const config = {
        terminal: terminal || 'default',
        vehicleType: vehicleType || 'default',
        divisionType,
        platformShare,
        airportShare,
        minFee,
        maxFee,
        updatedAt: new Date().toISOString()
      };

      this.feeConfigs.set(configKey, config);

      callback(null, { 
        success: true, 
        message: 'Fee config updated successfully',
        config 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  healthCheck(call, callback) {
    callback(null, {
      status: 'OK',
      message: 'Config service is healthy',
      timestamp: new Date().toISOString(),
      configCount: this.configs.size,
      feeConfigCount: this.feeConfigs.size
    });
  }
}

module.exports = ConfigService;
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/services/configService.js'),
      serviceContent
    );
  }
}

module.exports = ConfigGenerator;
