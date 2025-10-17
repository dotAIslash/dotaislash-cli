# Changelog

All notable changes to @dotaislash/cli will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-17

### Added

- Complete CLI implementation for VERSA 1.0
- `versa init` - Initialize new .ai/ folder with scaffolding
  - `--minimal` flag for bare minimum configuration
  - `--profile <name>` to create tool-specific profile
  - Creates context.json, rules/, profiles/ directories
  - Generates sample style.md rule
- `versa lint` - Validate .ai/ folder configuration
  - Validates context.json against schema
  - Checks all file references exist
  - Validates profiles and agents
  - Reports errors and warnings with clear messages
- `versa print` - Print merged configuration
  - `--profile <name>` to merge profile
  - `--format` option (json, yaml, text)
  - `--show-merges` to display merge details
  - Supports pretty and compact JSON output
- `versa context` - Assemble complete context payload
  - Loads all rules with metadata
  - Expands glob patterns for context files
  - Merges agent configurations
  - Filter by priority and tags
  - Output in JSON or YAML
- Library functions for programmatic use
  - `findAiFolder()` - Discover .ai/ folders
  - `loadContext()`, `loadProfile()`, `loadAgent()` - Load configurations
  - `mergeConfigs()` - Implement deep, shallow, replace merge strategies
  - `validateAiFolder()` - Comprehensive validation
  - `assembleContext()` - Build complete context payloads
  - Format helpers for JSON, YAML, and human-readable text

### Technical Details

- Built with Bun 1.3 as primary runtime
- TypeScript 5.8.3 with strict mode
- Commander.js for CLI framework
- Chalk for colored output
- Glob for file pattern expansion
- YAML support for output formatting
- Zero runtime dependencies beyond core libraries
- Full integration with @dotaislash/schemas

### Documentation

- Complete API documentation for all functions
- CLI help for all commands
- Examples for common workflows
- TypeScript type definitions included

[1.0.0]: https://github.com/dotAIslash/dotaislash-cli/releases/tag/v1.0.0
