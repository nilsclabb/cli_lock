import { describe, it, expect } from 'vitest';
import { parseConfig } from '../config.js';

describe('config parsing', () => {
  it('should parse a valid TOML config', () => {
    const toml = `
[meta]
node = ">=20"

[tools.prettier]
version = "^3.2"
provider = "npm"

[tools.gh]
version = ">=2.60"
provider = "github"
repo = "cli/cli"
    `;
    const config = parseConfig(toml);
    expect(config.tools.prettier.version).toBe('^3.2');
    expect(config.tools.gh.repo).toBe('cli/cli');
    expect(config.meta?.node).toBe('>=20');
  });

  it('should throw for invalid TOML', () => {
    const toml = `[tools.prettier] version = `;
    expect(() => parseConfig(toml)).toThrow();
  });

  it('should throw for invalid schema', () => {
    const toml = `
[tools.prettier]
version = 123
provider = "invalid"
    `;
    expect(() => parseConfig(toml)).toThrow('Invalid configuration');
  });
});
