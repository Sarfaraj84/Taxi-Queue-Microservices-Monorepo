const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { compileTemplate } = require('../utils/templateUtils');
const FileUtils = require('../utils/fileUtils');

class BaseGenerator {
  constructor(serviceName, port, dbType) {
    this.serviceName = serviceName;
    this.serviceKey = serviceName.replace('-service', '');
    this.port = port;
    this.dbType = dbType;
    this.servicePath = path.join(process.cwd(), serviceName);
  }

  async generate() {
    try {
      await this.createServiceDirectory();
      await this.createPackageJson();
      await this.createDirectories();
      await this.createEnvFile();
      await this.createGitignore();
      await this.createDockerfile();
      await this.generateServiceSpecificFiles();

      console.log(
        chalk.green(`✅ ${this.serviceName} generated successfully!`)
      );
      this.printNextSteps();
    } catch (error) {
      throw new Error(`Failed to generate service: ${error.message}`);
    }
  }

  async createServiceDirectory() {
    await fs.ensureDir(this.servicePath);
  }

  async createPackageJson() {
    const packageJsonContent = await compileTemplate('package.json.hbs', {
      serviceName: this.serviceName,
      serviceKey: this.serviceKey,
      port: this.port,
      dbType: this.dbType,
    });

    await FileUtils.writeJsonFile(
      path.join(this.servicePath, 'package.json'),
      JSON.parse(packageJsonContent)
    );
  }

  getScripts() {
    return {
      start: 'node src/server.js',
      dev: 'nodemon src/server.js',
      'compile-proto': 'npm run compile-proto:js && npm run compile-proto:ts',
      'compile-proto:js':
        'grpc_tools_node_protoc --js_out=import_style=commonjs,binary:src/proto/ --grpc_out=grpc_js:src/proto/ --proto_path=src/proto/ src/proto/*.proto',
      'compile-proto:ts':
        'protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts --ts_out=src/proto/ --proto_path=src/proto/ src/proto/*.proto',
      test: 'jest',
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
    };
  }

  getDependencies() {
    const baseDeps = {
      '@grpc/grpc-js': '^1.8.0',
      '@grpc/proto-loader': '^0.7.0',
      'google-protobuf': '^3.21.2',
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^6.0.1',
      dotenv: '^16.0.3',
    };

    const dbDeps = {
      mongodb: { mongoose: '^6.8.0' },
      postgres: { pg: '^8.8.0', 'pg-hstore': '^2.3.4' },
      redis: { redis: '^4.6.0', ioredis: '^5.3.2' },
    };

    return { ...baseDeps, ...(dbDeps[this.dbType] || {}) };
  }

  getDevDependencies() {
    return {
      'grpc-tools': '^1.12.0',
      grpc_tools_node_protoc_ts: '^5.3.3',
      nodemon: '^2.0.20',
      jest: '^29.3.1',
      eslint: '^8.31.0',
      '@types/node': '^18.11.0',
    };
  }

  async createDirectories() {
    const directories = [
      'src/controllers',
      'src/models',
      'src/services',
      'src/proto',
      'src/client',
      'src/middleware',
      'src/config',
      'src/utils',
      'tests',
    ];

    await FileUtils.ensureDirectories(this.servicePath, directories);
  }

  async createEnvFile() {
    const envContent = `PORT=${this.port}
GRPC_PORT=${this.port}
NODE_ENV=development
${this.getDatabaseEnv()}
JWT_SECRET=your-super-secret-jwt-key

# gRPC Service URLs
AUTH_SERVICE_URL=localhost:50051
USER_SERVICE_URL=localhost:50052
QUEUE_SERVICE_URL=localhost:50053
GEO_SERVICE_URL=localhost:50054
VEHICLE_SERVICE_URL=localhost:50055
PAYMENT_SERVICE_URL=localhost:50056
CONFIG_SERVICE_URL=localhost:50057
`;
    await fs.writeFile(path.join(this.servicePath, '.env'), envContent);
  }

  getDatabaseEnv() {
    const dbEnvMap = {
      mongodb: `MONGODB_URI=mongodb://localhost:27017/${this.serviceKey}db`,
      postgres: `POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/${this.serviceKey}db`,
      redis: `REDIS_URL=redis://localhost:6379/${this.serviceKey}`,
    };
    return dbEnvMap[this.dbType] || '';
  }

