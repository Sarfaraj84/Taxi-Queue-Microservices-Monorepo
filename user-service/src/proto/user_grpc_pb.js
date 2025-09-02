// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var user_pb = require('./user_pb.js');

function serialize_user_CreateUserRequest(arg) {
  if (!(arg instanceof user_pb.CreateUserRequest)) {
    throw new Error('Expected argument of type user.CreateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_CreateUserRequest(buffer_arg) {
  return user_pb.CreateUserRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_user_DeleteResponse(arg) {
  if (!(arg instanceof user_pb.DeleteResponse)) {
    throw new Error('Expected argument of type user.DeleteResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_DeleteResponse(buffer_arg) {
  return user_pb.DeleteResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_HealthRequest(arg) {
  if (!(arg instanceof user_pb.HealthRequest)) {
    throw new Error('Expected argument of type user.HealthRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_HealthRequest(buffer_arg) {
  return user_pb.HealthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_HealthResponse(arg) {
  if (!(arg instanceof user_pb.HealthResponse)) {
    throw new Error('Expected argument of type user.HealthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_HealthResponse(buffer_arg) {
  return user_pb.HealthResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UpdateUserRequest(arg) {
  if (!(arg instanceof user_pb.UpdateUserRequest)) {
    throw new Error('Expected argument of type user.UpdateUserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UpdateUserRequest(buffer_arg) {
  return user_pb.UpdateUserRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_user_UserRequest(arg) {
  if (!(arg instanceof user_pb.UserRequest)) {
    throw new Error('Expected argument of type user.UserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UserRequest(buffer_arg) {
  return user_pb.UserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UserResponse(arg) {
  if (!(arg instanceof user_pb.UserResponse)) {
    throw new Error('Expected argument of type user.UserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UserResponse(buffer_arg) {
  return user_pb.UserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UsersRequest(arg) {
  if (!(arg instanceof user_pb.UsersRequest)) {
    throw new Error('Expected argument of type user.UsersRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UsersRequest(buffer_arg) {
  return user_pb.UsersRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_user_UsersResponse(arg) {
  if (!(arg instanceof user_pb.UsersResponse)) {
    throw new Error('Expected argument of type user.UsersResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_user_UsersResponse(buffer_arg) {
  return user_pb.UsersResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

var UserServiceService = (exports.UserServiceService = {
  healthCheck: {
    path: '/user.UserService/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.HealthRequest,
    responseType: user_pb.HealthResponse,
    requestSerialize: serialize_user_HealthRequest,
    requestDeserialize: deserialize_user_HealthRequest,
    responseSerialize: serialize_user_HealthResponse,
    responseDeserialize: deserialize_user_HealthResponse,
  },
  getUser: {
    path: '/user.UserService/GetUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UserRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_UserRequest,
    requestDeserialize: deserialize_user_UserRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
  getUsers: {
    path: '/user.UserService/GetUsers',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UsersRequest,
    responseType: user_pb.UsersResponse,
    requestSerialize: serialize_user_UsersRequest,
    requestDeserialize: deserialize_user_UsersRequest,
    responseSerialize: serialize_user_UsersResponse,
    responseDeserialize: deserialize_user_UsersResponse,
  },
  updateUser: {
    path: '/user.UserService/UpdateUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UpdateUserRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_UpdateUserRequest,
    requestDeserialize: deserialize_user_UpdateUserRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
  deleteUser: {
    path: '/user.UserService/DeleteUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.UserRequest,
    responseType: user_pb.DeleteResponse,
    requestSerialize: serialize_user_UserRequest,
    requestDeserialize: deserialize_user_UserRequest,
    responseSerialize: serialize_user_DeleteResponse,
    responseDeserialize: deserialize_user_DeleteResponse,
  },
  createUser: {
    path: '/user.UserService/CreateUser',
    requestStream: false,
    responseStream: false,
    requestType: user_pb.CreateUserRequest,
    responseType: user_pb.UserResponse,
    requestSerialize: serialize_user_CreateUserRequest,
    requestDeserialize: deserialize_user_CreateUserRequest,
    responseSerialize: serialize_user_UserResponse,
    responseDeserialize: deserialize_user_UserResponse,
  },
});

exports.UserServiceClient = grpc.makeGenericClientConstructor(
  UserServiceService,
  'UserService'
);
