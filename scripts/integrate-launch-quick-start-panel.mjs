import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('App.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

function addImport(anchor, importLine) {
  if (source.includes(importLine)) return;
  if (!source.includes(anchor)) throw new Error(`Não encontrei âncora de import: ${anchor}`);
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

addImport(
  "import { LessonCard } from './src/components/LessonCard';",
  "import { LaunchQuickStartPanel } from './src/components/LaunchQuickStartPanel';",
);

const panelBlock = `\n            <LaunchQuickStartPanel\n              examples={educationalEditorExamples}\n              onOpenExample={(example) => openEducationalExample(example, true)}\n              onOpenLearn={() => setMode('learn')}\n              onOpenReference={() => setMode('reference')}\n              onOpenHardware={() => setMode('projects')}\n            />`;

if (!source.includes('<LaunchQuickStartPanel')) {
  const homeHero = source.indexOf('<HomeHero />');
  if (homeHero < 0) throw new Error('Não encontrei HomeHero na home.');
  const insertAt = homeHero + '<HomeHero />'.length;
  source = `${source.slice(0, insertAt)}${panelBlock}${source.slice(insertAt)}`;
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('LaunchQuickStartPanel integrado na home.');
} else {
  console.log('Nenhuma alteração necessária.');
}
