function validateServiceName(input) {
  if (!input) {
    return 'Service name is required';
  }
  if (!input.includes('-service')) {
    return 'Service name must include "-service" (e.g., auth-service)';
  }
  if (input.length < 5) {
    return 'Service name must be at least 5 characters long';
  }
  if (!/^[a-z0-9-]+$/.test(input)) {
    return 'Service name can only contain lowercase letters, numbers, and hyphens';
  }
  return true;
}

function validatePort(input) {
  const port = parseInt(input);
  if (isNaN(port)) {
    return 'Port must be a number';
  }
  if (port < 1024 || port > 65535) {
    return 'Port must be between 1024 and 65535';
  }
  return true;
}

function validateDatabaseType(input) {
  const validTypes = ['mongodb', 'postgres', 'redis', 'none'];
  if (!validTypes.includes(input)) {
    return `Database type must be one of: ${validTypes.join(', ')}`;
  }
  return true;
}

function validateTemplateType(input) {
  const validTemplates = [
    'auth',
    'user',
    'queue',
    'geo',
    'vehicle',
    'payment',
    'config',
  ];
  if (!validTemplates.includes(input)) {
    return `Template must be one of: ${validTemplates.join(', ')}`;
  }
  return true;
}

module.exports = {
  validateServiceName,
  validatePort,
  validateDatabaseType,
  validateTemplateType,
};
