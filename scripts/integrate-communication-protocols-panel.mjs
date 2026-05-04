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
  "import { PlcProfilePanel } from './src/components/PlcProfilePanel';",
  "import { CommunicationProtocolsPanel } from './src/components/CommunicationProtocolsPanel';",
);

const panelBlock = `\n            <CommunicationProtocolsPanel />`;

if (!source.includes('<CommunicationProtocolsPanel')) {
  const plcPanelIndex = source.indexOf('<PlcProfilePanel');
  if (plcPanelIndex < 0) {
    throw new Error('Não encontrei PlcProfilePanel para posicionar CommunicationProtocolsPanel. Rode integrate-plc-profile-panel primeiro.');
  }

  const plcPanelEnd = source.indexOf('/>', plcPanelIndex);
  if (plcPanelEnd < 0) throw new Error('Não encontrei o fechamento do PlcProfilePanel.');

  source = `${source.slice(0, plcPanelEnd + 2)}${panelBlock}${source.slice(plcPanelEnd + 2)}`;
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('CommunicationProtocolsPanel integrado junto da referência de dialetos CLP.');
} else {
  console.log('Nenhuma alteração necessária.');
}
