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

function findSelfClosingTagEnd(text, startIndex) {
  let depth = 0;
  let quote = null;

  for (let index = startIndex; index < text.length - 1; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quote) {
      if (char === quote && text[index - 1] !== '\\') quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') depth = Math.max(depth - 1, 0);

    if (depth === 0 && char === '/' && next === '>') return index + 2;
  }

  return -1;
}

addImport(
  "import { SimulatorDialectPanel } from './src/components/SimulatorDialectPanel';",
  "import { SmartphoneSimulationPanel } from './src/components/SmartphoneSimulationPanel';",
);

const panelBlock = `\n            {compactSimulator ? (\n              <SmartphoneSimulationPanel\n                editorProject={editorProject}\n                plcState={editorEvaluation.state}\n                evaluation={editorEvaluation}\n                selectedProfile={selectedPlcProfile}\n                onSelectProfile={setSelectedPlcProfile}\n                autoScan={autoScan}\n                onRunScan={runEditorScan}\n                onToggleAutoScan={() => setAutoScan((current) => !current)}\n                onSetValue={setEditorValue}\n              />\n            ) : null}`;

if (!source.includes('<SmartphoneSimulationPanel')) {
  const dialectIndex = source.indexOf('<SimulatorDialectPanel');
  if (dialectIndex >= 0) {
    const dialectEnd = findSelfClosingTagEnd(source, dialectIndex);
    if (dialectEnd < 0) throw new Error('Não encontrei fechamento do SimulatorDialectPanel.');
    source = `${source.slice(0, dialectEnd)}${panelBlock}${source.slice(dialectEnd)}`;
  } else {
    const workbenchIndex = source.indexOf('<PlcWorkbench');
    if (workbenchIndex < 0) throw new Error('Não encontrei SimulatorDialectPanel nem PlcWorkbench.');
    source = `${source.slice(0, workbenchIndex)}${panelBlock}\n            ${source.slice(workbenchIndex)}`;
  }
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('SmartphoneSimulationPanel integrado na tela Simular para compactSimulator.');
} else {
  console.log('Nenhuma alteração necessária.');
}

console.log('Smartphone compact simulation integration script ready.');
