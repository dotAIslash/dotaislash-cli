// File: dotaislash-cli/src/lib/validator.ts
// What: Validate .ai/ folder structure and detect issues
// Why: Ensure configs are valid, check file refs, detect circular deps
// Related: loader.ts, discovery.ts

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Context, Profile } from '@dotaislash/schemas';
import { validateAgent, validateKnowledge, validateMemory, validateRuleMeta, validateTool } from '@dotaislash/schemas';
import { loadContext, loadProfile, fileExists } from './loader.js';

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
export function validateAiFolder(aiPath: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Check if .ai/ folder exists
  if (!existsSync(aiPath)) {
    issues.push({
      level: 'error',
      file: aiPath,
      message: '.ai/ folder not found'
    });
    return { valid: false, issues };
  }
  
  // Check context.json exists
  const contextPath = join(aiPath, 'context.json');
  if (!existsSync(contextPath)) {
    issues.push({
      level: 'error',
      file: 'context.json',
      message: 'Required file context.json not found'
    });
    return { valid: false, issues };
  }
  
  // Load and validate context.json
  try {
    const context = loadContext(aiPath);
    
    // Check file references
    const fileIssues = checkFileReferences(context, aiPath);
    issues.push(...fileIssues);

    // Validate referenced files
    issues.push(...validateReferencedFiles(context, aiPath));
    issues.push(...validateMarkdownMetaFiles(context, aiPath));
    
    // Check for circular dependencies
    const circularDeps = checkCircularDeps(aiPath);
    if (circularDeps.length > 0) {
      issues.push({
        level: 'error',
        file: 'agents/',
        message: `Circular dependencies detected: ${circularDeps.join(' -> ')}`
      });
    }
  } catch (error) {
    issues.push({
      level: 'error',
      file: 'context.json',
      message: (error as Error).message
    });
    return { valid: false, issues };
  }
  
  // Validate profiles if they exist
  const profilesDir = join(aiPath, 'profiles');
  if (existsSync(profilesDir)) {
    try {
      const profiles = readdirSync(profilesDir).filter(f => f.endsWith('.json'));
      for (const profileFile of profiles) {
        try {
          const profileName = profileFile.replace('.json', '');
          const profile = loadProfile(aiPath, profileName);
          issues.push(...checkFileReferences(profile, aiPath));
          issues.push(...validateReferencedFiles(profile, aiPath));
          issues.push(...validateMarkdownMetaFiles(profile, aiPath));
        } catch (error) {
          issues.push({
            level: 'error',
            file: `profiles/${profileFile}`,
            message: (error as Error).message
          });
        }
      }
    } catch (error) {
      issues.push({
        level: 'warning',
        file: 'profiles/',
        message: `Could not read profiles directory: ${(error as Error).message}`
      });
    }
  }
  
  // Validate memory policies if present
  issues.push(...validateMemoryPolicies(aiPath));

  const hasErrors = issues.some(i => i.level === 'error');
  return { valid: !hasErrors, issues };
}

/**
 * Check that all file references in config actually exist
 */
export function checkFileReferences(config: Context | Profile, aiPath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check rules files
  if (config.rules) {
    for (const rule of config.rules) {
      if (!fileExists(aiPath, rule)) {
        issues.push({
          level: 'error',
          file: 'context.json',
          message: `Rule file not found: ${rule}`
        });
      }
    }
  }
  
  // Check agent files
  if (config.agents) {
    for (const agent of config.agents) {
      if (!fileExists(aiPath, agent)) {
        issues.push({
          level: 'error',
          file: 'context.json',
          message: `Agent file not found: ${agent}`
        });
      }
    }
  }
  
  // Check prompt files
  if (config.prompts) {
    for (const prompt of config.prompts) {
      if (!fileExists(aiPath, prompt)) {
        issues.push({
          level: 'error',
          file: 'context.json',
          message: `Prompt file not found: ${prompt}`
        });
      }
    }
  }
  
  // Check tool files
  if (config.tools) {
    for (const tool of config.tools) {
      if (!fileExists(aiPath, tool)) {
        issues.push({
          level: 'error',
          file: 'context.json',
          message: `Tool file not found: ${tool}`
        });
      }
    }
  }
  
  // Check knowledge files
  if (config.knowledge) {
    for (const knowledge of config.knowledge) {
      if (!fileExists(aiPath, knowledge)) {
        issues.push({
          level: 'error',
          file: 'context.json',
          message: `Knowledge file not found: ${knowledge}`
        });
      }
    }
  }
  
  return issues;
}

/**
 * Validate referenced JSON files (agents/tools/knowledge) against schemas
 */
function validateReferencedFiles(config: Context | Profile, aiPath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Agents
  if (config.agents) {
    for (const agentPath of config.agents) {
      const agentIssues = validateJsonSchemaFile(aiPath, agentPath, validateAgent, 'agent');
      issues.push(...agentIssues);
    }
  }

  // Tools
  if (config.tools) {
    for (const toolPath of config.tools) {
      const toolIssues = validateJsonSchemaFile(aiPath, toolPath, validateTool, 'tool configuration');
      issues.push(...toolIssues);
    }
  }

  // Knowledge
  if (config.knowledge) {
    for (const knowledgePath of config.knowledge) {
      const knowledgeIssues = validateJsonSchemaFile(aiPath, knowledgePath, validateKnowledge, 'knowledge configuration');
      issues.push(...knowledgeIssues);
    }
  }

  return issues;
}

/**
 * Validate Markdown front matter for rules and prompts
 */
