// File: dotaislash-cli/tests/integration/e2e.test.ts
// What: End-to-end integration tests for complete workflows
// Why: Test realistic usage scenarios with examples
// Related: src/commands/*.ts, examples/*

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { init } from '../../src/commands/init.js';
import { validateAiFolder } from '../../src/lib/validator.js';
import { loadContext, loadProfile } from '../../src/lib/loader.js';
import { mergeConfigs } from '../../src/lib/merger.js';

const TEST_DIR = '/tmp/versa-e2e-test';

describe('E2E: Complete Workflows', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('init → lint → load → merge workflow', async () => {
    // 1. Initialize
    await init(TEST_DIR, { profile: 'cursor' });
    
    const aiPath = join(TEST_DIR, '.ai');
    expect(existsSync(aiPath)).toBe(true);
    
    // 2. Validate
    const validation = validateAiFolder(aiPath);
    expect(validation.valid).toBe(true);
    
    // 3. Load context
    const context = loadContext(aiPath);
    expect(context.version).toBe('1.0');
    
    // 4. Load and merge profile
    const profile = loadProfile(aiPath, 'cursor');
    const merged = mergeConfigs(context, profile);
    
    expect(merged.version).toBe('1.0');
    expect(merged.settings).toBeDefined();
  });
  
  test('minimal init creates valid config', async () => {
    await init(TEST_DIR, { minimal: true });
    
    const aiPath = join(TEST_DIR, '.ai');
    const validation = validateAiFolder(aiPath);
    
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });
  
  test('full init with profile creates valid config', async () => {
    await init(TEST_DIR, { profile: 'windsurf' });
    
    const aiPath = join(TEST_DIR, '.ai');
    
    // Should have context, rules, and profile
    expect(existsSync(join(aiPath, 'context.json'))).toBe(true);
    expect(existsSync(join(aiPath, 'rules'))).toBe(true);
    expect(existsSync(join(aiPath, 'profiles', 'windsurf.json'))).toBe(true);
    
    // Should validate
    const validation = validateAiFolder(aiPath);
    expect(validation.valid).toBe(true);
  });
});

describe('E2E: Real Examples Integration', () => {
  const EXAMPLES_DIR = '/var/www/dotAIslash/dotaislash-examples/examples';
  
  test('typescript-project example is valid', () => {
    const aiPath = join(EXAMPLES_DIR, 'typescript-project', '.ai');
    
    if (!existsSync(aiPath)) {
      // Skip if example doesn't exist yet
      return;
    }
    
    const validation = validateAiFolder(aiPath);
    expect(validation.valid).toBe(true);
  });
  
  test('minimal example is valid', () => {
    const aiPath = join(EXAMPLES_DIR, 'minimal', '.ai');
    
    if (!existsSync(aiPath)) {
      return;
    }
    
    const validation = validateAiFolder(aiPath);
    expect(validation.valid).toBe(true);
  });
  
  test('can load and merge all example profiles', () => {
    const exampleDirs = [
      'minimal',
      'quick-start',
      'typescript-project'
    ];
    
    for (const exampleName of exampleDirs) {
      const aiPath = join(EXAMPLES_DIR, exampleName, '.ai');
      
      if (!existsSync(aiPath)) {
        continue;
      }
      
      const context = loadContext(aiPath);
      expect(context.version).toBe('1.0');
      
      // Try loading cursor profile if it exists
      const cursorPath = join(aiPath, 'profiles', 'cursor.json');
      if (existsSync(cursorPath)) {
        const profile = loadProfile(aiPath, 'cursor');
        const merged = mergeConfigs(context, profile);
        expect(merged.version).toBe('1.0');
      }
    }
  });
});
