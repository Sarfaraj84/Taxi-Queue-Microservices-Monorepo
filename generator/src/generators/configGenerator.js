const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

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
    const serviceContent = await compileTemplate('service/service.js.hbs', {
      serviceName: this.serviceKey,
      serviceNamePascal: this.serviceNamePascal,
      serviceNameUpperCase: this.serviceNameUpperCase,
    });

    await FileUtils.createFile(
      path.join(this.servicePath, `src/services/${this.serviceKey}Service.js`),
      serviceContent
    );
  }
}

module.exports = ConfigGenerator;
