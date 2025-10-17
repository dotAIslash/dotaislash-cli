// File: dotaislash-cli/src/lib/merger.ts
// What: Merge VERSA configurations using different strategies
// Why: Implement deep, shallow, and replace merge modes from spec
// Related: loader.ts, types.ts

import type { Context, Profile } from '@dotaislash/schemas';

/**
 * Merge a profile into a base context using the specified strategy
 */
export function mergeConfigs(base: Context, profile: Profile): Context {
  switch (profile.merge) {
    case 'deep':
      return deepMerge(base, profile);
    case 'shallow':
      return shallowMerge(base, profile);
    case 'replace':
      return replaceMode(profile);
    default:
      throw new Error(`Unknown merge strategy: ${profile.merge}`);
  }
}

/**
 * Deep merge: Recursively merge objects and concatenate arrays
 */
export function deepMerge(base: Context, profile: Profile): Context {
  const result = { ...base };
  
  // Merge each field
  for (const key of Object.keys(profile) as Array<keyof Profile>) {
    if (key === 'version' || key === 'merge') {
      // Skip metadata fields
      continue;
    }
    
    const profileValue = profile[key];
    const baseValue = result[key as keyof Context];
    
    if (profileValue === undefined) {
      // Undefined in profile means keep base value
      continue;
    }
    
    if (profileValue === null) {
      // Null in profile means remove the field
      delete result[key as keyof Context];
      continue;
    }
    
    if (Array.isArray(profileValue)) {
      // Arrays: concatenate
      if (Array.isArray(baseValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any)[key] = [...baseValue, ...profileValue];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any)[key] = [...profileValue];
      }
    } else if (typeof profileValue === 'object' && profileValue !== null) {
      // Objects: recursively merge
      if (typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any)[key] = deepMergeObjects(baseValue as Record<string, unknown>, profileValue as Record<string, unknown>);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any)[key] = profileValue;
      }
    } else {
      // Primitives: override
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = profileValue;
    }
  }
  
  return result;
}

/**
 * Shallow merge: Top-level fields only, arrays replaced
 */
export function shallowMerge(base: Context, profile: Profile): Context {
  const result = { ...base };
  
  for (const key of Object.keys(profile) as Array<keyof Profile>) {
    if (key === 'version' || key === 'merge') {
      continue;
    }
    
    const profileValue = profile[key];
    
    if (profileValue === undefined) {
      continue;
    }
    
    if (profileValue === null) {
      delete result[key as keyof Context];
      continue;
    }
    
    // Shallow: just replace the value (no deep merge, no array concat)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result as any)[key] = profileValue;
  }
  
  return result;
}

/**
 * Replace mode: Ignore base, use profile as complete config
 */
export function replaceMode(profile: Profile): Context {
  const result: Context = {
    version: profile.version || '1.0'
  };
  
  // Copy all fields except merge strategy metadata
  for (const key of Object.keys(profile) as Array<keyof Profile>) {
    if (key === 'merge') {
      continue;
    }
    
    const value = profile[key];
    if (value !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = value;
    }
  }
  
  return result;
}

/**
 * Deep merge two objects recursively
 */
function deepMergeObjects(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };
  
  for (const key of Object.keys(override)) {
    const overrideValue = override[key];
    const baseValue = result[key];
    
    if (overrideValue === undefined) {
      continue;
    }
    
    if (overrideValue === null) {
      delete result[key];
      continue;
    }
    
    if (Array.isArray(overrideValue)) {
      // Arrays: concatenate
      if (Array.isArray(baseValue)) {
        result[key] = [...baseValue, ...overrideValue];
      } else {
        result[key] = [...overrideValue];
      }
    } else if (typeof overrideValue === 'object' && overrideValue !== null) {
      // Objects: recursively merge
      if (typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
        result[key] = deepMergeObjects(baseValue as Record<string, unknown>, overrideValue as Record<string, unknown>);
      } else {
        result[key] = overrideValue;
      }
    } else {
      // Primitives: override
      result[key] = overrideValue;
    }
  }
  
  return result;
}
