const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('neq', (a, b) => a !== b);
Handlebars.registerHelper('toUpperCase', (str) => str.toUpperCase());
Handlebars.registerHelper('toPascalCase', (str) => {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
});

// Helper to stringify JSON for templates
Handlebars.registerHelper('json', (context) => {
  return JSON.stringify(context, null, 2);
});

async function compileTemplate(templateName, data) {
  try {
    const templatePath = path.join(__dirname, '../templates', templateName);

    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template file not found: ${templateName}`);
    }

    const templateContent = await fs.readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);
    return template(data);
  } catch (error) {
    throw new Error(
      `Failed to compile template ${templateName}: ${error.message}`
    );
  }
}

function listTemplates() {
  console.log('Available templates:');
  console.log('  package.json.hbs');
  console.log('  dockerfile.hbs');
  console.log('  app.js.hbs');
  console.log(
    '  proto/: auth.proto, user.proto, queue.proto, geo.proto, vehicle.proto, payment.proto, config.proto'
  );
  console.log('  service/: server.js, client.js, service.js');
}

module.exports = { compileTemplate, listTemplates };
