// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var geo_pb = require('./geo_pb.js');

function serialize_geo_DistanceRequest(arg) {
  if (!(arg instanceof geo_pb.DistanceRequest)) {
    throw new Error('Expected argument of type geo.DistanceRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geo_DistanceRequest(buffer_arg) {
  return geo_pb.DistanceRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_geo_DistanceResponse(arg) {
  if (!(arg instanceof geo_pb.DistanceResponse)) {
    throw new Error('Expected argument of type geo.DistanceResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geo_DistanceResponse(buffer_arg) {
  return geo_pb.DistanceResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_geo_GeofenceRequest(arg) {
  if (!(arg instanceof geo_pb.GeofenceRequest)) {
    throw new Error('Expected argument of type geo.GeofenceRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geo_GeofenceRequest(buffer_arg) {
  return geo_pb.GeofenceRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_geo_GeofenceResponse(arg) {
  if (!(arg instanceof geo_pb.GeofenceResponse)) {
    throw new Error('Expected argument of type geo.GeofenceResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geo_GeofenceResponse(buffer_arg) {
  return geo_pb.GeofenceResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_geo_HealthRequest(arg) {
  if (!(arg instanceof geo_pb.HealthRequest)) {
    throw new Error('Expected argument of type geo.HealthRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geo_HealthRequest(buffer_arg) {
  return geo_pb.HealthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_geo_HealthResponse(arg) {
  if (!(arg instanceof geo_pb.HealthResponse)) {
    throw new Error('Expected argument of type geo.HealthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geo_HealthResponse(buffer_arg) {
  return geo_pb.HealthResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_geo_PointRequest(arg) {
  if (!(arg instanceof geo_pb.PointRequest)) {
    throw new Error('Expected argument of type geo.PointRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_geo_PointRequest(buffer_arg) {
  return geo_pb.PointRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

var ServiceService = (exports.ServiceService = {
  healthCheck: {
    path: '/geo.Service/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: geo_pb.HealthRequest,
    responseType: geo_pb.HealthResponse,
    requestSerialize: serialize_geo_HealthRequest,
    requestDeserialize: deserialize_geo_HealthRequest,
    responseSerialize: serialize_geo_HealthResponse,
    responseDeserialize: deserialize_geo_HealthResponse,
  },
  isPointInGeofence: {
    path: '/geo.Service/IsPointInGeofence',
    requestStream: false,
    responseStream: false,
    requestType: geo_pb.PointRequest,
    responseType: geo_pb.GeofenceResponse,
    requestSerialize: serialize_geo_PointRequest,
    requestDeserialize: deserialize_geo_PointRequest,
    responseSerialize: serialize_geo_GeofenceResponse,
    responseDeserialize: deserialize_geo_GeofenceResponse,
  },
  addGeofence: {
    path: '/geo.Service/AddGeofence',
    requestStream: false,
    responseStream: false,
    requestType: geo_pb.GeofenceRequest,
    responseType: geo_pb.GeofenceResponse,
    requestSerialize: serialize_geo_GeofenceRequest,
    requestDeserialize: deserialize_geo_GeofenceRequest,
    responseSerialize: serialize_geo_GeofenceResponse,
    responseDeserialize: deserialize_geo_GeofenceResponse,
  },
  calculateDistance: {
    path: '/geo.Service/CalculateDistance',
    requestStream: false,
    responseStream: false,
    requestType: geo_pb.DistanceRequest,
    responseType: geo_pb.DistanceResponse,
    requestSerialize: serialize_geo_DistanceRequest,
    requestDeserialize: deserialize_geo_DistanceRequest,
    responseSerialize: serialize_geo_DistanceResponse,
    responseDeserialize: deserialize_geo_DistanceResponse,
  },
});

exports.ServiceClient = grpc.makeGenericClientConstructor(
  ServiceService,
  'Service'
);
