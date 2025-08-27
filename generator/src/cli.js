#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const Handlebars = require('handlebars');

// Register Handlebars helpers
Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
Handlebars.registerHelper('toCamelCase', (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
});

const templates = {
  'grpc-basic': {
    description: 'Basic gRPC microservice with MVC structure',
    files: [
      'src/controllers/',
      'src/models/',
      'src/services/',
      'src/proto/',
      'src/client/',
      'src/middleware/',
      'src/config/',
      'src/utils/',
      'tests/',
    ],
  },
  'grpc-auth': {
    description: 'Authentication service with gRPC',
    files: [
      'src/controllers/authController.js',
      'src/models/User.js',
      'src/proto/auth.proto',
      'src/services/authService.js',
      'src/client/authClient.js',
      'src/config/grpc.js',
    ],
  },
  'grpc-queue': {
    description: 'Queue management service with gRPC',
    files: [
      'src/controllers/queueController.js',
      'src/models/Queue.js',
      'src/models/Driver.js',
      'src/proto/queue.proto',
      'src/services/queueService.js',
      'src/client/queueClient.js',
    ],
  },
};

const protoTemplates = {
  basic: `syntax = "proto3";

package {{serviceName}};

service {{serviceNamePascal}}Service {
  rpc HealthCheck (HealthRequest) returns (HealthResponse) {};
}

message HealthRequest {
  string service = 1;
}

message HealthResponse {
  string status = 1;
  string message = 2;
  string timestamp = 3;
}
`,
  auth: `syntax = "proto3";

package auth;

service AuthService {
  rpc Login (LoginRequest) returns (LoginResponse) {};
  rpc Register (RegisterRequest) returns (RegisterResponse) {};
  rpc VerifyToken (TokenRequest) returns (TokenResponse) {};
}

message LoginRequest {
  string email = 1;
  string password = 2;
}

message LoginResponse {
  bool success = 1;
  string message = 2;
  string token = 3;
  User user = 4;
}

message RegisterRequest {
  string email = 1;
  string password = 2;
  string firstName = 3;
  string lastName = 4;
}

message RegisterResponse {
  bool success = 1;
  string message = 2;
  string userId = 3;
}

message TokenRequest {
  string token = 1;
}

message TokenResponse {
  bool valid = 1;
  string userId = 2;
  string email = 3;
}

message User {
  string id = 1;
  string email = 2;
  string firstName = 3;
  string lastName = 4;
}
`,
  queue: `syntax = "proto3";

package queue;

service QueueService {
  rpc AddToQueue (AddToQueueRequest) returns (QueueResponse) {};
  rpc RemoveFromQueue (RemoveFromQueueRequest) returns (QueueResponse) {};
  rpc GetQueueStatus (QueueStatusRequest) returns (QueueStatusResponse) {};
  rpc NotifyDriver (NotifyRequest) returns (NotifyResponse) {};
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
}

message QueueStatusResponse {
  int32 count = 1;
  repeated Driver drivers = 2;
}

message NotifyRequest {
  string driverId = 1;
  string message = 2;
  string terminal = 3;
}

message NotifyResponse {
  bool success = 1;
  string message = 2;
}

message Driver {
  string id = 1;
  string name = 2;
  string vehicleType = 3;
  int32 position = 4;
}

message QueueResponse {
  bool success = 1;
  string message = 2;
  int32 position = 3;
}
`,
};

async function generateService() {
  console.log(chalk.blue('🚀 gRPC Microservice Generator\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'serviceName',
      message: 'Service name (e.g., user-service, auth-service):',
      validate: (input) =>
        input && input.includes('-service')
          ? true
          : 'Service name must include "-service"',
    },
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template:',
      choices: Object.keys(templates).map((key) => ({
        name: `${key} - ${templates[key].description}`,
        value: key,
      })),
    },
    {
      type: 'input',
      name: 'port',
      message: 'gRPC server port:',
      default: '50051',
      validate: (input) => (!isNaN(input) ? true : 'Port must be a number'),
    },
    {
      type: 'confirm',
      name: 'withDatabase',
      message: 'Include database configuration?',
      default: true,
    },
    {
      type: 'list',
      name: 'databaseType',
      message: 'Database type:',
      choices: ['MongoDB', 'PostgreSQL', 'Redis', 'None'],
      default: 'MongoDB',
      when: (answers) => answers.withDatabase,
    },
    {
      type: 'confirm',
      name: 'generateClient',
      message: 'Generate gRPC client for other services?',
      default: true,
    },
  ]);

  await createServiceStructure(answers);
}

