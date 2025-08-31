const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

class UserGenerator extends BaseGenerator {
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

package user;

service UserService {
  rpc HealthCheck (HealthRequest) returns (HealthResponse) {};
  rpc GetUser (UserRequest) returns (UserResponse) {};
  rpc GetUsers (UsersRequest) returns (UsersResponse) {};
  rpc UpdateUser (UpdateUserRequest) returns (UserResponse) {};
  rpc DeleteUser (UserRequest) returns (DeleteResponse) {};
}

message HealthRequest {
  string service = 1;
}

message HealthResponse {
  string status = 1;
  string message = 2;
  string timestamp = 3;
}

message UserRequest {
  string userId = 1;
}

message UsersRequest {
  int32 page = 1;
  int32 limit = 2;
  string role = 3;
}

message UpdateUserRequest {
  string userId = 1;
  string firstName = 2;
  string lastName = 3;
  string phoneNumber = 4;
  string role = 5;
  bool isActive = 6;
  map<string, string> customFields = 7;
}

message UserResponse {
  bool success = 1;
  string message = 2;
  User user = 3;
}

message UsersResponse {
  bool success = 1;
  repeated User users = 2;
  int32 total = 3;
  int32 page = 4;
  int32 limit = 5;
}

message DeleteResponse {
  bool success = 1;
  string message = 2;
}

message User {
  string id = 1;
  string email = 2;
  string firstName = 3;
  string lastName = 4;
  string phoneNumber = 5;
  string role = 6;
  bool isActive = 7;
  map<string, string> customFields = 8;
  string createdAt = 9;
  string updatedAt = 10;
}
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/proto', 'user.proto'),
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

module.exports = UserGenerator;
