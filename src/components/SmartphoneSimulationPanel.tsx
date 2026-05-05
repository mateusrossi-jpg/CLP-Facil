import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { createPlcProfileProjectView, PlcProfileBlockView, PlcProfileId, PlcProfileRungView, plcProfiles } from '../plcProfiles/plcProfiles';
import { createSmartphoneProgramSummary } from '../simulation/smartphoneProgramView';
import { createSmartphoneIoSummary, SmartphoneIoGroupId, SmartphoneSignalSnapshot } from '../simulation/smartphoneIoView';
import { createSmartphoneIoSummary, SmartphoneIoGroupId, SmartphoneSignalSnapshot } from '../simulation/smartphoneIoView';
import { createSmartphoneIoSummary, SmartphoneIoGroupId, SmartphoneSignalSnapshot } from '../simulation/smartphoneIoView';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileTab = 'execution' | 'io' | 'program' | 'diagnostics';
type IoGroup = SmartphoneIoGroupId;
type ProgramView = 'list' | 'flow';

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

const mobileTabs: { key: MobileTab; label: string }[] = [
  { key: 'execution', label: 'Execução' },
  { key: 'io', label: 'I/O' },
  { key: 'program', label: 'Programa' },
  { key: 'diagnostics', label: 'Diagnóstico' },
];

const ioGroups: { key: IoGroup; label: string }[] = [
  { key: 'inputs', label: 'Entradas' },
  { key: 'outputs', label: 'Saídas' },
  { key: 'memory', label: 'Memórias' },
  { key: 'functions', label: 'T/C' },
];

function normalizeVariable(value: string | undefined) {
  return (value ?? '').trim().toUpperCase();
}

function inferSignalType(variable: string): SignalItem['type'] {
  const normalized = normalizeVariable(variable);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  if (normalized.startsWith('T') || normalized.startsWith('C')) return 'function';
  return 'memory';
}

function defaultSignalName(type: SignalItem['type']) {
  if (type === 'input') return 'Entrada';
  if (type === 'output') return 'Saída';
  if (type === 'function') return 'Temporizador/contador';
  return 'Memória';
}

