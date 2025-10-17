// File: dotaislash-cli/src/commands/print.ts
// What: Print merged configuration to stdout
// Why: Show final configuration after profile merging
// Related: lib/merger.ts, lib/loader.ts, lib/formatter.ts
import chalk from 'chalk';
import { findAiFolder } from '../lib/discovery.js';
import { loadContext, loadProfile } from '../lib/loader.js';
import { mergeConfigs } from '../lib/merger.js';
import { formatJson, formatYaml, formatText } from '../lib/formatter.js';
/**
 * Print merged configuration
 */
export async function print(targetDir, options = {}) {
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
            if (options.showMerges) {
                console.error(chalk.blue('Merging profile: ') + options.profile);
                console.error(chalk.gray(`Strategy: ${profile.merge}`));
                console.error('');
            }
            config = mergeConfigs(config, profile);
        }
        // Format output
        const format = options.format || 'json';
        const pretty = options.pretty !== false; // Default to true
        let output;
        switch (format) {
            case 'yaml':
                output = formatYaml(config);
                break;
            case 'text':
                output = formatText(config);
                break;
            case 'json':
            default:
                output = formatJson(config, pretty);
                break;
        }
        // Output to stdout
        console.log(output);
    }
    catch (error) {
        console.error(chalk.red('Error: ') + error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=print.js.map