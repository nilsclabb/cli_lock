# cli-lock — Project-Local CLI Tool Manager

`cli-lock` is a "Bun-style" package manager for CLI tools. It provides deterministic, pinned installation of CLI tools into a project-local `.cli/bin/` directory, while also serving as "project glue" for AI agents and infrastructure configs.

## Features

- **Deterministic Binaries:** Pin any CLI tool from npm or GitHub with SHA-256 integrity hashes.
- **Project Isolation:** Tools live in `.cli/` — no global state, no root `node_modules` pollution.
- **Agent Skill Syncing:** Automatically generates and syncs `SKILL.md` files for Claude, Gemini, Cursor, and more.
- **Interactive Wizard:** `cli-lock init` scans your project to detect tools, agents, and infra configs.
- **Fast:** Compatible with both Node.js and Bun for high-performance installation and execution.

## Quick Start

```bash
# 1. Initialize your project
npx cli-lock init

# 2. Install your toolchain
cli-lock install

# 3. Activate the environment
eval "$(cli-lock env)"

# 4. Use your tools directly
prettier --version
gh pr create
```

## Commands

- `cli-lock init`: Interactive setup wizard.
- `cli-lock install`: Resolve and install tools from `cli-lock.toml`.
- `cli-lock add <tool>`: Add a new tool to the config and install it.
- `cli-lock env`: Output shell activation command.
- `cli-lock skills sync`: Regenerate tool lists in agent skill files.

## CI / CD Integration

Use the `--frozen` flag in CI to ensure that the lockfile is up to date and that no unauthorized changes are made:

```bash
npx cli-lock install --frozen
echo "$(pwd)/.cli/bin" >> $GITHUB_PATH
```

## License

MIT
