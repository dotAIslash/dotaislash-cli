// File: dotaislash-cli/tests/lib/merger.test.ts
// What: Tests for configuration merging strategies
// Why: Ensure deep, shallow, and replace merge work correctly
// Related: src/lib/merger.ts

import { describe, test, expect } from 'vitest';
import { mergeConfigs, deepMerge, shallowMerge, replaceMode } from '../../src/lib/merger.js';
import type { Context, Profile } from '@dotaislash/schemas';

describe('Deep Merge Strategy', () => {
  test('concatenates arrays', () => {
    const base: Context = {
      version: '1.0',
      rules: ['rules/a.md', 'rules/b.md']
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'deep',
      rules: ['rules/c.md']
    };
    
    const result = deepMerge(base, profile);
    expect(result.rules).toEqual(['rules/a.md', 'rules/b.md', 'rules/c.md']);
  });
  
  test('recursively merges objects', () => {
    const base: Context = {
      version: '1.0',
      settings: {
        model: 'claude-sonnet-4',
        temperature: 0.7
      }
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'deep',
      settings: {
        temperature: 0.5,
        maxTokens: 4096
      }
    };
    
    const result = deepMerge(base, profile);
    expect(result.settings).toEqual({
      model: 'claude-sonnet-4',
      temperature: 0.5,
      maxTokens: 4096
    });
  });
  
  test('profile overrides base primitives', () => {
    const base: Context = {
      version: '1.0',
      settings: { model: 'gpt-4' }
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'deep',
      settings: { model: 'claude-sonnet-4' }
    };
    
    const result = deepMerge(base, profile);
    expect(result.settings?.model).toBe('claude-sonnet-4');
  });
  
  test('null in profile removes field', () => {
    const base: Context = {
      version: '1.0',
      settings: { model: 'gpt-4', temperature: 0.7 }
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'deep',
      settings: { temperature: null as any }
    };
    
    const result = deepMerge(base, profile);
    expect(result.settings).toEqual({ model: 'gpt-4' });
  });
  
  test('undefined in profile preserves base field', () => {
    const base: Context = {
      version: '1.0',
      settings: { model: 'gpt-4', temperature: 0.7 }
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'deep',
      settings: { temperature: undefined }
    };
    
    const result = deepMerge(base, profile);
    expect(result.settings).toEqual({ model: 'gpt-4', temperature: 0.7 });
  });
});

describe('Shallow Merge Strategy', () => {
  test('replaces arrays instead of concatenating', () => {
    const base: Context = {
      version: '1.0',
      rules: ['rules/a.md', 'rules/b.md']
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'shallow',
      rules: ['rules/c.md']
    };
    
    const result = shallowMerge(base, profile);
    expect(result.rules).toEqual(['rules/c.md']);
  });
  
  test('merges only top-level properties', () => {
    const base: Context = {
      version: '1.0',
      settings: {
        model: 'gpt-4',
        temperature: 0.7
      }
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'shallow',
      settings: {
        temperature: 0.5
      }
    };
    
    const result = shallowMerge(base, profile);
    // Shallow merge replaces entire settings object
    expect(result.settings).toEqual({ temperature: 0.5 });
  });
});

describe('Replace Strategy', () => {
  test('ignores base configuration', () => {
    const base: Context = {
      version: '1.0',
      rules: ['rules/a.md'],
      settings: { model: 'gpt-4' }
    };
    
    const profile: Profile = {
      version: '1.0',
      merge: 'replace',
      rules: ['rules/new.md']
    };
    
    const result = replaceMode(profile);
    expect(result.rules).toEqual(['rules/new.md']);
    expect(result.settings).toBeUndefined();
  });
});

describe('mergeConfigs', () => {
  test('uses correct strategy based on merge field', () => {
    const base: Context = {
      version: '1.0',
      rules: ['base.md']
    };
    
    const deepProfile: Profile = {
      version: '1.0',
      merge: 'deep',
      rules: ['profile.md']
    };
    
    const result = mergeConfigs(base, deepProfile);
    expect(result.rules).toHaveLength(2);
  });
  
  test('throws on invalid merge strategy', () => {
    const base: Context = { version: '1.0' };
    const invalid: any = { version: '1.0', merge: 'invalid' };
    
    expect(() => mergeConfigs(base, invalid)).toThrow();
  });
});
