// File: dotaislash-cli/src/lib/loader.ts
// What: Load and parse VERSA configuration files
// Why: Read context.json, profiles, agents, rules with validation
// Related: discovery.ts, validator.ts, types.ts

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Context, Profile, Agent, RuleMeta } from '@dotaislash/schemas';
import { validateContext, validateProfile, validateAgent, validateRuleMeta } from '@dotaislash/schemas';

/**
 * Load and validate context.json
 */
export function loadContext(aiPath: string): Context {
  const contextPath = join(aiPath, 'context.json');
  
  if (!existsSync(contextPath)) {
    throw new Error(`Context file not found: ${contextPath}`);
  }
  
  try {
    const content = readFileSync(contextPath, 'utf-8');
    const data = JSON.parse(content) as unknown;
    
    const result = validateContext(data);
    if (!result.valid) {
      const errors = result.errors.map(e => `  ${e.instancePath}: ${e.message}`).join('\n');
      throw new Error(`Invalid context.json:\n${errors}`);
    }
    
    return data as Context;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse context.json: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load and validate a profile
 */
export function loadProfile(aiPath: string, profileName: string): Profile {
  const profilePath = join(aiPath, 'profiles', `${profileName}.json`);
  
  if (!existsSync(profilePath)) {
    throw new Error(`Profile not found: ${profilePath}`);
  }
  
  try {
    const content = readFileSync(profilePath, 'utf-8');
    const data = JSON.parse(content) as unknown;
    
    const result = validateProfile(data);
    if (!result.valid) {
      const errors = result.errors.map(e => `  ${e.instancePath}: ${e.message}`).join('\n');
      throw new Error(`Invalid profile ${profileName}.json:\n${errors}`);
    }
    
    return data as Profile;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse ${profileName}.json: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load and validate an agent definition
 */
export function loadAgent(aiPath: string, agentName: string): Agent {
  const agentPath = join(aiPath, 'agents', `${agentName}.json`);
  
  if (!existsSync(agentPath)) {
    throw new Error(`Agent not found: ${agentPath}`);
  }
  
  try {
    const content = readFileSync(agentPath, 'utf-8');
    const data = JSON.parse(content) as unknown;
    
    const result = validateAgent(data);
    if (!result.valid) {
      const errors = result.errors.map(e => `  ${e.instancePath}: ${e.message}`).join('\n');
      throw new Error(`Invalid agent ${agentName}.json:\n${errors}`);
    }
    
    return data as Agent;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse ${agentName}.json: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load a rule file with metadata
 */
export function loadRule(aiPath: string, rulePath: string): { meta: RuleMeta | null; content: string } {
  const fullPath = resolve(aiPath, rulePath);
  
  if (!existsSync(fullPath)) {
    throw new Error(`Rule file not found: ${fullPath}`);
  }
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    
    // Parse front matter if present
    const frontMatterRegex = /^---\s*\nai:meta\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      return { meta: null, content };
    }
    
    // Parse YAML-like front matter (simple implementation)
    const metaContent = match[1];
    const meta = parseSimpleYaml(metaContent);
    
    // Validate metadata
    const result = validateRuleMeta(meta);
    if (!result.valid) {
      console.warn(`Warning: Invalid rule metadata in ${rulePath}`);
      return { meta: null, content };
    }
    
    return { meta: meta as RuleMeta, content };
  } catch (error) {
    throw new Error(`Failed to load rule ${rulePath}: ${(error as Error).message}`);
  }
}

/**
 * Simple YAML parser for front matter (only supports basic key-value pairs)
 */
function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();
    
    // Parse value
    if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Simple array parsing
      const arrayContent = value.slice(1, -1);
      result[key] = arrayContent.split(',').map(v => v.trim().replace(/['"]/g, ''));
    } else {
      // String value (remove quotes if present)
      result[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  
  return result;
}

/**
 * Check if a file exists relative to .ai/ folder
 */
export function fileExists(aiPath: string, filePath: string): boolean {
  const fullPath = resolve(aiPath, filePath);
  return existsSync(fullPath);
}
