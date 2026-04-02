# `cli-lock` Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a project-local CLI tool manager with deterministic pinning, AI agent integrations, and infra config automation.

**Architecture:** A TypeScript-based CLI that manages an isolated `.cli/` directory. It resolves versions from npm and GitHub, uses hybrid hash verification, and generates agent skill files.

**Tech Stack:** TypeScript, Bun/Node, Commander, Clack, Zod, Toml, Vitest.

---

## Chunk 1: Core Foundation & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `src/index.ts`, `src/config.ts`, `src/types.ts`
- Test: `src/__tests__/config.test.ts`

- [ ] **Task 1: Initialize Project & Dependencies**
  - [ ] Create `package.json` with `commander`, `clack`, `toml`, `zod`, `fs-extra`, `semver`.
  - [ ] Create `tsconfig.json` for ESNext/Node.
  - [ ] Run `npm install`.

- [ ] **Task 2: Define Core Types**
  - [ ] Create `src/types.ts` defining `CliLockConfig`, `ToolConfig`, `Provider`.

- [ ] **Task 3: Config Parsing & Validation**
  - [ ] Create `src/config.ts` using `toml` and `zod`.
  - [ ] Write tests in `src/__tests__/config.test.ts` for valid/invalid TOML.

---

## Chunk 2: Provider Implementation (npm)

**Files:**
- Create: `src/providers/npm.ts`, `src/fs.ts`
- Test: `src/__tests__/npm-provider.test.ts`

- [ ] **Task 4: Isolated npm Install**
  - [ ] Implement `installNpmTool` in `src/providers/npm.ts`.
  - [ ] Logic: Create `.cli/npm/package.json` → `npm install --prefix .cli/npm`.
  - [ ] Write tests using a mock registry or temporary directory.

- [ ] **Task 5: Bin Symlinking**
  - [ ] Implement `linkTool` in `src/fs.ts`.
  - [ ] Logic: Symlink `.cli/npm/node_modules/.bin/<tool>` to `.cli/bin/<tool>`.

---

## Chunk 3: Provider Implementation (GitHub)

**Files:**
- Create: `src/providers/github.ts`, `src/hashing.ts`
- Test: `src/__tests__/github-provider.test.ts`

- [ ] **Task 6: Asset Matching Heuristics**
  - [ ] Implement platform/arch detection and asset regex matching.

- [ ] **Task 7: Hybrid Hash Resolution**
  - [ ] Implement `resolveGitHubHash` in `src/hashing.ts`.
  - [ ] Logic: Try `checksums.txt` → Fallback to full download + SHA-256.

- [ ] **Task 8: GitHub Extraction**
  - [ ] Implement ZIP/TAR extraction to `.cli/store/<tool>/<version>`.

---

## Chunk 4: Project Scanning & Interactive Setup (`init`)

**Files:**
- Create: `src/scanner.ts`, `src/commands/init.ts`
- Test: `src/__tests__/scanner.test.ts`

- [ ] **Task 9: Project Scanner**
  - [ ] Implement `scanProject` in `src/scanner.ts`.
  - [ ] Detect: `package.json` devDeps, `.claude/`, `turbo.json`, etc.

- [ ] **Task 10: Interactive Wizard**
  - [ ] Implement `init` command using `clack`.
  - [ ] Multi-step: Tools → Agents → Configs → Confirm.

---

## Chunk 5: Agent & Config Integrations

**Files:**
- Create: `src/integrations/agents.ts`, `src/integrations/configs.ts`
- Test: `src/__tests__/integrations.test.ts`

- [ ] **Task 11: Agent Skill Generation**
  - [ ] Create templates for Claude, Gemini, Cursor.
  - [ ] Implement `syncAgentSkills` with fenced comment updates.

- [ ] **Task 12: Infra Config Recipes**
  - [ ] Implement mutation logic for `turbo.json`, `vercel.json`, `Dockerfile`.

---

## Chunk 6: Environment & Activation

**Files:**
- Create: `src/commands/env.ts`, `src/commands/exec.ts`, `bootstrap.sh`
- Test: `src/__tests__/cli.test.ts`

- [ ] **Task 13: `env` & `exec` Commands**
  - [ ] `cli-lock env` outputs shell export.
  - [ ] `cli-lock exec` runs with modified process PATH.

- [ ] **Task 14: Final Polish & Distribution**
  - [ ] Implement `cli-lock install --frozen` for CI.
  - [ ] Create the self-verifying `bootstrap.sh`.
  - [ ] Verify build and publish-ready status.
