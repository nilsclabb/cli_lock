import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0b0b10",
  surface: "#131320",
  surfaceAlt: "#1b1b2c",
  border: "#252540",
  borderHi: "#3a3a5e",
  text: "#e8e8f0",
  dim: "#8a8aa8",
  muted: "#4e4e6a",
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f97316",
  purple: "#a78bfa",
  cyan: "#06b6d4",
  red: "#ef4444",
  pink: "#ec4899",
  yellow: "#eab308",
};

const mono = "'JetBrains Mono','SF Mono','Fira Code',monospace";
const sans = "'Inter',system-ui,-apple-system,sans-serif";

const Badge = ({ color, children }) => (
  <span style={{
    display: "inline-block", padding: "2px 7px", borderRadius: 4,
    fontSize: 10, fontWeight: 600, fontFamily: mono,
    background: `${color}15`, color, border: `1px solid ${color}28`,
  }}>{children}</span>
);

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "wizard", label: "Init Wizard" },
  { id: "agents", label: "Agent Detection" },
  { id: "configs", label: "Config Scanning" },
  { id: "commands", label: "Commands" },
];

const agents = [
  { id: "claude", name: "Claude Code", dir: ".claude/", signal: ".claude/ or CLAUDE.md", color: C.orange, icon: "🟠" },
  { id: "gemini", name: "Gemini", dir: ".gemini/", signal: ".gemini/", color: C.blue, icon: "🔵" },
  { id: "openai", name: "OpenAI / Codex", dir: ".agents/", signal: ".agents/", color: C.green, icon: "🟢" },
  { id: "cursor", name: "Cursor", dir: ".cursor/", signal: ".cursor/ or .cursorrules", color: C.purple, icon: "🟣" },
  { id: "windsurf", name: "Windsurf", dir: ".windsurf/", signal: ".windsurf/ or .windsurfrules", color: C.cyan, icon: "🩵" },
  { id: "cline", name: "Cline", dir: ".cline/", signal: ".cline/ or .clinerules", color: C.pink, icon: "🩷" },
  { id: "aider", name: "Aider", dir: ".aider/", signal: ".aider.conf.yml", color: C.yellow, icon: "🟡" },
  { id: "amp", name: "Amp", dir: ".amp/", signal: ".amp/", color: C.red, icon: "🔴" },
];

const configs = [
  { file: "turbo.json", what: "Turborepo", action: "Add cli-lock:install pipeline task with caching", color: C.orange },
  { file: "vercel.json", what: "Vercel", action: "Prepend cli-lock install --frozen to build command", color: C.text },
  { file: "render.yaml", what: "Render", action: "Add cli-lock install to build steps", color: C.purple },
  { file: "netlify.toml", what: "Netlify", action: "Add cli-lock install to build command", color: C.cyan },
  { file: ".github/workflows/", what: "GitHub Actions", action: "Add cli-lock install step + PATH update", color: C.dim },
  { file: "Dockerfile", what: "Docker", action: "Add cached RUN layer for cli-lock install", color: C.blue },
  { file: "nx.json", what: "Nx", action: "Add cacheable cli-lock-install target", color: C.green },
  { file: "Makefile", what: "Make", action: "Add tools target as dependency", color: C.dim },
];

