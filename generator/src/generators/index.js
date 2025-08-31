const AuthGenerator = require('./authGenerator');
const UserGenerator = require('./userGenerator');
const QueueGenerator = require('./queueGenerator');
const GeoGenerator = require('./geoGenerator');
const VehicleGenerator = require('./vehicleGenerator');
const PaymentGenerator = require('./paymentGenerator');
const ConfigGenerator = require('./configGenerator');

async function generateAuthService(name, port, dbType) {
  const generator = new AuthGenerator(name, port, dbType);
  await generator.generate();
}

async function generateUserService(name, port, dbType) {
  const generator = new UserGenerator(name, port, dbType);
  await generator.generate();
}

async function generateQueueService(name, port, dbType) {
  const generator = new QueueGenerator(name, port, dbType);
  await generator.generate();
}

async function generateGeoService(name, port, dbType) {
  const generator = new GeoGenerator(name, port, dbType);
  await generator.generate();
}

async function generateVehicleService(name, port, dbType) {
  const generator = new VehicleGenerator(name, port, dbType);
  await generator.generate();
}

async function generatePaymentService(name, port, dbType) {
  const generator = new PaymentGenerator(name, port, dbType);
  await generator.generate();
}

async function generateConfigService(name, port, dbType) {
  const generator = new ConfigGenerator(name, port, dbType);
  await generator.generate();
}

module.exports = {
  generateAuthService,
  generateUserService,
  generateQueueService,
  generateGeoService,
  generateVehicleService,
  generatePaymentService,
  generateConfigService,
};
