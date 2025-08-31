const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

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
