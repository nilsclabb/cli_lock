import path from 'path';
import fs from 'fs-extra';

export async function ensureDirectoryStructure(rootDir: string) {
  const cliDir = path.join(rootDir, '.cli');
  await fs.ensureDir(cliDir);
  await fs.ensureDir(path.join(cliDir, 'bin'));
  await fs.ensureDir(path.join(cliDir, 'npm'));
  await fs.ensureDir(path.join(cliDir, 'store'));
  await fs.ensureDir(path.join(cliDir, 'cache'));
}

export async function linkTool(source: string, targetName: string, rootDir: string) {
  const binDir = path.join(rootDir, '.cli', 'bin');
  const targetPath = path.join(binDir, targetName);

  // Source should be relative to binDir for the symlink
  const relativeSource = path.relative(binDir, source);

  // Remove existing symlink or file if it exists
  if (await fs.pathExists(targetPath)) {
    await fs.remove(targetPath);
  }

  await fs.ensureSymlink(source, targetPath);
}
