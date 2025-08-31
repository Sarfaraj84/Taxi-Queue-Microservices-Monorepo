const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

class QueueGenerator extends BaseGenerator {
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

package queue;

service QueueService {
  rpc HealthCheck (HealthRequest) returns (HealthResponse) {};
  rpc AddToQueue (AddToQueueRequest) returns (QueueResponse) {};
  rpc RemoveFromQueue (RemoveFromQueueRequest) returns (QueueResponse) {};
  rpc GetQueueStatus (QueueStatusRequest) returns (QueueStatusResponse) {};
  rpc GetDriverPosition (DriverPositionRequest) returns (DriverPositionResponse) {};
  rpc ReleaseDrivers (ReleaseRequest) returns (ReleaseResponse) {};
}

message HealthRequest {
  string service = 1;
}

message HealthResponse {
  string status = 1;
  string message = 2;
  string timestamp = 3;
  int32 primaryQueueCount = 4;
  int32 secondaryQueueCount = 5;
}

message AddToQueueRequest {
  string driverId = 1;
  string vehicleType = 2;
  string queueType = 3;
}

message RemoveFromQueueRequest {
  string driverId = 1;
  string queueType = 2;
}

message QueueStatusRequest {
  string queueType = 1;
  string vehicleType = 2;
}

message DriverPositionRequest {
  string driverId = 1;
  string queueType = 2;
}

message ReleaseRequest {
  string queueType = 1;
  int32 count = 2;
  string terminal = 3;
}

message QueueResponse {
  bool success = 1;
  string message = 2;
  int32 position = 3;
  string queueType = 4;
}

message QueueStatusResponse {
  bool success = 1;
  int32 count = 2;
  repeated Driver drivers = 3;
  string queueType = 4;
}

message DriverPositionResponse {
  bool success = 1;
  int32 position = 2;
  string queueType = 3;
  string message = 4;
}

message ReleaseResponse {
  bool success = 1;
  string message = 2;
  int32 releasedCount = 3;
  repeated string driverIds = 4;
}

message Driver {
  string id = 1;
  string name = 2;
  string vehicleType = 3;
  int32 position = 4;
  string queueType = 5;
  string joinedAt = 6;
}
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/proto', 'queue.proto'),
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

module.exports = QueueGenerator;
