#!/usr/bin/env node
// File: dotaislash-cli/src/bin.ts
// What: CLI entry point with command definitions
// Why: Provide user-facing CLI for VERSA operations
// Related: commands/*.ts

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { lint } from './commands/lint.js';
import { print } from './commands/print.js';
import { context } from './commands/context.js';

const program = new Command();

program
  .name('versa')
  .description('CLI for VERSA - Vendor-neutral Extensible Repo Spec for Agents')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize a new .ai/ folder')
  .option('-m, --minimal', 'Create minimal configuration')
  .option('-t, --template <name>', 'Use a template')
  .option('-p, --profile <name>', 'Create a profile')
  .action(async (options) => {
    try {
      await init(process.cwd(), options);
    } catch (error) {
      console.error(chalk.red('Error: ') + (error as Error).message);
      process.exit(1);
    }
  });

// Lint command
program
  .command('lint')
  .description('Validate .ai/ folder configuration')
  .option('--fix', 'Attempt to fix issues automatically')
  .option('--strict', 'Fail on warnings')
  .argument('[dir]', 'Directory containing .ai/ folder')
  .action(async (dir) => {
    try {
      await lint(dir);
    } catch (error) {
      console.error(chalk.red('Error: ') + (error as Error).message);
      process.exit(1);
    }
  });

// Print command
program
  .command('print')
  .description('Print merged configuration')
  .option('--profile <name>', 'Profile to merge')
  .option('--no-pretty', 'Disable pretty printing')
  .option('--show-merges', 'Show merge details')
  .option('--format <format>', 'Output format (json, yaml, text)', 'json')
  .argument('[dir]', 'Directory containing .ai/ folder')
  .action(async (dir, options) => {
    try {
      await print(dir, options);
    } catch (error) {
      console.error(chalk.red('Error: ') + (error as Error).message);
      process.exit(1);
    }
  });

// Context command
program
  .command('context')
  .description('Assemble complete context payload')
  .option('--agent <name>', 'Agent to use')
  .option('--profile <name>', 'Profile to merge')
  .option('--format <format>', 'Output format (json, yaml)', 'json')
  .option('--priority <level>', 'Filter by minimum priority (low, medium, high, critical)')
  .option('--tags <tags>', 'Filter by tags (comma-separated)')
  .argument('[dir]', 'Directory containing .ai/ folder')
  .action(async (dir, options) => {
    try {
      // Parse tags if provided
      if (options.tags) {
        options.filterTags = options.tags.split(',').map((t: string) => t.trim());
      }
      
      await context(dir, options);
    } catch (error) {
      console.error(chalk.red('Error: ') + (error as Error).message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
