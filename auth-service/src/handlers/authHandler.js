// handlers/authHandler.js
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
      await redisClient.del('users:all');
      await redisClient.del(`users:role:${role}`);

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
      await redisClient.setex(
        userCacheKey,
        3600,
        JSON.stringify({
          user_id: user.userId,
          email: user.email,
          role: user.role,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber,
          is_active: user.isActive,
          is_verified: user.isVerified,
        })
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

      // Check Redis cache first for token validation
      const tokenCacheKey = `token:${token}:valid`;
      const cachedValidation = await redisClient.get(tokenCacheKey);

      if (cachedValidation) {
        const validation = JSON.parse(cachedValidation);
        return callback(null, {
          valid: validation.valid,
          user_id: validation.user_id,
          role: validation.role,
          expires_at: validation.expires_at,
        });
      }

      const decoded = verifyToken(token);

      // Check if token is revoked in database
      const tokenRecord = await AuthToken.findOne({
        token,
        type: 'access',
        isRevoked: false,
      });
      if (!tokenRecord) {
        return callback(null, {
          valid: false,
          user_id: '',
          role: '',
          expires_at: 0,
        });
      }

      const response = {
        valid: true,
        user_id: decoded.userId,
        role: decoded.role,
        expires_at: decoded.exp * 1000, // Convert to milliseconds
      };

      // Cache token validation for 5 minutes
      await redisClient.setex(tokenCacheKey, 300, JSON.stringify(response));

      callback(null, response);
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
      await redisClient.del(`user:${user_id}:profile`);
      await redisClient.delPattern(`tokens:user:${user_id}:*`);

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

      // Check Redis cache first
      const userCacheKey = `user:${user_id}:profile`;
      const cachedUser = await redisClient.get(userCacheKey);

      if (cachedUser) {
        return callback(null, {
          user: JSON.parse(cachedUser),
        });
      }

      const user = await User.findByUserId(user_id);
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'User not found',
        });
      }

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

      // Cache user profile for 1 hour
      await redisClient.setex(userCacheKey, 3600, JSON.stringify(userProfile));

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
      await redisClient.del(`user:${user_id}:profile`);

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

      // Check Redis cache first
      const sessionCacheKey = `session:${session_id}:valid`;
      const cachedValidation = await redisClient.get(sessionCacheKey);

      if (cachedValidation) {
        const validation = JSON.parse(cachedValidation);
        return callback(null, {
          valid: validation.valid,
          user_id: validation.user_id,
          role: validation.role,
        });
      }

      const session = await Session.findValidSession(session_id);
      if (!session || session.userId !== user_id) {
        return callback(null, {
          valid: false,
          user_id: '',
          role: '',
        });
      }

      const user = await User.findByUserId(user_id);
      if (!user || !user.isActive) {
        return callback(null, {
          valid: false,
          user_id: '',
          role: '',
        });
      }

      const response = {
        valid: true,
        user_id: user.userId,
        role: user.role,
      };

      // Cache session validation for 1 minute
      await redisClient.setex(sessionCacheKey, 60, JSON.stringify(response));

      callback(null, response);
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

      // Check Redis cache first
      const sessionsCacheKey = `user:${user_id}:sessions`;
      const cachedSessions = await redisClient.get(sessionsCacheKey);

      if (cachedSessions) {
        return callback(null, {
          sessions: JSON.parse(cachedSessions),
        });
      }

      const sessions = await Session.find({ userId: user_id, isValid: true })
        .sort({ loginTime: -1 })
        .limit(10);

      const sessionResponses = sessions.map((session) => ({
        session_id: session.sessionId,
        user_id: session.userId,
        device_info: session.deviceInfo.userAgent,
        ip_address: session.deviceInfo.ipAddress,
        login_time: session.loginTime.toISOString(),
        expires_at: session.expiresAt.toISOString(),
      }));

      // Cache sessions for 5 minutes
      await redisClient.setex(
        sessionsCacheKey,
        300,
        JSON.stringify(sessionResponses)
      );

      callback(null, {
        sessions: sessionResponses,
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
      await redisClient.del(`session:${session_id}:valid`);
      await redisClient.del(`user:${user_id}:sessions`);

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
