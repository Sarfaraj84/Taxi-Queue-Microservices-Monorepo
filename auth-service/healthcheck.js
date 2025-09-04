// healthcheck.js
const { exec } = require('child_process');

// Check if Redis is responding
exec('redis-cli ping', (error, stdout /*, stderr */) => {
  if (error || !stdout.includes('PONG')) {
    process.exit(1);
  }
  process.exit(0);
});
