# `cli-lock` — CLI Tool Package Manager

**Version:** 0.2.0-draft
**Date:** April 2026

---

## 1. What This Is

`cli-lock` is a package manager for CLI tools. It does for system-level command-line tools what `bun install` does for npm packages: reads a config, resolves versions, locks them, and installs them — one command, done.

```bash
npx cli-lock init          # interactive setup wizard
cli-lock install            # reads cli-lock.toml, installs everything
```

On first run, `cli-lock` scans your project, detects your agent harnesses and infrastructure configs, and offers to set everything up — tools, agent skills, and config updates — in one interactive flow.

---

## 2. What This Is NOT

- **Not a skills manager.** [skills.sh](https://skills.sh) handles agent knowledge and best practices. `cli-lock` manages the tools those skills depend on — but it can bootstrap agent skill files as part of setup.
- **Not a runtime manager.** Use `mise`, `fnm`, `nvm` for Node.js/Python runtimes.
- **Not an agent framework.** No context, no conventions, no boundaries. Just tools and the glue to get going fast.

---

## 3. Quick Start

### New project setup

```bash
npx cli-lock init
```

This launches the interactive setup wizard:

```
  cli-lock v0.1.0

  Scanning project...

  ✓ Detected: package.json (Node.js project)
  ✓ Detected: turbo.json (Turborepo monorepo)
  ✓ Detected: vercel.json (Vercel deployment)
  ✓ Detected: .claude/ (Claude Code agent)
  ✓ Detected: .gemini/ (Gemini agent)

  ── Agent Skill Files ────────────────────────────

  We have pre-configured agent skill files for cli-lock
  that help your agents understand and use your CLI tools.

  Detected agent harnesses:

    ◆ Claude Code (.claude/)
      Install cli-lock skills for Claude?
      This adds .claude/skills/cli-lock/ with a SKILL.md
      that teaches Claude how to use your project's CLI tools.

      ● Yes, install  ○ No, skip

    ◆ Gemini (.gemini/)
      Install cli-lock skills for Gemini?
      This adds .gemini/skills/cli-lock/ with agent instructions.

      ● Yes, install  ○ No, skip

    ◆ OpenAI Codex (.agents/)
      No .agents/ directory detected.
      Create .agents/skills/cli-lock/ anyway?

      ○ Yes, create   ● No, skip

  ── Project Config Updates ───────────────────────

  We found infrastructure config files that may benefit
  from cli-lock integration.

    ◆ turbo.json
      Add a "cli-lock:install" task to your Turbo pipeline
      so tools are installed before build/lint/test tasks?

      ● Yes, update   ○ No, skip
      Preview:
        "cli-lock:install": {
          "cache": true,
          "outputs": [".cli/**"]
        }

    ◆ vercel.json
      Add cli-lock install to your Vercel build command?
      Current: "build": "next build"
      Proposed: "build": "cli-lock install --frozen && next build"

      ○ Yes, update   ● No, skip

  ── Tools ────────────────────────────────────────

  Select CLI tools to add (detected from project):

    ◆ Formatting & Linting
      ☑ prettier (detected in package.json devDependencies)
      ☑ eslint (detected in package.json devDependencies)
      ☐ biome

    ◆ Build & Dev
      ☑ turbo (detected in package.json devDependencies)
      ☐ tsx

    ◆ Testing
      ☑ vitest (detected in package.json devDependencies)

    ◆ Git & CI
      ☐ gh (GitHub CLI)

  ────────────────────────────────────────────────

  Creating cli-lock.toml... done
  Creating cli-lock.lock... done
  Installing 5 tools... done
  Installing agent skills... done

  ✓ All set! Run: eval "$(cli-lock env)"

  Files created:
    cli-lock.toml
    cli-lock.lock
    .claude/skills/cli-lock/SKILL.md
    .gemini/skills/cli-lock/SKILL.md
    turbo.json (updated)
```

### Existing project (non-interactive)

```bash
cli-lock install              # reads cli-lock.toml, installs everything
cli-lock install --frozen     # CI mode — fails if lock is out of date
```

---

## 4. Project Detection

When `cli-lock init` runs, it scans the project directory for signals about the project's tooling, agent harnesses, and infrastructure.

### 4.1 Agent Harness Detection

cli-lock looks for these directories and files to identify which AI agent frameworks are configured:

| Agent | Detection Signal | Skill Install Path |
|---|---|---|
| Claude Code | `.claude/` directory or `CLAUDE.md` | `.claude/skills/cli-lock/` |
| Gemini | `.gemini/` directory | `.gemini/skills/cli-lock/` |
| OpenAI / Codex | `.agents/` directory | `.agents/skills/cli-lock/` |
| Cursor | `.cursor/` directory or `.cursorrules` | `.cursor/skills/cli-lock/` |
| Windsurf | `.windsurf/` directory or `.windsurfrules` | `.windsurf/skills/cli-lock/` |
| Amp | `.amp/` directory | `.amp/skills/cli-lock/` |
| Cline | `.cline/` directory or `.clinerules` | `.cline/skills/cli-lock/` |
| Aider | `.aider.conf.yml` or `.aiderignore` | `.aider/skills/cli-lock/` |
| Pi | `.pi/` directory | `.pi/skills/cli-lock/` |
| skills.sh | `.agents/skills/` with SKILL.md | `.agents/skills/cli-lock/` |

For each detected agent, the user is prompted whether to install a pre-configured skill file. The skill file is tailored to the agent's format and teaches it how to work with cli-lock and the project's declared tools.

#### What gets installed per agent harness

**Claude Code** (`.claude/skills/cli-lock/`):

```
.claude/
└── skills/
    └── cli-lock/
        └── SKILL.md        # Claude-format skill document
```

The SKILL.md contains:
- What cli-lock is and how it works in this project.
- A list of all tools declared in cli-lock.toml (auto-generated from the config).
- Instructions for the agent: "Before using any CLI tool, verify it's available via `cli-lock list`. If a tool is missing, suggest adding it with `cli-lock add <tool>`."
- How to run tools (direct invocation after `cli-lock env`, or via `cli-lock exec`).
- How to add new tools when the agent introduces a new dependency.

**Gemini** (`.gemini/skills/cli-lock/`):

Same content, adapted to Gemini's expected format.

**OpenAI / Codex** (`.agents/skills/cli-lock/`):

```
.agents/
└── skills/
    └── cli-lock/
        ├── agents/
        │   └── openai.yaml      # OpenAI-specific agent config
        ├── references/
        │   └── tool-usage.md    # reference doc for tool invocations
        └── SKILL.md             # main skill document
```

The structure follows the skills.sh pattern visible in the screenshot — with `agents/`, `references/`, and a root `SKILL.md`.

### 4.2 Project Config Detection

cli-lock scans for infrastructure config files and offers to integrate:

| Config File | What cli-lock offers |
|---|---|
| `turbo.json` | Add a `cli-lock:install` pipeline task with caching. |
| `vercel.json` | Prepend `cli-lock install --frozen &&` to build commands. |
| `render.yaml` | Add cli-lock install to build steps. |
| `netlify.toml` | Add cli-lock install to build command. |
| `fly.toml` | Add cli-lock install to deploy builder. |
| `.github/workflows/*.yml` | Offer a reusable step snippet for GitHub Actions. |
| `.gitlab-ci.yml` | Offer a cli-lock install stage. |
| `Dockerfile` | Suggest a RUN layer for cli-lock. |
| `docker-compose.yml` | Note: suggest adding to Dockerfile instead. |
| `nx.json` | Add cli-lock as a cacheable target. |
| `Makefile` | Add a `tools` target. |

Each detection prompts the user with a preview of the proposed change and a Y/n confirmation.

### 4.3 Tool Auto-Detection

cli-lock scans for tools that appear to already be in use:

| Signal | Detected Tool |
|---|---|
| `package.json` devDependencies | Any matching npm CLI tool |
| `.prettierrc` / `.prettierrc.json` / `prettier.config.*` | prettier |
| `eslint.config.*` / `.eslintrc.*` | eslint |
| `biome.json` / `biome.jsonc` | biome |
| `turbo.json` | turbo |
| `vitest.config.*` | vitest |
| `.github/` directory | gh (GitHub CLI) |
| `terraform/` or `*.tf` files | terraform |
| `Makefile` with `jq` references | jq |

Detected tools are pre-selected in the tool picker during `init`. The user can add or remove before confirming.

---

## 5. Config — `cli-lock.toml`

Human-authored. Checked into version control.

```toml
# cli-lock.toml

[meta]
node = ">=20"                          # validated at install time, not installed

[tools]
prettier = { version = "^3.2", provider = "npm" }
eslint = { version = "^9.0", provider = "npm" }
turbo = { version = "^2.3", provider = "npm" }
biome = { version = "^1.9", provider = "npm", package = "@biomejs/biome" }
tsx = { version = "^4.19", provider = "npm" }
vitest = { version = "^3.0", provider = "npm" }

gh = { version = ">=2.60", provider = "github", repo = "cli/cli" }
jq = { version = ">=1.7", provider = "github", repo = "jqlang/jq" }
```

### Expanded syntax for complex cases

```toml
[tools.custom-tool]
version = "1.0.0"
provider = "url"

[tools.custom-tool.urls]
darwin-arm64 = "https://example.com/ct-1.0.0-macos-arm64.tar.gz"
darwin-x64   = "https://example.com/ct-1.0.0-macos-x64.tar.gz"
linux-x64    = "https://example.com/ct-1.0.0-linux-x64.tar.gz"
linux-arm64  = "https://example.com/ct-1.0.0-linux-arm64.tar.gz"
```

### Field reference

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | string | Yes | Semver range (`^`, `~`, `>=`, exact). |
| `provider` | string | Yes | `npm`, `github`, or `url`. |
| `package` | string | No | npm package name when it differs from tool name. |
| `repo` | string | Conditional | `owner/repo` for `github` provider. |
| `bin` | string | No | Binary name if different from tool name. |
| `urls` | table | Conditional | Platform→URL map for `url` provider. |
| `asset_patterns` | table | No | Platform→glob for github asset matching. |

---

## 6. Lock File — `cli-lock.lock`

Machine-generated. Checked into version control. Never hand-edit.

```toml
# cli-lock.lock — generated by cli-lock@0.1.0, DO NOT EDIT

schema = 1
generated_at = "2026-04-01T12:00:00Z"

[tools.prettier]
version = "3.4.2"
provider = "npm"
package = "prettier"
integrity = "sha512-AbCdEf1234..."

[tools.eslint]
version = "9.22.0"
provider = "npm"
package = "eslint"
integrity = "sha512-GhIjKl5678..."

[tools.gh]
version = "2.67.0"
provider = "github"
repo = "cli/cli"

[tools.gh.assets.darwin-arm64]
url = "https://github.com/cli/cli/releases/download/v2.67.0/gh_2.67.0_macOS_arm64.zip"
sha256 = "a1b2c3d4e5f6..."
extract = "gh_2.67.0_macOS_arm64/bin/gh"

[tools.gh.assets.darwin-x64]
url = "https://github.com/cli/cli/releases/download/v2.67.0/gh_2.67.0_macOS_amd64.zip"
sha256 = "f6e5d4c3b2a1..."
extract = "gh_2.67.0_macOS_amd64/bin/gh"

[tools.gh.assets.linux-x64]
url = "https://github.com/cli/cli/releases/download/v2.67.0/gh_2.67.0_linux_amd64.tar.gz"
sha256 = "1a2b3c4d5e6f..."
extract = "gh_2.67.0_linux_amd64/bin/gh"

[tools.gh.assets.linux-arm64]
url = "https://github.com/cli/cli/releases/download/v2.67.0/gh_2.67.0_linux_arm64.tar.gz"
sha256 = "6f5e4d3c2b1a..."
extract = "gh_2.67.0_linux_arm64/bin/gh"
```

---

## 7. Directory Structure

After `cli-lock install`:

```
my-project/
├── cli-lock.toml             # config (you write, committed)
├── cli-lock.lock             # lock file (generated, committed)
├── .cli/                     # tool store (gitignored)
│   ├── bin/                  # all tool binaries/symlinks
│   │   ├── prettier
│   │   ├── eslint
│   │   ├── turbo
│   │   ├── gh
│   │   └── jq
│   ├── npm/                  # isolated npm prefix
│   ├── store/                # extracted binaries (github, url)
│   └── cache/                # download cache
│
│   # Agent skill files (committed — created by init)
├── .claude/
│   └── skills/
│       └── cli-lock/
│           └── SKILL.md
├── .gemini/
│   └── skills/
│       └── cli-lock/
│           └── SKILL.md
├── .agents/
│   └── skills/
│       └── cli-lock/
│           ├── agents/
│           │   └── openai.yaml
│           ├── references/
│           │   └── tool-usage.md
│           └── SKILL.md
│
├── turbo.json                # (may be updated with cli-lock task)
├── package.json
└── .gitignore                # .cli/ added
```

---

## 8. Agent Skill File Generation

### 8.1 What Gets Generated

The skill files are **auto-generated from your `cli-lock.toml`** so they're always accurate. They teach agents:

1. **What tools are available** — a concrete list with versions.
2. **How to use cli-lock** — the commands they can run.
3. **How to add new tools** — when the agent introduces a CLI dependency, it should use `cli-lock add`.
4. **How to verify tools** — `cli-lock list` to check what's installed.

### 8.2 Example Generated SKILL.md

```markdown
# CLI Tool Management (cli-lock)

This project uses cli-lock to manage CLI tool dependencies.
All tools are declared in `cli-lock.toml` and pinned in `cli-lock.lock`.

## Available Tools

The following CLI tools are installed and available on $PATH
(after running `cli-lock install && eval "$(cli-lock env)"`):

| Tool | Version | Provider |
|------|---------|----------|
| prettier | ^3.2 | npm |
| eslint | ^9.0 | npm |
| turbo | ^2.3 | npm |
| biome | ^1.9 | npm (@biomejs/biome) |
| tsx | ^4.19 | npm |
| vitest | ^3.0 | npm |
| gh | >=2.60 | github (cli/cli) |
| jq | >=1.7 | github (jqlang/jq) |

## Using Tools

Tools are available directly after environment activation:

    prettier --write src/
    eslint --fix .
    turbo build
    gh pr create

Or without activation:

    cli-lock exec prettier --write src/

## Adding a New Tool

If you need a CLI tool that isn't listed above:

    cli-lock add <tool-name>

This adds it to cli-lock.toml, resolves the version, and installs it.
Always commit the updated cli-lock.toml and cli-lock.lock.

## Checking Tool Status

    cli-lock list              # show all tools and install status
    cli-lock outdated          # show tools with newer versions

## Important

- Do NOT install CLI tools via `npm install -g` — use `cli-lock add`.
- Do NOT modify cli-lock.lock by hand — it is auto-generated.
- Always run `cli-lock install` after pulling changes to cli-lock.toml.
```

### 8.3 Regenerating Skill Files

When `cli-lock.toml` changes (tools added/removed), the agent skill files can be regenerated:

```bash
cli-lock skills sync
```

This updates the tool list in each installed agent skill file to match the current config. It does not overwrite custom content — it only updates the auto-generated "Available Tools" section, which is marked with comment fences:

```markdown
<!-- cli-lock:tools:start -->
| Tool | Version | Provider |
...
<!-- cli-lock:tools:end -->
```

### 8.4 Adding Agent Skills Later

If you set up a new agent harness after init:

```bash
cli-lock skills add claude        # install skill for Claude Code
cli-lock skills add gemini        # install skill for Gemini
cli-lock skills add openai        # install skill for OpenAI/Codex
cli-lock skills add cursor        # install skill for Cursor
cli-lock skills add --all         # install for all detected agents
```

List installed agent skills:

```bash
cli-lock skills list
Agent        Path                             Status
claude       .claude/skills/cli-lock/         ✓ installed
gemini       .gemini/skills/cli-lock/         ✓ installed
openai       .agents/skills/cli-lock/         ✗ not installed
cursor       —                                ✗ no .cursor/ detected
```

---

## 9. Project Config Integration

### 9.1 Turbo (turbo.json)

cli-lock adds a pipeline task that caches the tool installation:

```json
{
  "tasks": {
    "cli-lock:install": {
      "cache": true,
      "inputs": ["cli-lock.toml", "cli-lock.lock"],
      "outputs": [".cli/**"]
    },
    "build": {
      "dependsOn": ["cli-lock:install"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["cli-lock:install"]
    },
    "test": {
      "dependsOn": ["cli-lock:install"]
    }
  }
}
```

This ensures tools are installed before any task that might use them, and Turbo's cache means it only runs when the config actually changes.

### 9.2 Vercel (vercel.json)

```json
{
  "buildCommand": "cli-lock install --frozen && next build"
}
```

Or if using Turbo on Vercel (which is common), the Turbo integration handles it automatically since `build` depends on `cli-lock:install`.

### 9.3 GitHub Actions

cli-lock offers to create or update a workflow step:

```yaml
- name: Install CLI tools
  run: |
    npx cli-lock install --frozen
    echo "$(pwd)/.cli/bin" >> $GITHUB_PATH
```

### 9.4 Render (render.yaml)

```yaml
services:
  - type: web
    buildCommand: "npx cli-lock install --frozen && npm run build"
```

### 9.5 Netlify (netlify.toml)

```toml
[build]
  command = "npx cli-lock install --frozen && npm run build"
```

### 9.6 Docker (Dockerfile)

```dockerfile
# Install CLI tools (cached layer)
COPY cli-lock.toml cli-lock.lock ./
RUN npx cli-lock install --frozen
ENV PATH=".cli/bin:$PATH"

# Then copy source and build
COPY . .
RUN npm run build
```

### 9.7 Makefile

```makefile
.PHONY: tools
tools:
	cli-lock install

.PHONY: build
build: tools
	npm run build

.PHONY: lint
lint: tools
	prettier --check .
	eslint .
```

### 9.8 nx.json

```json
{
  "targetDefaults": {
    "cli-lock-install": {
      "cache": true,
      "inputs": ["{workspaceRoot}/cli-lock.toml", "{workspaceRoot}/cli-lock.lock"],
      "outputs": ["{workspaceRoot}/.cli/**"]
    }
  }
}
```

---

## 10. Commands

### `cli-lock init`

Interactive setup wizard. Scans project, detects agents and configs, prompts through setup.

```bash
npx cli-lock init                 # full interactive wizard
npx cli-lock init --yes           # accept all defaults (non-interactive)
npx cli-lock init --no-skills     # skip agent skill installation
npx cli-lock init --no-configs    # skip project config updates
```

### `cli-lock install`

The primary command. Analogous to `bun install`.

```bash
cli-lock install                  # resolve + lock + install
cli-lock install --frozen         # install from lock only (CI)
cli-lock install --dry-run        # show plan without executing
```

**Behavior:**
1. No lock file → resolve from toml, write lock, install.
2. Lock exists + toml unchanged → install from lock (fast path).
3. Lock exists + toml changed → re-resolve changed tools, update lock, install.

### `cli-lock add <tool> [tool...]`

Add tools and install.

```bash
cli-lock add prettier                    # auto-detect provider
cli-lock add gh --provider github --repo cli/cli
cli-lock add eslint biome turbo          # multiple at once
cli-lock add terraform --version "~1.7"  # explicit version range
```

Auto-detection: checks npm registry first. If package exists with a `bin` field, uses `npm`. Otherwise searches GitHub releases.

After adding, also runs `cli-lock skills sync` to update agent skill files if they exist.

### `cli-lock remove <tool> [tool...]`

Remove tools, clean up, update skill files.

```bash
cli-lock remove jq
```

### `cli-lock update [tool]`

Re-resolve to latest version matching range.

```bash
cli-lock update prettier          # update one tool
cli-lock update                   # update all
```

### `cli-lock list`

Show tools and status.

```bash
cli-lock list                     # human-readable table
cli-lock list --json              # machine-readable (for skills.sh interop)
```

### `cli-lock env`

Shell activation.

```bash
eval "$(cli-lock env)"            # activate for current session
eval "$(cli-lock env --hook)"     # auto-activate on cd (for shell profile)
```

### `cli-lock exec <tool> [args...]`

Run a tool without activation.

```bash
cli-lock exec prettier --write src/
cli-lock exec gh pr create
```

### `cli-lock check`

Verify integrity of installed tools.

```bash
cli-lock check                    # verify all hashes match lock
cli-lock check --json             # machine-readable output
```

### `cli-lock outdated`

Show tools with newer versions.

```bash
cli-lock outdated                 # human table
cli-lock outdated --json          # machine-readable
```

### `cli-lock skills`

Manage agent skill files.

```bash
cli-lock skills list              # show installed agent skills
cli-lock skills add claude        # install skill for specific agent
cli-lock skills add --all         # install for all detected agents
cli-lock skills sync              # regenerate tool lists in skill files
cli-lock skills remove gemini     # remove skill for specific agent
```

### `cli-lock scan`

Re-run the project scanner from init (without reinitializing). Useful when you've added a new agent harness or config file.

```bash
cli-lock scan
  ✓ Detected: .cursor/ (new — not previously configured)
  ✓ Detected: render.yaml (new — not previously configured)

  Install cli-lock skills for Cursor? [Y/n]
  Update render.yaml with cli-lock install? [Y/n]
```

---

## 11. Providers

### 11.1 `npm`

Installs Node.js CLI packages into isolated `.cli/npm/` prefix.

**Resolution:** Queries npm registry → resolves semver → records version + `integrity`.

**Installation:** Generates `.cli/npm/package.json` → `npm install --prefix .cli/npm --ignore-scripts --no-audit --no-fund` → symlinks to `.cli/bin/`.

### 11.2 `github`

Downloads pre-built binaries from GitHub Release assets.

**Resolution:** Queries Releases API → matches semver against tags → identifies platform assets → downloads + computes SHA-256.

**Asset matching heuristics:**

| Platform | OS patterns | Arch patterns |
|---|---|---|
| `darwin-arm64` | `macos`, `darwin`, `apple` | `arm64`, `aarch64` |
| `darwin-x64` | `macos`, `darwin`, `apple` | `amd64`, `x86_64`, `x64` |
| `linux-x64` | `linux` | `amd64`, `x86_64`, `x64` |
| `linux-arm64` | `linux` | `arm64`, `aarch64` |

Override with `asset_patterns` when heuristics fail.

### 11.3 `url`

Direct download escape hatch. No resolution — exact version and URLs required.

---

## 12. skills.sh Interop

### 12.1 Import tool deps from skills

```bash
cli-lock import --from-skill skills.sh/docx-creation
```

Reads the skill's metadata, extracts tool requirements, adds them to `cli-lock.toml`.

### 12.2 Validate skill compatibility

```bash
cli-lock check-skill skills.sh/docx-creation
```

Checks whether the skill's tool deps are satisfied by the current config.

### 12.3 Machine-readable output

```bash
cli-lock list --json
```

Returns tool inventory for skill runtimes to query.

---

## 13. Bootstrap

For CI and fresh environments:

```bash
#!/usr/bin/env sh
# .cli/bootstrap.sh

set -eu

VERSION="0.1.0"
SHA_darwin_arm64="abc123..."
SHA_darwin_x64="def456..."
SHA_linux_x64="789ghi..."
SHA_linux_arm64="jkl012..."

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in darwin) ;; linux) ;; *) echo "Unsupported: $OS" >&2; exit 1 ;; esac
case "$ARCH" in arm64|aarch64) ARCH="arm64" ;; x86_64|amd64) ARCH="x64" ;; *) echo "Unsupported: $ARCH" >&2; exit 1 ;; esac

PLATFORM="${OS}-${ARCH}"
HASH_VAR="SHA_${OS}_${ARCH}"
EXPECTED=$(eval echo "\$$HASH_VAR")
URL="https://github.com/cli-lock/cli-lock/releases/download/v${VERSION}/cli-lock-${PLATFORM}"
BIN="$(cd "$(dirname "$0")" && pwd)/self/cli-lock"
mkdir -p "$(dirname "$BIN")"

curl -fsSL "$URL" -o "$BIN"
ACTUAL=$(sha256sum "$BIN" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$BIN" | cut -d' ' -f1)
[ "$ACTUAL" = "$EXPECTED" ] || { echo "Hash mismatch" >&2; rm -f "$BIN"; exit 1; }

chmod +x "$BIN"
exec "$BIN" install "$@"
```

---

## 14. Security

- **npm tools:** Verified via SRI `integrity` hash from registry.
- **github/url tools:** Verified via SHA-256 computed at resolve time.
- **cli-lock itself:** SHA-256 in bootstrap script.
- **Postinstall scripts:** Disabled by default (`--ignore-scripts`). Opt in with `scripts = true`.
- **CI:** Always use `--frozen` to prevent lock file modification.

---

## 15. Comparison

| Feature | cli-lock | mise | aqua | devbox | Brew Bundle |
|---|---|---|---|---|---|
| npm CLI tools | ✓ first-class | ✗ | ✗ | Via Nix | ✗ |
| GitHub Release binaries | ✓ | ✓ plugins | ✓ | Via Nix | ✗ |
| Lock file with hashes | ✓ | ✗ | ✓ | ✓ Nix | Partial |
| Cross-platform | macOS + Linux | macOS + Linux | macOS + Linux | macOS + Linux | macOS |
| Project-local isolation | ✓ | ✓ | ✓ | ✓ | ✗ |
| Interactive setup wizard | ✓ | ✗ | ✗ | ✗ | ✗ |
| Agent harness detection | ✓ | ✗ | ✗ | ✗ | ✗ |
| Agent skill generation | ✓ | ✗ | ✗ | ✗ | ✗ |
| Project config integration | ✓ | ✗ | ✗ | Partial | ✗ |
| skills.sh interop | ✓ | ✗ | ✗ | ✗ | ✗ |
| `bun install`-style UX | ✓ | ✗ | ✗ | ✗ | ✗ |
| Bootstrappable | ✓ curl + sh | ✗ | ✗ | ✗ | ✗ |

---

## 16. Roadmap

### v0.1 — Core
- `cli-lock install`, `add`, `remove`, `list`, `env`
- npm + github + url providers
- Lock file with integrity hashes
- Bootstrap script
- `--frozen` for CI

### v0.2 — Interactive Setup
- `cli-lock init` wizard
- Agent harness detection (.claude, .gemini, .agents, .cursor, etc.)
- Agent skill file generation
- Project config detection (turbo.json, vercel.json, etc.)
- Project config update proposals
- Tool auto-detection from package.json and config files

### v0.3 — Skill Management
- `cli-lock skills list/add/sync/remove`
- `cli-lock scan` for re-detection
- Auto-sync skill files when tools change
- skills.sh `import` and `check-skill`

### v0.4 — Quality of Life
- `cli-lock update`, `outdated`, `check`, `exec`
- Shell auto-activation hooks
- Global cache (~/.cli-lock/cache/)
- GitHub token support for API rate limits

### v0.5 — Ecosystem
- Windows support
- `pip` / `pipx` provider
- `cargo-binstall` provider
- `cli-lock init --from-readme` (detect tools from README)
- Plugin system for custom providers
- Custom agent harness templates

---

## Appendix A: Minimal Example

```toml
# cli-lock.toml
[tools]
prettier = { version = "^3", provider = "npm" }
```

```bash
npx cli-lock init --yes
cli-lock install
eval "$(cli-lock env)"
prettier --version    # 3.4.2
```

## Appendix B: Full Example

```toml
# cli-lock.toml
[meta]
node = ">=20"

[tools]
prettier = { version = "^3.2", provider = "npm" }
eslint = { version = "^9.0", provider = "npm" }
turbo = { version = "^2.3", provider = "npm" }
biome = { version = "^1.9", provider = "npm", package = "@biomejs/biome" }
tsx = { version = "^4.19", provider = "npm" }
vitest = { version = "^3.0", provider = "npm" }
gh = { version = ">=2.60", provider = "github", repo = "cli/cli" }
jq = { version = ">=1.7", provider = "github", repo = "jqlang/jq" }
```

```bash
npx cli-lock init          # interactive — detects agents, configs, tools
cli-lock install            # installs everything
eval "$(cli-lock env)"      # activate
```

## Appendix C: Non-Interactive / CI Setup

```bash
# In CI — no prompts, just install from lock
npx cli-lock install --frozen
echo "$(pwd)/.cli/bin" >> $GITHUB_PATH

# Or with bootstrap script (no npx needed)
sh .cli/bootstrap.sh --frozen
echo "$(pwd)/.cli/bin" >> $GITHUB_PATH
```

## Appendix D: Adding Agent Support Later

```bash
# You just set up Cursor in your project
cli-lock scan                     # detects .cursor/ directory
cli-lock skills add cursor        # installs skill file
```
