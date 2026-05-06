import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type DeskViewMode = 'ladder' | 'flow' | 'list';

type MobileSimulationDeskProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  autoScan?: boolean;
  onSetValue?: (variable: string, value: boolean | number) => void;
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
  onSelectBlock?: (blockId: string) => void;
  onSelectRung?: (rungId: string) => void;
  onOpenEdit?: () => void;
  missionTitle?: string;
  hint?: string;
};

type DeskSignal = {
  address: string;
  name: string;
  active: boolean;
  kind: 'input' | 'output';
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function signalKind(address: string): DeskSignal['kind'] | null {
  const normalized = normalize(address);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  return null;
}

function allRungBlocks(rung: EditorProjectState['rungs'][number]): EditorBlock[] {
  return [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ];
}

function collectDeskSignals(project: EditorProjectState, state: PlcState, kind: DeskSignal['kind']): DeskSignal[] {
  const signals = new Map<string, DeskSignal>();

  for (const variable of project.projectVariables ?? []) {
    const address = normalize(variable.address || variable.id);
    if (signalKind(address) !== kind) continue;
    signals.set(address, {
      address,
      name: variable.name || address,
      active: isActive(state[address]),
      kind,
    });
  }

  for (const rung of project.rungs) {
    for (const block of allRungBlocks(rung)) {
      const candidates = [block.variable, block.sourceA, block.sourceB, block.destination, block.downSource, block.resetSource];
      for (const candidate of candidates) {
        const address = normalize(candidate);
        if (!address || signalKind(address) !== kind || signals.has(address)) continue;
        signals.set(address, {
          address,
          name: block.name || address,
          active: isActive(state[address]),
          kind,
        });
      }
    }
  }

  return Array.from(signals.values()).sort((left, right) => left.address.localeCompare(right.address)).slice(0, 8);
}

function contactSymbol(block: EditorBlock): string {
  if (block.compareMode) return `[${block.compareMode}]`;
  if (block.contactMode === 'NC') return '--|/|--';
  if (block.contactMode === 'RISING') return '--|↑|--';
  if (block.contactMode === 'FALLING') return '--|↓|--';
  return '--| |--';
}

function coilSymbol(block: EditorBlock): string {
  if (block.role === 'timer') return `[${block.timerMode ?? 'TON'}]`;
  if (block.role === 'counter') return `[${block.counterMode ?? 'CTU'}]`;
  if (block.mathMode) return `[${block.mathMode}]`;
  if (block.coilMode && block.coilMode !== 'NORMAL') return `(${block.coilMode})`;
  return '--( )--';
}

function blockActive(block: EditorBlock, state: PlcState, rungActive: boolean): boolean {
  if (block.role === 'contact') {
    const value = isActive(state[normalize(block.variable)]);
    return block.contactMode === 'NC' ? !value : value;
  }
  if (block.role === 'timer' || block.role === 'counter') return rungActive;
  return isActive(state[normalize(block.variable)]);
}

function blockLabel(block: EditorBlock): string {
  if (block.compareMode) return `${block.sourceA ?? 'A'} ${block.compareMode} ${block.sourceB ?? 'B'}`;
  if (block.mathMode) return `${block.mathMode} ${block.destination ?? block.variable}`;
  return normalize(block.variable) || block.name;
}

export const MobileSimulationDesk = memo(function MobileSimulationDesk({
  editorProject,
  plcState,
  evaluation,
  autoScan = false,
  onSetValue,
  onRunScan,
  onToggleAutoScan,
  onSelectBlock,
  onSelectRung,
  onOpenEdit,
  missionTitle,
  hint,
}: MobileSimulationDeskProps) {
  const [viewMode, setViewMode] = useState<DeskViewMode>('ladder');
  const selectedRungIndex = Math.max(0, editorProject.rungs.findIndex((rung) => rung.id === editorProject.selectedRungId));
  const selectedRung = editorProject.rungs[selectedRungIndex] ?? editorProject.rungs[0];
  const inputs = useMemo(() => collectDeskSignals(editorProject, plcState, 'input'), [editorProject, plcState]);
  const outputs = useMemo(() => collectDeskSignals(editorProject, plcState, 'output'), [editorProject, plcState]);
  const rungActive = Boolean(evaluation.rungResults?.[selectedRung?.id]);
  const seriesBlocks = selectedRung?.seriesBlocks ?? [];
  const branches = selectedRung?.parallelBranches ?? [];
  const coilBlock = selectedRung?.coilBlock;

  const selectRungByDelta = (delta: number) => {
    const nextIndex = Math.min(Math.max(selectedRungIndex + delta, 0), editorProject.rungs.length - 1);
    const nextRung = editorProject.rungs[nextIndex];
    if (nextRung) onSelectRung?.(nextRung.id);
  };

  const toggleInput = (signal: DeskSignal) => {
    onSetValue?.(signal.address, !signal.active);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topBar}>
        <View style={styles.titleBox}>
          <Text style={styles.eyebrow}>Mesa de simulação</Text>
          <Text style={styles.title} numberOfLines={1}>{missionTitle || 'Simulação livre'}</Text>
        </View>
        <View style={[styles.runPill, autoScan && styles.runPillAuto]}>
          <Text style={[styles.runText, autoScan && styles.runTextAuto]}>{autoScan ? 'AUTO' : 'MANUAL'}</Text>
          <Text style={styles.scanText}>Scan #{evaluation.scanNumber || 0}</Text>
        </View>
      </View>

      <View style={styles.ioPanel}>
        <Text style={styles.panelTitle}>Entradas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.signalStrip}>
          {inputs.length === 0 ? <Text style={styles.emptyText}>Adicione entradas I para simular.</Text> : inputs.map((signal) => (
            <Pressable key={signal.address} onPress={() => toggleInput(signal)} style={({ pressed }) => [styles.inputButton, signal.active && styles.inputButtonOn, pressed && styles.pressed]}>
              <Text style={[styles.signalAddress, signal.active && styles.signalAddressOn]}>{signal.address}</Text>
              <Text style={styles.signalName} numberOfLines={1}>{signal.name}</Text>
              <Text style={[styles.signalState, signal.active && styles.signalStateOn]}>{signal.active ? 'ON' : 'OFF'}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.rungHeader}>
        <Pressable onPress={() => selectRungByDelta(-1)} style={styles.rungNavButton}>
          <Text style={styles.rungNavText}>‹</Text>
        </Pressable>
        <View style={styles.rungTitleBox}>
          <Text style={[styles.rungTitle, rungActive && styles.rungTitleOn]}>Rung {selectedRungIndex + 1} de {editorProject.rungs.length}</Text>
          <Text style={styles.rungSubtitle} numberOfLines={1}>{selectedRung?.label ?? 'Linha ladder'}</Text>
        </View>
        <Pressable onPress={() => selectRungByDelta(1)} style={styles.rungNavButton}>
          <Text style={styles.rungNavText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.viewToggleRow}>
        {(['ladder', 'flow', 'list'] as DeskViewMode[]).map((mode) => (
          <Pressable key={mode} onPress={() => setViewMode(mode)} style={[styles.viewToggle, viewMode === mode && styles.viewToggleActive]}>
            <Text style={[styles.viewToggleText, viewMode === mode && styles.viewToggleTextActive]}>{mode === 'ladder' ? 'Ladder' : mode === 'flow' ? 'Fluxo' : 'Lista'}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rungCanvas}>
        {seriesBlocks.length === 0 ? (
          <Pressable onPress={onOpenEdit} style={styles.emptyRungBox}>
            <Text style={styles.emptyRungTitle}>Rung vazio</Text>
            <Text style={styles.emptyRungText}>Toque em Editar para adicionar contato, bobina, timer ou branch.</Text>
          </Pressable>
        ) : seriesBlocks.map((block) => {
          const active = blockActive(block, plcState, rungActive);
          return (
            <Pressable key={block.id} onPress={() => onSelectBlock?.(block.id)} style={[styles.ladderBlock, active && styles.ladderBlockOn]}>
              <Text style={[styles.blockVariable, active && styles.blockTextOn]}>{blockLabel(block)}</Text>
              <Text style={[styles.blockSymbol, active && styles.blockTextOn]}>{viewMode === 'list' ? block.name : contactSymbol(block)}</Text>
              {viewMode === 'flow' ? <Text style={styles.blockHint}>{active ? 'conduzindo' : 'aberto'}</Text> : null}
            </Pressable>
          );
        })}

        {branches.length > 0 ? (
          <View style={styles.branchBadge}>
            <Text style={styles.branchText}>+ {branches.length} branch</Text>
          </View>
        ) : null}

        {coilBlock ? (
          <Pressable onPress={() => onSelectBlock?.(coilBlock.id)} style={[styles.coilBlock, blockActive(coilBlock, plcState, rungActive) && styles.coilBlockOn]}>
            <Text style={[styles.blockVariable, blockActive(coilBlock, plcState, rungActive) && styles.blockTextOn]}>{blockLabel(coilBlock)}</Text>
            <Text style={[styles.blockSymbol, blockActive(coilBlock, plcState, rungActive) && styles.blockTextOn]}>{coilSymbol(coilBlock)}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onOpenEdit} style={styles.missingCoilBox}>
            <Text style={styles.missingCoilText}>+ Bobina</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.ioPanel}>
        <Text style={styles.panelTitle}>Saídas</Text>
        <View style={styles.outputGrid}>
          {outputs.length === 0 ? <Text style={styles.emptyText}>Adicione uma saída Q/O para ver o resultado.</Text> : outputs.map((signal) => (
            <View key={signal.address} style={[styles.outputCard, signal.active && styles.outputCardOn]}>
              <Text style={[styles.signalAddress, signal.active && styles.signalAddressOn]}>{signal.address}</Text>
              <Text style={styles.signalName} numberOfLines={1}>{signal.name}</Text>
              <Text style={[styles.signalState, signal.active && styles.signalStateOn]}>{signal.active ? 'ON' : 'OFF'}</Text>
            </View>
          ))}
        </View>
      </View>

      {hint ? <Text style={styles.hintText}>{hint}</Text> : null}

      <View style={styles.actionRow}>
        <Pressable onPress={onRunScan} style={[styles.actionButton, styles.scanButton]}>
          <Text style={styles.scanButtonText}>Scan</Text>
        </Pressable>
        <Pressable onPress={onToggleAutoScan} style={[styles.actionButton, autoScan && styles.autoButtonOn]}>
          <Text style={[styles.actionButtonText, autoScan && styles.autoButtonTextOn]}>{autoScan ? 'Auto ON' : 'Auto OFF'}</Text>
        </Pressable>
        <Pressable onPress={onOpenEdit} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Editar</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Dica</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: '#CBD5E1',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    gap: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleBox: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#334155', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: '#0F172A', fontSize: 16, lineHeight: 21, fontWeight: '900', marginTop: 2 },
  runPill: { borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 14, paddingHorizontal: spacing.sm, paddingVertical: 5, backgroundColor: '#FFFFFF', alignItems: 'center' },
  runPillAuto: { borderColor: '#16A34A', backgroundColor: '#DCFCE7' },
  runText: { color: '#334155', fontSize: 10, fontWeight: '900' },
  runTextAuto: { color: '#166534' },
  scanText: { color: '#475569', fontSize: 9, fontWeight: '800', marginTop: 1 },
  ioPanel: { borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: '#FFFFFF', gap: spacing.xs },
  panelTitle: { color: '#0F172A', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  signalStrip: { gap: spacing.xs, paddingRight: spacing.xs },
  inputButton: { width: 104, borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: '#F8FAFC', alignItems: 'center' },
  inputButtonOn: { borderColor: '#16A34A', backgroundColor: '#DCFCE7' },
  signalAddress: { color: '#0F172A', fontFamily: 'monospace', fontSize: 12, fontWeight: '900' },
  signalAddressOn: { color: '#166534' },
  signalName: { color: '#475569', fontSize: 10, fontWeight: '800', marginTop: 2, maxWidth: 88 },
  signalState: { color: '#475569', fontSize: 11, fontWeight: '900', marginTop: 4 },
  signalStateOn: { color: '#166534' },
  rungHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rungNavButton: { width: 38, height: 38, borderRadius: 999, borderColor: '#CBD5E1', borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  rungNavText: { color: '#0F172A', fontSize: 24, fontWeight: '900' },
  rungTitleBox: { flex: 1, minWidth: 0, alignItems: 'center' },
  rungTitle: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  rungTitleOn: { color: '#166534' },
  rungSubtitle: { color: '#64748B', fontSize: 10, fontWeight: '800', marginTop: 1 },
  viewToggleRow: { flexDirection: 'row', gap: spacing.xs },
  viewToggle: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingVertical: 7, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  viewToggleActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  viewToggleText: { color: colors.textMuted, fontSize: 11, fontWeight: '900' },
  viewToggleTextActive: { color: colors.cyan },
  rungCanvas: { minHeight: 130, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingRight: spacing.sm },
  ladderBlock: { minWidth: 116, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.surfaceElevated, alignItems: 'center' },
  ladderBlockOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  coilBlock: { minWidth: 128, borderColor: colors.amber, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.amberSoft, alignItems: 'center' },
  coilBlockOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  blockVariable: { color: colors.text, fontFamily: 'monospace', fontSize: 11, fontWeight: '900' },
  blockSymbol: { color: colors.text, fontSize: 14, fontWeight: '900', marginTop: 4 },
  blockTextOn: { color: colors.green },
  blockHint: { color: colors.textMuted, fontSize: 9, fontWeight: '800', marginTop: 3 },
  branchBadge: { borderColor: colors.cyan, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, backgroundColor: colors.cyanSoft },
  branchText: { color: colors.cyan, fontSize: 10, fontWeight: '900' },
  emptyRungBox: { minWidth: 220, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated, alignItems: 'center' },
  emptyRungTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  emptyRungText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  missingCoilBox: { minWidth: 96, borderColor: colors.amber, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.amberSoft, alignItems: 'center' },
  missingCoilText: { color: colors.amber, fontSize: 12, fontWeight: '900' },
  outputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  outputCard: { flexGrow: 1, flexBasis: 104, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.surface, alignItems: 'center' },
  outputCardOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  hintText: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: spacing.xs },
  actionButton: { flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.surfaceElevated },
  scanButton: { borderColor: colors.cyan, backgroundColor: colors.cyan },
  scanButtonText: { color: colors.surface, fontSize: 12, fontWeight: '900' },
  actionButtonText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  autoButtonOn: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  autoButtonTextOn: { color: colors.green },
  emptyText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
