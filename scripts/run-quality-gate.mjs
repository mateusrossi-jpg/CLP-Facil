import { spawnSync } from 'node:child_process';

const steps = [
  {
    name: 'TypeScript typecheck',
    command: 'npm',
    args: ['run', 'typecheck'],
  },
  {
    name: 'Simulator regression suite',
    command: 'npm',
    args: ['run', 'test:simulator'],
  },
];

const startedAt = Date.now();
const failedSteps = [];

for (const step of steps) {
  const stepStartedAt = Date.now();
  console.log(`\n▶ ${step.name}`);
  const result = spawnSync(step.command, step.args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  const elapsedSeconds = ((Date.now() - stepStartedAt) / 1000).toFixed(1);

  if (result.status !== 0) {
    failedSteps.push(step.name);
    console.error(`✖ ${step.name} falhou em ${elapsedSeconds}s.`);
  } else {
    console.log(`✔ ${step.name} passou em ${elapsedSeconds}s.`);
  }
}

const totalSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);

if (failedSteps.length > 0) {
  console.error(`\nQuality gate falhou em ${totalSeconds}s.`);
  console.error(`Etapas com falha: ${failedSteps.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`\nQuality gate aprovado em ${totalSeconds}s.`);
}
