// File: dotaislash-cli/tests/lib/discovery.test.ts
// What: Tests for .ai/ folder discovery
// Why: Ensure discovery logic works correctly
// Related: src/lib/discovery.ts

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { findAiFolder, hasAiFolder, getProjectRoot } from '../../src/lib/discovery.js';

const TEST_DIR = '/tmp/versa-discovery-test';

describe('findAiFolder', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('finds .ai/ in current directory', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    writeFileSync(join(aiPath, 'context.json'), '{"version":"1.0"}');
    
    const result = findAiFolder(TEST_DIR);
    expect(result).toBe(aiPath);
  });
  
  test('finds .ai/ in parent directory', () => {
    const aiPath = join(TEST_DIR, '.ai');
    const subDir = join(TEST_DIR, 'sub');
    
    mkdirSync(aiPath);
    mkdirSync(subDir);
    writeFileSync(join(aiPath, 'context.json'), '{"version":"1.0"}');
    
    const result = findAiFolder(subDir);
    expect(result).toBe(aiPath);
  });
  
  test('returns null when no .ai/ found', () => {
    const result = findAiFolder(TEST_DIR);
    expect(result).toBeNull();
  });
  
  test('stops at git root', () => {
    const gitDir = join(TEST_DIR, '.git');
    const subDir = join(TEST_DIR, 'sub');
    
    mkdirSync(gitDir);
    mkdirSync(subDir);
    
    const result = findAiFolder(subDir);
    expect(result).toBeNull();
  });
});

describe('hasAiFolder', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('returns true when valid .ai/ exists', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    writeFileSync(join(aiPath, 'context.json'), '{"version":"1.0"}');
    
    expect(hasAiFolder(TEST_DIR)).toBe(true);
  });
  
  test('returns false when .ai/ missing', () => {
    expect(hasAiFolder(TEST_DIR)).toBe(false);
  });
  
  test('returns false when context.json missing', () => {
    const aiPath = join(TEST_DIR, '.ai');
    mkdirSync(aiPath);
    
    expect(hasAiFolder(TEST_DIR)).toBe(false);
  });
});

describe('getProjectRoot', () => {
  test('returns parent of .ai/ folder', () => {
    const aiPath = '/path/to/project/.ai';
    const root = getProjectRoot(aiPath);
    expect(root).toBe('/path/to/project');
  });
});
