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
  "import { ExplanationPanel } from './src/components/ExplanationPanel';",
  "import { ExampleLibraryPanel } from './src/components/ExampleLibraryPanel';",
);

const panelBlock = `\n            <ExampleLibraryPanel\n              examples={educationalEditorExamples}\n              onOpenExample={(example) => openEducationalExample(example, true)}\n            />`;

if (!source.includes('<ExampleLibraryPanel')) {
  const learnHeader = source.indexOf('title="Aprender"');
  if (learnHeader < 0) throw new Error('Não encontrei AppHeader da aba Aprender.');

  const headerClose = source.indexOf('/>', learnHeader);
  if (headerClose < 0) throw new Error('Não encontrei fechamento do AppHeader da aba Aprender.');

  source = `${source.slice(0, headerClose + 2)}${panelBlock}${source.slice(headerClose + 2)}`;
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('ExampleLibraryPanel integrado na aba Aprender.');
} else {
  console.log('Nenhuma alteração necessária.');
}
