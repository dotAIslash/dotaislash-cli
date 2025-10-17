// File: dotaislash-cli/tests/commands/lint.test.ts
// What: Tests for versa lint command
// Why: Ensure lint validates configurations correctly
// Related: src/commands/lint.ts

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateAiFolder } from '../../src/lib/validator.js';

const TEST_DIR = '/tmp/versa-lint-test';

describe('lint validation', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('passes for valid configuration', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    const context = { version: '1.0' };
    writeFileSync(join(aiPath, 'context.json'), JSON.stringify(context));
    
    const result = validateAiFolder(aiPath);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
  
  test('reports missing context.json', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    const result = validateAiFolder(aiPath);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.message.includes('context.json'))).toBe(true);
  });
  
  test('reports invalid JSON', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    writeFileSync(join(aiPath, 'context.json'), 'invalid{json');
    
    const result = validateAiFolder(aiPath);
    expect(result.valid).toBe(false);
  });
  
  test('reports missing rule files', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    const context = {
      version: '1.0',
      rules: ['rules/nonexistent.md']
    };
    writeFileSync(join(aiPath, 'context.json'), JSON.stringify(context));
    
    const result = validateAiFolder(aiPath);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.message.includes('not found'))).toBe(true);
  });
  
  test('validates profiles in folder', () => {
    const aiPath = join(TEST_DIR, '.ai');
    const profilesPath = join(aiPath, 'profiles');
    mkdirSync(profilesPath, { recursive: true });
    
    writeFileSync(join(aiPath, 'context.json'), JSON.stringify({ version: '1.0' }));
    
    // Valid profile
    writeFileSync(
      join(profilesPath, 'cursor.json'),
      JSON.stringify({ version: '1.0', merge: 'deep' })
    );
    
    const result = validateAiFolder(aiPath);
    expect(result.valid).toBe(true);
  });
  
  test('reports invalid profiles', () => {
    const aiPath = join(TEST_DIR, '.ai');
    const profilesPath = join(aiPath, 'profiles');
    mkdirSync(profilesPath, { recursive: true });
    
    writeFileSync(join(aiPath, 'context.json'), JSON.stringify({ version: '1.0' }));
    
    // Invalid profile (missing merge)
    writeFileSync(
      join(profilesPath, 'bad.json'),
      JSON.stringify({ version: '1.0' })
    );
    
    const result = validateAiFolder(aiPath);
    expect(result.valid).toBe(false);
  });
});
