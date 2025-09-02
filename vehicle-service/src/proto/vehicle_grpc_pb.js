// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var vehicle_pb = require('./vehicle_pb.js');

function serialize_vehicle_ActiveVehicleRequest(arg) {
  if (!(arg instanceof vehicle_pb.ActiveVehicleRequest)) {
    throw new Error('Expected argument of type vehicle.ActiveVehicleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_vehicle_ActiveVehicleRequest(buffer_arg) {
  return vehicle_pb.ActiveVehicleRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_vehicle_DriverRequest(arg) {
  if (!(arg instanceof vehicle_pb.DriverRequest)) {
    throw new Error('Expected argument of type vehicle.DriverRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_vehicle_DriverRequest(buffer_arg) {
  return vehicle_pb.DriverRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_vehicle_DriverVehiclesResponse(arg) {
  if (!(arg instanceof vehicle_pb.DriverVehiclesResponse)) {
    throw new Error('Expected argument of type vehicle.DriverVehiclesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_vehicle_DriverVehiclesResponse(buffer_arg) {
  return vehicle_pb.DriverVehiclesResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_vehicle_HealthRequest(arg) {
  if (!(arg instanceof vehicle_pb.HealthRequest)) {
    throw new Error('Expected argument of type vehicle.HealthRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_vehicle_HealthRequest(buffer_arg) {
  return vehicle_pb.HealthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_vehicle_HealthResponse(arg) {
  if (!(arg instanceof vehicle_pb.HealthResponse)) {
    throw new Error('Expected argument of type vehicle.HealthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_vehicle_HealthResponse(buffer_arg) {
  return vehicle_pb.HealthResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_vehicle_VehicleRequest(arg) {
  if (!(arg instanceof vehicle_pb.VehicleRequest)) {
    throw new Error('Expected argument of type vehicle.VehicleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_vehicle_VehicleRequest(buffer_arg) {
  return vehicle_pb.VehicleRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_vehicle_VehicleResponse(arg) {
  if (!(arg instanceof vehicle_pb.VehicleResponse)) {
    throw new Error('Expected argument of type vehicle.VehicleResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_vehicle_VehicleResponse(buffer_arg) {
  return vehicle_pb.VehicleResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

var ServiceService = (exports.ServiceService = {
  healthCheck: {
    path: '/vehicle.Service/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: vehicle_pb.HealthRequest,
    responseType: vehicle_pb.HealthResponse,
    requestSerialize: serialize_vehicle_HealthRequest,
    requestDeserialize: deserialize_vehicle_HealthRequest,
    responseSerialize: serialize_vehicle_HealthResponse,
    responseDeserialize: deserialize_vehicle_HealthResponse,
  },
  registerVehicle: {
    path: '/vehicle.Service/RegisterVehicle',
    requestStream: false,
    responseStream: false,
    requestType: vehicle_pb.VehicleRequest,
    responseType: vehicle_pb.VehicleResponse,
    requestSerialize: serialize_vehicle_VehicleRequest,
    requestDeserialize: deserialize_vehicle_VehicleRequest,
    responseSerialize: serialize_vehicle_VehicleResponse,
    responseDeserialize: deserialize_vehicle_VehicleResponse,
  },
  setActiveVehicle: {
    path: '/vehicle.Service/SetActiveVehicle',
    requestStream: false,
    responseStream: false,
    requestType: vehicle_pb.ActiveVehicleRequest,
    responseType: vehicle_pb.VehicleResponse,
    requestSerialize: serialize_vehicle_ActiveVehicleRequest,
    requestDeserialize: deserialize_vehicle_ActiveVehicleRequest,
    responseSerialize: serialize_vehicle_VehicleResponse,
    responseDeserialize: deserialize_vehicle_VehicleResponse,
  },
  getDriverVehicles: {
    path: '/vehicle.Service/GetDriverVehicles',
    requestStream: false,
    responseStream: false,
    requestType: vehicle_pb.DriverRequest,
    responseType: vehicle_pb.DriverVehiclesResponse,
    requestSerialize: serialize_vehicle_DriverRequest,
    requestDeserialize: deserialize_vehicle_DriverRequest,
    responseSerialize: serialize_vehicle_DriverVehiclesResponse,
    responseDeserialize: deserialize_vehicle_DriverVehiclesResponse,
  },
});

exports.ServiceClient = grpc.makeGenericClientConstructor(
  ServiceService,
  'Service'
);
