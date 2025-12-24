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
- 🧾 **Export** - Print merged configs in JSON/YAML/Text

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
versa init --template typescript  # Template support (planned)
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

# Strict mode (fail on warnings)
versa lint --strict
```

**Checks:**
- ✅ JSON schema validation (context, profiles, agents, tools, knowledge, memory)
- ✅ Markdown `ai:meta` front matter for rules and prompts
- ✅ File references exist
- ✅ Circular dependency detection for agent references

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
```

---

## 📖 Usage Examples

### Initialize a New Project

```bash
cd my-project
versa init

# Or minimal scaffold
versa init --minimal
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

### Planned Features

- `versa diff`
- `versa preview`
- `versa import`
- `versa templates`
- `versa watch`
- `versa lint --fix`
- Template scaffolds for `versa init --template`

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

## 📄 License

MIT © [dotAIslash](https://github.com/dotAIslash)

---

<div align="center">

**Part of the VERSA ecosystem**

[Spec](https://github.com/dotAIslash/dotaislash-spec) · [Schemas](https://github.com/dotAIslash/dotaislash-schemas) · [Examples](https://github.com/dotAIslash/dotaislash-examples) · [Adapters](https://github.com/dotAIslash/dotaislash-adapters)

[⭐ Star us on GitHub](https://github.com/dotAIslash/dotaislash-cli)

</div>
