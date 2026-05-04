import fs from 'node:fs';

const file = 'App.tsx';
let s = fs.readFileSync(file, 'utf8');
const before = s;

const impA = "import { LaunchQuickStartPanel } from './src/components/LaunchQuickStartPanel';";
const impB = "import { LearningPathPanel } from './src/components/LearningPathPanel';";
if (!s.includes(impB)) s = s.replace(impA, `${impA}\n${impB}`);

const tag = '<LaunchQuickStartPanel';
const panel = '\n            <LearningPathPanel />';
if (!s.includes('<LearningPathPanel')) {
  const i = s.indexOf(tag);
  if (i < 0) throw new Error('LaunchQuickStartPanel não encontrado');
  const end = s.indexOf('/>', i);
  if (end < 0) throw new Error('Fim do LaunchQuickStartPanel não encontrado');
  s = s.slice(0, end + 2) + panel + s.slice(end + 2);
}

if (s !== before) {
  fs.writeFileSync(file, s);
  console.log('LearningPathPanel adicionado após o Comece rápido.');
} else {
  console.log('Sem alterações.');
}
