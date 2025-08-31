const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

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
    const serviceContent = await compileTemplate('service/service.js.hbs', {
      serviceName: this.serviceKey,
      serviceNamePascal: this.serviceNamePascal,
      serviceNameUpperCase: this.serviceNameUpperCase,
    });

    await FileUtils.createFile(
      path.join(this.servicePath, `src/services/${this.serviceKey}Service.js`),
      serviceContent
    );
  }
}
module.exports = PaymentGenerator;
