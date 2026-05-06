import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorProjectState, EditorRung } from '../engine/editorTypes';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorRungTrace, traceEditorRung } from '../engine/editorScanTrace';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileRungViewMode = 'ladder' | 'flow' | 'list';
type MobileRungScope = 'individual' | 'compiled';

type MobileRungViewerProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  rungIndex: number;
  onSelectRungIndex?: (index: number) => void;
  onSelectBlock?: (block: EditorBlock) => void;
};

const MIN_LADDER_ZOOM = 0.78;
const MAX_LADDER_ZOOM = 1.22;

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function clampLadderZoom(value: number): number {
  return Math.min(MAX_LADDER_ZOOM, Math.max(MIN_LADDER_ZOOM, value));
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

function traceContactClosed(block: EditorBlock, trace: EditorRungTrace | null): boolean {
  if (block.role !== 'contact') return false;
  const contacts = [
    ...(trace?.seriesContacts ?? []),
    ...(trace?.branchTraces ?? []).flatMap((branch) => branch.contacts),
  ];
  return Boolean(contacts.find((contact) => contact.blockId === block.id)?.energized);
}

function conductiveBlockIds(rung: EditorRung, trace: EditorRungTrace | null): Set<string> {
  const conducting = new Set<string>();
  if (!trace) return conducting;
  const seriesBlocks = rung.seriesBlocks.filter((block) => block.role === 'contact');
  const reachable = new Set<number>([0]);

  if (seriesBlocks.length === 0) {
    for (const branch of trace.branchTraces) {
      if (!branch.energized) continue;
      branch.contacts.forEach((contact) => conducting.add(contact.blockId));
    }
    return conducting;
  }

  for (let nodeIndex = 0; nodeIndex < seriesBlocks.length; nodeIndex += 1) {
    if (!reachable.has(nodeIndex)) continue;

    const seriesContact = trace.seriesContacts[nodeIndex];
    if (seriesContact?.energized) {
      conducting.add(seriesContact.blockId);
      reachable.add(nodeIndex + 1);
    }

    for (const branch of trace.branchTraces) {
      if (branch.seriesIndex !== nodeIndex || !branch.energized) continue;
      branch.contacts.forEach((contact) => conducting.add(contact.blockId));
      reachable.add(branch.endIndex);
    }
  }

  return conducting;
}

function flattenRung(rung: EditorRung): EditorBlock[] {
  return [
    ...rung.seriesBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...rung.parallelBlocks,
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ];
}

function branchesForRung(rung: EditorRung) {
  if (rung.parallelBranches && rung.parallelBranches.length > 0) return rung.parallelBranches;
  if (rung.parallelBlocks.length === 0) return [];
  return [{
    id: `${rung.id}-legacy-mobile-branch`,
    seriesIndex: 0,
    blocks: rung.parallelBlocks,
  }];
}

function BlockChip({ block, active, mode, zoom = 1, onPress }: { block: EditorBlock; active: boolean; mode: MobileRungViewMode; zoom?: number; onPress?: () => void }) {
  const outputLike = block.role === 'coil' || block.role === 'timer' || block.role === 'counter';
  const symbol = outputLike ? coilSymbol(block) : contactSymbol(block);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.blockChip,
        {
          minWidth: Math.round((outputLike ? 116 : 96) * zoom),
          minHeight: Math.round(70 * zoom),
          padding: Math.max(5, Math.round(spacing.sm * zoom)),
        },
        outputLike && styles.outputChip,
        active && styles.blockChipOn,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.blockAddress, { fontSize: Math.round(12 * zoom) }, active && styles.blockAddressOn]}>{blockAddress(block)}</Text>
      {mode !== 'list' ? <Text style={[styles.blockSymbol, { fontSize: Math.round(15 * zoom) }, active && styles.blockAddressOn]}>{symbol}</Text> : null}
      <Text style={[styles.blockName, { fontSize: Math.max(9, Math.round(10 * zoom)) }]} numberOfLines={mode === 'list' ? 2 : 1}>{block.name}</Text>
    </Pressable>
  );
}

