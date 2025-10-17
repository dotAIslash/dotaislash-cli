export interface InitOptions {
    minimal?: boolean;
    template?: string;
    profile?: string;
}
/**
 * Initialize a new .ai/ folder
 */
export declare function init(targetDir?: string, options?: InitOptions): Promise<void>;
//# sourceMappingURL=init.d.ts.map