function isNumericLiteral(value: string | undefined) {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function collectSignals(editorProject: EditorProjectState): SignalItem[] {
  const signals = new Map<string, SignalItem>();

  for (const variable of editorProject.projectVariables ?? []) {
    const id = normalizeVariable(variable.id || variable.address);
    const address = normalizeVariable(variable.address || variable.id);
    const type = variable.dataType === 'timer' || variable.dataType === 'counter'
      ? 'function'
      : variable.scope === 'input'
        ? 'input'
        : variable.scope === 'output'
          ? 'output'
          : 'memory';
    if (!id) continue;
    signals.set(id, {
      id,
      address: address || id,
      name: variable.name || defaultSignalName(type),
      type,
      dataType: variable.dataType,
    });
  }

  const register = (variable: string | undefined, name?: string) => {
    const id = normalizeVariable(variable);
    if (!id || isNumericLiteral(id) || signals.has(id)) return;
    const type = inferSignalType(id);
    signals.set(id, {
      id,
      address: id,
      name: name || defaultSignalName(type),
      type,
    });
  };

  for (const rung of editorProject.rungs) {
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

function signalValue(plcState: PlcState, signal: SignalItem) {
  return plcState[signal.address] ?? plcState[signal.id];
}

function isSignalOn(plcState: PlcState, signal: SignalItem) {
  return Boolean(signalValue(plcState, signal));
}

function activeSummary(signals: SignalItem[], plcState: PlcState, type: SignalItem['type']) {
  return signals.filter((signal) => signal.type === type && isSignalOn(plcState, signal)).slice(0, 4);
}

function isNormallyClosedInstruction(instruction: string) {
  const normalized = instruction.toUpperCase();
  return normalized === 'XIO' || normalized.includes('NF') || normalized.includes('DESLIGA');
}

function isOutputInstruction(instruction: string) {
  const normalized = instruction.toUpperCase();
  return ['OTE', 'OTL', 'OTU', 'COIL', 'BOBINA', 'SET', 'RESET', 'S', 'R'].some((item) => normalized.includes(item));
}

function blockValue(plcState: PlcState, block: PlcProfileBlockView) {
  const variable = normalizeVariable(block.variable || block.operand);
  if (!variable || isNumericLiteral(variable)) return false;
  const value = plcState[variable];
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function blockConducting(plcState: PlcState, block: PlcProfileBlockView) {
  const value = blockValue(plcState, block);
  if (isOutputInstruction(block.instruction)) return value;
  return isNormallyClosedInstruction(block.instruction) ? !value : value;
}

function ProgramLine({
  text,
  active,
  focused,
  onPress,
}: {
  text: string;
  active?: boolean;
  focused?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.programLine, active && styles.programLineActive, focused && styles.programLineFocused]}>
      <View style={[styles.programLineMarker, active && styles.programLineMarkerActive, focused && styles.programLineMarkerFocused]} />
      <Text style={[styles.programLineText, active && styles.programLineTextActive, focused && styles.programLineTextFocused]}>{text}</Text>
    </Pressable>
  );
}

function SignalPill({ signal, value, interactive, onToggle }: { signal: SignalItem; value: boolean | number | undefined; interactive?: boolean; onToggle?: () => void }) {
  const boolValue = Boolean(value);
  const numeric = typeof value === 'number';
  const content = (
    <View style={[styles.signalPill, boolValue && styles.signalPillOn]}>
      <View style={[styles.signalLamp, boolValue && styles.signalLampOn]} />
      <View style={styles.signalTextBox}>
        <Text style={styles.signalAddress}>{signal.address}</Text>
        <Text style={styles.signalName} numberOfLines={1}>{signal.name}</Text>
      </View>
      <Text style={[styles.signalState, boolValue && styles.signalStateOn]}>{numeric ? value : boolValue ? 'ON' : 'OFF'}</Text>
    </View>
  );

  if (!interactive) return content;
  return <Pressable onPress={onToggle}>{content}</Pressable>;
}

function FlowBlock({ block, active, output }: { block: PlcProfileBlockView; active: boolean; output?: boolean }) {
  return (
    <View style={[styles.flowBlock, active && styles.flowBlockActive, output && styles.flowBlockOutput]}>
      <Text style={[styles.flowInstruction, active && styles.flowInstructionActive]}>{block.instruction}</Text>
      <Text style={styles.flowOperand} numberOfLines={1}>{block.operand}</Text>
      <Text style={styles.flowDescription} numberOfLines={1}>{block.label || block.description}</Text>
      <Text style={[styles.flowState, active && styles.flowStateOn]}>{active ? 'ON' : 'OFF'}</Text>
    </View>
  );
}

function FlowConnector({ active }: { active: boolean }) {
  return <View style={[styles.flowConnector, active && styles.flowConnectorOn]} />;
}

function RungFlowCard({
  rung,
  index,
  active,
  focused,
  explanation,
  plcState,
  onPress,
}: {
  rung: PlcProfileRungView;
  index: number;
  active: boolean;
  focused: boolean;
  explanation: string;
  plcState: PlcState;
  onPress: () => void;
}) {
  const outputActive = rung.output ? blockValue(plcState, rung.output) : false;

  return (
    <Pressable onPress={onPress} style={[styles.flowCard, active && styles.flowCardActive, focused && styles.flowCardFocused]}>
      <View style={styles.flowHeader}>
        <View style={styles.flowHeaderText}>
          <Text style={styles.flowRungLabel}>Linha {index + 1}</Text>
          <Text style={styles.flowRungTitle} numberOfLines={1}>{rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
        </View>
        <Text style={[styles.flowRungStatus, active && styles.flowRungStatusOn]}>{active ? 'TRUE' : 'FALSE'}</Text>
      </View>

      <View style={[styles.outputSummaryCard, outputActive && styles.outputSummaryCardOn]}>
        <View style={styles.outputSummaryTextBox}>
          <Text style={styles.outputSummaryLabel}>Carga/saída sempre visível</Text>
          <Text style={[styles.outputSummaryValue, outputActive && styles.outputSummaryValueOn]} numberOfLines={1}>
            {rung.output ? `${rung.output.instruction}(${rung.output.operand})` : 'Sem saída definida'}
          </Text>
        </View>
        <Text style={[styles.outputSummaryState, outputActive && styles.outputSummaryStateOn]}>{outputActive ? 'ON' : 'OFF'}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.flowScrollContent}>
        <View style={styles.flowRail} />
        <View style={styles.flowPathBox}>
          <View style={styles.flowSeriesRow}>
            {rung.series.length === 0 ? <Text style={styles.emptyText}>Sem condição em série.</Text> : null}
            {rung.series.map((block, blockIndex) => {
              const conducting = blockConducting(plcState, block);
              return (
                <View key={block.blockId} style={styles.flowItemGroup}>
                  <FlowBlock block={block} active={conducting} />
                  {blockIndex < rung.series.length - 1 ? <FlowConnector active={active} /> : null}
                </View>
              );
            })}
          </View>

          {rung.parallelBranches.length > 0 ? (
            <View style={styles.flowBranchesBox}>
              <Text style={styles.flowBranchesTitle}>Caminhos paralelos</Text>
              {rung.parallelBranches.map((branch, branchIndex) => (
                <View key={`${rung.rungId}-branch-${branchIndex}`} style={styles.flowBranchRow}>
                  <Text style={styles.flowBranchBadge}>R{branchIndex + 1}</Text>
                  {branch.map((block, blockIndex) => {
                    const conducting = blockConducting(plcState, block);
                    return (
                      <View key={block.blockId} style={styles.flowItemGroup}>
                        <FlowBlock block={block} active={conducting} />
                        {blockIndex < branch.length - 1 ? <FlowConnector active={conducting} /> : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Text style={styles.flowHint}>Arraste para o lado para acompanhar rungs largos. A saída fica fixa no cartão acima.</Text>
      <Text style={styles.educationText}>{explanation}</Text>
    </Pressable>
  );
}

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanel({
  editorProject,
  plcState,
  evaluation,
  selectedProfile,
  onSelectProfile,
  autoScan,
  onRunScan,
  onToggleAutoScan,
  onSetValue,
}: SmartphoneSimulationPanelProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('execution');
  const [ioGroup, setIoGroup] = useState<IoGroup>('inputs');
  const [programView, setProgramView] = useState<ProgramView>('list');
  const [focusedRungId, setFocusedRungId] = useState<string | null>(null);
  const signals = useMemo(() => collectSignals(editorProject), [editorProject]);
  const profileView = useMemo(() => createPlcProfileProjectView(editorProject, selectedProfile), [editorProject, selectedProfile]);
  const selectedRungId = editorProject.selectedRungId ?? editorProject.rungs[0]?.id;
  const programSummary = useMemo(
    () => createSmartphoneProgramSummary(profileView, evaluation.rungResults, selectedRungId, focusedRungId, programView),
    [evaluation.rungResults, focusedRungId, profileView, programView, selectedRungId],
  );
  const activeInputs = activeSummary(signals, plcState, 'input');
  const activeOutputs = activeSummary(signals, plcState, 'output');
  const activeFunctions = activeSummary(signals, plcState, 'function');
  const signalSnapshots = useMemo<SmartphoneSignalSnapshot[]>(() => signals.map((signal) => ({
    address: signal.address,
    name: signal.name,
    type: signal.type,
    value: signalValue(plcState, signal),
  })), [plcState, signals]);
  const ioSummary = useMemo(() => createSmartphoneIoSummary(signalSnapshots, ioGroup), [ioGroup, signalSnapshots]);
  const diagnostics = evaluation.diagnostics ?? [];

  const shownSignals = signals.filter((signal) => {
    if (ioGroup === 'inputs') return signal.type === 'input';
    if (ioGroup === 'outputs') return signal.type === 'output';
    if (ioGroup === 'memory') return signal.type === 'memory';
    return signal.type === 'function';
  });

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
        <Pressable onPress={onRunScan} style={[styles.controlButton, styles.primaryButton]}>
          <Text style={[styles.controlButtonText, styles.primaryButtonText]}>Scan</Text>
        </Pressable>
        <Pressable onPress={onToggleAutoScan} style={[styles.controlButton, autoScan && styles.autoButtonOn]}>
          <Text style={[styles.controlButtonText, autoScan && styles.autoButtonTextOn]}>{autoScan ? 'Auto ON' : 'Auto'}</Text>
        </Pressable>
        <Pressable onPress={autoScan ? onToggleAutoScan : onRunScan} style={[styles.controlButton, styles.stopButton]}>
          <Text style={styles.stopButtonText}>{autoScan ? 'Parar' : 'Passo'}</Text>
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        {mobileTabs.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tabButton, selected && styles.tabButtonActive]}>
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'execution' ? (
        <View style={styles.sectionStack}>
          <View style={styles.executionGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{activeInputs.length}</Text>
              <Text style={styles.metricLabel}>entradas ON</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{activeOutputs.length}</Text>
              <Text style={styles.metricLabel}>saídas ON</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{programSummary.activeCount}</Text>
              <Text style={styles.metricLabel}>linhas ON</Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Ativos agora</Text>
            {[...activeInputs, ...activeOutputs, ...activeFunctions].length === 0 ? (
              <Text style={styles.emptyText}>Nenhum sinal ativo neste scan.</Text>
            ) : (
              <View style={styles.chipWrap}>
                {[...activeInputs, ...activeOutputs, ...activeFunctions].map((signal) => <Text key={signal.id} style={styles.activeChip}>{signal.address}</Text>)}
              </View>
            )}
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Linha em foco</Text>
            <Text style={styles.focusText}>{programSummary.focusedLine?.text ?? 'Selecione uma linha para acompanhar.'}</Text>
            {programSummary.focusedLine ? <Text style={styles.educationText}>{programSummary.focusedLine.explanation}</Text> : null}
          </View>
        </View>
      ) : null}

      {activeTab === 'io' ? (
        <View style={styles.sectionStack}>
          <View style={styles.subTabRow}>
            {ioGroups.map((group) => {
              const selected = ioGroup === group.key;
              return (
                <Pressable key={group.key} onPress={() => setIoGroup(group.key)} style={[styles.subTabButton, selected && styles.subTabButtonActive]}>
                  <Text style={[styles.subTabText, selected && styles.subTabTextActive]}>{group.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summaryBox}>
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

          <View style={styles.summaryBox}>
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

          <View style={styles.summaryBox}>
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

          <View style={styles.signalList}>
            {shownSignals.length === 0 ? <Text style={styles.emptyText}>Nenhum item neste grupo.</Text> : null}
            {shownSignals.map((signal) => {
              const value = signalValue(plcState, signal);
              const editable = signal.type === 'input' || signal.type === 'memory';
              return (
                <SignalPill
                  key={signal.id}
                  signal={signal}
                  value={value as boolean | number | undefined}
                  interactive={editable && typeof value !== 'number'}
                  onToggle={() => onSetValue(signal.address, !Boolean(value))}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {activeTab === 'program' ? (
        <View style={styles.sectionStack}>
          <View style={styles.programHeaderBox}>
            <View style={styles.programMetaRow}>
              <View style={styles.programMetaCard}>
                <Text style={styles.programMetaLabel}>Dialeto</Text>
                <Text style={styles.programMetaValue}>{programSummary.dialectShortName}</Text>
              </View>
              <View style={styles.programMetaCard}>
                <Text style={styles.programMetaLabel}>Ativas</Text>
                <Text style={styles.programMetaValue}>{programSummary.activeCount}</Text>
              </View>
            </View>
            <Text style={styles.programDisclaimer}>{programSummary.disclaimer}</Text>
          </View>

          <View style={styles.subTabRow}>
            {plcProfiles.map((profile) => {
              const selected = profile.id === selectedProfile;
              return (
                <Pressable key={profile.id} onPress={() => onSelectProfile(profile.id)} style={[styles.subTabButton, selected && styles.subTabButtonActive]}>
                  <Text style={[styles.subTabText, selected && styles.subTabTextActive]}>{profile.shortName}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.subTabRow}>
            {(['list', 'flow'] as ProgramView[]).map((view) => {
              const selected = programView === view;
              return (
                <Pressable key={view} onPress={() => setProgramView(view)} style={[styles.subTabButton, selected && styles.subTabButtonActive]}>
                  <Text style={[styles.subTabText, selected && styles.subTabTextActive]}>{view === 'list' ? 'Lista' : 'Fluxo'}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.programBox}>
            {programView === 'list' ? programSummary.lines.map((line) => (
              <ProgramLine
                key={line.rungId}
                text={line.text}
                active={line.active}
                focused={line.focused}
                onPress={() => setFocusedRungId(line.rungId)}
              />
            )) : profileView.rungs.map((rung, index) => {
              const line = programSummary.lines.find((item) => item.rungId === rung.rungId);
              return (
                <RungFlowCard
                  key={rung.rungId}
                  rung={rung}
                  index={index}
                  active={Boolean(evaluation.rungResults[rung.rungId])}
                  focused={Boolean(line?.focused)}
                  explanation={line?.explanation ?? 'Linha sem explicação disponível.'}
                  plcState={plcState}
                  onPress={() => setFocusedRungId(rung.rungId)}
                />
              );
            })}
          </View>

          {programSummary.focusedLine ? (
            <View style={styles.educationBox}>
              <Text style={styles.educationTitle}>O que esta linha faz?</Text>
              <Text style={styles.educationText}>{programSummary.focusedLine.explanation}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {activeTab === 'diagnostics' ? (
        <View style={styles.sectionStack}>
          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Diagnóstico do scan</Text>
            {diagnostics.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum alerta neste momento.</Text>
            ) : diagnostics.map((diagnostic) => (
              <Text key={diagnostic.id} style={styles.diagnosticText}>• {diagnostic.message}</Text>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusLeft: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  statusTitle: { color: colors.text, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  scanBadge: {
    minWidth: 66,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
    backgroundColor: colors.greenSoft,
  },
  scanLabel: { color: colors.green, fontSize: 9, fontWeight: '900' },
  scanValue: { color: colors.green, fontSize: 14, fontWeight: '900' },
  controlRow: { flexDirection: 'row', gap: spacing.xs },
  controlButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  primaryButton: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  primaryButtonText: { color: colors.surface },
  autoButtonOn: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  autoButtonTextOn: { color: colors.green },
  stopButton: { backgroundColor: colors.redSoft, borderColor: colors.red },
  stopButtonText: { color: colors.red, fontSize: 12, fontWeight: '900' },
  controlButtonText: { color: colors.textMuted, fontSize: 12, fontWeight: '900' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, backgroundColor: colors.backgroundSoft, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.xs },
  tabButton: { flex: 1, minWidth: 84, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
  tabButtonActive: { backgroundColor: colors.surface, borderColor: colors.cyan, borderWidth: 1 },
  tabText: { color: colors.textMuted, fontSize: 11, fontWeight: '900' },
  tabTextActive: { color: colors.cyan },
  sectionStack: { gap: spacing.sm },
  executionGrid: { flexDirection: 'row', gap: spacing.xs },
  metricCard: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated, alignItems: 'center' },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  summaryBox: { borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  sectionTitle: { color: colors.cyan, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  emptyText: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  activeChip: { color: colors.green, borderColor: colors.green, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.greenSoft },
  focusText: { color: colors.text, fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
  educationBox: { borderColor: colors.amber, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.goldSoft, gap: 3 },
  educationTitle: { color: colors.amber, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  educationText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  subTabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  subTabButton: { flexGrow: 1, minWidth: 72, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  subTabButtonActive: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  subTabText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  subTabTextActive: { color: colors.amber },
  signalList: { gap: spacing.xs },
  signalPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated },
  signalPillOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  signalLamp: { width: 18, height: 18, borderRadius: 999, borderColor: colors.textDim, borderWidth: 2 },
  signalLampOn: { backgroundColor: colors.green, borderColor: colors.green },
  signalTextBox: { flex: 1, minWidth: 0 },
  signalAddress: { color: colors.text, fontSize: 13, fontWeight: '900' },
  signalName: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  signalState: { color: colors.textMuted, fontSize: 11, fontWeight: '900', borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  signalStateOn: { color: colors.green, borderColor: colors.green, backgroundColor: colors.surface },
  programHeaderBox: { borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  programMetaRow: { flexDirection: 'row', gap: spacing.xs },
  programMetaCard: { flex: 1, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 10, padding: spacing.sm, backgroundColor: colors.black },
  programMetaLabel: { color: colors.textDim, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  programMetaValue: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: 2 },
  programDisclaimer: { color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  programBox: { gap: spacing.xs },
  programLine: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.xs, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: spacing.sm, backgroundColor: colors.black },
  programLineActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  programLineFocused: { borderColor: colors.amber, borderWidth: 2 },
  programLineMarker: { width: 4, borderRadius: 999, backgroundColor: colors.borderStrong },
  programLineMarkerActive: { backgroundColor: colors.green },
  programLineMarkerFocused: { backgroundColor: colors.amber },
  programLineText: { color: colors.textMuted, fontFamily: 'monospace', fontSize: 10, lineHeight: 15, flex: 1 },
  programLineTextActive: { color: colors.text, fontWeight: '900' },
  programLineTextFocused: { color: colors.text },
  flowCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.black, gap: spacing.sm },
  flowCardActive: { borderColor: colors.green },
  flowCardFocused: { borderColor: colors.amber, borderWidth: 2 },
  flowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  flowHeaderText: { flex: 1, minWidth: 0 },
  flowRungLabel: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  flowRungTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '900', marginTop: 2 },
  flowRungStatus: { color: colors.textDim, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  flowRungStatusOn: { color: colors.green, borderColor: colors.green, backgroundColor: colors.greenSoft },
  outputSummaryCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: '#020817' },
  outputSummaryCardOn: { borderColor: colors.green },
  outputSummaryTextBox: { flex: 1, minWidth: 0 },
  outputSummaryLabel: { color: colors.textDim, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  outputSummaryValue: { color: '#F8FAFC', fontFamily: 'monospace', fontSize: 12, lineHeight: 16, fontWeight: '900', marginTop: 2 },
  outputSummaryValueOn: { color: colors.green },
  outputSummaryState: { color: colors.textMuted, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  outputSummaryStateOn: { color: colors.green, borderColor: colors.green, backgroundColor: colors.greenSoft },
  flowScrollContent: { alignItems: 'stretch', gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: spacing.md },
  flowRail: { width: 4, minHeight: 122, borderRadius: 999, backgroundColor: colors.cyan },
  flowPathBox: { minWidth: 620, gap: spacing.sm },
  flowSeriesRow: { flexDirection: 'row', alignItems: 'center', minHeight: 82 },
  flowItemGroup: { flexDirection: 'row', alignItems: 'center' },
  flowConnector: { width: 28, height: 3, borderRadius: 999, backgroundColor: colors.borderStrong, marginHorizontal: 2 },
  flowConnectorOn: { backgroundColor: colors.green },
  flowBlock: { width: 132, minHeight: 76, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: '#0B1220', gap: 2 },
  flowBlockActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  flowBlockOutput: { borderColor: colors.cyan },
  flowInstruction: { color: colors.cyan, fontFamily: 'monospace', fontSize: 12, fontWeight: '900' },
  flowInstructionActive: { color: colors.green },
  flowOperand: { color: '#F8FAFC', fontFamily: 'monospace', fontSize: 11, fontWeight: '900' },
  flowDescription: { color: colors.textDim, fontSize: 9, fontWeight: '800' },
  flowState: { alignSelf: 'flex-start', color: colors.textMuted, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, fontSize: 9, fontWeight: '900', marginTop: 2 },
  flowStateOn: { color: colors.green, borderColor: colors.green, backgroundColor: colors.surface },
  flowBranchesBox: { borderColor: colors.borderStrong, borderWidth: 1, borderRadius: 12, padding: spacing.sm, gap: spacing.xs, backgroundColor: '#020817' },
  flowBranchesTitle: { color: colors.amber, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  flowBranchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flowBranchBadge: { color: colors.amber, borderColor: colors.amber, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3, fontSize: 9, fontWeight: '900' },
  flowHint: { color: colors.textDim, fontSize: 10, lineHeight: 14, fontWeight: '800' },
  diagnosticText: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
});
