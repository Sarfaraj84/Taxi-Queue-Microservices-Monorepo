const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');

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
    const serviceContent = `const grpc = require('@grpc/grpc-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.initializeAdminUser();
  }

  async initializeAdminUser() {
    // Create default admin user for testing
    const hashedPassword = await bcrypt.hash('admin123', 12);
    this.users.set('admin@taxiqueue.com', {
      id: 'admin_001',
      email: 'admin@taxiqueue.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '+61000000000',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
  }

  async login(call, callback) {
    try {
      const { email, password } = call.request;
      
      const user = this.users.get(email);
      if (!user) {
        return callback(null, { 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return callback(null, { 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      callback(null, { 
        success: true, 
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  async register(call, callback) {
    try {
      const { email, password, firstName, lastName, phoneNumber } = call.request;
      
      if (this.users.has(email)) {
        return callback(null, { 
          success: false, 
          message: 'User already exists' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = \`user_\${Date.now()}\`;

      const user = {
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: 'driver',
        createdAt: new Date().toISOString()
      };

      this.users.set(email, user);

      callback(null, { 
        success: true, 
        message: 'Registration successful',
        userId 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  verifyToken(call, callback) {
    try {
      const { token } = call.request;
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        callback(null, { 
          valid: true, 
          userId: decoded.userId, 
          email: decoded.email,
          message: 'Token is valid'
        });
      } catch (error) {
        callback(null, { 
          valid: false, 
          message: 'Invalid token' 
        });
      }
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  refreshToken(call, callback) {
    try {
      const { token } = call.request;
      
      // In a real implementation, you'd verify the refresh token
      // and generate a new access token
      callback(null, { 
        valid: false, 
        message: 'Refresh token not implemented' 
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
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString(),
      userCount: this.users.size
    });
  }

  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }
}

module.exports = AuthService;
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/services/authService.js'),
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
