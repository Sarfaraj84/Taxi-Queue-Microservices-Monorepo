const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');

class GeoGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    await this.createProtoFile();
    await this.createServerFile();
    await this.createServiceFile();
    await this.createClientFile();
    await this.createAdditionalFiles();
  }

  async createProtoFile() {
    const protoContent = await compileTemplate('proto/geo.proto.hbs', {
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
const turf = require('@turf/turf');

class GeoService {
  constructor() {
    this.geofences = new Map();
  }

  // Check if point is inside geofence
  isPointInGeofence(call, callback) {
    try {
      const { latitude, longitude, geofenceId } = call.request;
      const geofence = this.geofences.get(geofenceId);
      
      if (!geofence) {
        return callback(null, { success: false, message: 'Geofence not found' });
      }

      const point = turf.point([longitude, latitude]);
      const isInside = turf.booleanPointInPolygon(point, geofence.polygon);
      
      callback(null, { 
        success: true, 
        isInside, 
        geofenceId 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  // Add geofence
  addGeofence(call, callback) {
    try {
      const { id, name, coordinates } = call.request;
      const polygon = turf.polygon([coordinates]);
      
      this.geofences.set(id, {
        id,
        name,
        polygon
      });

      callback(null, { 
        success: true, 
        message: 'Geofence added successfully' 
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  }

  // Calculate distance between points
  calculateDistance(call, callback) {
    try {
      const { fromLat, fromLng, toLat, toLng } = call.request;
      const from = turf.point([fromLng, fromLat]);
      const to = turf.point([toLng, toLat]);
      
      const distance = turf.distance(from, to, { units: 'kilometers' });
      
      callback(null, { 
        success: true, 
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        unit: 'kilometers' 
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
      message: 'Geo service is healthy',
      timestamp: new Date().toISOString(),
      geofenceCount: this.geofences.size
    });
  }
}

module.exports = GeoService;
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

  async createAdditionalFiles() {
    // Add turf.js dependency
    const packageJsonPath = path.join(this.servicePath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.dependencies['@turf/turf'] = '^6.5.0';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Create config file for PostGIS if using PostgreSQL
    if (this.dbType === 'postgres') {
      const dbConfig = `const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// PostGIS extension setup
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis_topology;');
    client.release();
    console.log('PostGIS extensions enabled');
  } catch (error) {
    console.error('Error enabling PostGIS:', error);
  }
};

module.exports = { pool, initDatabase };
`;

      await fs.writeFile(
        path.join(this.servicePath, 'src/config/database.js'),
        dbConfig
      );
    }
  }

  toPascalCase(str) {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

module.exports = GeoGenerator;