async function createServiceStructure(options) {
  const { serviceName, template, port, databaseType, generateClient } = options;
  const servicePath = path.join(process.cwd(), serviceName);

  console.log(chalk.yellow(`\nCreating ${serviceName}...`));

  try {
    // Create service directory
    await fs.ensureDir(servicePath);

    // Create package.json with gRPC dependencies
    await createPackageJson(servicePath, serviceName, port);

    // Create directory structure
    await createDirectories(servicePath, template);

    // Create basic files
    await createBasicFiles(
      servicePath,
      serviceName,
      port,
      databaseType,
      template
    );

    // Create proto file
    await createProtoFile(servicePath, serviceName, template);

    // Create gRPC server and client
    await createGrpcFiles(servicePath, serviceName, port, generateClient);

    // Create Dockerfile
    await createDockerfile(servicePath, port);

    console.log(
      chalk.green(`\n✅ gRPC Service ${serviceName} generated successfully!`)
    );
    console.log(chalk.blue(`\nNext steps:`));
    console.log(`1. cd ${serviceName}`);
    console.log(`2. npm install`);
    console.log(`3. npm run compile-proto`);
    console.log(`4. Update environment variables in .env`);
    console.log(`5. Start developing! 🚀`);
  } catch (error) {
    console.error(chalk.red('Error generating service:'), error);
  }
}

async function createPackageJson(servicePath, serviceName, port) {
  const packageJson = {
    name: serviceName,
    version: '1.0.0',
    description: `${serviceName} gRPC microservice`,
    main: 'src/server.js',
    scripts: {
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
    },
    dependencies: {
      '@grpc/grpc-js': '^1.8.0',
      '@grpc/proto-loader': '^0.7.0',
      'google-protobuf': '^3.21.2',
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^6.0.1',
      dotenv: '^16.0.3',
      mongoose: '^6.8.0',
    },
    devDependencies: {
      'grpc-tools': '^1.12.0',
      grpc_tools_node_protoc_ts: '^5.3.3',
      nodemon: '^2.0.20',
      jest: '^29.3.1',
      eslint: '^8.31.0',
      '@types/node': '^18.11.0',
    },
  };

  await fs.writeJson(path.join(servicePath, 'package.json'), packageJson, {
    spaces: 2,
  });
}

async function createDirectories(servicePath, template) {
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

  for (const dir of directories) {
    await fs.ensureDir(path.join(servicePath, dir));
  }
}

async function createBasicFiles(
  servicePath,
  serviceName,
  port,
  databaseType,
  template
) {
  // Create .env file
  const envContent = `PORT=${port}
GRPC_PORT=${port}
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/${serviceName.replace('-service', 'db')}
JWT_SECRET=your-super-secret-jwt-key

# gRPC Service URLs
AUTH_SERVICE_URL=localhost:50051
USER_SERVICE_URL=localhost:50052
QUEUE_SERVICE_URL=localhost:50053
PAYMENT_SERVICE_URL=localhost:50054
`;
  await fs.writeFile(path.join(servicePath, '.env'), envContent);

  // Create .gitignore
  const gitignoreContent = `node_modules/
.env
dist/
logs/
*.log
.DS_Store
*.pb.js
*.pb.ts
`;
  await fs.writeFile(path.join(servicePath, '.gitignore'), gitignoreContent);
}

async function createProtoFile(servicePath, serviceName, template) {
  let protoContent;
  const serviceNameCamel = serviceName.replace(/-service$/, '');
  const serviceNamePascal = serviceNameCamel
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const context = {
    serviceName: serviceNameCamel,
    serviceNamePascal: serviceNamePascal,
  };

  switch (template) {
    case 'grpc-auth':
      protoContent = Handlebars.compile(protoTemplates.auth)(context);
      break;
    case 'grpc-queue':
      protoContent = Handlebars.compile(protoTemplates.queue)(context);
      break;
    default:
      protoContent = Handlebars.compile(protoTemplates.basic)(context);
  }

  const protoFileName = `${serviceNameCamel}.proto`;
  await fs.writeFile(
    path.join(servicePath, 'src/proto', protoFileName),
    protoContent
  );
}

