const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');

class QueueGenerator extends BaseGenerator {
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

package queue;

service QueueService {
  rpc HealthCheck (HealthRequest) returns (HealthResponse) {};
  rpc AddToQueue (AddToQueueRequest) returns (QueueResponse) {};
  rpc RemoveFromQueue (RemoveFromQueueRequest) returns (QueueResponse) {};
  rpc GetQueueStatus (QueueStatusRequest) returns (QueueStatusResponse) {};
  rpc GetDriverPosition (DriverPositionRequest) returns (DriverPositionResponse) {};
  rpc ReleaseDrivers (ReleaseRequest) returns (ReleaseResponse) {};
}

message HealthRequest {
  string service = 1;
}

message HealthResponse {
  string status = 1;
  string message = 2;
  string timestamp = 3;
  int32 primaryQueueCount = 4;
  int32 secondaryQueueCount = 5;
}

message AddToQueueRequest {
  string driverId = 1;
  string vehicleType = 2;
  string queueType = 3;
}

message RemoveFromQueueRequest {
  string driverId = 1;
  string queueType = 2;
}

message QueueStatusRequest {
  string queueType = 1;
  string vehicleType = 2;
}

message DriverPositionRequest {
  string driverId = 1;
  string queueType = 2;
}

message ReleaseRequest {
  string queueType = 1;
  int32 count = 2;
  string terminal = 3;
}

message QueueResponse {
  bool success = 1;
  string message = 2;
  int32 position = 3;
  string queueType = 4;
}

message QueueStatusResponse {
  bool success = 1;
  int32 count = 2;
  repeated Driver drivers = 3;
  string queueType = 4;
}

message DriverPositionResponse {
  bool success = 1;
  int32 position = 2;
  string queueType = 3;
  string message = 4;
}

message ReleaseResponse {
  bool success = 1;
  string message = 2;
  int32 releasedCount = 3;
  repeated string driverIds = 4;
}

message Driver {
  string id = 1;
  string name = 2;
  string vehicleType = 3;
  int32 position = 4;
  string queueType = 5;
  string joinedAt = 6;
}
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/proto', 'queue.proto'),
      protoContent
    );
  }

  async createServiceFile() {
    const serviceContent = `const grpc = require('@grpc/grpc-js');

class QueueService {
  constructor() {
    this.queues = {
      primary: [],
      secondary: [],
      'primary-van': [],
      'secondary-van': []
    };
    this.drivers = new Map();
  }

  addToQueue(call, callback) {
    try {
      const { driverId, vehicleType, queueType } = call.request;
      
      const validQueues = ['primary', 'secondary', 'primary-van', 'secondary-van'];
      if (!validQueues.includes(queueType)) {
        return callback(null, { 
          success: false, 
          message: 'Invalid queue type' 
        });
      }

      // Remove driver from any existing queue first
      this.removeDriverFromAllQueues(driverId);

      // Add to appropriate queue
      const targetQueue = vehicleType === 'van' ? \`\${queueType}-van\` : queueType;
      const position = this.queues[targetQueue].length + 1;
      
      this.queues[targetQueue].push({
        driverId,
        vehicleType,
        position,
        joinedAt: new Date().toISOString()
      });

      // Store driver info
      this.drivers.set(driverId, {
        driverId,
        vehicleType,
        currentQueue: targetQueue,
        position
      });

      callback(null, { 
        success: true, 
        message: 'Added to queue',
        position,
        queueType: targetQueue
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
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
          message: 'Driver not found in any queue' 
        });
      }

      const targetQueue = queueType || driver.currentQueue;
      this.queues[targetQueue] = this.queues[targetQueue].filter(
        item => item.driverId !== driverId
      );

      // Recalculate positions
      this.queues[targetQueue].forEach((item, index) => {
        item.position = index + 1;
      });

      this.drivers.delete(driverId);

      callback(null, { 
        success: true, 
        message: 'Removed from queue' 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
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
      targetQueues.forEach(q => {
        const queueDrivers = this.queues[q].map(item => ({
          id: item.driverId,
          name: \`Driver \${item.driverId}\`,
          vehicleType: item.vehicleType,
          position: item.position,
          queueType: q,
          joinedAt: item.joinedAt
        }));
        allDrivers = [...allDrivers, ...queueDrivers];
      });

      // Filter by vehicle type if specified
      if (vehicleType) {
        allDrivers = allDrivers.filter(driver => driver.vehicleType === vehicleType);
      }

      callback(null, { 
        success: true, 
        count: allDrivers.length,
        drivers: allDrivers,
        queueType: queueType || 'all'
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
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
          message: 'Driver not found in any queue' 
        });
      }

      const targetQueue = queueType || driver.currentQueue;
      const queueItem = this.queues[targetQueue].find(item => item.driverId === driverId);
      
      if (!queueItem) {
        return callback(null, { 
          success: false, 
          message: 'Driver not found in specified queue' 
        });
      }

      callback(null, { 
        success: true, 
        position: queueItem.position,
        queueType: targetQueue,
        message: \`Driver position: \${queueItem.position}\`
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  releaseDrivers(call, callback) {
    try {
      const { queueType, count, terminal } = call.request;
      
      if (!this.queues[queueType]) {
        return callback(null, { 
          success: false, 
          message: 'Invalid queue type' 
        });
      }

      const driversToRelease = this.queues[queueType].slice(0, count);
      const driverIds = driversToRelease.map(driver => driver.driverId);

      // Remove from queue
      this.queues[queueType] = this.queues[queueType].slice(count);

      // Update driver records
      driverIds.forEach(driverId => {
        this.drivers.delete(driverId);
      });

      // Recalculate positions
      this.queues[queueType].forEach((item, index) => {
        item.position = index + 1;
      });

      callback(null, { 
        success: true, 
        message: \`Released \${driversToRelease.length} drivers to terminal \${terminal}\`,
        releasedCount: driversToRelease.length,
        driverIds
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  removeDriverFromAllQueues(driverId) {
    Object.keys(this.queues).forEach(queueType => {
      this.queues[queueType] = this.queues[queueType].filter(
        item => item.driverId !== driverId
      );
    });
    this.drivers.delete(driverId);
  }

  healthCheck(call, callback) {
    callback(null, {
      status: 'OK',
      message: 'Queue service is healthy',
      timestamp: new Date().toISOString(),
      primaryQueueCount: this.queues.primary.length,
      secondaryQueueCount: this.queues.secondary.length
    });
  }
}

module.exports = QueueService;
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/services/queueService.js'),
      serviceContent
    );
  }
}

module.exports = QueueGenerator;
