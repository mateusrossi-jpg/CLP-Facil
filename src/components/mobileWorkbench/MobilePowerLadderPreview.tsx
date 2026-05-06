import { ComponentProps, memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorBlock, EditorRung } from '../../engine/editorTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobilePowerLadderPreviewProps = Pick<ComponentProps<typeof MobilePlcExperience>, 'editorProject' | 'plcState' | 'evaluation'>;

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function stateActive(state: MobilePowerLadderPreviewProps['plcState'], address: string | undefined): boolean {
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

function seriesPreviewBlocks(rung: EditorRung): EditorBlock[] {
  return rung.seriesBlocks.slice(0, 3);
}

function rungHasParallel(rung: EditorRung): boolean {
  return rung.parallelBlocks.length > 0 || (rung.parallelBranches ?? []).some((branch) => branch.blocks.length > 0);
}

function scanCursorLeft(scanNumber: number, rungIndex: number): string {
  const step = (scanNumber + rungIndex) % 6;
  return `${8 + step * 16}%`;
}

export const MobilePowerLadderPreview = memo(function MobilePowerLadderPreview({ editorProject, plcState, evaluation }: MobilePowerLadderPreviewProps) {
  const visibleRungs = useMemo(() => editorProject.rungs.slice(0, 4), [editorProject.rungs]);
  const energizedCount = visibleRungs.filter((rung) => Boolean(evaluation.rungResults?.[rung.id])).length;
  const scanNumber = evaluation.scanNumber ?? 0;

  if (visibleRungs.length === 0) return null;

  return (
    <View style={[styles.card, energizedCount > 0 && styles.cardOn]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Power Ladder</Text>
          <Text style={styles.title}>Fios e bobinas ao vivo</Text>
        </View>
        <View style={styles.scanBadgeGroup}>
          <Text style={[styles.counter, energizedCount > 0 && styles.counterOn]}>{energizedCount}/{visibleRungs.length} TRUE</Text>
          <Text style={styles.scanBadge}>SCAN #{scanNumber}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {visibleRungs.map((rung, rungIndex) => {
          const rungActive = Boolean(evaluation.rungResults?.[rung.id]);
          const outputActive = rung.coilBlock ? stateActive(plcState, rung.coilBlock.variable || rung.coilBlock.destination) || rungActive : rungActive;
          const previewBlocks = seriesPreviewBlocks(rung);
          const showPulse = rungActive && scanNumber > 0;
          return (
            <View key={rung.id} style={[styles.rungCard, rungActive && styles.rungCardOn]}>
              <View style={styles.rungHeader}>
                <Text style={[styles.rungLabel, rungActive && styles.rungLabelOn]}>Rung {rungIndex + 1}</Text>
                <Text style={[styles.rungState, rungActive && styles.rungStateOn]}>{rungActive ? 'ENERGIZADA' : 'OFF'}</Text>
              </View>

              <View style={styles.ladderLineRow}>
                {showPulse ? <View style={[styles.scanCursor, { left: scanCursorLeft(scanNumber, rungIndex) }]} /> : null}
                <View style={[styles.railVertical, rungActive && styles.railVerticalOn]} />
                <View style={[styles.wire, rungActive && styles.wireOn]} />
                {previewBlocks.map((block) => {
                  const blockOn = stateActive(plcState, block.variable || block.sourceA) || (rungActive && block.contactMode !== 'NC');
                  return (
                    <View key={block.id} style={[styles.blockNode, blockOn && styles.blockNodeOn]}>
                      <Text style={[styles.blockSymbol, blockOn && styles.blockSymbolOn]}>{blockSymbol(block)}</Text>
                      <Text style={[styles.blockTag, blockOn && styles.blockTagOn]} numberOfLines={1}>{blockAddress(block)}</Text>
                    </View>
                  );
                })}
                {rungHasParallel(rung) ? (
                  <View style={[styles.parallelBadge, rungActive && styles.parallelBadgeOn]}>
                    <Text style={[styles.parallelText, rungActive && styles.parallelTextOn]}>BR</Text>
                  </View>
                ) : null}
                <View style={[styles.wire, rungActive && styles.wireOn]} />
                <View style={[styles.coilNode, outputActive && styles.coilNodeOn]}>
                  <Text style={[styles.coilSymbol, outputActive && styles.coilSymbolOn]}>{rung.coilBlock ? blockSymbol(rung.coilBlock) : '(?)'}</Text>
                  <Text style={[styles.blockTag, outputActive && styles.blockTagOn]} numberOfLines={1}>{rung.coilBlock ? blockAddress(rung.coilBlock) : 'Q'}</Text>
                </View>
                <View style={[styles.wire, outputActive && styles.wireOn]} />
                <View style={[styles.railVertical, outputActive && styles.railVerticalOn]} />
              </View>

              <Text style={styles.rungName} numberOfLines={1}>{rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
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
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  scanBadgeGroup: {
    alignItems: 'flex-end',
    gap: 2,
  },
  counter: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  counterOn: {
    color: colors.green,
  },
  scanBadge: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
  },
  rail: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  rungCard: {
    width: 342,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  rungCardOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  rungHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rungLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  rungLabelOn: {
    color: colors.green,
  },
  rungState: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  rungStateOn: {
    color: colors.green,
  },
  ladderLineRow: {
    position: 'relative',
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanCursor: {
    position: 'absolute',
    top: 8,
    width: 18,
    height: 70,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    opacity: 0.28,
    zIndex: 10,
  },
  railVertical: {
    width: 4,
    height: 70,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  railVerticalOn: {
    backgroundColor: colors.green,
  },
  wire: {
    flex: 1,
    minWidth: 14,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  wireOn: {
    backgroundColor: colors.green,
  },
  blockNode: {
    width: 54,
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 2,
    zIndex: 20,
  },
  blockNodeOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  coilNode: {
    width: 58,
    minHeight: 62,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 2,
    zIndex: 20,
  },
  coilNodeOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  blockSymbol: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
  },
  blockSymbolOn: {
    color: colors.green,
  },
  coilSymbol: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '900',
  },
  coilSymbolOn: {
    color: colors.green,
  },
  blockTag: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '900',
  },
  blockTagOn: {
    color: colors.green,
  },
  parallelBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    zIndex: 20,
  },
  parallelBadgeOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  parallelText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  parallelTextOn: {
    color: colors.green,
  },
  rungName: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
});