async function createGrpcFiles(servicePath, serviceName, port, generateClient) {
  const serviceNameCamel = serviceName.replace(/-service$/, '');
  const serviceNamePascal = serviceNameCamel
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Create gRPC server
  const serverContent = `const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
require('dotenv').config();

// Load proto file
const PROTO_PATH = path.join(__dirname, 'proto/${serviceNameCamel}.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const ${serviceNameCamel}Proto = grpc.loadPackageDefinition(packageDefinition).${serviceNameCamel};

// Import service implementation
const ${serviceNameCamel}Service = require('./services/${serviceNameCamel}Service');

class GrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || ${port};
  }

  start() {
    this.server.addService(
      ${serviceNameCamel}Proto.${serviceNamePascal}Service.service,
      new ${serviceNameCamel}Service()
    );

    this.server.bindAsync(
      \`0.0.0.0:\${this.port}\`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to start gRPC server:', error);
          return;
        }
        console.log(\`gRPC server running on port \${port}\`);
        this.server.start();
      }
    );
  }

  stop() {
    this.server.forceShutdown();
  }
}

module.exports = GrpcServer;
`;
  await fs.writeFile(path.join(servicePath, 'src/server.js'), serverContent);

  // Create base service implementation
  const serviceContent = `const grpc = require('@grpc/grpc-js');

class ${serviceNamePascal}Service {
  constructor() {
    // Initialize your service here
  }

  // Example health check method
  healthCheck(call, callback) {
    callback(null, {
      status: 'OK',
      message: 'Service is healthy',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ${serviceNamePascal}Service;
`;
  await fs.writeFile(
    path.join(servicePath, `src/services/${serviceNameCamel}Service.js`),
    serviceContent
  );

  if (generateClient) {
    // Create gRPC client
    const clientContent = `const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class ${serviceNamePascal}Client {
  constructor(serviceUrl = 'localhost:${port}') {
    const PROTO_PATH = path.join(__dirname, '../proto/${serviceNameCamel}.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });

    const ${serviceNameCamel}Proto = grpc.loadPackageDefinition(packageDefinition).${serviceNameCamel};
    this.client = new ${serviceNameCamel}Proto.${serviceNamePascal}Service(
      serviceUrl,
      grpc.credentials.createInsecure()
    );
  }

  healthCheck() {
    return new Promise((resolve, reject) => {
      this.client.healthCheck({}, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Add more client methods as needed

  close() {
    this.client.close();
  }
}

module.exports = ${serviceNamePascal}Client;
`;
    await fs.writeFile(
      path.join(servicePath, `src/client/${serviceNameCamel}Client.js`),
      clientContent
    );
  }
}

async function createDockerfile(servicePath, port) {
  const dockerfileContent = `FROM node:16-alpine

WORKDIR /app

# Install grpc-tools and python for proto compilation
RUN apk add --no-cache python3 make g++ && \
    npm install -g grpc-tools

COPY package*.json ./
RUN npm install --only=production

COPY src/ ./src/
COPY .env ./

# Compile proto files
RUN npm run compile-proto

EXPOSE ${port}

CMD ["npm", "start"]
`;
  await fs.writeFile(path.join(servicePath, 'Dockerfile'), dockerfileContent);
}

// Handle command line arguments
yargs
  .command(
    'generate',
    'Generate a new gRPC microservice',
    () => {},
    generateService
  )
  .command('list', 'List available templates', () => {
    console.log(chalk.blue('\nAvailable gRPC templates:'));
    Object.entries(templates).forEach(([key, template]) => {
      console.log(chalk.green(`  ${key}: ${template.description}`));
    });
  })
  .option('name', {
    alias: 'n',
    description: 'Service name',
    type: 'string',
  })
  .option('template', {
    alias: 't',
    description: 'Template type',
    type: 'string',
  })
  .option('port', {
    alias: 'p',
    description: 'gRPC port',
    type: 'number',
  })
  .demandCommand(1, 'You need to specify a command')
  .help().argv;
