import type { Context, Profile } from '@dotaislash/schemas';
/**
 * Merge a profile into a base context using the specified strategy
 */
export declare function mergeConfigs(base: Context, profile: Profile): Context;
/**
 * Deep merge: Recursively merge objects and concatenate arrays
 */
export declare function deepMerge(base: Context, profile: Profile): Context;
/**
 * Shallow merge: Top-level fields only, arrays replaced
 */
export declare function shallowMerge(base: Context, profile: Profile): Context;
/**
 * Replace mode: Ignore base, use profile as complete config
 */
export declare function replaceMode(profile: Profile): Context;
//# sourceMappingURL=merger.d.ts.map