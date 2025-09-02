const grpc = require('@grpc/grpc-js');

class Service {
  constructor() {
    this.users = new Map();
    this.initializeSampleData();
  }

  initializeSampleData() {
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
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'user_002',
        email: 'driver@example.com',
        firstName: 'John',
        lastName: 'Driver',
        phoneNumber: '+61412345678',
        role: 'driver',
        isActive: true,
        customFields: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    sampleUsers.forEach((user) => this.users.set(user.id, user));
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

  // User Service Methods
  getUser(call, callback) {
    try {
      const { userId } = call.request;

      const user = this.users.get(userId);
      if (!user) {
        return callback(null, {
          success: false,
          message: 'User not found',
        });
      }

      callback(null, {
        success: true,
        message: 'User found',
        user,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getUsers(call, callback) {
    try {
      const { page = 1, limit = 10, role, search } = call.request;

      let users = Array.from(this.users.values());

      // Filter by role if specified
      if (role) {
        users = users.filter((user) => user.role === role);
      }

      // Filter by search term if specified
      if (search) {
        const searchTerm = search.toLowerCase();
        users = users.filter(
          (user) =>
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
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
        limit: parseInt(limit),
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  updateUser(call, callback) {
    try {
      const {
        userId,
        firstName,
        lastName,
        phoneNumber,
        role,
        isActive,
        customFields,
      } = call.request;

      const user = this.users.get(userId);
      if (!user) {
        return callback(null, {
          success: false,
          message: 'User not found',
        });
      }

      // Update fields if provided
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (role) user.role = role;
      if (typeof isActive !== 'undefined') user.isActive = isActive;
      if (customFields)
        user.customFields = { ...user.customFields, ...customFields };

      user.updatedAt = new Date().toISOString();
      this.users.set(userId, user);

      callback(null, {
        success: true,
        message: 'User updated successfully',
        user,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  deleteUser(call, callback) {
    try {
      const { userId } = call.request;

      if (!this.users.has(userId)) {
        return callback(null, {
          success: false,
          message: 'User not found',
        });
      }

      this.users.delete(userId);

      callback(null, {
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  createUser(call, callback) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role,
        customFields,
      } = call.request;

      if (this.users.has(email)) {
        return callback(null, {
          success: false,
          message: 'User already exists',
        });
      }

      const userId = `user_${Date.now()}`;
      const user = {
        id: userId,
        email,
        password: password || 'tempPassword123',
        firstName,
        lastName,
        phoneNumber,
        role: role || 'driver',
        isActive: true,
        customFields: customFields || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.users.set(userId, user);

      callback(null, {
        success: true,
        message: 'User created successfully',
        user,
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
