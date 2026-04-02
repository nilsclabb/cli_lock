import fs from 'fs-extra';
import path from 'path';
import { parseConfig } from '../config.js';
import { installNpmTool } from '../providers/npm.js';
import { linkTool, ensureDirectoryStructure } from '../fs.js';

export async function installCommand(rootDir: string, options: { frozen?: boolean }) {
  const configPath = path.join(rootDir, 'cli-lock.toml');
  if (!await fs.pathExists(configPath)) {
    console.error('cli-lock.toml not found. Run cli-lock init first.');
    process.exit(1);
  }

  const configContent = await fs.readFile(configPath, 'utf8');
  const config = parseConfig(configContent);

  await ensureDirectoryStructure(rootDir);

  for (const [name, tool] of Object.entries(config.tools)) {
    console.log(`Installing ${name}...`);
    if (tool.provider === 'npm') {
      const result = await installNpmTool(name, tool, rootDir);
      const binPath = path.join(rootDir, '.cli', 'npm', 'node_modules', '.bin', tool.package || name);
      await linkTool(binPath, name, rootDir);
      console.log(`✓ ${name}@${result.version} installed`);
    } else {
      console.warn(`Provider ${tool.provider} for ${name} not yet implemented (coming in Phase 3)`);
    }
  }

  console.log('Installation complete! Run: eval "$(cli-lock env)"');
}
