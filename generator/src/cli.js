#!/usr/bin/env node

const yargs = require('yargs');
const chalk = require('chalk');
const { generateService } = require('./prompts/servicePrompts');
const { listTemplates } = require('./utils/templateUtils');

yargs
  .command(
    'generate [name]',
    'Generate a new gRPC microservice',
    (yargs) => {
      return yargs
        .positional('name', {
          describe: 'Service name',
          type: 'string',
        })
        .option('template', {
          alias: 't',
          describe: 'Template type',
          choices: [
            'auth',
            'queue',
            'geo',
            'vehicle',
            'payment',
            'config',
            'user',
          ],
          type: 'string',
        })
        .option('port', {
          alias: 'p',
          describe: 'gRPC port',
          type: 'number',
        })
        .option('db', {
          alias: 'd',
          describe: 'Database type',
          choices: ['mongodb', 'postgres', 'redis', 'none'],
          default: 'mongodb',
          type: 'string',
        });
    },
    async (argv) => {
      try {
        await generateService(argv);
      } catch (error) {
        console.error(chalk.red('Error generating service:'), error.message);
        process.exit(1);
      }
    }
  )
  .command(
    'list',
    'List available templates and services',
    () => {},
    () => {
      listTemplates();
    }
  )
  .demandCommand(1, 'You need to specify a command')
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v').argv;
