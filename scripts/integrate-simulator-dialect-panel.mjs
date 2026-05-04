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
  "import { SelectedBlockEditor } from './src/components/SelectedBlockEditor';",
  "import { SimulatorDialectPanel } from './src/components/SimulatorDialectPanel';",
);

const panelBlock = `\n            <SimulatorDialectPanel\n              editorProject={editorProject}\n              selectedProfile={selectedPlcProfile}\n              onSelectProfile={setSelectedPlcProfile}\n              compact={compactSimulator}\n            />`;

if (!source.includes('<SimulatorDialectPanel')) {
  const plcWorkbenchIndex = source.indexOf('<PlcWorkbench');
  if (plcWorkbenchIndex < 0) throw new Error('Não encontrei PlcWorkbench para posicionar o painel de dialeto.');
  source = `${source.slice(0, plcWorkbenchIndex)}${panelBlock}\n            ${source.slice(plcWorkbenchIndex)}`;
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('SimulatorDialectPanel integrado acima da bancada de simulação.');
} else {
  console.log('Nenhuma alteração necessária.');
}
