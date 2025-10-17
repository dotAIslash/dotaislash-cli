// File: dotaislash-cli/src/lib/validator.ts
// What: Validate .ai/ folder structure and detect issues
// Why: Ensure configs are valid, check file refs, detect circular deps
// Related: loader.ts, discovery.ts
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadContext, loadProfile, fileExists } from './loader.js';
/**
 * Validate an entire .ai/ folder
 */
export function validateAiFolder(aiPath) {
    const issues = [];
    // Check if .ai/ folder exists
    if (!existsSync(aiPath)) {
        issues.push({
            level: 'error',
            file: aiPath,
            message: '.ai/ folder not found'
        });
        return { valid: false, issues };
    }
    // Check context.json exists
    const contextPath = join(aiPath, 'context.json');
    if (!existsSync(contextPath)) {
        issues.push({
            level: 'error',
            file: 'context.json',
            message: 'Required file context.json not found'
        });
        return { valid: false, issues };
    }
    // Load and validate context.json
    try {
        const context = loadContext(aiPath);
        // Check file references
        const fileIssues = checkFileReferences(context, aiPath);
        issues.push(...fileIssues);
        // Check for circular dependencies
        const circularDeps = checkCircularDeps();
        if (circularDeps.length > 0) {
            issues.push({
                level: 'error',
                file: 'context.json',
                message: `Circular dependencies detected: ${circularDeps.join(' -> ')}`
            });
        }
    }
    catch (error) {
        issues.push({
            level: 'error',
            file: 'context.json',
            message: error.message
        });
        return { valid: false, issues };
    }
    // Validate profiles if they exist
    const profilesDir = join(aiPath, 'profiles');
    if (existsSync(profilesDir)) {
        try {
            const profiles = readdirSync(profilesDir).filter(f => f.endsWith('.json'));
            for (const profileFile of profiles) {
                try {
                    const profileName = profileFile.replace('.json', '');
                    loadProfile(aiPath, profileName);
                }
                catch (error) {
                    issues.push({
                        level: 'error',
                        file: `profiles/${profileFile}`,
                        message: error.message
                    });
                }
            }
        }
        catch (error) {
            issues.push({
                level: 'warning',
                file: 'profiles/',
                message: `Could not read profiles directory: ${error.message}`
            });
        }
    }
    const hasErrors = issues.some(i => i.level === 'error');
    return { valid: !hasErrors, issues };
}
/**
 * Check that all file references in config actually exist
 */
export function checkFileReferences(config, aiPath) {
    const issues = [];
    // Check rules files
    if (config.rules) {
        for (const rule of config.rules) {
            if (!fileExists(aiPath, rule)) {
                issues.push({
                    level: 'error',
                    file: 'context.json',
                    message: `Rule file not found: ${rule}`
                });
            }
        }
    }
    // Check agent files
    if (config.agents) {
        for (const agent of config.agents) {
            if (!fileExists(aiPath, agent)) {
                issues.push({
                    level: 'error',
                    file: 'context.json',
                    message: `Agent file not found: ${agent}`
                });
            }
        }
    }
    // Check prompt files
    if (config.prompts) {
        for (const prompt of config.prompts) {
            if (!fileExists(aiPath, prompt)) {
                issues.push({
                    level: 'error',
                    file: 'context.json',
                    message: `Prompt file not found: ${prompt}`
                });
            }
        }
    }
    // Check tool files
    if (config.tools) {
        for (const tool of config.tools) {
            if (!fileExists(aiPath, tool)) {
                issues.push({
                    level: 'error',
                    file: 'context.json',
                    message: `Tool file not found: ${tool}`
                });
            }
        }
    }
    // Check knowledge files
    if (config.knowledge) {
        for (const knowledge of config.knowledge) {
            if (!fileExists(aiPath, knowledge)) {
                issues.push({
                    level: 'error',
                    file: 'context.json',
                    message: `Knowledge file not found: ${knowledge}`
                });
            }
        }
    }
    return issues;
}
/**
 * Detect circular dependencies (simplified implementation)
 */
export function checkCircularDeps() {
    // For now, return empty array
    // Full implementation would track agent -> agent references, etc.
    return [];
}
//# sourceMappingURL=validator.js.map