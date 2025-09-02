const cache = require('./PaymentCache');
const Payment = require('../models/Payment');

class TransactionManager {
  constructor() {
    this.cache = cache;
  }

  async processWithCache(transactionData) {
    // Check if similar transaction recently processed
    const duplicateKey = `dup:${transactionData.driverId}:${transactionData.amount}:${transactionData.terminal}`;
    const recentDuplicate = await this.cache.get(duplicateKey);

    if (recentDuplicate) {
      throw new Error('Duplicate transaction detected');
    }

    // Cache duplicate check
    await this.cache.set(duplicateKey, true, 60); // 1 minute duplicate window

    // Process transaction (would integrate with Stripe here)
    const transaction = await Payment.create(transactionData);

    // Cache the transaction
    await this.cache.setTransaction(transaction.toObject());

    // Invalidate balance cache
    await this.cache.invalidateDriverBalance(transactionData.driverId);

    return transaction;
  }

  async getDriverBalanceWithCache(driverId) {
    const cachedBalance = await this.cache.getDriverBalance(driverId);
    if (cachedBalance) return cachedBalance;

    // Calculate balance from database
    const payments = await Payment.find({
      driverId,
      status: { $in: ['completed', 'refunded'] },
    });

    const completed = payments.filter((p) => p.status === 'completed');
    const refunded = payments.filter((p) => p.status === 'refunded');

    const totalPaid = completed.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = refunded.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalPaid - totalRefunded;

    const balanceData = {
      driverId,
      balance: Math.round(balance * 100) / 100,
      currency: 'AUD',
      totalTransactions: payments.length,
      lastUpdated: new Date().toISOString(),
    };

    await this.cache.setDriverBalance(driverId, balanceData);

    return {
      ...balanceData,
      source: 'database',
    };
  }

  async getTransactionsWithCache(driverId, options = {}) {
    const { page = 1, limit = 10, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = await this.cache.getDriverTransactions(
        driverId,
        page,
        limit
      );
      if (cached.transactions.length > 0) return cached;
    }

    // Load from database
    const transactions = await Payment.find({ driverId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments({ driverId });

    // Cache individual transactions
    for (const txn of transactions) {
      await this.cache.setTransaction(txn.toObject());
    }

    return {
      transactions: transactions.map((t) => t.toObject()),
      total,
      page,
      limit,
      source: 'database',
    };
  }

  async refreshDriverData(driverId) {
    await this.cache.invalidateDriverBalance(driverId);

    const driverKey = this.prefix + `driver:${driverId}:txns`;
    await this.cache.del(driverKey);

    return {
      driverId,
      refreshed: true,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new TransactionManager();
