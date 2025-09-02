// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var payment_pb = require('./payment_pb.js');

function serialize_payment_BalanceResponse(arg) {
  if (!(arg instanceof payment_pb.BalanceResponse)) {
    throw new Error('Expected argument of type payment.BalanceResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_BalanceResponse(buffer_arg) {
  return payment_pb.BalanceResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_payment_DriverBalanceRequest(arg) {
  if (!(arg instanceof payment_pb.DriverBalanceRequest)) {
    throw new Error('Expected argument of type payment.DriverBalanceRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_DriverBalanceRequest(buffer_arg) {
  return payment_pb.DriverBalanceRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_payment_DriverPaymentsQuery(arg) {
  if (!(arg instanceof payment_pb.DriverPaymentsQuery)) {
    throw new Error('Expected argument of type payment.DriverPaymentsQuery');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_DriverPaymentsQuery(buffer_arg) {
  return payment_pb.DriverPaymentsQuery.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_payment_HealthRequest(arg) {
  if (!(arg instanceof payment_pb.HealthRequest)) {
    throw new Error('Expected argument of type payment.HealthRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_HealthRequest(buffer_arg) {
  return payment_pb.HealthRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_payment_HealthResponse(arg) {
  if (!(arg instanceof payment_pb.HealthResponse)) {
    throw new Error('Expected argument of type payment.HealthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_HealthResponse(buffer_arg) {
  return payment_pb.HealthResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_payment_PaymentQuery(arg) {
  if (!(arg instanceof payment_pb.PaymentQuery)) {
    throw new Error('Expected argument of type payment.PaymentQuery');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_PaymentQuery(buffer_arg) {
  return payment_pb.PaymentQuery.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_payment_PaymentRequest(arg) {
  if (!(arg instanceof payment_pb.PaymentRequest)) {
    throw new Error('Expected argument of type payment.PaymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_PaymentRequest(buffer_arg) {
  return payment_pb.PaymentRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_payment_PaymentResponse(arg) {
  if (!(arg instanceof payment_pb.PaymentResponse)) {
    throw new Error('Expected argument of type payment.PaymentResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_PaymentResponse(buffer_arg) {
  return payment_pb.PaymentResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_payment_PaymentsResponse(arg) {
  if (!(arg instanceof payment_pb.PaymentsResponse)) {
    throw new Error('Expected argument of type payment.PaymentsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_PaymentsResponse(buffer_arg) {
  return payment_pb.PaymentsResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_payment_RefundRequest(arg) {
  if (!(arg instanceof payment_pb.RefundRequest)) {
    throw new Error('Expected argument of type payment.RefundRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_payment_RefundRequest(buffer_arg) {
  return payment_pb.RefundRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

var PaymentServiceService = (exports.PaymentServiceService = {
  healthCheck: {
    path: '/payment.PaymentService/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.HealthRequest,
    responseType: payment_pb.HealthResponse,
    requestSerialize: serialize_payment_HealthRequest,
    requestDeserialize: deserialize_payment_HealthRequest,
    responseSerialize: serialize_payment_HealthResponse,
    responseDeserialize: deserialize_payment_HealthResponse,
  },
  processPayment: {
    path: '/payment.PaymentService/ProcessPayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.PaymentRequest,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_payment_PaymentRequest,
    requestDeserialize: deserialize_payment_PaymentRequest,
    responseSerialize: serialize_payment_PaymentResponse,
    responseDeserialize: deserialize_payment_PaymentResponse,
  },
  getPayment: {
    path: '/payment.PaymentService/GetPayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.PaymentQuery,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_payment_PaymentQuery,
    requestDeserialize: deserialize_payment_PaymentQuery,
    responseSerialize: serialize_payment_PaymentResponse,
    responseDeserialize: deserialize_payment_PaymentResponse,
  },
  getDriverPayments: {
    path: '/payment.PaymentService/GetDriverPayments',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.DriverPaymentsQuery,
    responseType: payment_pb.PaymentsResponse,
    requestSerialize: serialize_payment_DriverPaymentsQuery,
    requestDeserialize: deserialize_payment_DriverPaymentsQuery,
    responseSerialize: serialize_payment_PaymentsResponse,
    responseDeserialize: deserialize_payment_PaymentsResponse,
  },
  refundPayment: {
    path: '/payment.PaymentService/RefundPayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.RefundRequest,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_payment_RefundRequest,
    requestDeserialize: deserialize_payment_RefundRequest,
    responseSerialize: serialize_payment_PaymentResponse,
    responseDeserialize: deserialize_payment_PaymentResponse,
  },
  getDriverBalance: {
    path: '/payment.PaymentService/GetDriverBalance',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.DriverBalanceRequest,
    responseType: payment_pb.BalanceResponse,
    requestSerialize: serialize_payment_DriverBalanceRequest,
    requestDeserialize: deserialize_payment_DriverBalanceRequest,
    responseSerialize: serialize_payment_BalanceResponse,
    responseDeserialize: deserialize_payment_BalanceResponse,
  },
});

exports.PaymentServiceClient = grpc.makeGenericClientConstructor(
  PaymentServiceService,
  'PaymentService'
);
