const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const FileUtils = require('../utils/fileUtils');

class GeoGenerator extends BaseGenerator {
  constructor(serviceName, port, dbType) {
    super(serviceName, port, dbType);
  }

  async generateServiceSpecificFiles() {
    // These are now handled by the base class
    await this.createProtoFile();
    await this.createServerFile();
    await this.createServiceFile();
    await this.createClientFile();
    await this.createModelFiles();

    // Service-specific additional setup
    await this.createAdditionalFiles();
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

    await this.createGeoCacheService();
  }

  async createGeoCacheService() {
    const cacheServiceContent = `const cache = require('../config/redis');

class GeoCache {
  constructor() {
    this.prefix = 'geo:';
    this.ttl = 86400; // 24 hours for geofence data
  }

  async getGeofence(geofenceId) {
    const key = this.prefix + 'geofence:' + geofenceId;
    return await cache.get(key);
  }

  async setGeofence(geofenceId, geofenceData) {
    const key = this.prefix + 'geofence:' + geofenceId;
    await cache.set(key, geofenceData, this.ttl);
  }

  async getDistanceCache(from, to) {
    const key = this.prefix + 'distance:' + this.hashCoordinates(from, to);
    return await cache.get(key);
  }

  async setDistanceCache(from, to, distance) {
    const key = this.prefix + 'distance:' + this.hashCoordinates(from, to);
    await cache.set(key, distance, this.ttl);
  }

  hashCoordinates(from, to) {
    return \`\${from.lat}:\${from.lng}:\${to.lat}:\${to.lng}\`.replace(/[^a-zA-Z0-9:.-]/g, '');
  }

  async invalidateGeofence(geofenceId) {
    const key = this.prefix + 'geofence:' + geofenceId;
    await cache.del(key);
  }
}

module.exports = new GeoCache();
`;

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/services/GeoCache.js'),
      cacheServiceContent
    );
  }

  toPascalCase(str) {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

module.exports = GeoGenerator;
