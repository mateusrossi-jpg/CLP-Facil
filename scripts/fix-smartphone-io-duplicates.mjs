import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/components/SmartphoneSimulationPanel.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

const ioImport = "import { createSmartphoneIoSummary, SmartphoneIoGroupId, SmartphoneSignalSnapshot } from '../simulation/smartphoneIoView';";
const importCount = source.split(ioImport).length - 1;
if (importCount > 1) {
  let seen = false;
  source = source
    .split('\n')
    .filter((line) => {
      if (line !== ioImport) return true;
      if (!seen) {
        seen = true;
        return true;
      }
      return false;
    })
    .join('\n');
  console.log(`Import duplicado removido: ${importCount - 1}`);
}

const summaryStart = '          <View style={styles.summaryBox}>\n            <Text style={styles.sectionTitle}>Resumo de {ioSummary.label}</Text>';
const starts = [];
let offset = 0;
while (true) {
  const index = source.indexOf(summaryStart, offset);
  if (index < 0) break;
  starts.push(index);
  offset = index + summaryStart.length;
}

if (starts.length > 1) {
  for (let i = starts.length - 1; i >= 1; i -= 1) {
    const start = starts[i];
    const signalListIndex = source.indexOf('          <View style={styles.signalList}>', start);
    const nextSummaryIndex = source.indexOf(summaryStart, start + summaryStart.length);
    const nextMarker = nextSummaryIndex >= 0 && nextSummaryIndex < signalListIndex ? nextSummaryIndex : signalListIndex;
    if (nextMarker < 0) throw new Error('Não encontrei fim do bloco de resumo I/O duplicado.');
    source = `${source.slice(0, start)}${source.slice(nextMarker)}`;
  }
  source = source.replace(/\n{3,}/g, '\n\n');
  console.log(`Resumo I/O duplicado removido: ${starts.length - 1}`);
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('SmartphoneSimulationPanel limpo: sem imports/blocos duplicados.');
} else {
  console.log('Nenhuma duplicidade encontrada.');
}

console.log('Smartphone I/O duplicate fix script ready.');
