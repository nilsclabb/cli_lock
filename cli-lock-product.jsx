import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#08080c",
  surface: "#101018",
  card: "#151522",
  border: "#222238",
  borderHi: "#363658",
  text: "#eaeaf2",
  dim: "#8888a8",
  muted: "#4a4a68",
  green: "#22c55e",
  greenSoft: "#16a34a",
  blue: "#3b82f6",
  orange: "#f97316",
  purple: "#a78bfa",
  cyan: "#06b6d4",
  red: "#ef4444",
  pink: "#ec4899",
  yellow: "#eab308",
};

const mono = "'JetBrains Mono','SF Mono','Fira Code',monospace";
const sans = "'Inter',system-ui,-apple-system,sans-serif";

// ─── Terminal Component ───
const Term = ({ lines, height = 400, autoplay = true, speed = 1 }) => {
  const [visible, setVisible] = useState(autoplay ? 0 : lines.length);
  const ref = useRef(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!autoplay) return;
    setVisible(0);
    const timers = lines.map((l, i) =>
      setTimeout(() => setVisible(i + 1), (l.delay || i * 120) / speed)
    );
    return () => timers.forEach(clearTimeout);
  }, [key, autoplay, speed]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [visible]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} style={{
        background: "#06060a", border: `1px solid ${C.border}`, borderRadius: 10,
        padding: "14px 16px", height, overflow: "auto", fontFamily: mono, fontSize: 11.5, lineHeight: 1.7,
      }}>
        {lines.slice(0, visible).map((l, i) => (
          <div key={i} style={{ color: l.color || C.dim, minHeight: l.text ? "auto" : 6, fontWeight: l.bold ? 600 : 400 }}>
            {l.text || "\u00A0"}
          </div>
        ))}
        {autoplay && visible < lines.length && (
          <span style={{ color: C.green, animation: "blink 1s infinite" }}>▊</span>
        )}
      </div>
      {autoplay && visible >= lines.length && (
        <button onClick={() => setKey(k => k + 1)} style={{
          position: "absolute", top: 10, right: 10, background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 5, padding: "4px 10px", color: C.muted, fontSize: 10, cursor: "pointer", fontFamily: mono,
        }}>replay</button>
      )}
      <style>{`@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}`}</style>
    </div>
  );
};

