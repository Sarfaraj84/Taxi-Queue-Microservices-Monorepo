const grpc = require('@grpc/grpc-js');

class Service {
  constructor() {
    this.queues = {
      primary: [],
      secondary: [],
      'primary-van': [],
      'secondary-van': [],
    };
    this.drivers = new Map();
    this.priorityAccess = new Map();
  }

  healthCheck(call, callback) {
    try {
      const response = {
        status: 'OK',
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),

        primaryQueueCount: this.queues.primary.length,
        secondaryQueueCount: this.queues.secondary.length,
        priorityAccessCount: this.priorityAccess.size,
      };
      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  // Queue Service Methods
  addToQueue(call, callback) {
    try {
      const { driverId, vehicleType, queueType } = call.request;

      const validQueues = [
        'primary',
        'secondary',
        'primary-van',
        'secondary-van',
      ];
      if (!validQueues.includes(queueType)) {
        return callback(null, {
          success: false,
          message: 'Invalid queue type',
        });
      }

      // Remove driver from any existing queue first
      this.removeDriverFromAllQueues(driverId);

      // Add to appropriate queue
      const targetQueue =
        vehicleType === 'van' ? `${queueType}-van` : queueType;
      const position = this.queues[targetQueue].length + 1;

      this.queues[targetQueue].push({
        driverId,
        vehicleType,
        position,
        joinedAt: new Date().toISOString(),
      });

      // Store driver info
      this.drivers.set(driverId, {
        driverId,
        vehicleType,
        currentQueue: targetQueue,
        position,
      });

      callback(null, {
        success: true,
        message: 'Added to queue',
        position,
        queueType: targetQueue,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  removeFromQueue(call, callback) {
    try {
      const { driverId, queueType } = call.request;

      const driver = this.drivers.get(driverId);
      if (!driver) {
        return callback(null, {
          success: false,
          message: 'Driver not found in any queue',
        });
      }

      const targetQueue = queueType || driver.currentQueue;
      this.queues[targetQueue] = this.queues[targetQueue].filter(
        (item) => item.driverId !== driverId
      );

      // Recalculate positions
      this.queues[targetQueue].forEach((item, index) => {
        item.position = index + 1;
      });

      this.drivers.delete(driverId);

      callback(null, {
        success: true,
        message: 'Removed from queue',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getQueueStatus(call, callback) {
    try {
      const { queueType, vehicleType } = call.request;

      let targetQueues = [];
      if (queueType) {
        targetQueues = [queueType];
      } else {
        targetQueues = Object.keys(this.queues);
      }

      let allDrivers = [];
      targetQueues.forEach((q) => {
        const queueDrivers = this.queues[q].map((item) => ({
          id: item.driverId,
          name: `Driver ${item.driverId}`,
          vehicleType: item.vehicleType,
          position: item.position,
          queueType: q,
          joinedAt: item.joinedAt,
        }));
        allDrivers = [...allDrivers, ...queueDrivers];
      });

      // Filter by vehicle type if specified
      if (vehicleType) {
        allDrivers = allDrivers.filter(
          (driver) => driver.vehicleType === vehicleType
        );
      }

      callback(null, {
        success: true,
        count: allDrivers.length,
        drivers: allDrivers,
        queueType: queueType || 'all',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  getDriverPosition(call, callback) {
    try {
      const { driverId, queueType } = call.request;

      const driver = this.drivers.get(driverId);
      if (!driver) {
        return callback(null, {
          success: false,
          message: 'Driver not found in any queue',
        });
      }

      const targetQueue = queueType || driver.currentQueue;
      const queueItem = this.queues[targetQueue].find(
        (item) => item.driverId === driverId
      );

      if (!queueItem) {
        return callback(null, {
          success: false,
          message: 'Driver not found in specified queue',
        });
      }

      callback(null, {
        success: true,
        position: queueItem.position,
        queueType: targetQueue,
        message: `Driver position: ${queueItem.position}`,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  releaseDrivers(call, callback) {
    try {
      const { queueType, count, terminal /*vehicleRequirements */ } =
        call.request;

      if (!this.queues[queueType]) {
        return callback(null, {
          success: false,
          message: 'Invalid queue type',
        });
      }

      const driversToRelease = this.queues[queueType].slice(0, count);
      const driverIds = driversToRelease.map((driver) => driver.driverId);

      // Remove from queue
      this.queues[queueType] = this.queues[queueType].slice(count);

      // Update driver records
      driverIds.forEach((driverId) => {
        this.drivers.delete(driverId);
      });

      // Recalculate positions
      this.queues[queueType].forEach((item, index) => {
        item.position = index + 1;
      });

      callback(null, {
        success: true,
        message: `Released ${driversToRelease.length} drivers to terminal ${terminal}`,
        releasedCount: driversToRelease.length,
        driverIds,
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  handleAirportClosure(call, callback) {
    try {
      const { /*reason,*/ priorityExpiryHours } = call.request;

      // Move all secondary queue drivers to priority access
      const secondaryDrivers = [
        ...this.queues.secondary,
        ...this.queues['secondary-van'],
      ];

      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + (priorityExpiryHours || 12));

      secondaryDrivers.forEach((driver) => {
        this.priorityAccess.set(driver.driverId, {
          driverId: driver.driverId,
          originalPosition: driver.position,
          expiry: expiryTime.toISOString(),
        });
      });

      // Clear secondary queues
      this.queues.secondary = [];
      this.queues['secondary-van'] = [];

      callback(null, {
        success: true,
        message: `Airport closure handled. ${secondaryDrivers.length} drivers given priority access.`,
        driversMoved: secondaryDrivers.length,
        priorityExpiry: expiryTime.toISOString(),
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    }
  }

  removeDriverFromAllQueues(driverId) {
    Object.keys(this.queues).forEach((queueType) => {
      this.queues[queueType] = this.queues[queueType].filter(
        (item) => item.driverId !== driverId
      );
    });
    this.drivers.delete(driverId);
  }
}

module.exports = Service;