const commands = [
  { cmd: "cli-lock init", desc: "Interactive setup wizard — scans project, detects agents & configs", color: C.green, badge: "start here" },
  { cmd: "cli-lock install", desc: "Resolve, lock, install. The main command.", color: C.blue, badge: "primary" },
  { cmd: "cli-lock add <tool>", desc: "Add tool to config and install. Auto-detects provider.", color: C.cyan },
  { cmd: "cli-lock remove <tool>", desc: "Remove tool and clean up.", color: C.red },
  { cmd: "cli-lock update [tool]", desc: "Re-resolve to latest matching version.", color: C.orange },
  { cmd: "cli-lock list", desc: "Show all tools and their status. --json for machines.", color: C.dim },
  { cmd: "cli-lock env", desc: "Output shell activation. --hook for auto-activate.", color: C.purple },
  { cmd: "cli-lock exec <tool>", desc: "Run a tool without full environment activation.", color: C.dim },
  { cmd: "cli-lock check", desc: "Verify installed hashes match lock file.", color: C.orange },
  { cmd: "cli-lock outdated", desc: "Show tools with newer versions available.", color: C.dim },
  { cmd: "cli-lock skills list", desc: "Show installed agent skill files.", color: C.pink },
  { cmd: "cli-lock skills add <agent>", desc: "Install skill files for a specific agent harness.", color: C.pink },
  { cmd: "cli-lock skills sync", desc: "Regenerate tool lists in agent skill files.", color: C.pink },
  { cmd: "cli-lock scan", desc: "Re-scan for new agents & configs after project changes.", color: C.green },
  { cmd: "cli-lock import --from-skill", desc: "Pull tool deps from a skills.sh skill.", color: C.purple },
  { cmd: "cli-lock check-skill", desc: "Validate a skill's tool deps are satisfied.", color: C.purple },
];

// Simulated terminal for the wizard
const wizardLines = [
  { text: "$ npx cli-lock init", color: C.text, delay: 0 },
  { text: "", delay: 200 },
  { text: "  cli-lock v0.1.0", color: C.dim, delay: 400 },
  { text: "", delay: 500 },
  { text: "  Scanning project...", color: C.dim, delay: 700 },
  { text: "", delay: 900 },
  { text: "  ✓ Detected: package.json (Node.js project)", color: C.green, delay: 1100 },
  { text: "  ✓ Detected: turbo.json (Turborepo monorepo)", color: C.green, delay: 1400 },
  { text: "  ✓ Detected: vercel.json (Vercel deployment)", color: C.green, delay: 1700 },
  { text: "  ✓ Detected: .claude/ (Claude Code agent)", color: C.green, delay: 2000 },
  { text: "  ✓ Detected: .gemini/ (Gemini agent)", color: C.green, delay: 2300 },
  { text: "", delay: 2500 },
  { text: "  ── Agent Skill Files ─────────────────────", color: C.muted, delay: 2700 },
  { text: "", delay: 2800 },
  { text: "    ◆ Claude Code (.claude/)", color: C.orange, delay: 3000 },
  { text: "      Install cli-lock skills for Claude?", color: C.dim, delay: 3200 },
  { text: "      ● Yes, install   ○ No, skip", color: C.green, delay: 3400 },
  { text: "", delay: 3500 },
  { text: "    ◆ Gemini (.gemini/)", color: C.blue, delay: 3700 },
  { text: "      Install cli-lock skills for Gemini?", color: C.dim, delay: 3900 },
  { text: "      ● Yes, install   ○ No, skip", color: C.green, delay: 4100 },
  { text: "", delay: 4200 },
  { text: "  ── Project Config Updates ────────────────", color: C.muted, delay: 4400 },
  { text: "", delay: 4500 },
  { text: "    ◆ turbo.json", color: C.orange, delay: 4700 },
  { text: "      Add cli-lock:install pipeline task?", color: C.dim, delay: 4900 },
  { text: "      ● Yes, update   ○ No, skip", color: C.green, delay: 5100 },
  { text: "", delay: 5200 },
  { text: "    ◆ vercel.json", color: C.text, delay: 5400 },
  { text: "      Add to build command?", color: C.dim, delay: 5600 },
  { text: "      ○ Yes, update   ● No, skip", color: C.dim, delay: 5800 },
  { text: "", delay: 5900 },
  { text: "  ── Tools ─────────────────────────────────", color: C.muted, delay: 6100 },
  { text: "", delay: 6200 },
  { text: "    ☑ prettier    ☑ eslint    ☑ turbo", color: C.cyan, delay: 6400 },
  { text: "    ☑ biome       ☑ vitest    ☐ gh", color: C.cyan, delay: 6600 },
  { text: "", delay: 6800 },
  { text: "  Creating cli-lock.toml... done", color: C.green, delay: 7000 },
  { text: "  Creating cli-lock.lock... done", color: C.green, delay: 7300 },
  { text: "  Installing 5 tools... done", color: C.green, delay: 7600 },
  { text: "  Installing agent skills... done", color: C.green, delay: 7900 },
  { text: "", delay: 8000 },
  { text: "  ✓ All set! Run: eval \"$(cli-lock env)\"", color: C.green, delay: 8200 },
];

