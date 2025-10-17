export interface PrintOptions {
    profile?: string;
    pretty?: boolean;
    showMerges?: boolean;
    format?: 'json' | 'yaml' | 'text';
}
/**
 * Print merged configuration
 */
export declare function print(targetDir?: string, options?: PrintOptions): Promise<void>;
//# sourceMappingURL=print.d.ts.map