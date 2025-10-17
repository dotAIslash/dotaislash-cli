// File: dotaislash-cli/src/index.ts
// What: Main entry point for programmatic API
// Why: Export all functions for library use
// Related: commands/*.ts, lib/*.ts

// Export commands
export { init } from './commands/init.js';
export { lint } from './commands/lint.js';
export { print } from './commands/print.js';
export { context } from './commands/context.js';

// Export library functions
export { findAiFolder, hasAiFolder, getProjectRoot } from './lib/discovery.js';
export { loadContext, loadProfile, loadAgent, loadRule, fileExists } from './lib/loader.js';
export { mergeConfigs, deepMerge, shallowMerge, replaceMode } from './lib/merger.js';
export { validateAiFolder, checkFileReferences, checkCircularDeps } from './lib/validator.js';
export { assembleContext } from './lib/context-builder.js';
export { formatJson, formatYaml, formatText } from './lib/formatter.js';

// Re-export types from schemas
export type { Context, Profile, Agent, RuleMeta, Settings, Permissions } from '@dotaislash/schemas';
