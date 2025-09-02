const grpc = require('@grpc/grpc-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class Service {
  constructor() {
    this.payments = new Map();
    this.driverPayments = new Map();
    this.commissionRate = 0.15;
  }

  healthCheck(call, callback) {
    try {
      const response = {
        status: 'OK',
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),

        paymentCount: this.payments.size,
        driverCount: this.driverPayments.size,
      };
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  // Payment Service Methods
  async processPayment(call, callback) {
    try {
      const { driverId, amount, terminal, description, vehicleType } =
        call.request;

      const paymentId = `pay_${Date.now()}`;
      const platformCommission = amount * this.commissionRate;
      const airportPortion = amount - platformCommission;

      // Simulate Stripe payment
      const stripePayment = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'aud',
        metadata: {
          driverId,
          terminal,
          vehicleType,
        },
      });

      const payment = {
        id: paymentId,
        driverId,
        amount: parseFloat(amount),
        platformCommission,
        airportPortion,
        terminal,
        vehicleType,
        status: 'completed',
        description: description || 'Airport fee',
        stripePaymentId: stripePayment.id,
        divisionType: 'percentage',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        payment,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
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
          message: 'Payment not found',
        });
      }

      callback(null, {
        success: true,
        message: 'Payment found',
        payment,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getDriverPayments(call, callback) {
    try {
      const {
        driverId,
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
      } = call.request;

      const paymentIds = this.driverPayments.get(driverId) || [];
      let payments = paymentIds
        .map((id) => this.payments.get(id))
        .filter(Boolean);

      // Filter by status if specified
      if (status) {
        payments = payments.filter((payment) => payment.status === status);
      }

      // Filter by date range if specified
      if (startDate) {
        const start = new Date(startDate);
        payments = payments.filter(
          (payment) => new Date(payment.createdAt) >= start
        );
      }
      if (endDate) {
        const end = new Date(endDate);
        payments = payments.filter(
          (payment) => new Date(payment.createdAt) <= end
        );
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = payments.slice(startIndex, endIndex);

      callback(null, {
        success: true,
        payments: paginatedPayments,
        total: payments.length,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
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
          message: 'Payment not found',
        });
      }

      if (payment.status === 'refunded') {
        return callback(null, {
          success: false,
          message: 'Payment already refunded',
        });
      }

      payment.status = 'refunded';
      payment.refundReason = reason;
      payment.updatedAt = new Date().toISOString();
      this.payments.set(paymentId, payment);

      callback(null, {
        success: true,
        message: 'Payment refunded successfully',
        payment,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getDriverBalance(call, callback) {
    try {
      const { driverId } = call.request;

      const paymentIds = this.driverPayments.get(driverId) || [];
      const payments = paymentIds
        .map((id) => this.payments.get(id))
        .filter(Boolean);

      const totalPaid = payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const totalRefunded = payments
        .filter((p) => p.status === 'refunded')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const balance = totalPaid - totalRefunded;

      callback(null, {
        success: true,
        message: 'Balance calculated',
        balance: Math.round(balance * 100) / 100,
        currency: 'AUD',
        driverId,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }
}

module.exports = Service;
