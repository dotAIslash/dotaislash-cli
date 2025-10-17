export interface ContextOptions {
    agent?: string;
    profile?: string;
    format?: 'json' | 'yaml';
    filterPriority?: 'low' | 'medium' | 'high' | 'critical';
    filterTags?: string[];
}
/**
 * Assemble and output complete context
 */
export declare function context(targetDir?: string, options?: ContextOptions): Promise<void>;
//# sourceMappingURL=context.d.ts.map