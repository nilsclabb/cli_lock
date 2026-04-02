export type Provider = 'npm' | 'github' | 'url';

export interface ToolConfig {
  version: string;
  provider: Provider;
  package?: string;
  repo?: string;
  bin?: string | string[];
  urls?: Record<string, string>;
  sha256?: string | Record<string, string>;
}

export interface CliLockConfig {
  meta?: {
    node?: string;
  };
  tools: Record<string, ToolConfig>;
}

export interface LockEntry {
  version: string;
  provider: Provider;
  package?: string;
  repo?: string;
  integrity?: string; // npm SRI
  assets?: Record<string, {
    url: string;
    sha256: string;
    extract?: string;
  }>;
}

export interface CliLockLock {
  schema: number;
  generated_at: string;
  tools: Record<string, LockEntry>;
}
