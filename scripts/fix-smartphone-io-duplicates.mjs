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

const summaryBlock = `          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Resumo de {ioSummary.label}</Text>
            <View style={styles.programMetaRow}>
              <View style={styles.programMetaCard}>
                <Text style={styles.programMetaLabel}>Total</Text>
                <Text style={styles.programMetaValue}>{ioSummary.totalCount}</Text>
              </View>
              <View style={styles.programMetaCard}>
                <Text style={styles.programMetaLabel}>Ativos</Text>
                <Text style={styles.programMetaValue}>{ioSummary.activeCount}</Text>
              </View>
            </View>
            <Text style={styles.educationText}>{ioSummary.guidance}</Text>
            {ioSummary.activeAddresses.length > 0 ? (
              <View style={styles.chipWrap}>
                {ioSummary.activeAddresses.map((address) => <Text key={address} style={styles.activeChip}>{address}</Text>)}
              </View>
            ) : null}
          </View>`;

const blockCount = source.split(summaryBlock).length - 1;
if (blockCount > 1) {
  let seen = false;
  source = source.replace(new RegExp(summaryBlock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (match) => {
    if (!seen) {
      seen = true;
      return match;
    }
    return '';
  });
  source = source.replace(/\n{3,}/g, '\n\n');
  console.log(`Resumo I/O duplicado removido: ${blockCount - 1}`);
}

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('SmartphoneSimulationPanel limpo: sem imports/blocos duplicados.');
} else {
  console.log('Nenhuma duplicidade encontrada.');
}
