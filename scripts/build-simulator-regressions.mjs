import { spawnSync } from 'node:child_process';
import { simulatorRegressionSources } from './simulator-regression-sources.mjs';

const args = [
  ...simulatorRegressionSources,
  '--outDir',
  '/tmp/easy-clp-sim-test',
  '--module',
  'commonjs',
  '--target',
  'es2018',
  '--moduleResolution',
  'node',
  '--strict',
  '--esModuleInterop',
  '--skipLibCheck',
];

const result = spawnSync('tsc', args, { stdio: 'inherit', shell: process.platform === 'win32' });

if (result.error) {
  console.error(result.error);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 0;
}
