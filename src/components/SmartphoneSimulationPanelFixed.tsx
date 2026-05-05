import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { PlcProfileId } from '../plcProfiles/plcProfiles';
import { createSmartphoneIoSummary, SmartphoneIoGroupId, SmartphoneSignalSnapshot } from '../simulation/smartphoneIoView';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileTab = 'execution' | 'io' | 'program' | 'diagnostics';
type IoGroup = SmartphoneIoGroupId;

type SignalItem = {
  id: string;
  address: string;
  name: string;
  type: 'input' | 'output' | 'memory' | 'function';
  dataType?: string;
};

type SmartphoneSimulationPanelProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  selectedProfile: PlcProfileId;
  onSelectProfile: (profile: PlcProfileId) => void;
  autoScan: boolean;
  onRunScan: () => void;
  onToggleAutoScan: () => void;
  onSetValue: (variable: string, value: boolean | number) => void;
};

const tabs: { key: MobileTab; label: string }[] = [
  { key: 'execution', label: 'Execução' },
  { key: 'io', label: 'I/O' },
  { key: 'program', label: 'Programa' },
  { key: 'diagnostics', label: 'Diagnóstico' },
];

const ioGroups: { key: IoGroup; label: string }[] = [
  { key: 'overview', label: 'I/O' },
  { key: 'inputs', label: 'Entradas' },
  { key: 'outputs', label: 'Saídas' },
  { key: 'memory', label: 'Memórias' },
  { key: 'functions', label: 'T/C' },
];

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function signalType(address: string): SignalItem['type'] {
  const normalized = normalize(address);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  if (normalized.startsWith('T') || normalized.startsWith('C')) return 'function';
  return 'memory';
}

function defaultName(type: SignalItem['type']): string {
  if (type === 'input') return 'Entrada';
  if (type === 'output') return 'Saída';
  if (type === 'function') return 'Temporizador/contador';
  return 'Memória';
}

function isNumeric(value: string | undefined): boolean {
  return Boolean(value && Number.isFinite(Number(value.trim().replace(',', '.'))));
}

function collectSignals(project: EditorProjectState): SignalItem[] {
  const signals = new Map<string, SignalItem>();
  for (const variable of project.projectVariables ?? []) {
    const id = normalize(variable.id || variable.address);
    const address = normalize(variable.address || variable.id);
    const type = variable.dataType === 'timer' || variable.dataType === 'counter'
      ? 'function'
      : variable.scope === 'input'
        ? 'input'
        : variable.scope === 'output'
          ? 'output'
          : 'memory';
    if (id) signals.set(id, { id, address: address || id, name: variable.name || defaultName(type), type, dataType: variable.dataType });
  }

  const register = (value: string | undefined, name?: string) => {
    const id = normalize(value);
    if (!id || isNumeric(id) || signals.has(id)) return;
    const type = signalType(id);
    signals.set(id, { id, address: id, name: name || defaultName(type), type });
  };

  for (const rung of project.rungs) {
    const blocks: EditorBlock[] = [
      ...rung.seriesBlocks,
      ...rung.parallelBlocks,
      ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
      ...(rung.coilBlock ? [rung.coilBlock] : []),
    ];
    for (const block of blocks) {
      register(block.variable, block.name);
      register(block.sourceA);
      register(block.sourceB);
      register(block.destination);
      register(block.downSource);
      register(block.resetSource);
    }
  }

  return Array.from(signals.values()).sort((left, right) => left.address.localeCompare(right.address));
}

function signalValue(state: PlcState, signal: SignalItem): boolean | number | undefined {
  return state[signal.address] ?? state[signal.id];
}

