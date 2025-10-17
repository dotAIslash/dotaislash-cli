// File: dotaislash-cli/tests/lib/loader.test.ts
// What: Tests for configuration loading
// Why: Ensure configs are loaded and validated correctly
// Related: src/lib/loader.ts

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadContext, loadProfile, loadAgent, loadRule } from '../../src/lib/loader.js';

const TEST_DIR = '/tmp/versa-loader-test';

describe('loadContext', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('loads valid context.json', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    const context = {
      version: '1.0',
      rules: ['rules/style.md']
    };
    
    writeFileSync(join(aiPath, 'context.json'), JSON.stringify(context));
    
    const result = loadContext(aiPath);
    expect(result.version).toBe('1.0');
    expect(result.rules).toEqual(['rules/style.md']);
  });
  
  test('throws on missing context.json', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    expect(() => loadContext(aiPath)).toThrow(/not found/);
  });
  
  test('throws on invalid JSON', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    writeFileSync(join(aiPath, 'context.json'), 'invalid json{');
    
    expect(() => loadContext(aiPath)).toThrow(/Failed to parse/);
  });
  
  test('throws on schema validation failure', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    const invalid = { version: '2.0' }; // Wrong version
    writeFileSync(join(aiPath, 'context.json'), JSON.stringify(invalid));
    
    expect(() => loadContext(aiPath)).toThrow(/Invalid context.json/);
  });
});

describe('loadProfile', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('loads valid profile', () => {
    const aiPath = join(TEST_DIR, '.ai');
    const profilesPath = join(aiPath, 'profiles');
    mkdirSync(profilesPath, { recursive: true });
    
    const profile = {
      version: '1.0',
      merge: 'deep',
      rules: ['rules/cursor.md']
    };
    
    writeFileSync(join(profilesPath, 'cursor.json'), JSON.stringify(profile));
    
    const result = loadProfile(aiPath, 'cursor');
    expect(result.merge).toBe('deep');
    expect(result.rules).toEqual(['rules/cursor.md']);
  });
  
  test('throws on missing profile', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    expect(() => loadProfile(aiPath, 'nonexistent')).toThrow(/not found/);
  });
});

describe('loadAgent', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('loads valid agent', () => {
    const aiPath = join(TEST_DIR, '.ai');
    const agentsPath = join(aiPath, 'agents');
    mkdirSync(agentsPath, { recursive: true });
    
    const agent = {
      version: '1.0',
      name: 'Code Reviewer',
      temperature: 0.3
    };
    
    writeFileSync(join(agentsPath, 'reviewer.json'), JSON.stringify(agent));
    
    const result = loadAgent(aiPath, 'reviewer');
    expect(result.name).toBe('Code Reviewer');
    expect(result.temperature).toBe(0.3);
  });
});

describe('loadRule', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('loads rule without front matter', () => {
    const aiPath = join(TEST_DIR, '.ai');
    const rulesPath = join(aiPath, 'rules');
    mkdirSync(rulesPath, { recursive: true });
    
    const content = '# Style Guide\n\nUse tabs for indentation.';
    writeFileSync(join(rulesPath, 'style.md'), content);
    
    const result = loadRule(aiPath, 'rules/style.md');
    expect(result.meta).toBeNull();
    expect(result.content).toBe(content);
  });
  
  test('parses front matter metadata', () => {
    const aiPath = join(TEST_DIR, '.ai');
    const rulesPath = join(aiPath, 'rules');
    mkdirSync(rulesPath, { recursive: true });
    
    const content = `---
ai:meta
  priority: high
  attach: always
---

# Style Guide`;
    
    writeFileSync(join(rulesPath, 'style.md'), content);
    
    const result = loadRule(aiPath, 'rules/style.md');
    expect(result.meta).toBeTruthy();
    expect(result.meta?.priority).toBe('high');
    expect(result.meta?.attach).toBe('always');
  });
});
