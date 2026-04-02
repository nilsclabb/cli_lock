import * as p from '@clack/prompts';
import { scanProject } from '../scanner.js';
import fs from 'fs-extra';
import path from 'path';

export async function initCommand(rootDir: string, options: { yes?: boolean }) {
  p.intro('cli-lock setup wizard');

  const s = p.spinner();
  s.start('Scanning project...');
  const scan = await scanProject(rootDir);
  s.stop('Scan complete!');

  if (scan.isNodeProject) {
    p.note('Detected Node.js project. Ready to manage tools from package.json.');
  }

  // 1. Tool selection
  const selectedTools = await p.multiselect({
    message: 'Which CLI tools should cli-lock manage?',
    options: scan.detectedTools.map(t => ({ value: t, label: t, hint: 'auto-detected' })),
    initialValues: scan.detectedTools,
  });

  if (p.isCancel(selectedTools)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // 2. Agent selection
  const selectedAgents = await p.multiselect({
    message: 'Install cli-lock skill files for these agents?',
    options: scan.detectedAgents.map(a => ({ value: a, label: a, hint: 'detected harness' })),
    initialValues: scan.detectedAgents,
  });

  if (p.isCancel(selectedAgents)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // 3. Infrastructure updates
  for (const config of scan.detectedConfigs) {
    const confirm = await p.confirm({
      message: `Detected ${config}. Add cli-lock integration?`,
      initialValue: true,
    });
    if (confirm) {
      p.log.info(`Integration recipe for ${config} not yet implemented (coming in Phase 5)`);
    }
  }

  // 4. Final confirmation and file creation
  const finalize = await p.confirm({
    message: 'Create cli-lock.toml and install tools?',
    initialValue: true,
  });

  if (finalize) {
    const config = {
      meta: { node: ">=20" },
      tools: {} as Record<string, any>,
    };

    for (const tool of selectedTools as string[]) {
      config.tools[tool] = { version: "latest", provider: "npm" }; // Simple for init
    }

    await fs.writeJson(path.join(rootDir, 'cli-lock.toml'), config, { spaces: 2 });
    p.outro('cli-lock.toml created! Run cli-lock install to finish.');
  } else {
    p.cancel('Setup cancelled.');
  }
}
