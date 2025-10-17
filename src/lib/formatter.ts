// File: dotaislash-cli/src/lib/formatter.ts
// What: Format output in different formats (JSON, YAML, text)
// Why: Support multiple output formats for different use cases
// Related: context-builder.ts, commands/print.ts

import { stringify as yamlStringify } from 'yaml';
import type { Context } from '@dotaislash/schemas';

/**
 * Format data as JSON
 */
export function formatJson(data: unknown, pretty: boolean = true): string {
  if (pretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * Format data as YAML
 */
export function formatYaml(data: unknown): string {
  return yamlStringify(data, {
    indent: 2,
    lineWidth: 0
  });
}

/**
 * Format data as human-readable text
 */
export function formatText(data: Context): string {
  const lines: string[] = [];
  
  lines.push('VERSA Configuration');
  lines.push('===================');
  lines.push('');
  lines.push(`Version: ${data.version}`);
  
  if (data.metadata) {
    lines.push('');
    lines.push('Metadata:');
    if (data.metadata.name) lines.push(`  Name: ${data.metadata.name}`);
    if (data.metadata.description) lines.push(`  Description: ${data.metadata.description}`);
    if (data.metadata.author) lines.push(`  Author: ${data.metadata.author}`);
  }
  
  if (data.rules && data.rules.length > 0) {
    lines.push('');
    lines.push(`Rules (${data.rules.length}):`);
    data.rules.forEach(rule => lines.push(`  - ${rule}`));
  }
  
  if (data.context && data.context.length > 0) {
    lines.push('');
    lines.push(`Context Patterns (${data.context.length}):`);
    data.context.forEach(pattern => lines.push(`  - ${pattern}`));
  }
  
  if (data.agents && data.agents.length > 0) {
    lines.push('');
    lines.push(`Agents (${data.agents.length}):`);
    data.agents.forEach(agent => lines.push(`  - ${agent}`));
  }
  
  if (data.settings) {
    lines.push('');
    lines.push('Settings:');
    if (data.settings.model) lines.push(`  Model: ${data.settings.model}`);
    if (data.settings.temperature !== undefined) lines.push(`  Temperature: ${data.settings.temperature}`);
    if (data.settings.maxTokens) lines.push(`  Max Tokens: ${data.settings.maxTokens}`);
  }
  
  if (data.permissions) {
    lines.push('');
    lines.push('Permissions:');
    if (data.permissions.files) {
      lines.push('  Files:');
      if (data.permissions.files.read) {
        lines.push(`    Read: ${data.permissions.files.read.length} patterns`);
      }
      if (data.permissions.files.write) {
        lines.push(`    Write: ${data.permissions.files.write.length} patterns`);
      }
      if (data.permissions.files.deny) {
        lines.push(`    Deny: ${data.permissions.files.deny.length} patterns`);
      }
    }
  }
  
  return lines.join('\n');
}
