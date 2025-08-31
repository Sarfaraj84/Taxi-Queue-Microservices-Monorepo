const BaseGenerator = require('./baseGenerator');
const path = require('path');
const FileUtils = require('../utils/fileUtils');

class PaymentGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    await this.createProtoFile();
    await this.createServerFile();
    await this.createServiceFile();
    await this.createClientFile();
    await this.createModelFiles();
    await this.createAdditionalFiles();
  }

  async createAdditionalFiles() {
    await this.createPaymentCacheService();
    await this.createTransactionManager();
  }

  async createPaymentCacheService() {
    const cacheServiceContent = `const cache = require('../config/redis');

class PaymentCache {
  constructor() {
    this.prefix = 'payment:';
    this.ttl = {
      balance: 300, // 5 minutes
      transaction: 1800, // 30 minutes
      receipt: 86400 // 24 hours
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
    const driverKey = this.prefix + \`driver:\${transaction.driverId}:txns\`;
    await cache.zadd(driverKey, Date.now(), transaction.id);
    
    // Index by status
    const statusKey = this.prefix + \`status:\${transaction.status}:txns\`;
    await cache.zadd(statusKey, Date.now(), transaction.id);
    
    // Index by terminal
    const terminalKey = this.prefix + \`terminal:\${transaction.terminal}:txns\`;
    await cache.zadd(terminalKey, Date.now(), transaction.id);
  }

  async getDriverBalance(driverId) {
    const key = this.prefix + 'balance:' + driverId;
    const cached = await cache.get(key);
    
    if (cached) {
      return {
        ...cached,
        source: 'cache',
        timestamp: new Date().toISOString()
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
    const key = this.prefix + \`driver:\${driverId}:txns\`;
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
      source: 'cache'
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
        timestamp: new Date().toISOString()
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
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/services/PaymentCache.js'),
      cacheServiceContent
    );
  }

  async createTransactionManager() {
    const transactionManagerContent = `const cache = require('./PaymentCache');
const Payment = require('../models/Payment');

class TransactionManager {
  constructor() {
    this.cache = cache;
  }

  async processWithCache(transactionData) {
    // Check if similar transaction recently processed
    const duplicateKey = \`dup:\${transactionData.driverId}:\${transactionData.amount}:\${transactionData.terminal}\`;
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
      status: { $in: ['completed', 'refunded'] }
    });

    const completed = payments.filter(p => p.status === 'completed');
    const refunded = payments.filter(p => p.status === 'refunded');

    const totalPaid = completed.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = refunded.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalPaid - totalRefunded;

    const balanceData = {
      driverId,
      balance: Math.round(balance * 100) / 100,
      currency: 'AUD',
      totalTransactions: payments.length,
      lastUpdated: new Date().toISOString()
    };

    await this.cache.setDriverBalance(driverId, balanceData);

    return {
      ...balanceData,
      source: 'database'
    };
  }

  async getTransactionsWithCache(driverId, options = {}) {
    const { page = 1, limit = 10, forceRefresh = false } = options;

    if (!forceRefresh) {
      const cached = await this.cache.getDriverTransactions(driverId, page, limit);
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
      transactions: transactions.map(t => t.toObject()),
      total,
      page,
      limit,
      source: 'database'
    };
  }

  async refreshDriverData(driverId) {
    await this.cache.invalidateDriverBalance(driverId);
    
    const driverKey = this.prefix + \`driver:\${driverId}:txns\`;
    await this.cache.del(driverKey);

    return {
      driverId,
      refreshed: true,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new TransactionManager();
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/services/TransactionManager.js'),
      transactionManagerContent
    );
  }
}

module.exports = PaymentGenerator;
