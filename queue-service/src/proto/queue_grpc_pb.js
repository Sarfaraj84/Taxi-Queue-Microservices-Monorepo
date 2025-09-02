// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var queue_pb = require('./queue_pb.js');

function serialize_queue_AddToQueueRequest(arg) {
  if (!(arg instanceof queue_pb.AddToQueueRequest)) {
    throw new Error('Expected argument of type queue.AddToQueueRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_AddToQueueRequest(buffer_arg) {
  return queue_pb.AddToQueueRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_queue_ClosureRequest(arg) {
  if (!(arg instanceof queue_pb.ClosureRequest)) {
    throw new Error('Expected argument of type queue.ClosureRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_ClosureRequest(buffer_arg) {
  return queue_pb.ClosureRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_queue_ClosureResponse(arg) {
  if (!(arg instanceof queue_pb.ClosureResponse)) {
    throw new Error('Expected argument of type queue.ClosureResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_ClosureResponse(buffer_arg) {
  return queue_pb.ClosureResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_queue_DriverPositionRequest(arg) {
  if (!(arg instanceof queue_pb.DriverPositionRequest)) {
    throw new Error('Expected argument of type queue.DriverPositionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_DriverPositionRequest(buffer_arg) {
  return queue_pb.DriverPositionRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_queue_DriverPositionResponse(arg) {
  if (!(arg instanceof queue_pb.DriverPositionResponse)) {
    throw new Error('Expected argument of type queue.DriverPositionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_DriverPositionResponse(buffer_arg) {
  return queue_pb.DriverPositionResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_queue_HealthRequest(arg) {
  if (!(arg instanceof queue_pb.HealthRequest)) {
    throw new Error('Expected argument of type queue.HealthRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_HealthRequest(buffer_arg) {
  return queue_pb.HealthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_queue_HealthResponse(arg) {
  if (!(arg instanceof queue_pb.HealthResponse)) {
    throw new Error('Expected argument of type queue.HealthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_HealthResponse(buffer_arg) {
  return queue_pb.HealthResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_queue_QueueResponse(arg) {
  if (!(arg instanceof queue_pb.QueueResponse)) {
    throw new Error('Expected argument of type queue.QueueResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_QueueResponse(buffer_arg) {
  return queue_pb.QueueResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_queue_QueueStatusRequest(arg) {
  if (!(arg instanceof queue_pb.QueueStatusRequest)) {
    throw new Error('Expected argument of type queue.QueueStatusRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_QueueStatusRequest(buffer_arg) {
  return queue_pb.QueueStatusRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_queue_QueueStatusResponse(arg) {
  if (!(arg instanceof queue_pb.QueueStatusResponse)) {
    throw new Error('Expected argument of type queue.QueueStatusResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_QueueStatusResponse(buffer_arg) {
  return queue_pb.QueueStatusResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_queue_ReleaseRequest(arg) {
  if (!(arg instanceof queue_pb.ReleaseRequest)) {
    throw new Error('Expected argument of type queue.ReleaseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_ReleaseRequest(buffer_arg) {
  return queue_pb.ReleaseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_queue_ReleaseResponse(arg) {
  if (!(arg instanceof queue_pb.ReleaseResponse)) {
    throw new Error('Expected argument of type queue.ReleaseResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_ReleaseResponse(buffer_arg) {
  return queue_pb.ReleaseResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_queue_RemoveFromQueueRequest(arg) {
  if (!(arg instanceof queue_pb.RemoveFromQueueRequest)) {
    throw new Error('Expected argument of type queue.RemoveFromQueueRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_queue_RemoveFromQueueRequest(buffer_arg) {
  return queue_pb.RemoveFromQueueRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

var QueueServiceService = (exports.QueueServiceService = {
  healthCheck: {
    path: '/queue.QueueService/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: queue_pb.HealthRequest,
    responseType: queue_pb.HealthResponse,
    requestSerialize: serialize_queue_HealthRequest,
    requestDeserialize: deserialize_queue_HealthRequest,
    responseSerialize: serialize_queue_HealthResponse,
    responseDeserialize: deserialize_queue_HealthResponse,
  },
  addToQueue: {
    path: '/queue.QueueService/AddToQueue',
    requestStream: false,
    responseStream: false,
    requestType: queue_pb.AddToQueueRequest,
    responseType: queue_pb.QueueResponse,
    requestSerialize: serialize_queue_AddToQueueRequest,
    requestDeserialize: deserialize_queue_AddToQueueRequest,
    responseSerialize: serialize_queue_QueueResponse,
    responseDeserialize: deserialize_queue_QueueResponse,
  },
  removeFromQueue: {
    path: '/queue.QueueService/RemoveFromQueue',
    requestStream: false,
    responseStream: false,
    requestType: queue_pb.RemoveFromQueueRequest,
    responseType: queue_pb.QueueResponse,
    requestSerialize: serialize_queue_RemoveFromQueueRequest,
    requestDeserialize: deserialize_queue_RemoveFromQueueRequest,
    responseSerialize: serialize_queue_QueueResponse,
    responseDeserialize: deserialize_queue_QueueResponse,
  },
  getQueueStatus: {
    path: '/queue.QueueService/GetQueueStatus',
    requestStream: false,
    responseStream: false,
    requestType: queue_pb.QueueStatusRequest,
    responseType: queue_pb.QueueStatusResponse,
    requestSerialize: serialize_queue_QueueStatusRequest,
    requestDeserialize: deserialize_queue_QueueStatusRequest,
    responseSerialize: serialize_queue_QueueStatusResponse,
    responseDeserialize: deserialize_queue_QueueStatusResponse,
  },
  getDriverPosition: {
    path: '/queue.QueueService/GetDriverPosition',
    requestStream: false,
    responseStream: false,
    requestType: queue_pb.DriverPositionRequest,
    responseType: queue_pb.DriverPositionResponse,
    requestSerialize: serialize_queue_DriverPositionRequest,
    requestDeserialize: deserialize_queue_DriverPositionRequest,
    responseSerialize: serialize_queue_DriverPositionResponse,
    responseDeserialize: deserialize_queue_DriverPositionResponse,
  },
  releaseDrivers: {
    path: '/queue.QueueService/ReleaseDrivers',
    requestStream: false,
    responseStream: false,
    requestType: queue_pb.ReleaseRequest,
    responseType: queue_pb.ReleaseResponse,
    requestSerialize: serialize_queue_ReleaseRequest,
    requestDeserialize: deserialize_queue_ReleaseRequest,
    responseSerialize: serialize_queue_ReleaseResponse,
    responseDeserialize: deserialize_queue_ReleaseResponse,
  },
  handleAirportClosure: {
    path: '/queue.QueueService/HandleAirportClosure',
    requestStream: false,
    responseStream: false,
    requestType: queue_pb.ClosureRequest,
    responseType: queue_pb.ClosureResponse,
    requestSerialize: serialize_queue_ClosureRequest,
    requestDeserialize: deserialize_queue_ClosureRequest,
    responseSerialize: serialize_queue_ClosureResponse,
    responseDeserialize: deserialize_queue_ClosureResponse,
  },
});

exports.QueueServiceClient = grpc.makeGenericClientConstructor(
  QueueServiceService,
  'QueueService'
);
