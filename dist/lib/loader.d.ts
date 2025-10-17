import type { Context, Profile, Agent, RuleMeta } from '@dotaislash/schemas';
/**
 * Load and validate context.json
 */
export declare function loadContext(aiPath: string): Context;
/**
 * Load and validate a profile
 */
export declare function loadProfile(aiPath: string, profileName: string): Profile;
/**
 * Load and validate an agent definition
 */
export declare function loadAgent(aiPath: string, agentName: string): Agent;
/**
 * Load a rule file with metadata
 */
export declare function loadRule(aiPath: string, rulePath: string): {
    meta: RuleMeta | null;
    content: string;
};
/**
 * Check if a file exists relative to .ai/ folder
 */
export declare function fileExists(aiPath: string, filePath: string): boolean;
//# sourceMappingURL=loader.d.ts.map