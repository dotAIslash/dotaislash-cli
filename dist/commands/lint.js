// File: dotaislash-cli/src/commands/lint.ts
// What: Validate .ai/ folder and report errors
// Why: Catch configuration errors before they cause runtime issues
// Related: lib/validator.ts, lib/discovery.ts
import chalk from 'chalk';
import { findAiFolder } from '../lib/discovery.js';
import { validateAiFolder } from '../lib/validator.js';
/**
 * Lint .ai/ folder and report issues
 */
export async function lint(targetDir) {
    // Find .ai/ folder
    const aiPath = targetDir
        ? `${targetDir}/.ai`
        : findAiFolder();
    if (!aiPath) {
        console.error(chalk.red('Error: No .ai/ folder found'));
        console.error(chalk.yellow('Run ' + chalk.cyan('versa init') + ' to create one'));
        process.exit(1);
    }
    console.log(chalk.blue('Validating VERSA configuration...'));
    console.log(chalk.gray(`Location: ${aiPath}`));
    console.log('');
    // Validate
    const result = validateAiFolder(aiPath);
    if (result.issues.length === 0) {
        console.log(chalk.green('✓ No issues found'));
        console.log('');
        process.exit(0);
    }
    // Report issues
    const errors = result.issues.filter(i => i.level === 'error');
    const warnings = result.issues.filter(i => i.level === 'warning');
    if (errors.length > 0) {
        console.log(chalk.red(`✗ ${errors.length} error(s) found:`));
        console.log('');
        for (const error of errors) {
            console.log(chalk.red('  ✗') + ` ${error.file}`);
            console.log(chalk.gray(`    ${error.message}`));
        }
        console.log('');
    }
    if (warnings.length > 0) {
        console.log(chalk.yellow(`⚠ ${warnings.length} warning(s):`));
        console.log('');
        for (const warning of warnings) {
            console.log(chalk.yellow('  ⚠') + ` ${warning.file}`);
            console.log(chalk.gray(`    ${warning.message}`));
        }
        console.log('');
    }
    // Exit with error if validation failed
    if (!result.valid) {
        process.exit(1);
    }
    process.exit(0);
}
//# sourceMappingURL=lint.js.map