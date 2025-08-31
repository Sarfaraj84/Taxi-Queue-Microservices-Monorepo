const BaseGenerator = require('./baseGenerator');

class PaymentGenerator extends BaseGenerator {
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
    // Service-specific additional file creation
    // e.g., special configuration, unique models, etc.
  }

  async initializeSampleData() {
    // Service-specific data initialization
  }

  async setupSpecialDependencies() {
    // Service-specific dependency setup
  }
}
module.exports = PaymentGenerator;
