#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distEntry = join(__dirname, '../dist/index.js');

if (existsSync(distEntry)) {
  await import(distEntry);
} else {
  const tsEntry = join(__dirname, '../src/index.ts');
  const child = spawn(process.execPath, ['--experimental-strip-types', tsEntry], {
    stdio: 'inherit',
  });

  try {
    const { code, signal } = await new Promise((resolve, reject) => {
      child.on('exit', (exitCode, exitSignal) => resolve({ code: exitCode, signal: exitSignal }));
      child.on('error', reject);
    });

    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  } catch (error) {
    console.error('Failed to launch TypeScript entrypoint:', error);
    process.exit(1);
  }
}
