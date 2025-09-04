// auth-service/handlers/authHandler.js
const grpc = require('@grpc/grpc-js');
const { User, Session, AuthToken } = require('../models');
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  storeToken,
  revokeToken,
} = require('../utils/jwtUtils');
const { logger } = require('../middleware/grpcMiddleware');
const redisClient = require('../utils/redisClient');

// Generic cache function with fallback
async function getWithCache(key, fallbackFunction, ttl = 3600) {
  try {
    // Try to get from Redis first
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, execute fallback function
    const result = await fallbackFunction();

    // Store in Redis if available
    if (result && redisClient.isConnected) {
      await redisClient.set(key, JSON.stringify(result), { EX: ttl });
    }

    return result;
  } catch (error) {
    logger.warn('Cache operation failed, using fallback', {
      key,
      error: error.message,
    });

    // Fallback to direct function call
    return await fallbackFunction();
  }
}

// Cache set function with fallback
async function setWithCache(key, value, ttl = 3600) {
  try {
    if (redisClient.isConnected) {
      await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    }
  } catch (error) {
    logger.warn('Cache set operation failed', {
      key,
      error: error.message,
    });
  }
}

// Cache delete function with fallback
async function deleteFromCache(key) {
  try {
    if (redisClient.isConnected) {
      await redisClient.del(key);
    }
  } catch (error) {
    logger.warn('Cache delete operation failed', {
      key,
      error: error.message,
    });
  }
}

