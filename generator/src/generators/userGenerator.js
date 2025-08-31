const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');

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
    const serviceContent = `const grpc = require('@grpc/grpc-js');

class UserService {
  constructor() {
    this.users = new Map();
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample users for testing
    const sampleUsers = [
      {
        id: 'user_001',
        email: 'admin@taxiqueue.com',
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '+61000000000',
        role: 'admin',
        isActive: true,
        customFields: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'user_002',
        email: 'driver1@example.com',
        firstName: 'John',
        lastName: 'Driver',
        phoneNumber: '+61412345678',
        role: 'driver',
        isActive: true,
        customFields: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  getUser(call, callback) {
    try {
      const { userId } = call.request;
      
      const user = this.users.get(userId);
      if (!user) {
        return callback(null, { 
          success: false, 
          message: 'User not found' 
        });
      }

      callback(null, { 
        success: true, 
        message: 'User found',
        user 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  getUsers(call, callback) {
    try {
      const { page = 1, limit = 10, role } = call.request;
      
      let users = Array.from(this.users.values());
      
      // Filter by role if specified
      if (role) {
        users = users.filter(user => user.role === role);
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      callback(null, { 
        success: true, 
        users: paginatedUsers,
        total: users.length,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  updateUser(call, callback) {
    try {
      const { userId, firstName, lastName, phoneNumber, role, isActive, customFields } = call.request;
      
      const user = this.users.get(userId);
      if (!user) {
        return callback(null, { 
          success: false, 
          message: 'User not found' 
        });
      }

      // Update fields if provided
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (role) user.role = role;
      if (typeof isActive !== 'undefined') user.isActive = isActive;
      if (customFields) user.customFields = { ...user.customFields, ...customFields };
      
      user.updatedAt = new Date().toISOString();
      this.users.set(userId, user);

      callback(null, { 
        success: true, 
        message: 'User updated successfully',
        user 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  deleteUser(call, callback) {
    try {
      const { userId } = call.request;
      
      if (!this.users.has(userId)) {
        return callback(null, { 
          success: false, 
          message: 'User not found' 
        });
      }

      this.users.delete(userId);

      callback(null, { 
        success: true, 
        message: 'User deleted successfully' 
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
      message: 'User service is healthy',
      timestamp: new Date().toISOString(),
      userCount: this.users.size
    });
  }
}

module.exports = UserService;
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/services/userService.js'),
      serviceContent
    );
  }
}

module.exports = UserGenerator;
