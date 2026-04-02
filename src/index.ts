#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { installCommand } from './commands/install.js';
import { envCommand } from './commands/env.js';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('cli-lock')
  .description('Project-local CLI tool package manager')
  .version('0.1.0');

program
  .command('init')
  .description('Interactive setup wizard')
  .option('--yes', 'Accept all defaults')
  .action((options) => {
    initCommand(process.cwd(), options);
  });

program
  .command('install')
  .description('Resolve and install tools from cli-lock.toml')
  .option('--frozen', 'CI mode - fail if lockfile is out of date')
  .action((options) => {
    installCommand(process.cwd(), options);
  });

program
  .command('env')
  .description('Shell activation')
  .option('--hook', 'Auto-activation hook')
  .action((options) => {
    envCommand(process.cwd(), options);
  });

program.parse();
