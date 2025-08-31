const BaseGenerator = require('./baseGenerator');
const path = require('path');
const fs = require('fs-extra');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

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
