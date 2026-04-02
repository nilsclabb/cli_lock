import path from 'path';

export function envCommand(rootDir: string, options: { hook?: boolean }) {
  const binDir = path.join(rootDir, '.cli', 'bin');
  
  if (options.hook) {
    // Shell auto-activation hook
    console.log(`export PATH="${binDir}:$PATH"`);
  } else {
    // Manual activation command
    console.log(`export PATH="${binDir}:$PATH"`);
    console.log(`echo "cli-lock environment activated for ${rootDir}"`);
  }
}
