const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');

class PaymentGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    await this.createProtoFile();
    await this.createServiceFile();
    await this.createClientFile();
  }

  async createProtoFile() {
    const protoContent = `syntax = "proto3";

package payment;

service PaymentService {
  rpc HealthCheck (HealthRequest) returns (HealthResponse) {};
  rpc ProcessPayment (PaymentRequest) returns (PaymentResponse) {};
  rpc GetPayment (PaymentQuery) returns (PaymentResponse) {};
  rpc GetDriverPayments (DriverPaymentsQuery) returns (PaymentsResponse) {};
  rpc RefundPayment (RefundRequest) returns (PaymentResponse) {};
}

message HealthRequest {
  string service = 1;
}

message HealthResponse {
  string status = 1;
  string message = 2;
  string timestamp = 3;
}

message PaymentRequest {
  string driverId = 1;
  double amount = 2;
  string terminal = 3;
  string description = 4;
}

message PaymentQuery {
  string paymentId = 1;
}

message DriverPaymentsQuery {
  string driverId = 1;
  int32 page = 2;
  int32 limit = 3;
}

message RefundRequest {
  string paymentId = 1;
  string reason = 2;
}

message PaymentResponse {
  bool success = 1;
  string message = 2;
  Payment payment = 3;
}

message PaymentsResponse {
  bool success = 1;
  repeated Payment payments = 2;
  int32 total = 3;
  int32 page = 4;
  int32 limit = 5;
}

message Payment {
  string id = 1;
  string driverId = 2;
  double amount = 3;
  double platformCommission = 4;
  double airportPortion = 5;
  string terminal = 6;
  string status = 7;
  string description = 8;
  string stripePaymentId = 9;
  string createdAt = 10;
  string updatedAt = 11;
}
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/proto', 'payment.proto'),
      protoContent
    );
  }

  async createServiceFile() {
    const serviceContent = `const grpc = require('@grpc/grpc-js');

class PaymentService {
  constructor() {
    this.payments = new Map();
    this.driverPayments = new Map();
    this.commissionRate = 0.15; // 15% commission
  }

  processPayment(call, callback) {
    try {
      const { driverId, amount, terminal, description } = call.request;
      
      const paymentId = \`pay_\${Date.now()}\`;
      const platformCommission = amount * this.commissionRate;
      const airportPortion = amount - platformCommission;

      const payment = {
        id: paymentId,
        driverId,
        amount: parseFloat(amount),
        platformCommission,
        airportPortion,
        terminal,
        status: 'completed',
        description: description || 'Airport fee',
        stripePaymentId: \`stripe_\${Date.now()}\`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.payments.set(paymentId, payment);

      // Track driver payments
      if (!this.driverPayments.has(driverId)) {
        this.driverPayments.set(driverId, []);
      }
      this.driverPayments.get(driverId).push(paymentId);

      callback(null, { 
        success: true, 
        message: 'Payment processed successfully',
        payment 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  getPayment(call, callback) {
    try {
      const { paymentId } = call.request;
      
      const payment = this.payments.get(paymentId);
      if (!payment) {
        return callback(null, { 
          success: false, 
          message: 'Payment not found' 
        });
      }

      callback(null, { 
        success: true, 
        message: 'Payment found',
        payment 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  getDriverPayments(call, callback) {
    try {
      const { driverId, page = 1, limit = 10 } = call.request;
      
      const paymentIds = this.driverPayments.get(driverId) || [];
      const payments = paymentIds.map(id => this.payments.get(id)).filter(Boolean);

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = payments.slice(startIndex, endIndex);

      callback(null, { 
        success: true, 
        payments: paginatedPayments,
        total: payments.length,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  refundPayment(call, callback) {
    try {
      const { paymentId, reason } = call.request;
      
      const payment = this.payments.get(paymentId);
      if (!payment) {
        return callback(null, { 
          success: false, 
          message: 'Payment not found' 
        });
      }

      if (payment.status === 'refunded') {
        return callback(null, { 
          success: false, 
          message: 'Payment already refunded' 
        });
      }

      payment.status = 'refunded';
      payment.refundReason = reason;
      payment.updatedAt = new Date().toISOString();
      this.payments.set(paymentId, payment);

      callback(null, { 
        success: true, 
        message: 'Payment refunded successfully',
        payment 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  healthCheck(call, callback) {
    callback(null, {
      status: 'OK',
      message: 'Payment service is healthy',
      timestamp: new Date().toISOString(),
      paymentCount: this.payments.size,
      driverCount: this.driverPayments.size
    });
  }
}

module.exports = PaymentService;
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/services/paymentService.js'),
      serviceContent
    );
  }
}

module.exports = PaymentGenerator;