const authHandler = {
  // User registration
  RegisterUser: async (call, callback) => {
    try {
      const {
        email,
        password,
        role,
        first_name,
        last_name,
        phone_number,
        driver_license_number,
        driver_accreditation_number,
      } = call.request;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: 'User already exists with this email',
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        role,
        firstName: first_name,
        lastName: last_name,
        phoneNumber: phone_number,
        driverLicenseNumber: driver_license_number,
        driverAccreditationNumber: driver_accreditation_number,
      });

      await user.save();

      // Invalidate any cached user lists
      await deleteFromCache('users:all');
      await deleteFromCache(`users:role:${role}`);

      callback(null, {
        user_id: user.userId,
        email: user.email,
        role: user.role,
        message: 'User registered successfully',
      });
    } catch (error) {
      logger.error('Registration failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Registration failed: ' + error.message,
      });
    }
  },

  // User login
  LoginUser: async (call, callback) => {
    try {
      const { email, password, device_info, ip_address } = call.request;

      // Check Redis for login attempts to prevent brute force
      const loginAttemptsKey = `login:attempts:${email}`;
      const attempts = (await redisClient.get(loginAttemptsKey)) || 0;

      if (attempts >= 5) {
        return callback({
          code: grpc.status.RESOURCE_EXHAUSTED,
          message: 'Too many login attempts. Please try again later.',
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user || !(await user.comparePassword(password))) {
        // Increment failed login attempts
        await redisClient.incr(loginAttemptsKey);
        await redisClient.expire(loginAttemptsKey, 300); // 5 minutes lockout

        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Invalid email or password',
        });
      }

      if (!user.isActive) {
        return callback({
          code: grpc.status.PERMISSION_DENIED,
          message: 'Account is deactivated',
        });
      }

      // Reset login attempts on successful login
      await redisClient.del(loginAttemptsKey);

      // Generate tokens
      const tokenPayload = {
        userId: user.userId,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateToken(tokenPayload, '1h');
      const refreshToken = generateRefreshToken(tokenPayload, '7d');

      // Store tokens
      const accessTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await storeToken(user.userId, accessToken, 'access', accessTokenExpiry, {
        userAgent: device_info,
        ipAddress: ip_address,
      });

      await storeToken(
        user.userId,
        refreshToken,
        'refresh',
        refreshTokenExpiry,
        { userAgent: device_info, ipAddress: ip_address }
      );

      // Create session
      const session = new Session({
        userId: user.userId,
        expiresAt: refreshTokenExpiry,
        deviceInfo: {
          userAgent: device_info,
          ipAddress: ip_address,
        },
      });

      await session.save();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Cache user profile for faster future access
      const userCacheKey = `user:${user.userId}:profile`;
      await setWithCache(
        userCacheKey,
        {
          user_id: user.userId,
          email: user.email,
          role: user.role,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber,
          is_active: user.isActive,
          is_verified: user.isVerified,
        },
        3600
      );

      callback(null, {
        user_id: user.userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600, // 1 hour in seconds
        user: {
          user_id: user.userId,
          email: user.email,
          role: user.role,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber,
          is_active: user.isActive,
          is_verified: user.isVerified,
        },
      });
    } catch (error) {
      logger.error('Login failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Login failed: ' + error.message,
      });
    }
  },

  // Verify token
  VerifyToken: async (call, callback) => {
    try {
      const { token } = call.request;

      const tokenCacheKey = `token:${token}:valid`;

      const result = await getWithCache(
        tokenCacheKey,
        async () => {
          const decoded = verifyToken(token);

          // Check if token is revoked in database
          const tokenRecord = await AuthToken.findOne({
            token,
            type: 'access',
            isRevoked: false,
          });

          if (!tokenRecord) {
            return {
              valid: false,
              user_id: '',
              role: '',
              expires_at: 0,
            };
          }

          return {
            valid: true,
            user_id: decoded.userId,
            role: decoded.role,
            expires_at: decoded.exp * 1000, // Convert to milliseconds
          };
        },
        300 // 5 minutes cache
      );

      callback(null, result);
    } catch (error) {
      callback(null, {
        valid: false,
        user_id: '',
        role: '',
        expires_at: 0,
      });
    }
  },

  // Refresh token
  RefreshToken: async (call, callback) => {
    try {
      const { refresh_token } = call.request;

      // Verify refresh token
      const decoded = verifyRefreshToken(refresh_token);

      // Check if refresh token is valid in database
      const tokenRecord = await AuthToken.findOne({
        token: refresh_token,
        type: 'refresh',
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenRecord) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: 'Invalid or expired refresh token',
        });
      }

      // Get user
      const user = await User.findByUserId(decoded.userId);
      if (!user || !user.isActive) {
        return callback({
          code: grpc.status.PERMISSION_DENIED,
          message: 'User not found or inactive',
        });
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.userId,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateToken(tokenPayload, '1h');
      const newRefreshToken = generateRefreshToken(tokenPayload, '7d');

      // Store new tokens
      const accessTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await storeToken(
        user.userId,
        newAccessToken,
        'access',
        accessTokenExpiry,
        tokenRecord.metadata
      );

      await storeToken(
        user.userId,
        newRefreshToken,
        'refresh',
        refreshTokenExpiry,
        tokenRecord.metadata
      );

      // Revoke old refresh token
      await revokeToken(tokenRecord.tokenId);

      // Invalidate cached tokens
      await deleteFromCache(`token:${refresh_token}:valid`);
      await deleteFromCache(`user:${user.userId}:tokens`);

      callback(null, {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 3600,
      });
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Token refresh failed: ' + error.message,
      });
    }
  },

  // Logout user
  LogoutUser: async (call, callback) => {
    try {
      const { user_id, session_id } = call.request;

      // Revoke all access tokens for this user
      await AuthToken.updateMany(
        { userId: user_id, type: 'access', isRevoked: false },
        { isRevoked: true }
      );

      // Revoke refresh token
      await AuthToken.updateMany(
        { userId: user_id, type: 'refresh', isRevoked: false },
        { isRevoked: true }
      );

      // Invalidate session if provided
      if (session_id) {
        const session = await Session.findOne({ sessionId: session_id });
        if (session) {
          await session.invalidate();
        }
      }

      // Clear user cache
      await deleteFromCache(`user:${user_id}:profile`);
      await deleteFromCache(`user:${user_id}:sessions`);
      await deleteFromCache(`user:${user_id}:tokens`);

      callback(null, {
        success: true,
        message: 'User logged out successfully',
      });
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Logout failed: ' + error.message,
      });
    }
  },

  // Get user profile
  GetUserProfile: async (call, callback) => {
    try {
      const { user_id } = call.request;
      const userCacheKey = `user:${user_id}:profile`;

      const userProfile = await getWithCache(
        userCacheKey,
        async () => {
          const user = await User.findByUserId(user_id);
          if (!user) throw new Error('User not found');

          return {
            user_id: user.userId,
            email: user.email,
            role: user.role,
            first_name: user.firstName,
            last_name: user.lastName,
            phone_number: user.phoneNumber,
            driver_license_number: user.driverLicenseNumber,
            driver_accreditation_number: user.driverAccreditationNumber,
            is_active: user.isActive,
            is_verified: user.isVerified,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
          };
        },
        3600 // 1 hour cache
      );

      callback(null, {
        user: userProfile,
      });
    } catch (error) {
      logger.error('Get user profile failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Get user profile failed: ' + error.message,
      });
    }
  },

  // Update user profile
  UpdateUserProfile: async (call, callback) => {
    try {
      const {
        user_id,
        first_name,
        last_name,
        phone_number,
        driver_license_number,
        driver_accreditation_number,
      } = call.request;

      const user = await User.findByUserId(user_id);
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'User not found',
        });
      }

      // Update fields if provided
      if (first_name) user.firstName = first_name;
      if (last_name) user.lastName = last_name;
      if (phone_number) user.phoneNumber = phone_number;
      if (driver_license_number)
        user.driverLicenseNumber = driver_license_number;
      if (driver_accreditation_number)
        user.driverAccreditationNumber = driver_accreditation_number;

      await user.save();

      // Invalidate cache
      await deleteFromCache(`user:${user_id}:profile`);

      const userProfile = {
        user_id: user.userId,
        email: user.email,
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber,
        driver_license_number: user.driverLicenseNumber,
        driver_accreditation_number: user.driverAccreditationNumber,
        is_active: user.isActive,
        is_verified: user.isVerified,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      };

      callback(null, {
        user: userProfile,
      });
    } catch (error) {
      logger.error('Update user profile failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Update user profile failed: ' + error.message,
      });
    }
  },

  // Validate session
  ValidateSession: async (call, callback) => {
    try {
      const { session_id, user_id } = call.request;
      const sessionCacheKey = `session:${session_id}:valid`;

      const result = await getWithCache(
        sessionCacheKey,
        async () => {
          const session = await Session.findValidSession(session_id);
          if (!session || session.userId !== user_id) {
            return {
              valid: false,
              user_id: '',
              role: '',
            };
          }

          const user = await User.findByUserId(user_id);
          if (!user || !user.isActive) {
            return {
              valid: false,
              user_id: '',
              role: '',
            };
          }

          return {
            valid: true,
            user_id: user.userId,
            role: user.role,
          };
        },
        60 // 1 minute cache
      );

      callback(null, result);
    } catch (error) {
      logger.error('Session validation failed', { error: error.message });
      callback(null, {
        valid: false,
        user_id: '',
        role: '',
      });
    }
  },

  // Get user sessions
  GetUserSessions: async (call, callback) => {
    try {
      const { user_id } = call.request;
      const sessionsCacheKey = `user:${user_id}:sessions`;

      const sessions = await getWithCache(
        sessionsCacheKey,
        async () => {
          const dbSessions = await Session.find({
            userId: user_id,
            isValid: true,
          })
            .sort({ loginTime: -1 })
            .limit(10);

          return dbSessions.map((session) => ({
            session_id: session.sessionId,
            user_id: session.userId,
            device_info: session.deviceInfo.userAgent,
            ip_address: session.deviceInfo.ipAddress,
            login_time: session.loginTime.toISOString(),
            expires_at: session.expiresAt.toISOString(),
          }));
        },
        300 // 5 minutes cache
      );

      callback(null, {
        sessions,
      });
    } catch (error) {
      logger.error('Get user sessions failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Get user sessions failed: ' + error.message,
      });
    }
  },

  // Revoke session
  RevokeSession: async (call, callback) => {
    try {
      const { session_id, user_id } = call.request;

      const session = await Session.findOne({
        sessionId: session_id,
        userId: user_id,
      });
      if (!session) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'Session not found',
        });
      }

      await session.invalidate();

      // Invalidate cache
      await deleteFromCache(`session:${session_id}:valid`);
      await deleteFromCache(`user:${user_id}:sessions`);

      callback(null, {
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      logger.error('Revoke session failed', { error: error.message });
      callback({
        code: grpc.status.INTERNAL,
        message: 'Revoke session failed: ' + error.message,
      });
    }
  },
};

module.exports = authHandler;