function isOn(state: PlcState, signal: SignalItem): boolean {
  const value = signalValue(state, signal);
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

function activeCount(signals: SignalItem[], state: PlcState, type: SignalItem['type']): number {
  return signals.filter((signal) => signal.type === type && isOn(state, signal)).length;
}

function filterByGroup(signals: SignalItem[], group: IoGroup): SignalItem[] {
  if (group === 'overview') return signals.filter((signal) => signal.type === 'input' || signal.type === 'output');
  if (group === 'inputs') return signals.filter((signal) => signal.type === 'input');
  if (group === 'outputs') return signals.filter((signal) => signal.type === 'output');
  if (group === 'memory') return signals.filter((signal) => signal.type === 'memory');
  return signals.filter((signal) => signal.type === 'function');
}

function SignalRow({ signal, value, editable, onToggle }: { signal: SignalItem; value: boolean | number | undefined; editable: boolean; onToggle: () => void }) {
  const active = typeof value === 'number' ? value !== 0 : Boolean(value);
  const content = (
    <View style={[styles.signalRow, active && styles.signalRowOn]}>
      <View style={[styles.lamp, active && styles.lampOn]} />
      <View style={styles.signalCopy}>
        <Text style={[styles.signalAddress, active && styles.signalAddressOn]}>{signal.address}</Text>
        <Text style={styles.signalName} numberOfLines={1}>{signal.name}</Text>
      </View>
      <Text style={[styles.signalState, active && styles.signalStateOn]}>{typeof value === 'number' ? value : active ? 'ON' : 'OFF'}</Text>
    </View>
  );
  return editable ? <Pressable onPress={onToggle}>{content}</Pressable> : content;
}

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanel({
  editorProject,
  plcState,
  evaluation,
  autoScan,
  onRunScan,
  onToggleAutoScan,
  onSetValue,
}: SmartphoneSimulationPanelProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('execution');
  const [ioGroup, setIoGroup] = useState<IoGroup>('overview');
  const signals = useMemo(() => collectSignals(editorProject), [editorProject]);
  const snapshots = useMemo<SmartphoneSignalSnapshot[]>(() => signals.map((signal) => ({
    address: signal.address,
    name: signal.name,
    type: signal.type,
    value: signalValue(plcState, signal),
  })), [plcState, signals]);
  const ioSummary = useMemo(() => createSmartphoneIoSummary(snapshots, ioGroup), [ioGroup, snapshots]);
  const shownSignals = filterByGroup(signals, ioGroup);
  const activeRungs = Object.values(evaluation.rungResults).filter(Boolean).length;

  return (
    <View style={styles.card}>
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.eyebrow}>Modo compacto</Text>
          <Text style={styles.statusTitle}>{autoScan ? 'RUN automático' : 'RUN manual'}</Text>
        </View>
        <View style={styles.scanBadge}>
          <Text style={styles.scanLabel}>SCAN</Text>
          <Text style={styles.scanValue}>{evaluation.scanNumber}</Text>
        </View>
      </View>

      <View style={styles.controlRow}>
        <Pressable onPress={onRunScan} style={[styles.controlButton, styles.primaryButton]}><Text style={styles.primaryButtonText}>Scan</Text></Pressable>
        <Pressable onPress={onToggleAutoScan} style={[styles.controlButton, autoScan && styles.autoButtonOn]}><Text style={[styles.controlButtonText, autoScan && styles.autoButtonTextOn]}>{autoScan ? 'Auto ON' : 'Auto'}</Text></Pressable>
        <Pressable onPress={autoScan ? onToggleAutoScan : onRunScan} style={[styles.controlButton, styles.stopButton]}><Text style={styles.stopButtonText}>{autoScan ? 'Parar' : 'Passo'}</Text></Pressable>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.key;
          return <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tabButton, selected && styles.tabButtonActive]}><Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text></Pressable>;
        })}
      </View>

      {activeTab === 'execution' ? (
        <View style={styles.stack}>
          <View style={styles.metricGrid}>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{activeCount(signals, plcState, 'input')}</Text><Text style={styles.metricLabel}>entradas ON</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{activeCount(signals, plcState, 'output')}</Text><Text style={styles.metricLabel}>saídas ON</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricValue}>{activeRungs}</Text><Text style={styles.metricLabel}>linhas ON</Text></View>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Execução do scan</Text>
            <Text style={styles.educationText}>O simulador lê entradas, resolve os rungs e atualiza saídas. Use I/O para acionar entradas e observar a resposta.</Text>
          </View>
        </View>
      ) : null}

      {activeTab === 'io' ? (
        <View style={styles.stack}>
          <View style={styles.subTabRow}>
            {ioGroups.map((group) => {
              const selected = ioGroup === group.key;
              return <Pressable key={group.key} onPress={() => setIoGroup(group.key)} style={[styles.subTabButton, selected && styles.subTabButtonActive]}><Text style={[styles.subTabText, selected && styles.subTabTextActive]}>{group.label}</Text></Pressable>;
            })}
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Resumo de {ioSummary.label}</Text>
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}><Text style={styles.metricLabel}>Total</Text><Text style={styles.metricValue}>{ioSummary.totalCount}</Text></View>
              <View style={styles.metricCard}><Text style={styles.metricLabel}>Ativos</Text><Text style={styles.metricValue}>{ioSummary.activeCount}</Text></View>
            </View>
            <Text style={styles.educationText}>{ioSummary.guidance}</Text>
          </View>
          <View style={styles.signalList}>
            {shownSignals.map((signal) => {
              const value = signalValue(plcState, signal);
              const editable = signal.type === 'input' || signal.type === 'memory';
              return <SignalRow key={signal.id} signal={signal} value={value} editable={editable && typeof value !== 'number'} onToggle={() => onSetValue(signal.address, !Boolean(value))} />;
            })}
          </View>
        </View>
      ) : null}

      {activeTab === 'program' ? (
        <View style={styles.stack}>
          <Text style={styles.sectionTitle}>Programa em execução</Text>
          {editorProject.rungs.map((rung) => {
            const active = Boolean(evaluation.rungResults[rung.id]);
            return (
              <View key={rung.id} style={[styles.rungRow, active && styles.rungRowOn]}>
                <Text style={[styles.rungTitle, active && styles.rungTitleOn]}>{rung.label}</Text>
                <Text style={styles.rungMeta}>{active ? 'TRUE' : 'FALSE'} • {rung.seriesBlocks.length} série • {(rung.parallelBranches ?? []).length} paralelo(s)</Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {activeTab === 'diagnostics' ? (
        <View style={styles.stack}>
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
          {(evaluation.diagnostics ?? []).length === 0 ? <Text style={styles.educationText}>Nenhum alerta neste momento.</Text> : evaluation.diagnostics.map((diagnostic) => <Text key={diagnostic.id} style={styles.diagnosticText}>• {diagnostic.message}</Text>)}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 18, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  statusLeft: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.amber, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  statusTitle: { color: colors.text, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  scanBadge: { minWidth: 66, borderColor: colors.green, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, alignItems: 'center', backgroundColor: colors.greenSoft },
  scanLabel: { color: colors.green, fontSize: 9, fontWeight: '900' },
  scanValue: { color: colors.green, fontSize: 14, fontWeight: '900' },
  controlRow: { flexDirection: 'row', gap: spacing.xs },
  controlButton: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  controlButtonText: { color: colors.textMuted, fontSize: 12, fontWeight: '900' },
  primaryButton: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  primaryButtonText: { color: colors.surface, fontSize: 12, fontWeight: '900' },
  autoButtonOn: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  autoButtonTextOn: { color: colors.green },
  stopButton: { backgroundColor: colors.redSoft, borderColor: colors.red },
  stopButtonText: { color: colors.red, fontSize: 12, fontWeight: '900' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, backgroundColor: colors.backgroundSoft, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.xs },
  tabButton: { flex: 1, minWidth: 84, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
  tabButtonActive: { backgroundColor: colors.surface, borderColor: colors.cyan, borderWidth: 1 },
  tabText: { color: colors.textMuted, fontSize: 11, fontWeight: '900' },
  tabTextActive: { color: colors.cyan },
  stack: { gap: spacing.sm },
  metricGrid: { flexDirection: 'row', gap: spacing.xs },
  metricCard: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated, alignItems: 'center' },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase' },
  summaryBox: { borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  sectionTitle: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  educationText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  subTabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  subTabButton: { flexGrow: 1, minWidth: 72, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  subTabButtonActive: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  subTabText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  subTabTextActive: { color: colors.amber },
  signalList: { gap: spacing.xs },
  signalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated },
  signalRowOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  lamp: { width: 18, height: 18, borderRadius: 999, borderColor: colors.textDim, borderWidth: 2 },
  lampOn: { borderColor: colors.green, backgroundColor: colors.green },
  signalCopy: { flex: 1, minWidth: 0 },
  signalAddress: { color: colors.text, fontSize: 13, fontWeight: '900', fontFamily: 'monospace' },
  signalAddressOn: { color: colors.green },
  signalName: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  signalState: { color: colors.textDim, fontSize: 11, fontWeight: '900' },
  signalStateOn: { color: colors.green },
  rungRow: { borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated, gap: 3 },
  rungRowOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  rungTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  rungTitleOn: { color: colors.green },
  rungMeta: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  diagnosticText: { color: colors.text, fontSize: 12, lineHeight: 18, fontWeight: '700' },
});
