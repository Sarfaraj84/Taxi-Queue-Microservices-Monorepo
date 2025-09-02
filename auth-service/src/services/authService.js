const grpc = require('@grpc/grpc-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Service {
  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.initializeAdminUser();
  }

  async initializeAdminUser() {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    this.users.set('admin@taxiqueue.com', {
      id: 'admin_001',
      email: 'admin@taxiqueue.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '+61000000000',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
  }

  healthCheck(call, callback) {
    try {
      const response = {
        status: 'OK',
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
        userCount: this.users.size,
      };
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  // Auth Service Methods
  async login(call, callback) {
    try {
      const { email, password } = call.request;

      const user = this.users.get(email);
      if (!user) {
        return callback(null, {
          success: false,
          message: 'Invalid credentials',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return callback(null, {
          success: false,
          message: 'Invalid credentials',
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
          role: user.role,
        },
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  async register(call, callback) {
    try {
      const { email, password, firstName, lastName, phoneNumber } =
        call.request;

      if (this.users.has(email)) {
        return callback(null, {
          success: false,
          message: 'User already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = `user_${Date.now()}`;

      const user = {
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: 'driver',
        createdAt: new Date().toISOString(),
      };

      this.users.set(email, user);

      callback(null, {
        success: true,
        message: 'Registration successful',
        userId,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
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
          message: 'Token is valid',
        });
      } catch (error) {
        callback(null, {
          valid: false,
          message: 'Invalid token',
        });
      }
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  refreshToken(call, callback) {
    try {
      const { token } = call.request;

      // Verify refresh token and generate new access token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = Array.from(this.users.values()).find(
          (u) => u.id === decoded.userId
        );

        if (user) {
          const newToken = this.generateToken(user);
          callback(null, {
            valid: true,
            token: newToken,
            message: 'Token refreshed successfully',
          });
        } else {
          callback(null, {
            valid: false,
            message: 'User not found',
          });
        }
      } catch (error) {
        callback(null, {
          valid: false,
          message: 'Invalid refresh token',
        });
      }
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }
}

module.exports = Service;
