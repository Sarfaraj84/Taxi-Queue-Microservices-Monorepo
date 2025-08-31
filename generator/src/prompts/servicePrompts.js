const inquirer = require('inquirer');
const chalk = require('chalk');
const {
  generateAuthService,
  generateQueueService,
  generateGeoService,
  generateVehicleService,
  generatePaymentService,
  generateConfigService,
  generateUserService,
} = require('../generators');
const {
  validateServiceName,
  validatePort,
} = require('../utils/validationUtils');

async function generateService(options = {}) {
  let answers = { ...options };

  // If not provided via CLI flags, prompt for missing information
  if (!answers.name) {
    const nameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Service name (e.g., auth-service, geo-service):',
        validate: validateServiceName,
      },
    ]);
    answers = { ...answers, ...nameAnswer };
  }

  if (!answers.template) {
    const templateAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Choose service type:',
        choices: [
          {
            name: 'Auth Service - Authentication & authorization',
            value: 'auth',
          },
          { name: 'User Service - User management', value: 'user' },
          { name: 'Queue Service - Taxi queue management', value: 'queue' },
          { name: 'Geo Service - Location & geofencing', value: 'geo' },
          { name: 'Vehicle Service - Vehicle management', value: 'vehicle' },
          { name: 'Payment Service - Payment processing', value: 'payment' },
          { name: 'Config Service - System configuration', value: 'config' },
        ],
      },
    ]);
    answers = { ...answers, ...templateAnswer };
  }

  if (!answers.port) {
    const portAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'port',
        message: 'gRPC server port:',
        default: getDefaultPort(answers.template),
        validate: validatePort,
      },
    ]);
    answers = { ...answers, ...portAnswer };
  }

  if (!answers.db) {
    const dbAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'db',
        message: 'Database type:',
        choices: [
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'PostgreSQL (with PostGIS)', value: 'postgres' },
          { name: 'Redis', value: 'redis' },
          { name: 'None', value: 'none' },
        ],
        default: getDefaultDatabase(answers.template),
      },
    ]);
    answers = { ...answers, ...dbAnswer };
  }

  // Generate the specific service
  await generateSpecificService(answers);
}

function getDefaultPort(template) {
  const portMap = {
    auth: '50051',
    user: '50052',
    queue: '50053',
    geo: '50054',
    vehicle: '50055',
    payment: '50056',
    config: '50057',
  };
  return portMap[template] || '50051';
}

function getDefaultDatabase(template) {
  const dbMap = {
    auth: 'mongodb',
    user: 'mongodb',
    queue: 'mongodb',
    geo: 'postgres', // PostGIS for geospatial data
    vehicle: 'mongodb',
    payment: 'mongodb',
    config: 'mongodb',
  };
  return dbMap[template] || 'mongodb';
}

async function generateSpecificService(options) {
  const { template, name, port, db } = options;

  console.log(chalk.yellow(`\nCreating ${name} (${template} service)...`));

  switch (template) {
    case 'auth':
      await generateAuthService(name, port, db);
      break;
    case 'user':
      await generateUserService(name, port, db);
      break;
    case 'queue':
      await generateQueueService(name, port, db);
      break;
    case 'geo':
      await generateGeoService(name, port, db);
      break;
    case 'vehicle':
      await generateVehicleService(name, port, db);
      break;
    case 'payment':
      await generatePaymentService(name, port, db);
      break;
    case 'config':
      await generateConfigService(name, port, db);
      break;
    default:
      throw new Error(`Unknown service template: ${template}`);
  }
}

module.exports = { generateService };
