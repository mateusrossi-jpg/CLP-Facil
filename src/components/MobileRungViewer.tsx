import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState, EditorRung } from '../engine/editorTypes';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileRungViewMode = 'ladder' | 'flow' | 'list';

type MobileRungViewerProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  rungIndex: number;
  onSelectRungIndex?: (index: number) => void;
  onSelectBlock?: (block: EditorBlock) => void;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function contactSymbol(block: EditorBlock): string {
  if (block.contactMode === 'NC') return '--|/|--';
  if (block.contactMode === 'RISING') return '--|P|--';
  if (block.contactMode === 'FALLING') return '--|N|--';
  return '--| |--';
}

function coilSymbol(block: EditorBlock): string {
  if (block.role === 'timer') return block.timerMode ?? 'TON';
  if (block.role === 'counter') return block.counterMode ?? 'CTU';
  if (block.coilMode && block.coilMode !== 'NORMAL') return `(${block.coilMode})`;
  return '--( )--';
}

function blockAddress(block: EditorBlock): string {
  return normalize(block.variable || block.destination || block.sourceA) || 'TAG';
}

function blockActive(block: EditorBlock, state: PlcState, rungActive: boolean): boolean {
  if (block.role === 'coil' || block.role === 'timer' || block.role === 'counter') return rungActive || Boolean(state[normalize(block.variable)]);
  const raw = Boolean(state[normalize(block.variable)]);
  return block.contactMode === 'NC' ? !raw : raw;
}

function flattenRung(rung: EditorRung): EditorBlock[] {
  return [
    ...rung.seriesBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...rung.parallelBlocks,
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ];
}

function BlockChip({ block, active, mode, onPress }: { block: EditorBlock; active: boolean; mode: MobileRungViewMode; onPress?: () => void }) {
  const outputLike = block.role === 'coil' || block.role === 'timer' || block.role === 'counter';
  const symbol = outputLike ? coilSymbol(block) : contactSymbol(block);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.blockChip, outputLike && styles.outputChip, active && styles.blockChipOn, pressed && styles.pressed]}>
      <Text style={[styles.blockAddress, active && styles.blockAddressOn]}>{blockAddress(block)}</Text>
      {mode !== 'list' ? <Text style={[styles.blockSymbol, active && styles.blockAddressOn]}>{symbol}</Text> : null}
      <Text style={styles.blockName} numberOfLines={mode === 'list' ? 2 : 1}>{block.name}</Text>
    </Pressable>
  );
}

