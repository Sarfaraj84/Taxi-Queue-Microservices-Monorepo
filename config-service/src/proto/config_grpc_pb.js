// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var config_pb = require('./config_pb.js');

function serialize_config_ConfigRequest(arg) {
  if (!(arg instanceof config_pb.ConfigRequest)) {
    throw new Error('Expected argument of type config.ConfigRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_ConfigRequest(buffer_arg) {
  return config_pb.ConfigRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_config_ConfigResponse(arg) {
  if (!(arg instanceof config_pb.ConfigResponse)) {
    throw new Error('Expected argument of type config.ConfigResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_ConfigResponse(buffer_arg) {
  return config_pb.ConfigResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_config_FeeConfigRequest(arg) {
  if (!(arg instanceof config_pb.FeeConfigRequest)) {
    throw new Error('Expected argument of type config.FeeConfigRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_FeeConfigRequest(buffer_arg) {
  return config_pb.FeeConfigRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_config_FeeConfigResponse(arg) {
  if (!(arg instanceof config_pb.FeeConfigResponse)) {
    throw new Error('Expected argument of type config.FeeConfigResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_FeeConfigResponse(buffer_arg) {
  return config_pb.FeeConfigResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_config_HealthRequest(arg) {
  if (!(arg instanceof config_pb.HealthRequest)) {
    throw new Error('Expected argument of type config.HealthRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_HealthRequest(buffer_arg) {
  return config_pb.HealthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_config_HealthResponse(arg) {
  if (!(arg instanceof config_pb.HealthResponse)) {
    throw new Error('Expected argument of type config.HealthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_HealthResponse(buffer_arg) {
  return config_pb.HealthResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_config_SystemConfigRequest(arg) {
  if (!(arg instanceof config_pb.SystemConfigRequest)) {
    throw new Error('Expected argument of type config.SystemConfigRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_SystemConfigRequest(buffer_arg) {
  return config_pb.SystemConfigRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_config_SystemConfigResponse(arg) {
  if (!(arg instanceof config_pb.SystemConfigResponse)) {
    throw new Error('Expected argument of type config.SystemConfigResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_SystemConfigResponse(buffer_arg) {
  return config_pb.SystemConfigResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_config_UpdateConfigRequest(arg) {
  if (!(arg instanceof config_pb.UpdateConfigRequest)) {
    throw new Error('Expected argument of type config.UpdateConfigRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_UpdateConfigRequest(buffer_arg) {
  return config_pb.UpdateConfigRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_config_UpdateFeeConfigRequest(arg) {
  if (!(arg instanceof config_pb.UpdateFeeConfigRequest)) {
    throw new Error('Expected argument of type config.UpdateFeeConfigRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_config_UpdateFeeConfigRequest(buffer_arg) {
  return config_pb.UpdateFeeConfigRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

var ConfigServiceService = (exports.ConfigServiceService = {
  healthCheck: {
    path: '/config.ConfigService/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.HealthRequest,
    responseType: config_pb.HealthResponse,
    requestSerialize: serialize_config_HealthRequest,
    requestDeserialize: deserialize_config_HealthRequest,
    responseSerialize: serialize_config_HealthResponse,
    responseDeserialize: deserialize_config_HealthResponse,
  },
  getConfig: {
    path: '/config.ConfigService/GetConfig',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.ConfigRequest,
    responseType: config_pb.ConfigResponse,
    requestSerialize: serialize_config_ConfigRequest,
    requestDeserialize: deserialize_config_ConfigRequest,
    responseSerialize: serialize_config_ConfigResponse,
    responseDeserialize: deserialize_config_ConfigResponse,
  },
  updateConfig: {
    path: '/config.ConfigService/UpdateConfig',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.UpdateConfigRequest,
    responseType: config_pb.ConfigResponse,
    requestSerialize: serialize_config_UpdateConfigRequest,
    requestDeserialize: deserialize_config_UpdateConfigRequest,
    responseSerialize: serialize_config_ConfigResponse,
    responseDeserialize: deserialize_config_ConfigResponse,
  },
  getFeeConfig: {
    path: '/config.ConfigService/GetFeeConfig',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.FeeConfigRequest,
    responseType: config_pb.FeeConfigResponse,
    requestSerialize: serialize_config_FeeConfigRequest,
    requestDeserialize: deserialize_config_FeeConfigRequest,
    responseSerialize: serialize_config_FeeConfigResponse,
    responseDeserialize: deserialize_config_FeeConfigResponse,
  },
  updateFeeConfig: {
    path: '/config.ConfigService/UpdateFeeConfig',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.UpdateFeeConfigRequest,
    responseType: config_pb.FeeConfigResponse,
    requestSerialize: serialize_config_UpdateFeeConfigRequest,
    requestDeserialize: deserialize_config_UpdateFeeConfigRequest,
    responseSerialize: serialize_config_FeeConfigResponse,
    responseDeserialize: deserialize_config_FeeConfigResponse,
  },
  getSystemConfig: {
    path: '/config.ConfigService/GetSystemConfig',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.SystemConfigRequest,
    responseType: config_pb.SystemConfigResponse,
    requestSerialize: serialize_config_SystemConfigRequest,
    requestDeserialize: deserialize_config_SystemConfigRequest,
    responseSerialize: serialize_config_SystemConfigResponse,
    responseDeserialize: deserialize_config_SystemConfigResponse,
  },
});

exports.ConfigServiceClient = grpc.makeGenericClientConstructor(
  ConfigServiceService,
  'ConfigService'
);