function validateMarkdownMetaFiles(config: Context | Profile, aiPath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (config.rules) {
    for (const rulePath of config.rules) {
      issues.push(...validateMarkdownMeta(aiPath, rulePath));
    }
  }

  if (config.prompts) {
    for (const promptPath of config.prompts) {
      issues.push(...validateMarkdownMeta(aiPath, promptPath));
    }
  }

  return issues;
}

/**
 * Validate memory policy files in .ai/memory
 */
function validateMemoryPolicies(aiPath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const memoryDir = join(aiPath, 'memory');

  if (!existsSync(memoryDir)) {
    return issues;
  }

  try {
    const memoryFiles = readdirSync(memoryDir).filter(f => f.endsWith('.json'));
    for (const memoryFile of memoryFiles) {
      const relPath = join('memory', memoryFile).replace(/\\/g, '/');
      const memoryIssues = validateJsonSchemaFile(aiPath, relPath, validateMemory, 'memory policy');
      issues.push(...memoryIssues);
    }
  } catch (error) {
    issues.push({
      level: 'warning',
      file: 'memory/',
      message: `Could not read memory directory: ${(error as Error).message}`
    });
  }

  return issues;
}

function validateJsonSchemaFile(
  aiPath: string,
  relativePath: string,
  validator: (data: unknown) => { valid: boolean; errors: Array<{ instancePath: string; message?: string }> },
  label: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fullPath = resolve(aiPath, relativePath);

  if (!existsSync(fullPath)) {
    return issues;
  }

  let data: unknown;
  try {
    data = JSON.parse(readFileSync(fullPath, 'utf-8'));
  } catch (error) {
    issues.push({
      level: 'error',
      file: relativePath,
      message: `Failed to parse ${label} JSON: ${(error as Error).message}`
    });
    return issues;
  }

  const result = validator(data);
  if (!result.valid) {
    const details = result.errors
      .map(e => `${e.instancePath || '/'}: ${e.message || 'invalid'}`)
      .join('; ');
    issues.push({
      level: 'error',
      file: relativePath,
      message: `Invalid ${label}: ${details}`
    });
  }

  return issues;
}

function validateMarkdownMeta(aiPath: string, relativePath: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fullPath = resolve(aiPath, relativePath);

  if (!existsSync(fullPath)) {
    return issues;
  }

  let content: string;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch (error) {
    issues.push({
      level: 'error',
      file: relativePath,
      message: `Failed to read markdown file: ${(error as Error).message}`
    });
    return issues;
  }

  const frontMatterRegex = /^---\s*\nai:meta\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontMatterRegex);
  if (!match) {
    return issues;
  }

  let meta: unknown;
  try {
    meta = parseYaml(normalizeYamlIndent(match[1]));
  } catch (error) {
    issues.push({
      level: 'error',
      file: relativePath,
      message: `Invalid ai:meta front matter: ${(error as Error).message}`
    });
    return issues;
  }

  const result = validateRuleMeta(meta);
  if (!result.valid) {
    const details = result.errors
      .map(e => `${e.instancePath || '/'}: ${e.message || 'invalid'}`)
      .join('; ');
    issues.push({
      level: 'error',
      file: relativePath,
      message: `Invalid ai:meta front matter: ${details}`
    });
  }

  return issues;
}

function normalizeYamlIndent(content: string): string {
  const lines = content.split('\n');
  const indents = lines
    .filter(line => line.trim().length > 0)
    .map(line => line.match(/^ */)?.[0].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
  if (minIndent === 0) {
    return content;
  }
  return lines.map(line => line.slice(minIndent)).join('\n');
}

/**
 * Detect circular dependencies (simplified implementation)
 */
export function checkCircularDeps(aiPath: string): string[] {
  const agentsDir = join(aiPath, 'agents');
  if (!existsSync(agentsDir)) {
    return [];
  }

  let agentFiles: string[] = [];
  try {
    agentFiles = readdirSync(agentsDir).filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }

  const graph = new Map<string, string[]>();
  const normalizeAgentPath = (value: string): string => {
    const normalized = value.replace(/\\/g, '/');
    if (normalized.startsWith('agents/')) {
      return normalized;
    }
    if (!normalized.includes('/')) {
      return `agents/${normalized}`;
    }
    return normalized;
  };

  for (const file of agentFiles) {
    const relativePath = `agents/${file}`;
    const fullPath = join(agentsDir, file);
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(fullPath, 'utf-8'));
    } catch {
      graph.set(relativePath, []);
      continue;
    }

    const deps = (data as { agents?: unknown }).agents;
    if (Array.isArray(deps)) {
      const normalizedDeps = deps
        .filter((entry): entry is string => typeof entry === 'string')
        .map(normalizeAgentPath);
      graph.set(relativePath, normalizedDeps);
    } else {
      graph.set(relativePath, []);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  const dfs = (node: string): string[] | null => {
    visiting.add(node);
    stack.push(node);

    const deps = graph.get(node) ?? [];
    for (const dep of deps) {
      if (!graph.has(dep)) {
        continue;
      }
      if (visiting.has(dep)) {
        const startIndex = stack.indexOf(dep);
        return [...stack.slice(startIndex), dep];
      }
      if (!visited.has(dep)) {
        const cycle = dfs(dep);
        if (cycle) {
          return cycle;
        }
      }
    }

    visiting.delete(node);
    visited.add(node);
    stack.pop();
    return null;
  };

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      const cycle = dfs(node);
      if (cycle) {
        return cycle;
      }
    }
  }

  return [];
}
