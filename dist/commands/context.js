// File: dotaislash-cli/src/commands/context.ts
// What: Assemble and output complete context payload for agents
// Why: Provide full context including rules, files, and merged config
// Related: lib/context-builder.ts, lib/merger.ts
import chalk from 'chalk';
import { findAiFolder } from '../lib/discovery.js';
import { loadContext, loadProfile, loadAgent } from '../lib/loader.js';
import { mergeConfigs } from '../lib/merger.js';
import { assembleContext } from '../lib/context-builder.js';
import { formatJson, formatYaml } from '../lib/formatter.js';
/**
 * Assemble and output complete context
 */
export async function context(targetDir, options = {}) {
    // Find .ai/ folder
    const aiPath = targetDir
        ? `${targetDir}/.ai`
        : findAiFolder();
    if (!aiPath) {
        console.error(chalk.red('Error: No .ai/ folder found'));
        process.exit(1);
    }
    try {
        // Load base context
        let config = loadContext(aiPath);
        // Merge profile if specified
        if (options.profile) {
            const profile = loadProfile(aiPath, options.profile);
            config = mergeConfigs(config, profile);
        }
        // Load agent if specified
        if (options.agent) {
            const agent = loadAgent(aiPath, options.agent);
            // Merge agent settings into config
            if (agent.model)
                config.settings = { ...config.settings, model: agent.model };
            if (agent.temperature !== undefined) {
                config.settings = { ...config.settings, temperature: agent.temperature };
            }
            if (agent.maxTokens) {
                config.settings = { ...config.settings, maxTokens: agent.maxTokens };
            }
            // Add agent rules
            if (agent.rules) {
                config.rules = [...(config.rules || []), ...agent.rules];
            }
            // Add agent tools
            if (agent.tools) {
                config.tools = [...(config.tools || []), ...agent.tools];
            }
        }
        // Assemble complete context
        const assembled = assembleContext(aiPath, config, {
            profile: options.profile,
            agent: options.agent,
            filterPriority: options.filterPriority,
            filterTags: options.filterTags
        });
        // Format output
        const format = options.format || 'json';
        const output = format === 'yaml'
            ? formatYaml(assembled)
            : formatJson(assembled, true);
        // Output to stdout
        console.log(output);
    }
    catch (error) {
        console.error(chalk.red('Error: ') + error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=context.js.map