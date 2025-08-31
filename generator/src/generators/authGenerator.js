const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

class AuthGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    await this.createProtoFile();
    await this.createServerFile();
    await this.createServiceFile();
    await this.createClientFile();
    await this.createModelFiles();
  }

  async createProtoFile() {
    const protoContent = `syntax = "proto3";

package auth;

service AuthService {
  rpc HealthCheck (HealthRequest) returns (HealthResponse) {};
  rpc Login (LoginRequest) returns (LoginResponse) {};
  rpc Register (RegisterRequest) returns (RegisterResponse) {};
  rpc VerifyToken (TokenRequest) returns (TokenResponse) {};
  rpc RefreshToken (TokenRequest) returns (TokenResponse) {};
}

message HealthRequest {
  string service = 1;
}

message HealthResponse {
  string status = 1;
  string message = 2;
  string timestamp = 3;
}

message LoginRequest {
  string email = 1;
  string password = 2;
}

message LoginResponse {
  bool success = 1;
  string message = 2;
  string token = 3;
  string refreshToken = 4;
  User user = 5;
}

message RegisterRequest {
  string email = 1;
  string password = 2;
  string firstName = 3;
  string lastName = 4;
  string phoneNumber = 5;
}

message RegisterResponse {
  bool success = 1;
  string message = 2;
  string userId = 3;
}

message TokenRequest {
  string token = 1;
}

message TokenResponse {
  bool valid = 1;
  string userId = 2;
  string email = 3;
  string message = 4;
}

message User {
  string id = 1;
  string email = 2;
  string firstName = 3;
  string lastName = 4;
  string phoneNumber = 5;
  string role = 6;
}
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/proto', 'auth.proto'),
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

  async createModelFiles() {
    // Add bcrypt and jwt to dependencies
    const packageJsonPath = path.join(this.servicePath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.dependencies['bcryptjs'] = '^2.4.3';
    packageJson.dependencies['jsonwebtoken'] = '^8.5.1';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

module.exports = AuthGenerator;
