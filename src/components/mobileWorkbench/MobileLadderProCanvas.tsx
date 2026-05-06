import { ComponentProps, memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorRung } from '../../engine/editorTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileLadderProCanvasProps = Pick<
  ComponentProps<typeof MobilePlcExperience>,
  'editorProject' | 'plcState' | 'evaluation' | 'selectedBlockId' | 'onSelectRungId' | 'onSelectBlockId'
>;

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function valueOn(state: MobileLadderProCanvasProps['plcState'], address: string | undefined): boolean {
  const normalized = normalize(address);
  if (!normalized) return false;
  const compact = normalized.replace('.0', '');
  const dotted = normalized.includes('.') ? normalized : `${normalized}.0`;
  const value = state[normalized] ?? state[compact] ?? state[dotted];
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

function blockAddress(block: EditorBlock): string {
  return normalize(block.variable || block.destination || block.sourceA) || 'TAG';
}

function blockSymbol(block: EditorBlock): string {
  if (block.role === 'timer') return block.timerMode ?? 'TON';
  if (block.role === 'counter') return block.counterMode ?? 'CTU';
  if (block.role === 'coil') return block.coilMode === 'SET' ? '(S)' : block.coilMode === 'RESET' ? '(R)' : '( )';
  if (block.contactMode === 'NC') return '|/|';
  if (block.contactMode === 'RISING') return '|P|';
  if (block.contactMode === 'FALLING') return '|N|';
  return '| |';
}

function previewBlocks(rung: EditorRung): EditorBlock[] {
  return [
    ...rung.seriesBlocks.slice(0, 4),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ];
}

function branchBlocks(rung: EditorRung): EditorBlock[] {
  return [
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
  ].slice(0, 4);
}

function blockIsActive(block: EditorBlock, plcState: MobileLadderProCanvasProps['plcState'], rungActive: boolean): boolean {
  const outputLike = block.role === 'coil' || block.role === 'timer' || block.role === 'counter';
  return outputLike
    ? valueOn(plcState, block.variable || block.destination) || rungActive
    : valueOn(plcState, block.variable || block.sourceA) || (rungActive && block.contactMode !== 'NC');
}

function CanvasBlock({
  block,
  plcState,
  rungActive,
  selectedBlockId,
  onSelectBlockId,
  compact,
}: {
  block: EditorBlock;
  plcState: MobileLadderProCanvasProps['plcState'];
  rungActive: boolean;
  selectedBlockId?: string | null;
  onSelectBlockId?: (blockId: string) => void;
  compact?: boolean;
}) {
  const outputLike = block.role === 'coil' || block.role === 'timer' || block.role === 'counter';
  const active = blockIsActive(block, plcState, rungActive);
  const selectedBlock = selectedBlockId === block.id;
  return (
    <Pressable
      onPress={() => onSelectBlockId?.(block.id)}
      style={({ pressed }) => [
        styles.blockNode,
        compact && styles.blockNodeCompact,
        outputLike && styles.outputNode,
        active && styles.blockNodeOn,
        selectedBlock && styles.blockNodeSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.blockSymbol, compact && styles.blockSymbolCompact, active && styles.blockSymbolOn]}>{blockSymbol(block)}</Text>
      <Text style={[styles.blockAddress, compact && styles.blockAddressCompact, active && styles.blockAddressOn]} numberOfLines={1}>{blockAddress(block)}</Text>
      {!compact ? <Text style={styles.blockName} numberOfLines={1}>{block.name}</Text> : null}
    </Pressable>
  );
}

export const MobileLadderProCanvas = memo(function MobileLadderProCanvas({
  editorProject,
  plcState,
  evaluation,
  selectedBlockId,
  onSelectRungId,
  onSelectBlockId,
}: MobileLadderProCanvasProps) {
  const visibleRungs = useMemo(() => editorProject.rungs.slice(0, 6), [editorProject.rungs]);
  const selectedRungId = editorProject.selectedRungId ?? visibleRungs[0]?.id;
  const energizedCount = visibleRungs.filter((rung) => Boolean(evaluation.rungResults?.[rung.id])).length;

  if (visibleRungs.length === 0) return null;

  return (
    <View style={[styles.card, energizedCount > 0 && styles.cardOn]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Ladder Canvas PRO</Text>
          <Text style={styles.title}>Editor visual com snap e branch</Text>
        </View>
        <View style={styles.counterPill}>
          <Text style={[styles.counterText, energizedCount > 0 && styles.counterTextOn]}>{energizedCount}/{visibleRungs.length} LIVE</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.canvasScroller}>
        <View style={styles.canvasArea}>
          <View style={styles.leftRail} />
          <View style={styles.rightRail} />

          {visibleRungs.map((rung, rungIndex) => {
            const rungActive = Boolean(evaluation.rungResults?.[rung.id]);
            const selectedRung = selectedRungId === rung.id;
            const blocks = previewBlocks(rung);
            const branches = branchBlocks(rung);
            const hasBranch = branches.length > 0;
            return (
              <Pressable
                key={rung.id}
                onPress={() => onSelectRungId?.(rung.id)}
                style={({ pressed }) => [
                  styles.rungLane,
                  hasBranch && styles.rungLaneWithBranch,
                  selectedRung && styles.rungLaneSelected,
                  rungActive && styles.rungLaneOn,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.rungNumberCol}>
                  <Text style={[styles.rungNumber, selectedRung && styles.rungNumberSelected, rungActive && styles.rungNumberOn]}>{String(rungIndex + 1).padStart(3, '0')}</Text>
                </View>

                <View style={styles.rungCircuitWrap}>
                  <View style={styles.rungCircuit}>
                    <View style={[styles.rungWire, rungActive && styles.rungWireOn]} />
                    <View style={[styles.snapDot, selectedRung && styles.snapDotSelected, rungActive && styles.snapDotOn]} />

                    {blocks.length === 0 ? (
                      <View style={styles.emptyDropZone}>
                        <Text style={styles.emptyDropText}>+ toque no dock para inserir</Text>
                      </View>
                    ) : blocks.map((block, blockIndex) => (
                      <View key={block.id} style={styles.blockWrap}>
                        {blockIndex > 0 ? <View style={[styles.insertSlot, selectedRung && styles.insertSlotSelected]}><Text style={styles.insertText}>+</Text></View> : null}
                        <CanvasBlock
                          block={block}
                          plcState={plcState}
                          rungActive={rungActive}
                          selectedBlockId={selectedBlockId}
                          onSelectBlockId={onSelectBlockId}
                        />
                      </View>
                    ))}

                    <View style={[styles.snapEnd, selectedRung && styles.snapEndSelected, rungActive && styles.snapEndOn]} />
                  </View>

                  {hasBranch ? (
                    <View style={styles.branchLayer}>
                      <View style={[styles.branchFork, rungActive && styles.branchForkOn]} />
                      <View style={[styles.branchMerge, rungActive && styles.branchMergeOn]} />
                      <View style={[styles.branchWire, rungActive && styles.branchWireOn]} />
                      <View style={[styles.branchStartDot, rungActive && styles.branchDotOn]} />
                      <Text style={[styles.branchLabel, rungActive && styles.branchLabelOn]}>BRANCH</Text>
                      <View style={styles.branchBlocksRow}>
                        {branches.map((block, index) => (
                          <View key={block.id} style={styles.branchBlockWrap}>
                            {index > 0 ? <View style={[styles.branchInsertSlot, selectedRung && styles.insertSlotSelected]}><Text style={styles.insertText}>+</Text></View> : null}
                            <CanvasBlock
                              block={block}
                              plcState={plcState}
                              rungActive={rungActive}
                              selectedBlockId={selectedBlockId}
                              onSelectBlockId={onSelectBlockId}
                              compact
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : selectedRung ? (
                    <View style={styles.branchGhost}>
                      <Text style={styles.branchGhostText}>+ Branch paralelo</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.rungStateCol}>
                  <Text style={[styles.rungState, rungActive && styles.rungStateOn]}>{rungActive ? 'TRUE' : 'FALSE'}</Text>
                  <Text style={styles.rungName} numberOfLines={1}>{rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.hint}>Branches paralelos agora aparecem com fork, merge e energização independente no canvas.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  counterPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  counterText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  counterTextOn: {
    color: colors.green,
  },
  canvasScroller: {
    paddingRight: spacing.sm,
  },
  canvasArea: {
    minWidth: 820,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  leftRail: {
    position: 'absolute',
    left: 54,
    top: 14,
    bottom: 14,
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  rightRail: {
    position: 'absolute',
    right: 86,
    top: 14,
    bottom: 14,
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  rungLane: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  rungLaneWithBranch: {
    minHeight: 142,
  },
  rungLaneSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  rungLaneOn: {
    borderColor: colors.green,
  },
  rungNumberCol: {
    width: 42,
    alignItems: 'flex-start',
  },
  rungNumber: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  rungNumberSelected: {
    color: colors.cyan,
  },
  rungNumberOn: {
    color: colors.green,
  },
  rungCircuitWrap: {
    flex: 1,
    minWidth: 500,
    gap: spacing.xs,
  },
  rungCircuit: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  rungWire: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  rungWireOn: {
    backgroundColor: colors.green,
  },
  snapDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    zIndex: 20,
  },
  snapDotSelected: {
    borderColor: colors.cyan,
  },
  snapDotOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  snapEnd: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    marginLeft: spacing.sm,
    zIndex: 20,
  },
  snapEndSelected: {
    borderColor: colors.cyan,
  },
  snapEndOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  emptyDropZone: {
    minWidth: 220,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.cyan,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  emptyDropText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  blockWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  insertSlot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  insertSlotSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  insertText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  blockNode: {
    width: 82,
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    gap: 2,
  },
  blockNodeCompact: {
    width: 70,
    minHeight: 46,
    padding: 4,
  },
  outputNode: {
    borderRadius: 999,
  },
  blockNodeOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  blockNodeSelected: {
    borderColor: colors.cyan,
    borderWidth: 2,
  },
  blockSymbol: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
  },
  blockSymbolCompact: {
    fontSize: 12,
  },
  blockSymbolOn: {
    color: colors.green,
  },
  blockAddress: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
  },
  blockAddressCompact: {
    fontSize: 9,
  },
  blockAddressOn: {
    color: colors.green,
  },
  blockName: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  branchLayer: {
    minHeight: 54,
    marginLeft: 28,
    marginRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingLeft: 22,
    paddingRight: 22,
  },
  branchFork: {
    position: 'absolute',
    left: 0,
    top: -18,
    bottom: 22,
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  branchForkOn: {
    backgroundColor: colors.green,
  },
  branchMerge: {
    position: 'absolute',
    right: 0,
    top: -18,
    bottom: 22,
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  branchMergeOn: {
    backgroundColor: colors.green,
  },
  branchWire: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  branchWireOn: {
    backgroundColor: colors.green,
  },
  branchStartDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
    zIndex: 20,
  },
  branchDotOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  branchLabel: {
    position: 'absolute',
    left: 24,
    top: -2,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  branchLabelOn: {
    color: colors.green,
  },
  branchBlocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  branchBlockWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchInsertSlot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  branchGhost: {
    minHeight: 36,
    marginLeft: 48,
    marginRight: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.cyan,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  branchGhostText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  rungStateCol: {
    width: 116,
    alignItems: 'flex-end',
    gap: 3,
  },
  rungState: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  rungStateOn: {
    color: colors.green,
  },
  rungName: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    maxWidth: 110,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