const Terminal = () => {
  const [visibleLines, setVisibleLines] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const timers = wizardLines.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div
      ref={containerRef}
      style={{
        background: "#0a0a0e",
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "16px 18px",
        height: 420,
        overflow: "auto",
        fontFamily: mono,
        fontSize: 11.5,
        lineHeight: 1.7,
      }}
    >
      {wizardLines.slice(0, visibleLines).map((line, i) => (
        <div key={i} style={{ color: line.color || C.text, minHeight: line.text ? "auto" : 8 }}>
          {line.text || "\u00A0"}
        </div>
      ))}
      {visibleLines < wizardLines.length && (
        <span style={{ color: C.green, animation: "blink 1s infinite" }}>▊</span>
      )}
      <style>{`@keyframes blink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }`}</style>
    </div>
  );
};

export default function CliLockViz() {
  const [tab, setTab] = useState("overview");
  const [agentToggles, setAgentToggles] = useState({ claude: true, gemini: true, openai: false, cursor: false });

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: sans, padding: 24 }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: mono, fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em" }}>cli-lock</div>
          <div style={{ color: C.dim, fontSize: 14, marginTop: 4 }}>
            A package manager for CLI tools
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, marginBottom: 20, background: C.surface, borderRadius: 8, padding: 3 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 10px",
              background: tab === t.id ? C.surfaceAlt : "transparent",
              border: tab === t.id ? `1px solid ${C.borderHi}` : "1px solid transparent",
              borderRadius: 6, color: tab === t.id ? C.text : C.muted,
              fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: sans,
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            {/* Hero */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "20px 24px", textAlign: "center", marginBottom: 16,
            }}>
              <div style={{ fontFamily: mono, fontSize: 18, color: C.green, marginBottom: 6 }}>
                $ npx cli-lock init
              </div>
              <div style={{ fontSize: 13, color: C.dim }}>
                Scans your project → detects agents & configs → prompts through setup → installs everything
              </div>
            </div>

            {/* Three pillars */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { icon: "📦", title: "Install Tools", desc: "npm packages + GitHub binaries, pinned by version and hash", color: C.blue },
                { icon: "🤖", title: "Agent Skills", desc: "Auto-generate skill files for Claude, Gemini, Cursor, Codex, etc.", color: C.orange },
                { icon: "⚙️", title: "Config Updates", desc: "Detect turbo.json, vercel.json, CI configs and offer integration", color: C.green },
              ].map((p, i) => (
                <div key={i} style={{
                  background: C.surface, border: `1px solid ${p.color}25`, borderRadius: 8, padding: "14px 16px",
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: p.color, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 11.5, color: C.dim, lineHeight: 1.5 }}>{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Flow */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 24px 1fr 24px 1fr 24px 1fr 24px 1fr",
              alignItems: "center", marginBottom: 16,
            }}>
              {[
                { label: "Scan", sub: "detect project", color: C.green },
                null,
                { label: "Prompt", sub: "agents + configs", color: C.orange },
                null,
                { label: "Lock", sub: "pin versions", color: C.blue },
                null,
                { label: "Install", sub: "tools to .cli/", color: C.cyan },
                null,
                { label: "Skills", sub: "agent files", color: C.purple },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>→</div>
                ) : (
                  <div key={i} style={{
                    background: C.surface, border: `1px solid ${item.color}28`, borderRadius: 7,
                    padding: "10px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: item.color }}>{item.label}</div>
                    <div style={{ fontSize: 9.5, color: C.muted, marginTop: 2 }}>{item.sub}</div>
                  </div>
                )
              )}
            </div>

            {/* skills.sh interop */}
            <div style={{
              background: `${C.purple}08`, border: `1px solid ${C.purple}20`, borderRadius: 8,
              padding: "13px 16px", display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16 }}>🔌</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.purple, marginBottom: 3 }}>skills.sh compatible</div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>
                  <code style={{ fontFamily: mono, color: C.text, fontSize: 11 }}>cli-lock import --from-skill skills.sh/docx-creation</code>
                  {" "}— pulls a skill's tool deps into your config. cli-lock handles tools, skills.sh handles knowledge.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WIZARD ── */}
        {tab === "wizard" && (
          <div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 14, lineHeight: 1.6 }}>
              The init wizard scans your project and walks you through setup interactively — similar to how Convex prompts you to install agent files when connecting to a project.
            </div>
            <Terminal />
            <div style={{
              marginTop: 12, padding: "12px 16px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.dim,
            }}>
              <span style={{ color: C.green, fontWeight: 600 }}>Non-interactive mode:</span>{" "}
              <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}>npx cli-lock init --yes</code>
              {" "}accepts all defaults.{" "}
              <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}>--no-skills</code>
              {" "}and{" "}
              <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}>--no-configs</code>
              {" "}skip those sections.
            </div>
          </div>
        )}

        {/* ── AGENTS ── */}
        {tab === "agents" && (
          <div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 1.6 }}>
              cli-lock detects which AI agent harnesses are configured in your project and offers to install
              pre-made skill files that teach each agent how to use your CLI tools.
            </div>

            {/* Agent grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {agents.map(a => (
                <div key={a.id} style={{
                  background: C.surface, border: `1px solid ${a.color}20`, borderRadius: 8,
                  padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: a.color }}>{a.name}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, fontFamily: mono, marginTop: 2 }}>
                      detects: {a.signal}
                    </div>
                    <div style={{ fontSize: 10.5, color: C.dim, marginTop: 2 }}>
                      installs to: {a.dir}skills/cli-lock/
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* What gets generated */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "16px 18px",
            }}>
              <div style={{
                fontFamily: mono, fontSize: 11, fontWeight: 600, color: C.dim, marginBottom: 12,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>Generated Skill File Structure</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.orange, fontFamily: mono, marginBottom: 8 }}>
                    Claude / Gemini / Cursor (simple)
                  </div>
                  <pre style={{
                    background: C.bg, borderRadius: 6, padding: "10px 12px",
                    fontFamily: mono, fontSize: 11, lineHeight: 1.6, color: C.dim, margin: 0,
                  }}>
{`.claude/
└── skills/
    └── cli-lock/
        └── SKILL.md

.gemini/
└── skills/
    └── cli-lock/
        └── SKILL.md`}
                  </pre>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.green, fontFamily: mono, marginBottom: 8 }}>
                    OpenAI / Codex (skills.sh pattern)
                  </div>
                  <pre style={{
                    background: C.bg, borderRadius: 6, padding: "10px 12px",
                    fontFamily: mono, fontSize: 11, lineHeight: 1.6, color: C.dim, margin: 0,
                  }}>
{`.agents/
└── skills/
    └── cli-lock/
        ├── agents/
        │   └── openai.yaml
        ├── references/
        │   └── tool-usage.md
        └── SKILL.md`}
                  </pre>
                </div>
              </div>

              <div style={{
                marginTop: 14, padding: "10px 14px", background: `${C.cyan}08`,
                border: `1px solid ${C.cyan}18`, borderRadius: 6, fontSize: 12, color: C.dim,
              }}>
                <span style={{ color: C.cyan, fontWeight: 600 }}>Auto-synced:</span>{" "}
                The tool list in each SKILL.md is auto-generated from <code style={{ fontFamily: mono, fontSize: 11 }}>cli-lock.toml</code>.
                Run <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}>cli-lock skills sync</code> after
                adding/removing tools to keep them up to date.
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIGS ── */}
        {tab === "configs" && (
          <div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 1.6 }}>
              cli-lock scans for infrastructure config files and offers to integrate — adding build steps,
              pipeline tasks, or CI steps so your tools are always installed before they're needed.
            </div>

            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              overflow: "hidden",
            }}>
              {configs.map((c, i) => (
                <div key={c.file} style={{
                  padding: "12px 16px",
                  borderBottom: i < configs.length - 1 ? `1px solid ${C.border}` : "none",
                  display: "flex", gap: 14, alignItems: "center",
                }}>
                  <div style={{ flex: "0 0 180px" }}>
                    <code style={{ fontFamily: mono, fontSize: 12, color: c.color, fontWeight: 500 }}>
                      {c.file}
                    </code>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{c.what}</div>
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: C.dim }}>{c.action}</div>
                </div>
              ))}
            </div>

            {/* Example: turbo.json */}
            <div style={{
              marginTop: 14, background: C.surface, border: `1px solid ${C.orange}20`,
              borderRadius: 10, padding: "16px 18px",
            }}>
              <div style={{
                fontFamily: mono, fontSize: 11, fontWeight: 600, color: C.orange, marginBottom: 10,
              }}>Example: turbo.json integration</div>
              <pre style={{
                background: C.bg, borderRadius: 6, padding: "12px 14px",
                fontFamily: mono, fontSize: 11, lineHeight: 1.65, color: C.dim, margin: 0,
              }}>
{`{
  "tasks": {
    "cli-lock:install": {
      "cache": true,
      "inputs": ["cli-lock.toml", "cli-lock.lock"],
      "outputs": [".cli/**"]
    },
    "build": {
      "dependsOn": ["cli-lock:install"]
    },
    "lint": {
      "dependsOn": ["cli-lock:install"]
    },
    "test": {
      "dependsOn": ["cli-lock:install"]
    }
  }
}`}
              </pre>
              <div style={{ fontSize: 11.5, color: C.dim, marginTop: 10, lineHeight: 1.5 }}>
                Turbo caches the installation — tools are only re-installed when
                {" "}<code style={{ fontFamily: mono, fontSize: 10.5 }}>cli-lock.toml</code> or
                {" "}<code style={{ fontFamily: mono, fontSize: 10.5 }}>cli-lock.lock</code> change.
              </div>
            </div>

            {/* Example: GitHub Actions */}
            <div style={{
              marginTop: 10, background: C.surface, border: `1px solid ${C.dim}20`,
              borderRadius: 10, padding: "16px 18px",
            }}>
              <div style={{
                fontFamily: mono, fontSize: 11, fontWeight: 600, color: C.dim, marginBottom: 10,
              }}>Example: GitHub Actions step</div>
              <pre style={{
                background: C.bg, borderRadius: 6, padding: "12px 14px",
                fontFamily: mono, fontSize: 11, lineHeight: 1.65, color: C.dim, margin: 0,
              }}>
{`- name: Install CLI tools
  run: |
    npx cli-lock install --frozen
    echo "$(pwd)/.cli/bin" >> $GITHUB_PATH

- name: Lint & test
  run: |
    prettier --check .
    eslint .
    vitest run`}
              </pre>
            </div>
          </div>
        )}

        {/* ── COMMANDS ── */}
        {tab === "commands" && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            overflow: "hidden",
          }}>
            {commands.map((c, i) => (
              <div key={c.cmd} style={{
                padding: "10px 16px",
                borderBottom: i < commands.length - 1 ? `1px solid ${C.border}` : "none",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: "0 0 250px", display: "flex", alignItems: "center", gap: 8 }}>
                  <code style={{ fontFamily: mono, fontSize: 11.5, color: c.color, fontWeight: 500 }}>
                    {c.cmd}
                  </code>
                  {c.badge && <Badge color={c.color}>{c.badge}</Badge>}
                </div>
                <div style={{ flex: 1, fontSize: 11.5, color: C.dim }}>{c.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
