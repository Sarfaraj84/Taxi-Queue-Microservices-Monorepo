const cache = require('../config/redis');

class PaymentCache {
  constructor() {
    this.prefix = 'payment:';
    this.ttl = {
      balance: 300, // 5 minutes
      transaction: 1800, // 30 minutes
      receipt: 86400, // 24 hours
    };
  }

  async getTransaction(transactionId) {
    const key = this.prefix + 'txn:' + transactionId;
    return await cache.get(key);
  }

  async setTransaction(transaction) {
    const key = this.prefix + 'txn:' + transaction.id;
    await cache.set(key, transaction, this.ttl.transaction);

    // Index by driver and status
    await this.indexTransaction(transaction);
  }

  async indexTransaction(transaction) {
    // Index by driver
    const driverKey = this.prefix + `driver:${transaction.driverId}:txns`;
    await cache.zadd(driverKey, Date.now(), transaction.id);

    // Index by status
    const statusKey = this.prefix + `status:${transaction.status}:txns`;
    await cache.zadd(statusKey, Date.now(), transaction.id);

    // Index by terminal
    const terminalKey = this.prefix + `terminal:${transaction.terminal}:txns`;
    await cache.zadd(terminalKey, Date.now(), transaction.id);
  }

  async getDriverBalance(driverId) {
    const key = this.prefix + 'balance:' + driverId;
    const cached = await cache.get(key);

    if (cached) {
      return {
        ...cached,
        source: 'cache',
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  async setDriverBalance(driverId, balanceData) {
    const key = this.prefix + 'balance:' + driverId;
    await cache.set(key, balanceData, this.ttl.balance);
  }

  async invalidateDriverBalance(driverId) {
    const key = this.prefix + 'balance:' + driverId;
    await cache.del(key);
  }

  async getDriverTransactions(driverId, page = 1, limit = 10) {
    const key = this.prefix + `driver:${driverId}:txns`;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const transactionIds = await cache.zrevrange(key, start, end);

    if (transactionIds.length === 0) {
      return { transactions: [], total: 0, source: 'cache_empty' };
    }

    const transactions = [];
    for (const id of transactionIds) {
      const txn = await this.getTransaction(id);
      if (txn) transactions.push(txn);
    }

    const total = await cache.zcard(key);

    return {
      transactions,
      total,
      page,
      limit,
      source: 'cache',
    };
  }

  async cacheReceipt(transactionId, receiptData) {
    const key = this.prefix + 'receipt:' + transactionId;
    await cache.set(key, receiptData, this.ttl.receipt);
  }

  async getReceipt(transactionId) {
    const key = this.prefix + 'receipt:' + transactionId;
    return await cache.get(key);
  }

  async invalidateTransaction(transactionId) {
    const key = this.prefix + 'txn:' + transactionId;
    await cache.del(key);

    const receiptKey = this.prefix + 'receipt:' + transactionId;
    await cache.del(receiptKey);
  }

  async getTransactionStats(timeframe = 'day') {
    const key = this.prefix + 'stats:' + timeframe;
    const cached = await cache.get(key);

    if (cached) {
      return {
        ...cached,
        source: 'cache',
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  async setTransactionStats(timeframe, stats) {
    const key = this.prefix + 'stats:' + timeframe;
    await cache.set(key, stats, 300); // 5 minutes for stats
  }
}

module.exports = new PaymentCache();
