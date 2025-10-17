import type { Context, RuleMeta } from '@dotaislash/schemas';
export interface AssemblyOptions {
    profile?: string;
    agent?: string;
    filterPriority?: 'low' | 'medium' | 'high' | 'critical';
    filterTags?: string[];
}
export interface AssembledContext {
    config: Context;
    rules: Array<{
        path: string;
        meta: RuleMeta | null;
        content: string;
    }>;
    contextFiles: string[];
    metadata: {
        timestamp: string;
        profile?: string;
        agent?: string;
    };
}
/**
 * Assemble complete context from configuration
 */
export declare function assembleContext(aiPath: string, config: Context, options?: AssemblyOptions): AssembledContext;
//# sourceMappingURL=context-builder.d.ts.map