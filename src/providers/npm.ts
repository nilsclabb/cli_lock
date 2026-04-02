import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { ToolConfig } from '../types.js';

export interface NpmInstallResult {
  version: string;
  integrity: string;
}

export async function installNpmTool(name: string, config: ToolConfig, rootDir: string): Promise<NpmInstallResult> {
  const npmDir = path.join(rootDir, '.cli', 'npm');
  const binName = config.package || name;
  const version = config.version;

  await fs.ensureDir(npmDir);

  // Initialize or update package.json in .cli/npm
  const pkgPath = path.join(npmDir, 'package.json');
  let pkg: { name: string, private: boolean, dependencies: Record<string, string> } = { name: 'cli-lock-npm-prefix', private: true, dependencies: {} };
  if (await fs.pathExists(pkgPath)) {
    pkg = await fs.readJson(pkgPath);
  }
  
  pkg.dependencies[binName] = version;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // Run npm install --prefix .cli/npm --ignore-scripts --no-audit --no-fund
  // We use bun if available for speed, fallback to npm
  const command = `npm install --prefix .cli/npm --ignore-scripts --no-audit --no-fund`;
  execSync(command, { stdio: 'pipe' });

  // Read back the exact version and integrity from package-lock.json
  const lockPath = path.join(npmDir, 'package-lock.json');
  const lock = await fs.readJson(lockPath);
  
  // Find the exact package in lockfile (handle names with @)
  const nodeModulesPath = `node_modules/${binName}`;
  const entry = lock.packages[nodeModulesPath];

  if (!entry) {
    throw new Error(`Failed to find ${binName} in package-lock.json`);
  }

  return {
    version: entry.version,
    integrity: entry.integrity,
  };
}
