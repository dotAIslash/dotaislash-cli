import type { Context } from '@dotaislash/schemas';
export interface ValidationIssue {
    level: 'error' | 'warning';
    file: string;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
}
/**
 * Validate an entire .ai/ folder
 */
export declare function validateAiFolder(aiPath: string): ValidationResult;
/**
 * Check that all file references in config actually exist
 */
export declare function checkFileReferences(config: Context, aiPath: string): ValidationIssue[];
/**
 * Detect circular dependencies (simplified implementation)
 */
export declare function checkCircularDeps(): string[];
//# sourceMappingURL=validator.d.ts.map