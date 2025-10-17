// File: dotaislash-cli/src/lib/merger.ts
// What: Merge VERSA configurations using different strategies
// Why: Implement deep, shallow, and replace merge modes from spec
// Related: loader.ts, types.ts
/**
 * Merge a profile into a base context using the specified strategy
 */
export function mergeConfigs(base, profile) {
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
export function deepMerge(base, profile) {
    const result = { ...base };
    // Merge each field
    for (const key of Object.keys(profile)) {
        if (key === 'version' || key === 'merge') {
            // Skip metadata fields
            continue;
        }
        const profileValue = profile[key];
        const baseValue = result[key];
        if (profileValue === undefined) {
            // Undefined in profile means keep base value
            continue;
        }
        if (profileValue === null) {
            // Null in profile means remove the field
            delete result[key];
            continue;
        }
        if (Array.isArray(profileValue)) {
            // Arrays: concatenate
            if (Array.isArray(baseValue)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result[key] = [...baseValue, ...profileValue];
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result[key] = [...profileValue];
            }
        }
        else if (typeof profileValue === 'object' && profileValue !== null) {
            // Objects: recursively merge
            if (typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result[key] = deepMergeObjects(baseValue, profileValue);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result[key] = profileValue;
            }
        }
        else {
            // Primitives: override
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result[key] = profileValue;
        }
    }
    return result;
}
/**
 * Shallow merge: Top-level fields only, arrays replaced
 */
export function shallowMerge(base, profile) {
    const result = { ...base };
    for (const key of Object.keys(profile)) {
        if (key === 'version' || key === 'merge') {
            continue;
        }
        const profileValue = profile[key];
        if (profileValue === undefined) {
            continue;
        }
        if (profileValue === null) {
            delete result[key];
            continue;
        }
        // Shallow: just replace the value (no deep merge, no array concat)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = profileValue;
    }
    return result;
}
/**
 * Replace mode: Ignore base, use profile as complete config
 */
export function replaceMode(profile) {
    const result = {
        version: profile.version || '1.0'
    };
    // Copy all fields except merge strategy metadata
    for (const key of Object.keys(profile)) {
        if (key === 'merge') {
            continue;
        }
        const value = profile[key];
        if (value !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result[key] = value;
        }
    }
    return result;
}
/**
 * Deep merge two objects recursively
 */
function deepMergeObjects(base, override) {
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
            }
            else {
                result[key] = [...overrideValue];
            }
        }
        else if (typeof overrideValue === 'object' && overrideValue !== null) {
            // Objects: recursively merge
            if (typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
                result[key] = deepMergeObjects(baseValue, overrideValue);
            }
            else {
                result[key] = overrideValue;
            }
        }
        else {
            // Primitives: override
            result[key] = overrideValue;
        }
    }
    return result;
}
//# sourceMappingURL=merger.js.map