export const MobileRungViewer = memo(function MobileRungViewer({
  editorProject,
  plcState,
  evaluation,
  rungIndex,
  onSelectRungIndex,
  onSelectBlock,
}: MobileRungViewerProps) {
  const [viewMode, setViewMode] = useState<MobileRungViewMode>('ladder');
  const safeIndex = Math.min(Math.max(rungIndex, 0), Math.max(editorProject.rungs.length - 1, 0));
  const rung = editorProject.rungs[safeIndex];
  const rungActive = Boolean(rung && evaluation.rungResults?.[rung.id]);
  const blocks = useMemo(() => rung ? flattenRung(rung) : [], [rung]);
  const branches = rung?.parallelBranches ?? [];

  if (!rung) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>Nenhuma rung criada ainda.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, rungActive && styles.cardOn]}>
      <View style={styles.header}>
        <View style={styles.rungCopy}>
          <Text style={styles.eyebrow}>Rung {safeIndex + 1} de {editorProject.rungs.length}</Text>
          <Text style={styles.title}>{rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
        </View>
        <View style={[styles.statusPill, rungActive && styles.statusPillOn]}>
          <Text style={[styles.statusText, rungActive && styles.statusTextOn]}>{rungActive ? 'TRUE' : 'FALSE'}</Text>
        </View>
      </View>

      <View style={styles.navRow}>
        <Pressable disabled={safeIndex === 0} onPress={() => onSelectRungIndex?.(safeIndex - 1)} style={[styles.navButton, safeIndex === 0 && styles.disabled]}>
          <Text style={styles.navText}>Anterior</Text>
        </Pressable>
        <View style={styles.modeRow}>
          {(['ladder', 'flow', 'list'] as MobileRungViewMode[]).map((mode) => {
            const selected = viewMode === mode;
            return (
              <Pressable key={mode} onPress={() => setViewMode(mode)} style={[styles.modeButton, selected && styles.modeButtonOn]}>
                <Text style={[styles.modeText, selected && styles.modeTextOn]}>{mode === 'ladder' ? 'Ladder' : mode === 'flow' ? 'Fluxo' : 'Lista'}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable disabled={safeIndex >= editorProject.rungs.length - 1} onPress={() => onSelectRungIndex?.(safeIndex + 1)} style={[styles.navButton, safeIndex >= editorProject.rungs.length - 1 && styles.disabled]}>
          <Text style={styles.navText}>Proxima</Text>
        </Pressable>
      </View>

      {viewMode === 'ladder' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ladderRail}>
          <Text style={[styles.railText, rungActive && styles.railTextOn]}>|</Text>
          {rung.seriesBlocks.map((block) => (
            <BlockChip key={block.id} block={block} active={blockActive(block, plcState, rungActive)} mode={viewMode} onPress={() => onSelectBlock?.(block)} />
          ))}
          {branches.length > 0 ? (
            <View style={styles.branchBox}>
              <Text style={styles.branchLabel}>Branch</Text>
              {branches.map((branch) => (
                <View key={branch.id} style={styles.branchRow}>
                  {branch.blocks.map((block) => (
                    <BlockChip key={block.id} block={block} active={blockActive(block, plcState, rungActive)} mode={viewMode} onPress={() => onSelectBlock?.(block)} />
                  ))}
                </View>
              ))}
            </View>
          ) : null}
          {rung.coilBlock ? <BlockChip block={rung.coilBlock} active={blockActive(rung.coilBlock, plcState, rungActive)} mode={viewMode} onPress={() => onSelectBlock?.(rung.coilBlock as EditorBlock)} /> : null}
          <Text style={[styles.railText, rungActive && styles.railTextOn]}>|</Text>
        </ScrollView>
      ) : null}

      {viewMode === 'flow' ? (
        <View style={styles.flowStack}>
          {blocks.map((block, index) => (
            <View key={`${block.id}-${index}`} style={styles.flowRow}>
              <Text style={styles.flowIndex}>{index + 1}</Text>
              <BlockChip block={block} active={blockActive(block, plcState, rungActive)} mode={viewMode} onPress={() => onSelectBlock?.(block)} />
            </View>
          ))}
        </View>
      ) : null}

      {viewMode === 'list' ? (
        <View style={styles.flowStack}>
          {blocks.map((block, index) => {
            const active = blockActive(block, plcState, rungActive);
            return (
              <Pressable key={`${block.id}-${index}`} onPress={() => onSelectBlock?.(block)} style={[styles.listRow, active && styles.listRowOn]}>
                <Text style={styles.flowIndex}>{index + 1}</Text>
                <View style={styles.listCopy}>
                  <Text style={[styles.listTitle, active && styles.blockAddressOn]}>{blockAddress(block)} • {block.name}</Text>
                  <Text style={styles.listMeta}>{block.role} {block.contactMode ?? block.coilMode ?? block.timerMode ?? block.counterMode ?? ''}</Text>
                </View>
                <Text style={[styles.listState, active && styles.blockAddressOn]}>{active ? 'ON' : 'OFF'}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  cardOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rungCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  statusPill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surfaceElevated,
  },
  statusPillOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextOn: {
    color: colors.green,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    backgroundColor: colors.surfaceElevated,
  },
  navText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  modeRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  modeButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    backgroundColor: colors.surfaceElevated,
  },
  modeButtonOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  modeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  modeTextOn: {
    color: colors.cyan,
  },
  ladderRail: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  railText: {
    color: colors.textDim,
    fontSize: 34,
    fontWeight: '900',
  },
  railTextOn: {
    color: colors.green,
  },
  blockChip: {
    minWidth: 96,
    minHeight: 70,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  outputChip: {
    borderRadius: 999,
    minWidth: 116,
  },
  blockChipOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  blockAddress: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  blockAddressOn: {
    color: colors.green,
  },
  blockSymbol: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },
  blockName: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'center',
  },
  branchBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  branchLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flowStack: {
    gap: spacing.xs,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flowIndex: {
    width: 22,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  listRowOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  listCopy: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  listMeta: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  listState: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.72,
  },
});