// ─── Section Header ───
const SectionHead = ({ number, title, subtitle }) => (
  <div style={{ marginBottom: 16, marginTop: 36 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, background: `${C.green}12`, border: `1px solid ${C.green}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: mono, fontSize: 12, fontWeight: 700, color: C.green,
      }}>{number}</div>
      <div style={{ fontFamily: mono, fontSize: 17, fontWeight: 600, color: C.text }}>{title}</div>
    </div>
    {subtitle && <div style={{ fontSize: 13, color: C.dim, marginTop: 6, marginLeft: 38, lineHeight: 1.5 }}>{subtitle}</div>}
  </div>
);

// ─── Info Box ───
const InfoBox = ({ color, icon, children }) => (
  <div style={{
    background: `${color}06`, border: `1px solid ${color}18`, borderRadius: 8,
    padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", marginTop: 10,
  }}>
    {icon && <span style={{ fontSize: 14, marginTop: 1 }}>{icon}</span>}
    <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.6 }}>{children}</div>
  </div>
);

// ─── Code Block ───
const Code = ({ children, color = C.border, title }) => (
  <div style={{ marginTop: 10 }}>
    {title && <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>}
    <pre style={{
      background: "#06060a", border: `1px solid ${color}30`, borderRadius: 7,
      padding: "12px 14px", fontFamily: mono, fontSize: 11, lineHeight: 1.65,
      color: C.dim, margin: 0, overflow: "auto", whiteSpace: "pre",
    }}>{children}</pre>
  </div>
);

// ─── File Tree ───
const FileTree = ({ files }) => (
  <pre style={{
    background: "#06060a", border: `1px solid ${C.border}`, borderRadius: 7,
    padding: "12px 14px", fontFamily: mono, fontSize: 11, lineHeight: 1.65,
    color: C.dim, margin: 0, marginTop: 10,
  }}>{files}</pre>
);

// ─── INIT WIZARD LINES ───
const initLines = [
  { text: "$ npx cli-lock init", color: C.text, delay: 0, bold: true },
  { text: "", delay: 300 },
  { text: "  ┌  cli-lock v0.1.0", color: C.green, delay: 500, bold: true },
  { text: "  │", delay: 600 },
  { text: "  ◇  Scanning project...", color: C.dim, delay: 800 },
  { text: "  │", delay: 1000 },
  { text: "  │  Found:", color: C.dim, delay: 1200 },
  { text: "  │  ✓ package.json        → Node.js project", color: C.green, delay: 1400 },
  { text: "  │  ✓ turbo.json          → Turborepo monorepo", color: C.green, delay: 1600 },
  { text: "  │  ✓ vercel.json         → Vercel deployment", color: C.green, delay: 1800 },
  { text: "  │  ✓ .claude/            → Claude Code", color: C.green, delay: 2000 },
  { text: "  │  ✓ .cursor/            → Cursor AI", color: C.green, delay: 2200 },
  { text: "  │  ✓ .agents/skills/     → skills.sh", color: C.green, delay: 2400 },
  { text: "  │", delay: 2600 },
  { text: "  ◆  Which CLI tools does this project use?", color: C.text, delay: 2800, bold: true },
  { text: "  │  (auto-detected from package.json & config files)", color: C.dim, delay: 3000 },
  { text: "  │", delay: 3100 },
  { text: "  │  ● prettier     (detected: .prettierrc.json)", color: C.cyan, delay: 3200 },
  { text: "  │  ● eslint       (detected: eslint.config.js)", color: C.cyan, delay: 3300 },
  { text: "  │  ● turbo        (detected: turbo.json)", color: C.cyan, delay: 3400 },
  { text: "  │  ● biome        (detected: biome.json)", color: C.cyan, delay: 3500 },
  { text: "  │  ● vitest       (detected: vitest.config.ts)", color: C.cyan, delay: 3600 },
  { text: "  │  ○ tsx", color: C.muted, delay: 3700 },
  { text: "  │  ○ gh           (GitHub CLI)", color: C.muted, delay: 3800 },
  { text: "  │", delay: 3900 },
  { text: "  │  ↳ Confirmed 5 tools", color: C.green, delay: 4200 },
  { text: "  │", delay: 4400 },
  { text: "  ◆  Agent skill files", color: C.text, delay: 4600, bold: true },
  { text: "  │  Install cli-lock skills so your agents know", color: C.dim, delay: 4800 },
  { text: "  │  which tools are available and how to use them?", color: C.dim, delay: 4900 },
  { text: "  │", delay: 5100 },
  { text: "  │  ● Claude Code  → .claude/skills/cli-lock/SKILL.md", color: C.orange, delay: 5300 },
  { text: "  │  ● Cursor       → .cursor/skills/cli-lock/SKILL.md", color: C.purple, delay: 5500 },
  { text: "  │  ● skills.sh    → .agents/skills/cli-lock/SKILL.md", color: C.green, delay: 5700 },
  { text: "  │", delay: 5900 },
  { text: "  │  ↳ Installing 3 agent skill files", color: C.green, delay: 6100 },
  { text: "  │", delay: 6300 },
  { text: "  ◆  Project config integration", color: C.text, delay: 6500, bold: true },
  { text: "  │  Update configs to run cli-lock automatically?", color: C.dim, delay: 6700 },
  { text: "  │", delay: 6800 },
  { text: "  │  ● turbo.json   → add cli-lock:install task", color: C.orange, delay: 7000 },
  { text: "  │    dependsOn for build, lint, test", color: C.dim, delay: 7100 },
  { text: "  │  ○ vercel.json  → skip (using turbo)", color: C.muted, delay: 7300 },
  { text: "  │", delay: 7500 },
  { text: "  │  ↳ Updated turbo.json", color: C.green, delay: 7700 },
  { text: "  │", delay: 7900 },
  { text: "  ◇  Resolving versions...", color: C.dim, delay: 8100 },
  { text: "  │  prettier   ^3.2  →  3.4.2  (npm)", color: C.dim, delay: 8300 },
  { text: "  │  eslint     ^9.0  →  9.22.0 (npm)", color: C.dim, delay: 8400 },
  { text: "  │  turbo      ^2.3  →  2.3.3  (npm)", color: C.dim, delay: 8500 },
  { text: "  │  biome      ^1.9  →  1.9.4  (npm)", color: C.dim, delay: 8600 },
  { text: "  │  vitest     ^3.0  →  3.0.4  (npm)", color: C.dim, delay: 8700 },
  { text: "  │", delay: 8900 },
  { text: "  ◇  Installing to .cli/bin/...", color: C.dim, delay: 9100 },
  { text: "  │  ████████████████████████  5/5", color: C.green, delay: 9500 },
  { text: "  │", delay: 9700 },
  { text: "  └  Done!", color: C.green, delay: 9900, bold: true },
  { text: "", delay: 10000 },
  { text: "  Files created:", color: C.dim, delay: 10200 },
  { text: "    cli-lock.toml", color: C.blue, delay: 10300 },
  { text: "    cli-lock.lock", color: C.green, delay: 10400 },
  { text: "    .claude/skills/cli-lock/SKILL.md", color: C.orange, delay: 10500 },
  { text: "    .cursor/skills/cli-lock/SKILL.md", color: C.purple, delay: 10600 },
  { text: "    .agents/skills/cli-lock/SKILL.md", color: C.green, delay: 10700 },
  { text: "    turbo.json  (updated)", color: C.orange, delay: 10800 },
  { text: "    .gitignore  (added .cli/)", color: C.dim, delay: 10900 },
  { text: "", delay: 11000 },
  { text: "  Next: eval \"$(cli-lock env)\"", color: C.text, delay: 11200, bold: true },
];

// ─── INSTALL LINES ───
const installLines = [
  { text: "$ cli-lock install", color: C.text, delay: 0, bold: true },
  { text: "", delay: 200 },
  { text: "  Checking cli-lock.lock... up to date", color: C.dim, delay: 400 },
  { text: "", delay: 500 },
  { text: "  prettier   3.4.2   ✓ cached", color: C.green, delay: 700 },
  { text: "  eslint     9.22.0  ✓ cached", color: C.green, delay: 800 },
  { text: "  turbo      2.3.3   ✓ cached", color: C.green, delay: 900 },
  { text: "  biome      1.9.4   ✓ cached", color: C.green, delay: 1000 },
  { text: "  vitest     3.0.4   ✓ cached", color: C.green, delay: 1100 },
  { text: "", delay: 1200 },
  { text: "  5 tools installed to .cli/bin/", color: C.green, delay: 1400, bold: true },
];

const addLines = [
  { text: "$ cli-lock add gh", color: C.text, delay: 0, bold: true },
  { text: "", delay: 200 },
  { text: "  Searching npm... not found", color: C.dim, delay: 500 },
  { text: "  Searching GitHub... found cli/cli", color: C.dim, delay: 900 },
  { text: "", delay: 1000 },
  { text: "  ◆  Add gh from GitHub Releases?", color: C.text, delay: 1200 },
  { text: "  │  repo: cli/cli", color: C.dim, delay: 1300 },
  { text: "  │  latest: 2.67.0", color: C.dim, delay: 1400 },
  { text: "  │  version range: >=2.67.0", color: C.dim, delay: 1500 },
  { text: "  │", delay: 1600 },
  { text: "  │  ↳ Yes", color: C.green, delay: 1800 },
  { text: "  │", delay: 1900 },
  { text: "  ◇  Resolving for 4 platforms...", color: C.dim, delay: 2100 },
  { text: "  │  darwin-arm64  gh_2.67.0_macOS_arm64.zip", color: C.dim, delay: 2400 },
  { text: "  │  darwin-x64    gh_2.67.0_macOS_amd64.zip", color: C.dim, delay: 2600 },
  { text: "  │  linux-x64     gh_2.67.0_linux_amd64.tar.gz", color: C.dim, delay: 2800 },
  { text: "  │  linux-arm64   gh_2.67.0_linux_arm64.tar.gz", color: C.dim, delay: 3000 },
  { text: "  │", delay: 3100 },
  { text: "  ◇  Installing for darwin-arm64...", color: C.dim, delay: 3300 },
  { text: "  │  ████████████████████████  sha256 ✓", color: C.green, delay: 3700 },
  { text: "  │", delay: 3800 },
  { text: "  ◇  Updating agent skills...", color: C.dim, delay: 4000 },
  { text: "  │  .claude/skills/cli-lock/SKILL.md  ✓", color: C.orange, delay: 4200 },
  { text: "  │  .cursor/skills/cli-lock/SKILL.md  ✓", color: C.purple, delay: 4300 },
  { text: "  │  .agents/skills/cli-lock/SKILL.md  ✓", color: C.green, delay: 4400 },
  { text: "  │", delay: 4500 },
  { text: "  └  Added gh@2.67.0", color: C.green, delay: 4700, bold: true },
  { text: "", delay: 4800 },
  { text: "  Updated: cli-lock.toml, cli-lock.lock", color: C.dim, delay: 5000 },
  { text: "  Updated: 3 agent skill files", color: C.dim, delay: 5100 },
];

const pages = [
  { id: "journey", label: "Full Journey" },
  { id: "init", label: "npx cli-lock init" },
  { id: "install", label: "cli-lock install" },
  { id: "add", label: "cli-lock add" },
  { id: "files", label: "Generated Files" },
];

export default function CliLockProduct() {
  const [page, setPage] = useState("journey");

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: sans, padding: "24px 20px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em" }}>cli-lock</div>
          <div style={{ color: C.dim, fontSize: 13, marginTop: 4 }}>The complete product walkthrough</div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 3, marginBottom: 24, background: C.surface, borderRadius: 8, padding: 3, flexWrap: "wrap" }}>
          {pages.map(p => (
            <button key={p.id} onClick={() => setPage(p.id)} style={{
              flex: 1, minWidth: 100, padding: "8px 8px", background: page === p.id ? C.card : "transparent",
              border: page === p.id ? `1px solid ${C.borderHi}` : "1px solid transparent",
              borderRadius: 6, color: page === p.id ? C.text : C.muted,
              fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: mono,
            }}>{p.label}</button>
          ))}
        </div>

        {/* ═══════════════════════════════════════ JOURNEY ═══════════════════════════════════════ */}
        {page === "journey" && (
          <div>
            <div style={{
              background: C.surface, border: `1px solid ${C.green}20`, borderRadius: 10,
              padding: "18px 22px", marginBottom: 20, textAlign: "center",
            }}>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
                A developer clones a repo (or starts a new project).<br />
                They run <strong style={{ color: C.green, fontFamily: mono }}>npx cli-lock init</strong> once.<br />
                Every future <strong style={{ color: C.blue, fontFamily: mono }}>cli-lock install</strong> is instant.
              </div>
            </div>

            {/* Step 1 */}
            <SectionHead number="1" title="npx cli-lock init" subtitle="Run once per project. The interactive setup wizard scans your project, detects what you're working with, and walks you through setup." />
            <div style={{ marginLeft: 38 }}>
              {[
                { icon: "🔍", label: "Scan", desc: "Reads package.json, finds config files, detects agent directories", color: C.cyan },
                { icon: "📦", label: "Pick tools", desc: "Shows auto-detected CLI tools with checkboxes. Pre-selects tools found in devDependencies and config files.", color: C.blue },
                { icon: "🤖", label: "Agent skills", desc: "For each detected agent harness (.claude/, .cursor/, .agents/, etc.) — offers to install a SKILL.md that lists your tools.", color: C.orange },
                { icon: "⚙️", label: "Config updates", desc: "For each detected infra config (turbo.json, vercel.json, CI files) — offers to add cli-lock install steps with a preview.", color: C.green },
                { icon: "🔒", label: "Resolve & lock", desc: "Resolves all semver ranges to exact versions. Computes SHA-256 hashes for every binary. Writes cli-lock.lock.", color: C.purple },
                { icon: "📥", label: "Install", desc: "Downloads binaries for your platform into .cli/bin/. You're ready to go.", color: C.green },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <div>
                    <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: 12.5, color: C.dim, marginLeft: 8 }}>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 2 */}
            <SectionHead number="2" title="cli-lock install" subtitle="Run by every developer and every CI job. Reads the lock file and installs exact pinned versions. Fast — skips anything already cached." />
            <div style={{ marginLeft: 38 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "First run", desc: "Resolve → lock → install (2-10s)", color: C.blue },
                  { label: "Repeat run", desc: "Read lock → install from cache (<1s)", color: C.green },
                  { label: "CI (--frozen)", desc: "Read lock only → fail if stale", color: C.orange },
                ].map((m, i) => (
                  <div key={i} style={{ background: C.card, border: `1px solid ${m.color}20`, borderRadius: 7, padding: "10px 12px" }}>
                    <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: m.color, marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <SectionHead number="3" title='eval "$(cli-lock env)"' subtitle="Activate. Prepends .cli/bin/ to your $PATH. Every declared tool is now directly callable. Add to your shell profile for auto-activation." />

            {/* Step 4 */}
            <SectionHead number="4" title="Daily use" subtitle="Add, remove, and update tools as your project evolves. Agent skill files auto-update to stay in sync." />
            <div style={{ marginLeft: 38 }}>
              <Code>{`cli-lock add gh                    # adds tool, installs, updates skill files
cli-lock remove jq                 # removes tool, cleans up
cli-lock update prettier           # re-resolve to latest matching version
cli-lock update                    # update everything
cli-lock outdated                  # see what's behind`}</Code>
            </div>

            {/* Step 5 */}
            <SectionHead number="5" title="Teammate / agent clones repo" subtitle="They get the exact same tools at the exact same versions. One command." />
            <div style={{ marginLeft: 38 }}>
              <Code>{`git clone <repo>
cd <repo>
npx cli-lock install               # or: sh .cli/bootstrap.sh
eval "$(cli-lock env)"
# done — every tool is ready`}</Code>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ INIT ═══════════════════════════════════════ */}
        {page === "init" && (
          <div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 1.6 }}>
              This is what you see in your terminal when you run <code style={{ fontFamily: mono, color: C.green }}>npx cli-lock init</code> in a project directory.
              The wizard uses <strong style={{ color: C.text }}>clack</strong>-style prompts — clean, navigable with arrow keys, no walls of text.
            </div>
            <Term lines={initLines} height={520} speed={1} />
            <InfoBox color={C.blue} icon="💡">
              <strong style={{ color: C.blue }}>Non-interactive mode:</strong>{" "}
              <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}>npx cli-lock init --yes</code> accepts all defaults.
              <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}> --no-skills</code> skips agent files.
              <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}> --no-configs</code> skips config updates.
              Perfect for scripting and CI bootstrapping.
            </InfoBox>
          </div>
        )}

        {/* ═══════════════════════════════════════ INSTALL ═══════════════════════════════════════ */}
        {page === "install" && (
          <div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 1.6 }}>
              The everyday command. Like <code style={{ fontFamily: mono, color: C.text }}>bun install</code> or <code style={{ fontFamily: mono, color: C.text }}>npm install</code> — reads the lock file, installs what's missing, verifies hashes. Fast.
            </div>

            <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Repeat install (everything cached)
            </div>
            <Term lines={installLines} height={240} speed={1} />

            <div style={{ marginTop: 20, fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              What happens under the hood
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
              {[
                { step: "1", text: "Parse cli-lock.lock", detail: "Read pinned versions and hashes", color: C.blue },
                { step: "2", text: "Check .cli/bin/", detail: "Skip tools already installed at correct version", color: C.cyan },
                { step: "3a", text: "npm tools: generate .cli/npm/package.json", detail: "Exact versions from lock → npm install --prefix .cli/npm --ignore-scripts", color: C.green },
                { step: "3b", text: "github tools: download from pinned URLs", detail: "Check .cli/cache/ first → download if missing → verify SHA-256", color: C.green },
                { step: "4", text: "Symlink into .cli/bin/", detail: "npm: node_modules/.bin/prettier → .cli/bin/prettier | github: .cli/store/gh/2.67.0/gh → .cli/bin/gh", color: C.purple },
                { step: "5", text: "Verify integrity", detail: "Hash every installed binary against the lock file", color: C.orange },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 5, background: `${s.color}12`, border: `1px solid ${s.color}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: mono, fontSize: 10, fontWeight: 700, color: s.color, flexShrink: 0,
                  }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 12, color: C.text }}>{s.text}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: mono }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <InfoBox color={C.orange} icon="🔒">
              <strong style={{ color: C.orange }}>CI mode:</strong>{" "}
              <code style={{ fontFamily: mono, fontSize: 11, color: C.text }}>cli-lock install --frozen</code> refuses to resolve or update the lock file. If cli-lock.toml has changed without a corresponding lock update, it fails. This guarantees CI installs exactly what was code-reviewed.
            </InfoBox>
          </div>
        )}

        {/* ═══════════════════════════════════════ ADD ═══════════════════════════════════════ */}
        {page === "add" && (
          <div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 1.6 }}>
              Adding a new tool. cli-lock auto-detects the provider (checks npm first, then GitHub), resolves the version, installs the binary, and <strong style={{ color: C.text }}>automatically updates your agent skill files</strong> so every agent immediately knows the new tool exists.
            </div>
            <Term lines={addLines} height={440} speed={1} />

            <InfoBox color={C.pink} icon="🤖">
              <strong style={{ color: C.pink }}>Agent skill sync:</strong>{" "}
              When you add or remove a tool, cli-lock automatically regenerates the "Available Tools" table in each agent's SKILL.md. The agents always have an accurate picture of what's installed — no manual updates needed.
            </InfoBox>

            <div style={{ marginTop: 16, fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              More add examples
            </div>
            <Code>{`cli-lock add prettier eslint turbo    # add multiple at once
cli-lock add biome --version "^1.9"   # explicit version range
cli-lock add gh --provider github \\
  --repo cli/cli                       # explicit provider + repo
cli-lock add @biomejs/biome           # scoped npm packages work too`}</Code>
          </div>
        )}

        {/* ═══════════════════════════════════════ FILES ═══════════════════════════════════════ */}
        {page === "files" && (
          <div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 1.6 }}>
              Every file cli-lock creates or touches. Green = committed to git. Gray = gitignored.
            </div>

            <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Project after cli-lock init
            </div>
            <FileTree files={`my-project/
│
├── cli-lock.toml                ← config you edit (committed)
├── cli-lock.lock                ← pinned versions + hashes (committed)
│
├── .cli/                        ← tool store (GITIGNORED)
│   ├── bin/                     ← all tool symlinks
│   │   ├── prettier             →  ../npm/node_modules/.bin/prettier
│   │   ├── eslint               →  ../npm/node_modules/.bin/eslint
│   │   ├── turbo                →  ../npm/node_modules/.bin/turbo
│   │   ├── biome                →  ../npm/node_modules/.bin/biome
│   │   ├── vitest               →  ../npm/node_modules/.bin/vitest
│   │   └── gh                   →  ../store/gh/2.67.0/gh
│   ├── npm/                     ← isolated npm prefix
│   │   ├── package.json         ← auto-generated (exact versions)
│   │   └── node_modules/
│   ├── store/                   ← github/url binaries
│   │   └── gh/2.67.0/gh
│   └── cache/                   ← download cache
│
├── .claude/                     ← (committed)
│   └── skills/
│       └── cli-lock/
│           └── SKILL.md         ← auto-generated, auto-synced
│
├── .cursor/                     ← (committed)
│   └── skills/
│       └── cli-lock/
│           └── SKILL.md
│
├── .agents/                     ← (committed)
│   └── skills/
│       └── cli-lock/
│           ├── agents/
│           │   └── openai.yaml
│           ├── references/
│           │   └── tool-usage.md
│           └── SKILL.md
│
├── turbo.json                   ← (updated with cli-lock task)
└── .gitignore                   ← (added .cli/)`} />

            <div style={{ marginTop: 20, fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              cli-lock.toml
            </div>
            <Code color={C.blue}>{`[meta]
node = ">=20"

[tools]
prettier = { version = "^3.2", provider = "npm" }
eslint   = { version = "^9.0", provider = "npm" }
turbo    = { version = "^2.3", provider = "npm" }
biome    = { version = "^1.9", provider = "npm", package = "@biomejs/biome" }
vitest   = { version = "^3.0", provider = "npm" }
gh       = { version = ">=2.60", provider = "github", repo = "cli/cli" }`}</Code>

            <div style={{ marginTop: 20, fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Generated SKILL.md (for each agent)
            </div>
            <Code color={C.orange}>{`# CLI Tools (cli-lock)

This project uses \`cli-lock\` to manage CLI tool dependencies.
All tools are declared in \`cli-lock.toml\` and pinned in \`cli-lock.lock\`.

## Available Tools

<!-- cli-lock:tools:start -->
| Tool     | Version | Provider              |
|----------|---------|-----------------------|
| prettier | ^3.2    | npm                   |
| eslint   | ^9.0    | npm                   |
| turbo    | ^2.3    | npm                   |
| biome    | ^1.9    | npm (@biomejs/biome)  |
| vitest   | ^3.0    | npm                   |
| gh       | >=2.60  | github (cli/cli)      |
<!-- cli-lock:tools:end -->

## Usage

All tools are on \$PATH after running:

    cli-lock install && eval "$(cli-lock env)"

Or run a tool directly:

    cli-lock exec prettier --write src/

## Adding Tools

When you need a CLI tool not listed above:

    cli-lock add <tool-name>

This updates cli-lock.toml, cli-lock.lock, and this file automatically.
Always commit the changes.

## Rules

- Do NOT install CLI tools globally (npm install -g). Use cli-lock add.
- Do NOT hand-edit cli-lock.lock.
- Run cli-lock install after pulling changes to cli-lock.toml.`}</Code>

            <div style={{ marginTop: 20, fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              turbo.json (updated)
            </div>
            <Code color={C.orange}>{`{
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
}`}</Code>
          </div>
        )}

      </div>
    </div>
  );
}
