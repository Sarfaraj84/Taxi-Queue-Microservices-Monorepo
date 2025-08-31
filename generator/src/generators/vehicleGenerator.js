const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');

class VehicleGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    await this.createProtoFile();
    await this.createServerFile();
    await this.createServiceFile();
    await this.createClientFile();
    await this.createModelFiles();
  }

  async createProtoFile() {
    const protoContent = await compileTemplate('proto/vehicle.proto.hbs', {
      serviceName: this.serviceKey,
    });

    await fs.writeFile(
      path.join(this.servicePath, 'src/proto', `${this.serviceKey}.proto`),
      protoContent
    );
  }

  async createServerFile() {
    const serverContent = await compileTemplate('service/server.js.hbs', {
      serviceName: this.serviceKey,
      serviceNamePascal: this.toPascalCase(this.serviceKey),
      port: this.port,
    });

    await fs.writeFile(
      path.join(this.servicePath, 'src/server.js'),
      serverContent
    );
  }

  async createServiceFile() {
    const serviceContent = `const grpc = require('@grpc/grpc-js');

class VehicleService {
  constructor() {
    this.vehicles = new Map();
    this.driverVehicles = new Map();
  }

  // Register a new vehicle
  registerVehicle(call, callback) {
    try {
      const { driverId, registrationNumber, vehicleType, make, model, year, color } = call.request;
      
      const vehicleId = \`veh_\${Date.now()}\`;
      const vehicle = {
        id: vehicleId,
        driverId,
        registrationNumber,
        vehicleType,
        make,
        model,
        year: parseInt(year),
        color,
        isActive: false,
        isApproved: false,
        createdAt: new Date().toISOString()
      };

      this.vehicles.set(vehicleId, vehicle);
      
      // Track driver's vehicles
      if (!this.driverVehicles.has(driverId)) {
        this.driverVehicles.set(driverId, new Set());
      }
      this.driverVehicles.get(driverId).add(vehicleId);

      callback(null, { 
        success: true, 
        message: 'Vehicle registered successfully',
        vehicleId 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  // Set active vehicle for driver
  setActiveVehicle(call, callback) {
    try {
      const { driverId, vehicleId } = call.request;
      
      const vehicle = this.vehicles.get(vehicleId);
      if (!vehicle || vehicle.driverId !== driverId) {
        return callback(null, { 
          success: false, 
          message: 'Vehicle not found or not owned by driver' 
        });
      }

      // Deactivate all other vehicles for this driver
      const driverVehicles = this.driverVehicles.get(driverId) || new Set();
      for (const vid of driverVehicles) {
        if (vid !== vehicleId) {
          const v = this.vehicles.get(vid);
          if (v) v.isActive = false;
        }
      }

      vehicle.isActive = true;
      this.vehicles.set(vehicleId, vehicle);

      callback(null, { 
        success: true, 
        message: 'Vehicle set as active' 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  // Get driver's vehicles
  getDriverVehicles(call, callback) {
    try {
      const { driverId } = call.request;
      const driverVehicles = this.driverVehicles.get(driverId) || new Set();
      
      const vehicles = Array.from(driverVehicles).map(vehicleId => {
        const vehicle = this.vehicles.get(vehicleId);
        return {
          id: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          vehicleType: vehicle.vehicleType,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          isActive: vehicle.isActive,
          isApproved: vehicle.isApproved
        };
      });

      callback(null, { 
        success: true, 
        vehicles 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  // Health check
  healthCheck(call, callback) {
    callback(null, {
      status: 'OK',
      message: 'Vehicle service is healthy',
      timestamp: new Date().toISOString(),
      vehicleCount: this.vehicles.size,
      driverCount: this.driverVehicles.size
    });
  }
}

module.exports = VehicleService;
`;

    await fs.writeFile(
      path.join(this.servicePath, `src/services/${this.serviceKey}Service.js`),
      serviceContent
    );
  }

  async createClientFile() {
    const clientContent = await compileTemplate('service/client.js.hbs', {
      serviceName: this.serviceKey,
      serviceNamePascal: this.toPascalCase(this.serviceKey),
      port: this.port,
    });

    await fs.writeFile(
      path.join(this.servicePath, `src/client/${this.serviceKey}Client.js`),
      clientContent
    );
  }

  async createModelFiles() {
    // Create Vehicle model
    const vehicleModel = `const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['sedan', '7-seater', 'station-wagon', 'van']
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  documents: [{
    type: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Ensure only one active vehicle per driver
vehicleSchema.pre('save', async function(next) {
  if (this.isActive && this.isModified('isActive')) {
    await this.constructor.updateMany(
      { driverId: this.driverId, _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
`;

    await fs.writeFile(
      path.join(this.servicePath, 'src/models/Vehicle.js'),
      vehicleModel
    );
  }

  toPascalCase(str) {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

module.exports = VehicleGenerator;
