// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var auth_pb = require('./auth_pb.js');

function serialize_auth_HealthRequest(arg) {
  if (!(arg instanceof auth_pb.HealthRequest)) {
    throw new Error('Expected argument of type auth.HealthRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_HealthRequest(buffer_arg) {
  return auth_pb.HealthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_HealthResponse(arg) {
  if (!(arg instanceof auth_pb.HealthResponse)) {
    throw new Error('Expected argument of type auth.HealthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_HealthResponse(buffer_arg) {
  return auth_pb.HealthResponse.deserializeBinary(new Uint8Array(buffer_arg));
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

function serialize_auth_TokenRequest(arg) {
  if (!(arg instanceof auth_pb.TokenRequest)) {
    throw new Error('Expected argument of type auth.TokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_TokenRequest(buffer_arg) {
  return auth_pb.TokenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_TokenResponse(arg) {
  if (!(arg instanceof auth_pb.TokenResponse)) {
    throw new Error('Expected argument of type auth.TokenResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_TokenResponse(buffer_arg) {
  return auth_pb.TokenResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

var AuthServiceService = (exports.AuthServiceService = {
  healthCheck: {
    path: '/auth.AuthService/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.HealthRequest,
    responseType: auth_pb.HealthResponse,
    requestSerialize: serialize_auth_HealthRequest,
    requestDeserialize: deserialize_auth_HealthRequest,
    responseSerialize: serialize_auth_HealthResponse,
    responseDeserialize: deserialize_auth_HealthResponse,
  },
  login: {
    path: '/auth.AuthService/Login',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.LoginRequest,
    responseType: auth_pb.LoginResponse,
    requestSerialize: serialize_auth_LoginRequest,
    requestDeserialize: deserialize_auth_LoginRequest,
    responseSerialize: serialize_auth_LoginResponse,
    responseDeserialize: deserialize_auth_LoginResponse,
  },
  register: {
    path: '/auth.AuthService/Register',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.RegisterRequest,
    responseType: auth_pb.RegisterResponse,
    requestSerialize: serialize_auth_RegisterRequest,
    requestDeserialize: deserialize_auth_RegisterRequest,
    responseSerialize: serialize_auth_RegisterResponse,
    responseDeserialize: deserialize_auth_RegisterResponse,
  },
  verifyToken: {
    path: '/auth.AuthService/VerifyToken',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.TokenRequest,
    responseType: auth_pb.TokenResponse,
    requestSerialize: serialize_auth_TokenRequest,
    requestDeserialize: deserialize_auth_TokenRequest,
    responseSerialize: serialize_auth_TokenResponse,
    responseDeserialize: deserialize_auth_TokenResponse,
  },
  refreshToken: {
    path: '/auth.AuthService/RefreshToken',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.TokenRequest,
    responseType: auth_pb.TokenResponse,
    requestSerialize: serialize_auth_TokenRequest,
    requestDeserialize: deserialize_auth_TokenRequest,
    responseSerialize: serialize_auth_TokenResponse,
    responseDeserialize: deserialize_auth_TokenResponse,
  },
});

exports.AuthServiceClient = grpc.makeGenericClientConstructor(
  AuthServiceService,
  'AuthService'
);
