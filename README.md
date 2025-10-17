<div align="center">

<img src="logo.png" alt="dotAIslash Logo" width="120" />

# 🔧 VERSA CLI

### Reference Command-Line Tool for the `.ai/` Folder Standard

[![npm](https://img.shields.io/npm/v/@dotaislash/cli?style=for-the-badge&logo=npm&color=violet)](https://www.npmjs.com/package/@dotaislash/cli)
[![License](https://img.shields.io/badge/License-MIT-cyan?style=for-the-badge)](LICENSE)
[![Website](https://img.shields.io/badge/Website-dotaislash.github.io-lime?style=for-the-badge)](https://dotaislash.github.io)

[**Documentation**](https://dotaislash.github.io) · [**VERSA Spec**](https://github.com/dotAIslash/dotaislash-spec) · [**Examples**](https://github.com/dotAIslash/dotaislash-examples)

</div>

---

## 🚀 What is versa CLI?

The **official command-line tool** for working with VERSA `.ai/` folders. Initialize, validate, merge profiles, and generate agent context with a single command.

```bash
# Initialize a new .ai/ folder
versa init

# Validate your configuration
versa lint

# Print merged configuration
versa print --profile cursor

# Generate agent context
versa context --agent code-reviewer
```

---

## ✨ Features

- 🎯 **Scaffold** - Create `.ai/` folders with sensible defaults
- ✅ **Validate** - Lint JSON and Markdown against VERSA schemas
- 🔄 **Merge** - Deep-merge profiles with base configuration
- 📦 **Context** - Assemble complete agent payloads
- 🎨 **Preview** - Visualize your configuration before using
- 🔍 **Diff** - Compare profiles and see what changes

---

## 📦 Installation

```bash
# npm
npm install -g @dotaislash/cli

# yarn
yarn global add @dotaislash/cli

# pnpm
pnpm add -g @dotaislash/cli

# Or use npx (no install)
npx @dotaislash/cli init
```

---

## 🎯 Commands

### `versa init`

Scaffold a new `.ai/` folder in your project.

```bash
# Interactive setup
versa init

# With options
versa init --minimal              # Minimal setup
versa init --template typescript  # Use template
versa init --profile cursor       # Include profile
```

**Creates:**
```
.ai/
├── context.json          # Base configuration
├── profiles/             # Tool-specific overrides
├── rules/                # Markdown rules
│   └── style.md
├── agents/               # Agent configurations
└── tools/                # MCP server configs
```

---

### `versa lint`

Validate your `.ai/` folder against VERSA schemas.

```bash
# Lint entire .ai/ folder
versa lint

# Lint specific file
versa lint .ai/context.json

# Auto-fix issues
versa lint --fix

# Strict mode (fail on warnings)
versa lint --strict
```

**Checks:**
- ✅ JSON schema validation
- ✅ Markdown `ai:meta` preambles
- ✅ File references exist
- ✅ Circular dependencies
- ✅ Permission conflicts

---

### `versa print`

Print merged configuration for a specific profile.

```bash
# Print base configuration
versa print

# Print with profile merged
versa print --profile cursor

# Output to file
versa print --profile windsurf > windsurf-config.json

# Pretty print
versa print --pretty

# Show merge details
versa print --profile cursor --show-merges
```

---

### `versa context`

Assemble complete context payload for an agent.

```bash
# Generate context for an agent
versa context --agent code-reviewer

# With specific profile
versa context --agent code-reviewer --profile cursor

# Output formats
versa context --agent code-reviewer --format json
versa context --agent code-reviewer --format yaml
versa context --agent code-reviewer --format text

# Include file contents
versa context --agent code-reviewer --include-files
```

---

## 📖 Usage Examples

### Initialize a New Project

```bash
cd my-project
versa init --template typescript

# Choose options interactively:
# - Language: TypeScript
# - Include profiles: Cursor, Windsurf
# - Add sample rules: Yes
```

### Validate Before Commit

```bash
# Add to your CI pipeline
npm run lint && versa lint
```

### Generate Context for Multiple Tools

```bash
# Cursor
versa context --profile cursor > .cursor-context.json

# Windsurf
versa context --profile windsurf > .windsurf-context.json

# Claude
versa context --profile claude > .claude-context.json
```

### Compare Profiles

```bash
# See what's different
versa diff cursor windsurf

# Output:
# + cursor.settings.shortcuts.review = "agents/code-reviewer.json"
# - windsurf.settings.sidebar = "compact"
```

---

## 🔧 Configuration

### `.versarc.json`

Configure CLI behavior in your project:

```json
{
  "aiFolder": ".ai",
  "defaultProfile": "cursor",
  "strictMode": true,
  "autoFix": false,
  "schemaVersion": "1.0"
}
```

### Environment Variables

```bash
# Override .ai/ folder location
export VERSA_AI_FOLDER=".agent-config"

# Default profile
export VERSA_DEFAULT_PROFILE="windsurf"

# Enable debug logging
export VERSA_DEBUG=true
```

---

## 🎨 Templates

### Available Templates

```bash
# List templates
versa templates

# Available:
# - minimal        Basic .ai/ folder
# - typescript     TypeScript project setup
# - python         Python project setup
# - monorepo       Multi-package repository
# - full-featured  Everything included
```

### Use a Template

```bash
versa init --template typescript
```

### Create Custom Template

```bash
# Create template directory
mkdir -p ~/.versa/templates/my-template

# Add files
cp -r .ai/* ~/.versa/templates/my-template/

# Use it
versa init --template my-template
```

---

## 🧪 API Usage

Use versa programmatically in your Node.js projects:

```typescript
import { VersaCLI } from '@dotaislash/cli';

const cli = new VersaCLI({
  aiFolder: '.ai',
  schemaVersion: '1.0'
});

// Initialize
await cli.init({ template: 'typescript' });

// Validate
const result = await cli.lint();
if (result.errors.length > 0) {
  console.error('Validation failed:', result.errors);
}

// Merge configuration
const config = await cli.print({ profile: 'cursor' });

// Generate context
const context = await cli.context({
  agent: 'code-reviewer',
  profile: 'cursor',
  includeFiles: true
});
```

---

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/dotAIslash/dotaislash-cli.git
cd dotaislash-cli

# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

---

## 📚 Documentation

- 📖 [CLI Reference](https://dotaislash.github.io/cli)
- 🎯 [Command Guide](docs/COMMANDS.md)
- 🧩 [API Documentation](docs/API.md)
- 📝 [Configuration Options](docs/CONFIG.md)
- 🎨 [Template Guide](docs/TEMPLATES.md)

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Help

- 🐛 Report bugs and issues
- 💡 Suggest new commands or features
- 📝 Improve documentation
- 🧪 Add tests
- 🎨 Create templates

---

## 📊 Status

**Current Version:** 1.0.0

| Feature | Status |
|---------|--------|
| `versa init` | 🟡 In Progress |
| `versa lint` | 🟡 In Progress |
| `versa print` | 🔴 Planned |
| `versa context` | 🔴 Planned |
| Templates | 🔴 Planned |
| npm Package | 🔴 Planned |

---

## 📄 License

MIT © [dotAIslash](https://github.com/dotAIslash)

---

<div align="center">

**Part of the VERSA ecosystem**

[Spec](https://github.com/dotAIslash/dotaislash-spec) · [Schemas](https://github.com/dotAIslash/dotaislash-schemas) · [Examples](https://github.com/dotAIslash/dotaislash-examples) · [Adapters](https://github.com/dotAIslash/dotaislash-adapters)

[⭐ Star us on GitHub](https://github.com/dotAIslash/dotaislash-cli)

</div>
