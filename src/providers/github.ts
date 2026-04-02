import path from 'path';
import fs from 'fs-extra';
import { ToolConfig } from '../types.js';

export interface GitHubAsset {
  url: string;
  name: string;
}

export function detectPlatform() {
  const os = process.platform === 'darwin' ? 'darwin' : 'linux';
  let arch: string = process.arch;
  if (arch === 'aarch64') arch = 'arm64';
  if (arch === 'x86_64' || arch === 'amd64') arch = 'x64';
  return `${os}-${arch}`;
}

export function matchAsset(assets: GitHubAsset[], platform: string): GitHubAsset | null {
  const [os, arch] = platform.split('-');
  
  // Scoring assets based on platform/arch keywords
  const scores = assets.map(asset => {
    let score = 0;
    const name = asset.name.toLowerCase();

    // OS match
    if (os === 'darwin' && (name.includes('darwin') || name.includes('macos') || name.includes('apple'))) score += 10;
    if (os === 'linux' && name.includes('linux')) score += 10;

    // Arch match
    if (arch === 'arm64' && (name.includes('arm64') || name.includes('aarch64'))) score += 10;
    if (arch === 'x64' && (name.includes('x64') || name.includes('amd64') || name.includes('x86_64'))) score += 10;

    // Filter out obvious mismatches
    if (os === 'darwin' && name.includes('linux')) score = -100;
    if (os === 'linux' && (name.includes('darwin') || name.includes('macos'))) score = -100;
    if (arch === 'arm64' && (name.includes('x64') || name.includes('amd64'))) score = -50;
    if (arch === 'x64' && (name.includes('arm64') || name.includes('aarch64'))) score = -50;

    // File type priority
    if (name.endsWith('.tar.gz') || name.endsWith('.zip') || name.endsWith('.tar.xz')) score += 5;
    if (name.endsWith('.sha256') || name.endsWith('.txt') || name.endsWith('.sig')) score = -200; // ignore metadata files here

    return { asset, score };
  });

  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best && best.score > 10 ? best.asset : null;
}
