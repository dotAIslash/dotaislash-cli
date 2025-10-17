/**
 * Find the .ai/ folder starting from a directory
 * Searches in order: current dir, parent dirs (up to git root), home dir
 * Returns absolute path to .ai/ folder or null if not found
 */
export declare function findAiFolder(startDir?: string): string | null;
/**
 * Check if a directory contains a valid .ai/ folder
 */
export declare function hasAiFolder(dir: string): boolean;
/**
 * Get the project root directory (contains .ai/ folder)
 */
export declare function getProjectRoot(aiPath: string): string;
//# sourceMappingURL=discovery.d.ts.map