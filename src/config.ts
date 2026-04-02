import toml from 'toml';
import { z } from 'zod';
import { CliLockConfig } from './types.js';

const ToolConfigSchema = z.object({
  version: z.string(),
  provider: z.enum(['npm', 'github', 'url']),
  package: z.string().optional(),
  repo: z.string().optional(),
  bin: z.union([z.string(), z.array(z.string())]).optional(),
  urls: z.record(z.string()).optional(),
  sha256: z.union([z.string(), z.record(z.string())]).optional(),
});

const CliLockConfigSchema = z.object({
  meta: z.object({
    node: z.string().optional(),
  }).optional(),
  tools: z.record(ToolConfigSchema),
});

export function parseConfig(content: string): CliLockConfig {
  try {
    const raw = toml.parse(content);
    return CliLockConfigSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${error.message}`);
    }
    throw error;
  }
}
