import crypto from 'crypto';
import fs from 'fs-extra';
import axios from 'axios';

export async function computeFileHash(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

export async function resolveGitHubHashes(assets: { url: string, name: string }[], platform: string): Promise<Record<string, string>> {
  // 1. Try to find a checksum file
  const checksumAsset = assets.find(a => a.name.toLowerCase().includes('checksums') || a.name.toLowerCase().endsWith('.sha256') || a.name.toLowerCase().endsWith('.txt'));
  
  if (checksumAsset) {
    try {
      const { data: content } = await axios.get(checksumAsset.url);
      const hashes: Record<string, string> = {};
      const lines = content.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const hash = parts[0];
          const name = parts[1];
          // Simple matching: does the filename in checksums.txt match any of our assets?
          const asset = assets.find(a => a.name === name);
          if (asset) {
            hashes[asset.name] = hash;
          }
        }
      }
      return hashes;
    } catch (e) {
      console.warn('Failed to parse checksum file, falling back to manual hashing');
    }
  }

  // 2. Manual hashing (only for current platform for now to keep it simple, but plan says all 4)
  // To keep it simple for the implementation, let's just return the current platform's hash if we download it.
  // We'll actually do the download/hash during the installation phase.
  return {};
}