function MobileLadderCanvas({
  rung,
  rungActive,
  plcState,
  conductingBlocks,
  zoom,
  onSelectBlock,
}: {
  rung: EditorRung;
  rungActive: boolean;
  plcState: PlcState;
  conductingBlocks: Set<string>;
  zoom: number;
  onSelectBlock?: (block: EditorBlock) => void;
}) {
  const branches = branchesForRung(rung);
  const blockWidth = Math.round(106 * zoom);
  const outputWidth = Math.round(132 * zoom);
  const blockHeight = Math.round(72 * zoom);
  const startX = Math.round(58 * zoom);
  const stepX = Math.round(138 * zoom);
  const mainY = Math.round(92 * zoom);
  const blockTop = Math.round(56 * zoom);
  const branchStartY = Math.round(174 * zoom);
  const branchGapY = Math.round(88 * zoom);
  const railHeight = Math.max(Math.round(180 * zoom), branchStartY + Math.max(branches.length - 1, 0) * branchGapY + blockHeight + Math.round(40 * zoom));
  const coilLeft = startX + Math.max(rung.seriesBlocks.length, 1) * stepX + Math.round(120 * zoom);
  const canvasWidth = Math.max(Math.round(650 * zoom), coilLeft + outputWidth + Math.round(82 * zoom));
  const mainLineLeft = Math.round(18 * zoom);
  const mainLineRight = canvasWidth - Math.round(18 * zoom);
  const lineColorStyle = rungActive ? styles.mobileWireOn : styles.mobileWire;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.mobileCanvasScroller}>
      <View style={[styles.mobileCircuitCanvas, { width: canvasWidth, height: railHeight }]}>
        <View style={[styles.mobileRail, styles.mobileLeftRail, { height: railHeight - Math.round(28 * zoom) }]} />
        <View style={[styles.mobileRail, styles.mobileRightRail, { left: mainLineRight, height: railHeight - Math.round(28 * zoom) }]} />
        <View style={[styles.mobileMainLine, lineColorStyle, { left: mainLineLeft, top: mainY, width: mainLineRight - mainLineLeft }]} />

        {branches.map((branch, branchIndex) => {
          const segmentIndex = Math.min(Math.max(branch.seriesIndex, 0), Math.max(rung.seriesBlocks.length - 1, 0));
          const branchStartX = startX + segmentIndex * stepX + Math.round(blockWidth * 0.48);
          const branchY = branchStartY + branchIndex * branchGapY;
          const branchEndX = branchStartX + Math.max(branch.blocks.length, 1) * stepX;
          return (
            <View key={branch.id}>
              <View style={[styles.mobileNode, { left: branchStartX - 4, top: mainY - 4 }]} />
              <View style={[styles.mobileNode, { left: branchEndX - 4, top: mainY - 4 }]} />
              <View style={[styles.mobileBranchDrop, lineColorStyle, { left: branchStartX, top: mainY, height: branchY - mainY }]} />
              <View style={[styles.mobileBranchDrop, lineColorStyle, { left: branchEndX, top: mainY, height: branchY - mainY }]} />
              <View style={[styles.mobileMainLine, lineColorStyle, { left: branchStartX, top: branchY, width: branchEndX - branchStartX }]} />
              {branch.blocks.map((block, blockIndex) => (
                <View key={block.id} style={[styles.mobileAbsoluteBlock, { left: branchStartX + blockIndex * stepX - Math.round(blockWidth * 0.42), top: branchY - Math.round(blockHeight * 0.52) }]}>
                  <BlockChip block={block} active={conductingBlocks.has(block.id)} mode="ladder" zoom={zoom} onPress={() => onSelectBlock?.(block)} />
                </View>
              ))}
            </View>
          );
        })}

        {rung.seriesBlocks.map((block, index) => (
          <View key={block.id} style={[styles.mobileAbsoluteBlock, { left: startX + index * stepX, top: blockTop }]}>
            <BlockChip block={block} active={conductingBlocks.has(block.id)} mode="ladder" zoom={zoom} onPress={() => onSelectBlock?.(block)} />
          </View>
        ))}

        {rung.coilBlock ? (
          <View style={[styles.mobileAbsoluteBlock, { left: coilLeft, top: blockTop }]}>
            <BlockChip block={rung.coilBlock} active={blockActive(rung.coilBlock, plcState, rungActive)} mode="ladder" zoom={zoom} onPress={() => onSelectBlock?.(rung.coilBlock as EditorBlock)} />
          </View>
        ) : null}
      </View>
    </ScrollView>
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
  const [rungScope, setRungScope] = useState<MobileRungScope>('individual');
  const [ladderZoom, setLadderZoom] = useState(0.92);
  const safeIndex = Math.min(Math.max(rungIndex, 0), Math.max(editorProject.rungs.length - 1, 0));
  const rung = editorProject.rungs[safeIndex];
  const rungActive = Boolean(rung && evaluation.rungResults?.[rung.id]);
  const rungTrace = useMemo(() => rung ? traceEditorRung(rung, plcState, evaluation.runtime) : null, [evaluation.runtime, plcState, rung]);
  const conductingBlocks = useMemo(() => rung ? conductiveBlockIds(rung, rungTrace) : new Set<string>(), [rung, rungTrace]);
  const blocks = useMemo(() => rung ? flattenRung(rung) : [], [rung]);
  const outputBlock = rung?.coilBlock ?? blocks.find((block) => block.role === 'coil' || block.role === 'timer' || block.role === 'counter') ?? null;
  const outputActive = outputBlock ? blockActive(outputBlock, plcState, rungActive) : false;
  const compiledMode = rungScope === 'compiled';
  const energizedCount = editorProject.rungs.filter((item) => evaluation.rungResults?.[item.id]).length;

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
          <Text style={styles.eyebrow}>{compiledMode ? 'Programa completo' : `Rung ${safeIndex + 1} de ${editorProject.rungs.length}`}</Text>
          <Text style={styles.title}>{compiledMode ? `${editorProject.rungs.length} rungs no mesmo bloco` : rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
        </View>
        <View style={[styles.statusPill, rungActive && styles.statusPillOn]}>
          <Text style={[styles.statusText, rungActive && styles.statusTextOn]}>{compiledMode ? `${energizedCount}/${editorProject.rungs.length}` : rungActive ? 'TRUE' : 'FALSE'}</Text>
        </View>
      </View>

      <View style={styles.scopeRow}>
        {([
          ['individual', 'Rung'],
          ['compiled', 'Programa'],
        ] as [MobileRungScope, string][]).map(([scope, label]) => {
          const selected = rungScope === scope;
          return (
            <Pressable key={scope} onPress={() => setRungScope(scope)} style={[styles.scopeButton, selected && styles.scopeButtonOn]}>
              <Text style={[styles.scopeText, selected && styles.scopeTextOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.navRow}>
        {!compiledMode ? (
          <Pressable disabled={safeIndex === 0} onPress={() => onSelectRungIndex?.(safeIndex - 1)} style={[styles.navButton, safeIndex === 0 && styles.disabled]}>
            <Text style={styles.navText}>Anterior</Text>
          </Pressable>
        ) : null}
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
        {!compiledMode ? (
          <Pressable disabled={safeIndex >= editorProject.rungs.length - 1} onPress={() => onSelectRungIndex?.(safeIndex + 1)} style={[styles.navButton, safeIndex >= editorProject.rungs.length - 1 && styles.disabled]}>
            <Text style={styles.navText}>Proxima</Text>
          </Pressable>
        ) : null}
      </View>

      {!compiledMode ? (
        <View style={[styles.outputSummary, outputActive && styles.outputSummaryOn]}>
        <View style={styles.outputSummaryCopy}>
          <Text style={styles.outputSummaryLabel}>Carga / saida</Text>
          <Text style={[styles.outputSummaryTitle, outputActive && styles.blockAddressOn]} numberOfLines={1}>
            {outputBlock ? `${blockAddress(outputBlock)} • ${outputBlock.name}` : 'Sem saida nesta rung'}
          </Text>
        </View>
        <Text style={[styles.outputSummaryState, outputActive && styles.blockAddressOn]}>{outputActive ? 'ON' : 'OFF'}</Text>
      </View>
      ) : null}

      {viewMode === 'ladder' ? (
        <>
        <View style={styles.zoomRow}>
          <Text style={styles.zoomHint}>Arraste para o lado</Text>
          <View style={styles.zoomControls}>
            <Pressable onPress={() => setLadderZoom((current) => clampLadderZoom(Number((current - 0.08).toFixed(2))))} style={({ pressed }) => [styles.zoomButton, pressed && styles.pressed]}>
              <Text style={styles.zoomButtonText}>-</Text>
            </Pressable>
            <Pressable onPress={() => setLadderZoom(0.84)} style={({ pressed }) => [styles.zoomValueButton, pressed && styles.pressed]}>
              <Text style={styles.zoomValueText}>{Math.round(ladderZoom * 100)}%</Text>
            </Pressable>
            <Pressable onPress={() => setLadderZoom((current) => clampLadderZoom(Number((current + 0.08).toFixed(2))))} style={({ pressed }) => [styles.zoomButton, pressed && styles.pressed]}>
              <Text style={styles.zoomButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
        {compiledMode ? (
          <View style={styles.compiledProgramBox}>
            {editorProject.rungs.map((item, index) => {
              const itemActive = Boolean(evaluation.rungResults?.[item.id]);
              const itemTrace = traceEditorRung(item, plcState, evaluation.runtime);
              const itemConducting = conductiveBlockIds(item, itemTrace);
              const itemOutput = item.coilBlock;
              const itemOutputActive = itemOutput ? blockActive(itemOutput, plcState, itemActive) : false;
              return (
                <View key={item.id} style={[styles.compiledRung, item.id === rung.id && styles.compiledRungSelected]}>
                  <Pressable onPress={() => onSelectRungIndex?.(index)} style={({ pressed }) => [styles.compiledRungHeader, pressed && styles.pressed]}>
                    <View style={styles.compiledRungCopy}>
                      <Text style={styles.compiledRungIndex}>Rung {index + 1}</Text>
                      <Text style={styles.compiledRungTitle} numberOfLines={1}>{item.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
                    </View>
                    <Text style={[styles.compiledRungState, itemActive && styles.blockAddressOn]}>{itemActive ? 'TRUE' : 'FALSE'}</Text>
                  </Pressable>
                  <View style={[styles.compiledLoadSummary, itemOutputActive && styles.outputSummaryOn]}>
                    <Text style={[styles.compiledLoadText, itemOutputActive && styles.blockAddressOn]} numberOfLines={1}>
                      {itemOutput ? `${blockAddress(itemOutput)} • ${itemOutput.name}` : 'Sem carga/saida'}
                    </Text>
                    <Text style={[styles.compiledLoadState, itemOutputActive && styles.blockAddressOn]}>{itemOutputActive ? 'ON' : 'OFF'}</Text>
                  </View>
                  <MobileLadderCanvas
                    rung={item}
                    rungActive={itemActive}
                    plcState={plcState}
                    conductingBlocks={itemConducting}
                    zoom={ladderZoom}
                    onSelectBlock={onSelectBlock}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <MobileLadderCanvas
            rung={rung}
            rungActive={rungActive}
            plcState={plcState}
            conductingBlocks={conductingBlocks}
            zoom={ladderZoom}
            onSelectBlock={onSelectBlock}
          />
        )}
        </>
      ) : null}

      {viewMode === 'flow' ? (
        <View style={styles.flowStack}>
          {(compiledMode ? editorProject.rungs : [rung]).map((item, rungListIndex) => {
            const itemActive = Boolean(evaluation.rungResults?.[item.id]);
            const itemTrace = traceEditorRung(item, plcState, evaluation.runtime);
            const itemConducting = conductiveBlockIds(item, itemTrace);
            const itemBlocks = flattenRung(item);
            return (
              <View key={item.id} style={compiledMode && styles.compiledTextRung}>
                {compiledMode ? <Text style={styles.compiledRungIndex}>Rung {rungListIndex + 1} • {item.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text> : null}
                {itemBlocks.map((block, index) => (
                  <View key={`${block.id}-${index}`} style={styles.flowRow}>
                    <Text style={styles.flowIndex}>{index + 1}</Text>
                    <BlockChip block={block} active={block.role === 'contact' ? itemConducting.has(block.id) : blockActive(block, plcState, itemActive)} mode={viewMode} onPress={() => onSelectBlock?.(block)} />
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ) : null}

      {viewMode === 'list' ? (
        <View style={styles.flowStack}>
          {(compiledMode ? editorProject.rungs : [rung]).map((item, rungListIndex) => {
            const itemActive = Boolean(evaluation.rungResults?.[item.id]);
            const itemTrace = traceEditorRung(item, plcState, evaluation.runtime);
            const itemConducting = conductiveBlockIds(item, itemTrace);
            const itemBlocks = flattenRung(item);
            return (
              <View key={item.id} style={compiledMode && styles.compiledTextRung}>
                {compiledMode ? <Text style={styles.compiledRungIndex}>Rung {rungListIndex + 1} • {item.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text> : null}
                {itemBlocks.map((block, index) => {
                  const closed = traceContactClosed(block, itemTrace);
                  const active = block.role === 'contact' ? itemConducting.has(block.id) : blockActive(block, plcState, itemActive);
                  const stateLabel = block.role === 'contact'
                    ? active ? 'CONDUZ' : closed ? 'FECHADO' : 'ABERTO'
                    : active ? 'ON' : 'OFF';
                  return (
                    <Pressable key={`${block.id}-${index}`} onPress={() => onSelectBlock?.(block)} style={[styles.listRow, closed && !active && styles.listRowClosed, active && styles.listRowOn]}>
                      <Text style={styles.flowIndex}>{index + 1}</Text>
                      <View style={styles.listCopy}>
                        <Text style={[styles.listTitle, active && styles.blockAddressOn]}>{blockAddress(block)} • {block.name}</Text>
                        <Text style={styles.listMeta}>{block.role} {block.contactMode ?? block.coilMode ?? block.timerMode ?? block.counterMode ?? ''}</Text>
                      </View>
                      <Text style={[styles.listState, closed && !active && styles.listStateClosed, active && styles.blockAddressOn]}>{stateLabel}</Text>
                    </Pressable>
                  );
                })}
              </View>
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
    backgroundColor: colors.surface,
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
  scopeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.background,
    padding: 3,
  },
  scopeButton: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
  },
  scopeButtonOn: {
    backgroundColor: colors.cyanSoft,
  },
  scopeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scopeTextOn: {
    color: colors.cyan,
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
  outputSummary: {
    minHeight: 46,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  outputSummaryOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputSummaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  outputSummaryLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  outputSummaryTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  outputSummaryState: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  zoomHint: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  zoomButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  zoomValueButton: {
    minWidth: 52,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftColor: colors.border,
    borderRightColor: colors.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  zoomValueText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  mobileCanvasScroller: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  mobileCircuitCanvas: {
    position: 'relative',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  mobileRail: {
    position: 'absolute',
    top: 14,
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.inactive,
  },
  mobileLeftRail: {
    left: 16,
  },
  mobileRightRail: {
    left: 620,
  },
  mobileMainLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
  },
  mobileWire: {
    backgroundColor: colors.inactive,
  },
  mobileWireOn: {
    backgroundColor: colors.green,
  },
  mobileBranchDrop: {
    position: 'absolute',
    width: 3,
    borderRadius: 999,
  },
  mobileNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.inactive,
  },
  mobileAbsoluteBlock: {
    position: 'absolute',
  },
  compiledProgramBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: spacing.xs,
    gap: spacing.sm,
  },
  compiledRung: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  compiledRungSelected: {
    borderColor: colors.cyan,
  },
  compiledRungHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  compiledRungCopy: {
    flex: 1,
    minWidth: 0,
  },
  compiledRungIndex: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  compiledRungTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  compiledRungState: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  compiledLoadSummary: {
    minHeight: 32,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  compiledLoadText: {
    flex: 1,
    minWidth: 0,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  compiledLoadState: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
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
    backgroundColor: colors.background,
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
  flowStack: {
    gap: spacing.xs,
  },
  compiledTextRung: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.background,
    padding: spacing.xs,
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
    backgroundColor: colors.surface,
  },
  listRowClosed: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
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
  listStateClosed: {
    color: colors.textMuted,
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
