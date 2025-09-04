// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var auth_pb = require('./auth_pb.js');

function serialize_auth_GetSessionsRequest(arg) {
  if (!(arg instanceof auth_pb.GetSessionsRequest)) {
    throw new Error('Expected argument of type auth.GetSessionsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_GetSessionsRequest(buffer_arg) {
  return auth_pb.GetSessionsRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_GetSessionsResponse(arg) {
  if (!(arg instanceof auth_pb.GetSessionsResponse)) {
    throw new Error('Expected argument of type auth.GetSessionsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_GetSessionsResponse(buffer_arg) {
  return auth_pb.GetSessionsResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_GetUserRequest(arg) {
  if (!(arg instanceof auth_pb.GetUserRequest)) {
    throw new Error('Expected argument of type auth.GetUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_GetUserRequest(buffer_arg) {
  return auth_pb.GetUserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_LoginRequest(arg) {
  if (!(arg instanceof auth_pb.LoginRequest)) {
    throw new Error('Expected argument of type auth.LoginRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_LoginRequest(buffer_arg) {
  return auth_pb.LoginRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_LoginResponse(arg) {
  if (!(arg instanceof auth_pb.LoginResponse)) {
    throw new Error('Expected argument of type auth.LoginResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_LoginResponse(buffer_arg) {
  return auth_pb.LoginResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_LogoutRequest(arg) {
  if (!(arg instanceof auth_pb.LogoutRequest)) {
    throw new Error('Expected argument of type auth.LogoutRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_LogoutRequest(buffer_arg) {
  return auth_pb.LogoutRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_LogoutResponse(arg) {
  if (!(arg instanceof auth_pb.LogoutResponse)) {
    throw new Error('Expected argument of type auth.LogoutResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_LogoutResponse(buffer_arg) {
  return auth_pb.LogoutResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_RefreshTokenRequest(arg) {
  if (!(arg instanceof auth_pb.RefreshTokenRequest)) {
    throw new Error('Expected argument of type auth.RefreshTokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_RefreshTokenRequest(buffer_arg) {
  return auth_pb.RefreshTokenRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_RefreshTokenResponse(arg) {
  if (!(arg instanceof auth_pb.RefreshTokenResponse)) {
    throw new Error('Expected argument of type auth.RefreshTokenResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_RefreshTokenResponse(buffer_arg) {
  return auth_pb.RefreshTokenResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_RegisterRequest(arg) {
  if (!(arg instanceof auth_pb.RegisterRequest)) {
    throw new Error('Expected argument of type auth.RegisterRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_RegisterRequest(buffer_arg) {
  return auth_pb.RegisterRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_RegisterResponse(arg) {
  if (!(arg instanceof auth_pb.RegisterResponse)) {
    throw new Error('Expected argument of type auth.RegisterResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_RegisterResponse(buffer_arg) {
  return auth_pb.RegisterResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_RevokeSessionRequest(arg) {
  if (!(arg instanceof auth_pb.RevokeSessionRequest)) {
    throw new Error('Expected argument of type auth.RevokeSessionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_RevokeSessionRequest(buffer_arg) {
  return auth_pb.RevokeSessionRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_RevokeSessionResponse(arg) {
  if (!(arg instanceof auth_pb.RevokeSessionResponse)) {
    throw new Error('Expected argument of type auth.RevokeSessionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_RevokeSessionResponse(buffer_arg) {
  return auth_pb.RevokeSessionResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_UpdateUserRequest(arg) {
  if (!(arg instanceof auth_pb.UpdateUserRequest)) {
    throw new Error('Expected argument of type auth.UpdateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_UpdateUserRequest(buffer_arg) {
  return auth_pb.UpdateUserRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_UserProfileResponse(arg) {
  if (!(arg instanceof auth_pb.UserProfileResponse)) {
    throw new Error('Expected argument of type auth.UserProfileResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_UserProfileResponse(buffer_arg) {
  return auth_pb.UserProfileResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_ValidateSessionRequest(arg) {
  if (!(arg instanceof auth_pb.ValidateSessionRequest)) {
    throw new Error('Expected argument of type auth.ValidateSessionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_ValidateSessionRequest(buffer_arg) {
  return auth_pb.ValidateSessionRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_ValidateSessionResponse(arg) {
  if (!(arg instanceof auth_pb.ValidateSessionResponse)) {
    throw new Error('Expected argument of type auth.ValidateSessionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_ValidateSessionResponse(buffer_arg) {
  return auth_pb.ValidateSessionResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_VerifyTokenRequest(arg) {
  if (!(arg instanceof auth_pb.VerifyTokenRequest)) {
    throw new Error('Expected argument of type auth.VerifyTokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_VerifyTokenRequest(buffer_arg) {
  return auth_pb.VerifyTokenRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_auth_VerifyTokenResponse(arg) {
  if (!(arg instanceof auth_pb.VerifyTokenResponse)) {
    throw new Error('Expected argument of type auth.VerifyTokenResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_VerifyTokenResponse(buffer_arg) {
  return auth_pb.VerifyTokenResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

var AuthServiceService = (exports.AuthServiceService = {
  // User management
  registerUser: {
    path: '/auth.AuthService/RegisterUser',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.RegisterRequest,
    responseType: auth_pb.RegisterResponse,
    requestSerialize: serialize_auth_RegisterRequest,
    requestDeserialize: deserialize_auth_RegisterRequest,
    responseSerialize: serialize_auth_RegisterResponse,
    responseDeserialize: deserialize_auth_RegisterResponse,
  },
  loginUser: {
    path: '/auth.AuthService/LoginUser',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.LoginRequest,
    responseType: auth_pb.LoginResponse,
    requestSerialize: serialize_auth_LoginRequest,
    requestDeserialize: deserialize_auth_LoginRequest,
    responseSerialize: serialize_auth_LoginResponse,
    responseDeserialize: deserialize_auth_LoginResponse,
  },
  verifyToken: {
    path: '/auth.AuthService/VerifyToken',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.VerifyTokenRequest,
    responseType: auth_pb.VerifyTokenResponse,
    requestSerialize: serialize_auth_VerifyTokenRequest,
    requestDeserialize: deserialize_auth_VerifyTokenRequest,
    responseSerialize: serialize_auth_VerifyTokenResponse,
    responseDeserialize: deserialize_auth_VerifyTokenResponse,
  },
  refreshToken: {
    path: '/auth.AuthService/RefreshToken',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.RefreshTokenRequest,
    responseType: auth_pb.RefreshTokenResponse,
    requestSerialize: serialize_auth_RefreshTokenRequest,
    requestDeserialize: deserialize_auth_RefreshTokenRequest,
    responseSerialize: serialize_auth_RefreshTokenResponse,
    responseDeserialize: deserialize_auth_RefreshTokenResponse,
  },
  logoutUser: {
    path: '/auth.AuthService/LogoutUser',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.LogoutRequest,
    responseType: auth_pb.LogoutResponse,
    requestSerialize: serialize_auth_LogoutRequest,
    requestDeserialize: deserialize_auth_LogoutRequest,
    responseSerialize: serialize_auth_LogoutResponse,
    responseDeserialize: deserialize_auth_LogoutResponse,
  },
  getUserProfile: {
    path: '/auth.AuthService/GetUserProfile',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.GetUserRequest,
    responseType: auth_pb.UserProfileResponse,
    requestSerialize: serialize_auth_GetUserRequest,
    requestDeserialize: deserialize_auth_GetUserRequest,
    responseSerialize: serialize_auth_UserProfileResponse,
    responseDeserialize: deserialize_auth_UserProfileResponse,
  },
  updateUserProfile: {
    path: '/auth.AuthService/UpdateUserProfile',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.UpdateUserRequest,
    responseType: auth_pb.UserProfileResponse,
    requestSerialize: serialize_auth_UpdateUserRequest,
    requestDeserialize: deserialize_auth_UpdateUserRequest,
    responseSerialize: serialize_auth_UserProfileResponse,
    responseDeserialize: deserialize_auth_UserProfileResponse,
  },
  // Session management
  validateSession: {
    path: '/auth.AuthService/ValidateSession',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.ValidateSessionRequest,
    responseType: auth_pb.ValidateSessionResponse,
    requestSerialize: serialize_auth_ValidateSessionRequest,
    requestDeserialize: deserialize_auth_ValidateSessionRequest,
    responseSerialize: serialize_auth_ValidateSessionResponse,
    responseDeserialize: deserialize_auth_ValidateSessionResponse,
  },
  getUserSessions: {
    path: '/auth.AuthService/GetUserSessions',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.GetSessionsRequest,
    responseType: auth_pb.GetSessionsResponse,
    requestSerialize: serialize_auth_GetSessionsRequest,
    requestDeserialize: deserialize_auth_GetSessionsRequest,
    responseSerialize: serialize_auth_GetSessionsResponse,
    responseDeserialize: deserialize_auth_GetSessionsResponse,
  },
  revokeSession: {
    path: '/auth.AuthService/RevokeSession',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.RevokeSessionRequest,
    responseType: auth_pb.RevokeSessionResponse,
    requestSerialize: serialize_auth_RevokeSessionRequest,
    requestDeserialize: deserialize_auth_RevokeSessionRequest,
    responseSerialize: serialize_auth_RevokeSessionResponse,
    responseDeserialize: deserialize_auth_RevokeSessionResponse,
  },
});

exports.AuthServiceClient = grpc.makeGenericClientConstructor(
  AuthServiceService,
  'AuthService'
);