  async createGitignore() {
    const gitignoreContent = `node_modules/
.env
dist/
logs/
*.log
.DS_Store
*.pb.js
*.pb.ts
`;
    await fs.writeFile(
      path.join(this.servicePath, '.gitignore'),
      gitignoreContent
    );
  }

  async createDockerfile() {
    const dockerfileContent = await compileTemplate('dockerfile.hbs', {
      serviceName: this.serviceName,
      port: this.port,
    });

    await FileUtils.createFile(
      path.join(this.servicePath, 'Dockerfile'),
      dockerfileContent
    );
  }

  async createAppFile() {
    const appContent = await compileTemplate('app.js.hbs', {
      serviceName: this.serviceName,
      serviceKey: this.serviceKey,
      port: this.port,
    });

    await FileUtils.createFile(
      path.join(this.servicePath, 'src/app.js'),
      appContent
    );
  }

  async createProtoFile() {
    try {
      const protoContent = await compileTemplate(
        `proto/${this.serviceKey}.proto.hbs`,
        {
          serviceName: this.serviceKey,
          serviceNamePascal: this.serviceNamePascal,
        }
      );

      await FileUtils.createFile(
        path.join(this.servicePath, 'src/proto', `${this.serviceKey}.proto`),
        protoContent
      );
    } catch (error) {
      console.warn(
        chalk.yellow(
          `Could not create proto file for ${this.serviceName}: ${error.message}`
        )
      );
    }
  }

  async createModelFiles() {
    if (this.dbType === 'none') return;

    try {
      const modelContent = await compileTemplate(
        `models/${this.serviceKey}.model.hbs`,
        {
          serviceName: this.serviceKey,
          serviceNamePascal: this.serviceNamePascal,
        }
      );

      await FileUtils.createFile(
        path.join(
          this.servicePath,
          'src/models',
          `${this.serviceNamePascal}.js`
        ),
        modelContent
      );
    } catch (error) {
      console.warn(
        chalk.yellow(
          `Could not create model file for ${this.serviceName}: ${error.message}`
        )
      );
    }
  }

  async createServiceFile() {
    try {
      const serviceContent = await compileTemplate('service/service.js.hbs', {
        serviceName: this.serviceKey,
        serviceNamePascal: this.serviceNamePascal,
        serviceNameUpperCase: this.serviceNameUpperCase,
      });

      await FileUtils.createFile(
        path.join(
          this.servicePath,
          `src/services/${this.serviceKey}Service.js`
        ),
        serviceContent
      );
    } catch (error) {
      throw new Error(`Failed to create service file: ${error.message}`);
    }
  }

  async createClientFile() {
    try {
      const clientContent = await compileTemplate('service/client.js.hbs', {
        serviceName: this.serviceKey,
        serviceNamePascal: this.serviceNamePascal,
        serviceNameUpperCase: this.serviceNameUpperCase,
        port: this.port,
      });

      await FileUtils.createFile(
        path.join(this.servicePath, `src/client/${this.serviceKey}Client.js`),
        clientContent
      );
    } catch (error) {
      console.warn(
        chalk.yellow(
          `Could not create client file for ${this.serviceName}: ${error.message}`
        )
      );
    }
  }

  async createServerFile() {
    try {
      const serverContent = await compileTemplate('service/server.js.hbs', {
        serviceName: this.serviceKey,
        serviceNamePascal: this.serviceNamePascal,
        port: this.port,
      });

      await FileUtils.createFile(
        path.join(this.servicePath, 'src/server.js'),
        serverContent
      );
    } catch (error) {
      throw new Error(`Failed to create server file: ${error.message}`);
    }
  }

  async generateServiceSpecificFiles() {
    // To be implemented by specific service generators
  }

  printNextSteps() {
    console.log(chalk.blue(`\nNext steps for ${this.serviceName}:`));
    console.log(`1. cd ${this.serviceName}`);
    console.log(`2. npm install`);
    console.log(`3. npm run compile-proto`);
    console.log(`4. Update environment variables in .env`);
    console.log(`5. Start developing! 🚀\n`);
  }
}

module.exports = BaseGenerator;
