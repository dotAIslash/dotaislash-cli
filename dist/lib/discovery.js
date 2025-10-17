// File: dotaislash-cli/src/lib/discovery.ts
// What: Discover .ai/ folders in filesystem
// Why: Tools must search for .ai/ in current dir, parents, or home
// Related: loader.ts, commands/lint.ts
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { homedir } from 'node:os';
/**
 * Find the .ai/ folder starting from a directory
 * Searches in order: current dir, parent dirs (up to git root), home dir
 * Returns absolute path to .ai/ folder or null if not found
 */
export function findAiFolder(startDir = process.cwd()) {
    let currentDir = resolve(startDir);
    const homeDirectory = homedir();
    // Search upward from start directory
    let searching = true;
    while (searching) {
        const aiPath = join(currentDir, '.ai');
        if (existsSync(aiPath)) {
            return aiPath;
        }
        // Check if we hit git root
        const gitPath = join(currentDir, '.git');
        if (existsSync(gitPath)) {
            // Stop at git root if no .ai/ found
            break;
        }
        // Check if we hit filesystem root
        const parentDir = dirname(currentDir);
        if (parentDir === currentDir) {
            // We've reached the root
            break;
        }
        currentDir = parentDir;
    }
    // Check home directory as fallback
    const homeAiPath = join(homeDirectory, '.ai');
    if (existsSync(homeAiPath)) {
        return homeAiPath;
    }
    return null;
}
/**
 * Check if a directory contains a valid .ai/ folder
 */
export function hasAiFolder(dir) {
    const aiPath = join(dir, '.ai');
    const contextPath = join(aiPath, 'context.json');
    return existsSync(aiPath) && existsSync(contextPath);
}
/**
 * Get the project root directory (contains .ai/ folder)
 */
export function getProjectRoot(aiPath) {
    return dirname(aiPath);
}
//# sourceMappingURL=discovery.js.map