import fs from 'fs-extra';
import path from 'path';

export interface ScanResult {
  detectedTools: string[];
  detectedAgents: string[];
  detectedConfigs: string[];
  isNodeProject: boolean;
}

export async function scanProject(rootDir: string): Promise<ScanResult> {
  const detectedTools: string[] = [];
  const detectedAgents: string[] = [];
  const detectedConfigs: string[] = [];
  let isNodeProject = false;

  const files = await fs.readdir(rootDir);

  // 1. Detect agents
  if (files.includes('.claude') || files.includes('CLAUDE.md')) detectedAgents.push('claude');
  if (files.includes('.gemini')) detectedAgents.push('gemini');
  if (files.includes('.agents')) detectedAgents.push('openai');
  if (files.includes('.cursor') || files.includes('.cursorrules')) detectedAgents.push('cursor');
  if (files.includes('.windsurf') || files.includes('.windsurfrules')) detectedAgents.push('windsurf');
  if (files.includes('.cline') || files.includes('.clinerules')) detectedAgents.push('cline');
  if (files.includes('.aider.conf.yml') || files.includes('.aiderignore')) detectedAgents.push('aider');
  if (files.includes('.amp')) detectedAgents.push('amp');
  if (files.includes('.pi')) detectedAgents.push('pi');

  // 2. Detect configs
  if (files.includes('turbo.json')) detectedConfigs.push('turbo.json');
  if (files.includes('vercel.json')) detectedConfigs.push('vercel.json');
  if (files.includes('render.yaml')) detectedConfigs.push('render.yaml');
  if (files.includes('netlify.toml')) detectedConfigs.push('netlify.toml');
  if (files.includes('fly.toml')) detectedConfigs.push('fly.toml');
  if (files.includes('Dockerfile')) detectedConfigs.push('Dockerfile');
  if (files.includes('nx.json')) detectedConfigs.push('nx.json');
  if (files.includes('Makefile')) detectedConfigs.push('Makefile');
  if (await fs.pathExists(path.join(rootDir, '.github', 'workflows'))) detectedConfigs.push('.github/workflows/');

  // 3. Detect Node.js project and tools in devDependencies
  if (files.includes('package.json')) {
    isNodeProject = true;
    const pkg = await fs.readJson(path.join(rootDir, 'package.json'));
    const devDeps = pkg.devDependencies || {};
    
    // Tools we recognize and can manage via cli-lock
    const knownTools = ['prettier', 'eslint', 'turbo', 'biome', 'vitest', 'tsx', 'gh', 'jq', 'terraform'];
    for (const tool of knownTools) {
      if (devDeps[tool]) detectedTools.push(tool);
    }
  }

  return { detectedTools, detectedAgents, detectedConfigs, isNodeProject };
}
