// File: dotaislash-cli/src/lib/context-builder.ts
// What: Assemble complete context payload for agents
// Why: Load all rules, expand globs, apply filters, merge configs
// Related: loader.ts, merger.ts, formatter.ts
import { resolve } from 'node:path';
import { glob } from 'glob';
import { loadRule } from './loader.js';
/**
 * Assemble complete context from configuration
 */
export function assembleContext(aiPath, config, options = {}) {
    const rules = [];
    const contextFiles = [];
    // Load all rules
    if (config.rules) {
        for (const rulePath of config.rules) {
            try {
                const rule = loadRule(aiPath, rulePath);
                // Apply priority filter
                if (options.filterPriority && rule.meta?.priority) {
                    const priorities = ['low', 'medium', 'high', 'critical'];
                    const minIndex = priorities.indexOf(options.filterPriority);
                    const ruleIndex = priorities.indexOf(rule.meta.priority);
                    if (ruleIndex < minIndex) {
                        continue; // Skip this rule
                    }
                }
                // Apply tag filter
                if (options.filterTags && rule.meta?.applies_to) {
                    const hasMatchingTag = rule.meta.applies_to.some(tag => options.filterTags?.includes(tag));
                    if (!hasMatchingTag) {
                        continue; // Skip this rule
                    }
                }
                rules.push({
                    path: rulePath,
                    meta: rule.meta,
                    content: rule.content
                });
            }
            catch (error) {
                console.warn(`Warning: Could not load rule ${rulePath}: ${error.message}`);
            }
        }
    }
    // Expand context file patterns
    if (config.context) {
        for (const pattern of config.context) {
            try {
                const projectRoot = resolve(aiPath, '..');
                const matches = glob.sync(pattern, {
                    cwd: projectRoot,
                    absolute: false,
                    nodir: true
                });
                contextFiles.push(...matches);
            }
            catch (error) {
                console.warn(`Warning: Could not expand pattern ${pattern}: ${error.message}`);
            }
        }
    }
    return {
        config,
        rules,
        contextFiles,
        metadata: {
            timestamp: new Date().toISOString(),
            profile: options.profile,
            agent: options.agent
        }
    };
}
//# sourceMappingURL=context-builder.js.map