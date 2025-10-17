// File: dotaislash-cli/tests/commands/init.test.ts
// What: Tests for versa init command
// Why: Ensure init creates valid .ai/ folders
// Related: src/commands/init.ts

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { init } from '../../src/commands/init.js';

const TEST_DIR = '/tmp/versa-init-test';

describe('init command', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('creates .ai/ folder', async () => {
    await init(TEST_DIR, { minimal: true });
    
    const aiPath = join(TEST_DIR, '.ai');
    expect(existsSync(aiPath)).toBe(true);
  });
  
  test('creates context.json', async () => {
    await init(TEST_DIR, { minimal: true });
    
    const contextPath = join(TEST_DIR, '.ai', 'context.json');
    expect(existsSync(contextPath)).toBe(true);
    
    const content = JSON.parse(readFileSync(contextPath, 'utf-8'));
    expect(content.version).toBe('1.0');
  });
  
  test('minimal mode creates minimal config', async () => {
    await init(TEST_DIR, { minimal: true });
    
    const contextPath = join(TEST_DIR, '.ai', 'context.json');
    const content = JSON.parse(readFileSync(contextPath, 'utf-8'));
    
    expect(content).toEqual({ version: '1.0' });
  });
  
  test('default mode creates full config', async () => {
    await init(TEST_DIR);
    
    const contextPath = join(TEST_DIR, '.ai', 'context.json');
    const content = JSON.parse(readFileSync(contextPath, 'utf-8'));
    
    expect(content.metadata).toBeDefined();
    expect(content.rules).toBeDefined();
    expect(content.settings).toBeDefined();
  });
  
  test('creates sample rule in default mode', async () => {
    await init(TEST_DIR);
    
    const rulePath = join(TEST_DIR, '.ai', 'rules', 'style.md');
    expect(existsSync(rulePath)).toBe(true);
    
    const content = readFileSync(rulePath, 'utf-8');
    expect(content).toContain('ai:meta');
    expect(content).toContain('priority');
  });
  
  test('creates profile when requested', async () => {
    await init(TEST_DIR, { profile: 'cursor' });
    
    const profilePath = join(TEST_DIR, '.ai', 'profiles', 'cursor.json');
    expect(existsSync(profilePath)).toBe(true);
    
    const content = JSON.parse(readFileSync(profilePath, 'utf-8'));
    expect(content.version).toBe('1.0');
    expect(content.merge).toBeDefined();
  });
});
