// File: dotaislash-cli/src/lib/context-builder.ts
// What: Assemble complete context payload for agents
// Why: Load all rules, expand globs, apply filters, merge configs
// Related: loader.ts, merger.ts, formatter.ts

import { resolve } from 'node:path';
import { glob } from 'glob';
import type { Context, RuleMeta } from '@dotaislash/schemas';
import { loadRule } from './loader.js';

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
export function assembleContext(
  aiPath: string,
  config: Context,
  options: AssemblyOptions = {}
): AssembledContext {
  const rules: AssembledContext['rules'] = [];
  const contextFiles: string[] = [];
  
  // Load all rules
  if (config.rules) {
    for (const rulePath of config.rules) {
      try {
        const rule = loadRule(aiPath, rulePath);
        
        // Apply priority filter
        if (options.filterPriority && rule.meta?.priority) {
          const priorities = ['low', 'medium', 'high', 'critical'];
          const minIndex = priorities.indexOf(options.filterPriority);
          const ruleIndex = priorities.indexOf(rule.meta.priority);
          if (ruleIndex < minIndex) {
            continue; // Skip this rule
          }
        }
        
        // Apply tag filter
        if (options.filterTags && rule.meta?.applies_to) {
          const hasMatchingTag = rule.meta.applies_to.some(tag => 
            options.filterTags?.includes(tag)
          );
          if (!hasMatchingTag) {
            continue; // Skip this rule
          }
        }
        
        rules.push({
          path: rulePath,
          meta: rule.meta,
          content: rule.content
        });
      } catch (error) {
        console.warn(`Warning: Could not load rule ${rulePath}: ${(error as Error).message}`);
      }
    }
  }
  
  // Expand context file patterns
  if (config.context) {
    for (const pattern of config.context) {
      try {
        const projectRoot = resolve(aiPath, '..');
        const matches = glob.sync(pattern, {
          cwd: projectRoot,
          absolute: false,
          nodir: true
        });
        contextFiles.push(...matches);
      } catch (error) {
        console.warn(`Warning: Could not expand pattern ${pattern}: ${(error as Error).message}`);
      }
    }
  }
  
  return {
    config,
    rules,
    contextFiles,
    metadata: {
      timestamp: new Date().toISOString(),
      profile: options.profile,
      agent: options.agent
    }
  };
}
