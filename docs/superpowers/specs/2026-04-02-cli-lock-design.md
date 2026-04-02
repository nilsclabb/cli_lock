# Design: `cli-lock` — CLI Tool Package Manager

**Date:** 2026-04-02
**Status:** Draft
**Version:** 1.0.0

---

## 1. Executive Summary

`cli-lock` is a project-local CLI tool package manager designed for the modern developer experience. It provides deterministic, pinned installation of CLI tools (from npm, GitHub Releases, or direct URLs) into a project-local `.cli/bin/` directory. Beyond tool management, it serves as "project glue," automatically configuring AI agent harnesses (Claude, Gemini, Cursor, etc.) and infrastructure configs (Turbo, Vercel, CI) to create a seamless, reproducible development environment.

## 2. Goals & Success Criteria

- **Determinism:** Every developer and CI environment gets the exact same tool versions and binaries, verified by SHA-256 hashes.
- **Isolation:** Tools are installed project-locally in `.cli/`, avoiding "it works on my machine" issues caused by global state.
- **Speed:** Fast installation using local caching and `bun`-compatible execution.
- **Agent Awareness:** AI agents automatically understand the project's toolchain through generated skill files.
- **Low Friction:** An interactive `init` wizard that automates setup by scanning the project.

## 3. Architecture & Tech Stack

### 3.1 Tech Stack
- **Implementation:** TypeScript / Node.js.
- **Runtime:** Fully compatible with Node.js (`npx`, `npm`, `yarn`, `pnpm`) and Bun (`bun x`, `bun run`).
- **TUI:** `clack` for high-fidelity interactive prompts.

### 3.2 Directory Structure
```
my-project/
├── cli-lock.toml             # Config (committed)
├── cli-lock.lock             # Lockfile (committed)
├── .cli/                     # Tool store (GITIGNORED)
│   ├── bin/                  # Symlinks to all tools
│   ├── npm/                  # Isolated npm prefix
│   ├── store/                # Versioned GitHub/URL binaries
│   └── cache/                # Downloaded assets and checksums
└── .claude/skills/cli-lock/  # Agent skill files (committed)
```

## 4. Configuration Schema

### 4.1 `cli-lock.toml` (Human-Authored)
```toml
[meta]
node = ">=20"

[tools.prettier]
version = "^3.2"
provider = "npm"

[tools.gh]
version = ">=2.60"
provider = "github"
repo = "cli/cli"
bin = ["gh"]  # Optional: list of binaries to symlink
```

### 4.2 `cli-lock.lock` (Machine-Generated)
Contains exact versions, platform-specific URLs, and SHA-256 hashes for all supported platforms (darwin-arm64, darwin-x64, linux-arm64, linux-x64).

## 5. Key Workflows

### 5.1 Interactive Setup (`cli-lock init`)
1. **Scan:** Detect `package.json`, infra configs, and agent harnesses.
2. **Tool Picker:** Checkbox list of detected tools.
3. **Agent Setup:** Offer to install `SKILL.md` for detected agents.
4. **Config Updates:** Preview and apply integration snippets for `turbo.json`, `vercel.json`, etc.
5. **Install:** Resolve, hash, and install all tools.

### 5.2 Tool Installation (`cli-lock install`)
- Reads `cli-lock.lock`.
- Skips already-installed tools in `.cli/bin/`.
- **npm Tools:** Installs to `.cli/npm/` via `npm install --ignore-scripts`.
- **GitHub Tools:** Downloads assets, verifies hashes, extracts to `.cli/store/`, and symlinks to `.cli/bin/`.
- **Integrity Check:** Verifies all installed binaries against the lockfile hashes.

### 5.3 Hybrid Hash Resolution
When adding a tool from GitHub, `cli-lock` will:
1. Attempt to parse official `checksums.txt` or `SHA256SUMS` from the release assets.
2. Fallback to downloading binaries for all 4 platforms and computing hashes locally.
This ensures the lockfile is always complete for all developers and CI.

## 6. Integrations

### 6.1 Agent Skills
Generated `SKILL.md` files include:
- An auto-synced "Available Tools" table (fenced with comments).
- Instructions on using `cli-lock add` to introduce new dependencies.
- Rules for tool usage and environment activation.

### 6.2 Infrastructure Configs
- **Turbo:** Adds a `cli-lock:install` task with caching and `dependsOn` for build/test tasks.
- **Vercel/Netlify:** Prepends `cli-lock install --frozen` to the build command.
- **GitHub Actions:** Provides a workflow step to install tools and update `$GITHUB_PATH`.

## 7. Security
- **No Scripts:** `npm install` runs with `--ignore-scripts` by default.
- **Integrity:** Every binary is verified against its hash in the lockfile before execution.
- **CI Mode:** `cli-lock install --frozen` fails if the lockfile is out of sync with `cli-lock.toml`.
