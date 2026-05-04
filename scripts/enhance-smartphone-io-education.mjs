import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/components/SmartphoneSimulationPanel.tsx');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

function replaceOnce(from, to, label) {
  if (!source.includes(from)) {
    console.warn(`Não encontrei: ${label}`);
    return false;
  }
  source = source.replace(from, to);
  console.log(`Aplicado: ${label}`);
  return true;
}

replaceOnce(
  "import { createSmartphoneProgramSummary } from '../simulation/smartphoneProgramView';",
  "import { createSmartphoneProgramSummary } from '../simulation/smartphoneProgramView';\nimport { createSmartphoneIoSummary, SmartphoneIoGroupId, SmartphoneSignalSnapshot } from '../simulation/smartphoneIoView';",
  'importar resumo educativo de I/O',
);

replaceOnce(
  "type IoGroup = 'inputs' | 'outputs' | 'memory' | 'functions';",
  'type IoGroup = SmartphoneIoGroupId;',
  'usar tipo compartilhado de grupo I/O',
);

replaceOnce(
  `  const activeInputs = activeSummary(signals, plcState, 'input');
  const activeOutputs = activeSummary(signals, plcState, 'output');
  const activeFunctions = activeSummary(signals, plcState, 'function');
  const diagnostics = evaluation.diagnostics ?? [];`,
  `  const activeInputs = activeSummary(signals, plcState, 'input');
  const activeOutputs = activeSummary(signals, plcState, 'output');
  const activeFunctions = activeSummary(signals, plcState, 'function');
  const signalSnapshots = useMemo<SmartphoneSignalSnapshot[]>(() => signals.map((signal) => ({
    address: signal.address,
    name: signal.name,
    type: signal.type,
    value: signalValue(plcState, signal),
  })), [plcState, signals]);
  const ioSummary = useMemo(() => createSmartphoneIoSummary(signalSnapshots, ioGroup), [ioGroup, signalSnapshots]);
  const diagnostics = evaluation.diagnostics ?? [];`,
  'criar resumo de I/O por grupo',
);

replaceOnce(
  `          <View style={styles.signalList}>`,
  `          <View style={styles.summaryBox}>
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
          </View>

          <View style={styles.signalList}>`,
  'exibir resumo educativo na aba I/O',
);

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('Aba I/O mobile agora mostra resumo educativo por Entradas/Saídas/Memórias/T-C.');
} else {
  console.log('Nenhuma alteração necessária.');
}
