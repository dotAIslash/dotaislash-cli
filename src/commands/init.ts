// File: dotaislash-cli/src/commands/init.ts
// What: Initialize a new .ai/ folder with default configuration
// Why: Scaffold new VERSA configurations quickly
// Related: lib/loader.ts, lib/validator.ts

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import type { Context } from '@dotaislash/schemas';

export interface InitOptions {
  minimal?: boolean;
  template?: string;
  profile?: string;
}

/**
 * Initialize a new .ai/ folder
 */
export async function init(targetDir: string = process.cwd(), options: InitOptions = {}): Promise<void> {
  const aiPath = join(targetDir, '.ai');
  
  // Check if .ai/ already exists
  if (existsSync(aiPath)) {
    console.error(chalk.red('Error: .ai/ folder already exists'));
    console.error(chalk.yellow('Use --force to overwrite (not implemented)'));
    process.exit(1);
  }
  
  console.log(chalk.blue('Initializing VERSA configuration...'));
  console.log('');
  
  // Create .ai/ directory
  mkdirSync(aiPath, { recursive: true });
  mkdirSync(join(aiPath, 'rules'), { recursive: true });
  mkdirSync(join(aiPath, 'profiles'), { recursive: true });
  
  // Create context.json
  const context: Context = options.minimal 
    ? createMinimalContext()
    : createDefaultContext();
  
  writeFileSync(
    join(aiPath, 'context.json'),
    JSON.stringify(context, null, 2) + '\n'
  );
  
  console.log(chalk.green('✓') + ' Created context.json');
  
  // Create sample rule
  if (!options.minimal) {
    const styleRule = createStyleRule();
    writeFileSync(join(aiPath, 'rules', 'style.md'), styleRule);
    console.log(chalk.green('✓') + ' Created rules/style.md');
  }
  
  // Create profile if requested
  if (options.profile) {
    const profile = createSampleProfile(options.profile);
    writeFileSync(
      join(aiPath, 'profiles', `${options.profile}.json`),
      JSON.stringify(profile, null, 2) + '\n'
    );
    console.log(chalk.green('✓') + ` Created profiles/${options.profile}.json`);
  }
  
  // Success message
  console.log('');
  console.log(chalk.green('✓ Successfully initialized .ai/ folder'));
  console.log('');
  console.log(chalk.bold('Next steps:'));
  console.log('  1. Edit .ai/context.json to configure your project');
  console.log('  2. Add rules to .ai/rules/ folder');
  console.log('  3. Run ' + chalk.cyan('versa lint') + ' to validate your configuration');
  console.log('');
}

/**
 * Create minimal context
 */
function createMinimalContext(): Context {
  return {
    version: '1.0'
  };
}

/**
 * Create default context with useful defaults
 */
function createDefaultContext(): Context {
  return {
    version: '1.0',
    metadata: {
      name: 'My Project',
      description: 'VERSA configuration for my project',
      author: '',
      created: new Date().toISOString().split('T')[0]
    },
    rules: ['rules/style.md'],
    settings: {
      model: 'claude-sonnet-4',
      temperature: 0.7
    }
  };
}

/**
 * Create sample style rule
 */
function createStyleRule(): string {
  return `---
ai:meta
  priority: medium
  attach: always
  scope: global
---

# Code Style Guide

## General Principles

- Write clear, readable code
- Follow consistent naming conventions
- Add comments for non-obvious logic
- Keep functions small and focused

## TypeScript

- Use strict mode
- Prefer \`const\` over \`let\`
- Use descriptive variable names
- Add type annotations for public APIs

## Formatting

- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
`;
}

/**
 * Create sample profile
 */
function createSampleProfile(name: string): unknown {
  return {
    version: '1.0',
    merge: 'deep',
    metadata: {
      name: `${name} Profile`,
      description: `Tool-specific settings for ${name}`
    },
    settings: {
      shortcuts: {
        review: 'agents/code-reviewer.json'
      }
    }
  };
}
