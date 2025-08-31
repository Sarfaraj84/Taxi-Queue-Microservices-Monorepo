const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { compileTemplate } = require('../utils/templateUtils');
const { ensureDirectories } = require('../utils/fileUtils');

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
    const packageJson = {
      name: this.serviceName,
      version: '1.0.0',
      description: `${this.serviceName} gRPC microservice`,
      main: 'src/server.js',
      scripts: this.getScripts(),
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
    };

    await fs.writeJson(
      path.join(this.servicePath, 'package.json'),
      packageJson,
      { spaces: 2 }
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

    await ensureDirectories(this.servicePath, directories);
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
    const dockerfileContent = `FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ && \\
    npm install -g grpc-tools

COPY package*.json ./
RUN npm install --only=production

COPY src/ ./src/
COPY .env ./

RUN npm run compile-proto

EXPOSE ${this.port}

CMD ["npm", "start"]
`;
    await fs.writeFile(
      path.join(this.servicePath, 'Dockerfile'),
      dockerfileContent
    );
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
