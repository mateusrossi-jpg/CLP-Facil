import { ComponentProps, memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorBlock } from '../../engine/editorTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileLiveBlockStripProps = Pick<ComponentProps<typeof MobilePlcExperience>, 'editorProject' | 'plcState' | 'evaluation'>;

type LiveBlock = {
  block: EditorBlock;
  rungLabel: string;
  active: boolean;
  outputLike: boolean;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function booleanState(state: MobileLiveBlockStripProps['plcState'], address: string | undefined): boolean {
  const normalized = normalize(address);
  if (!normalized) return false;
  const compact = normalized.replace('.0', '');
  const dotted = normalized.includes('.') ? normalized : `${normalized}.0`;
  const value = state[normalized] ?? state[compact] ?? state[dotted];
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

function blockTag(block: EditorBlock): string {
  return normalize(block.variable || block.destination || block.sourceA) || 'TAG';
}

function blockMode(block: EditorBlock): string {
  return block.contactMode ?? block.coilMode ?? block.timerMode ?? block.counterMode ?? block.role.toUpperCase();
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

function collectLiveBlocks({ editorProject, plcState, evaluation }: MobileLiveBlockStripProps): LiveBlock[] {
  return editorProject.rungs.flatMap((rung, rungIndex) => {
    const rungActive = Boolean(evaluation.rungResults?.[rung.id]);
    const blocks = [
      ...rung.seriesBlocks,
      ...rung.parallelBlocks,
      ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
      ...(rung.coilBlock ? [rung.coilBlock] : []),
    ];

    return blocks.map((block) => {
      const outputLike = block.role === 'coil' || block.role === 'timer' || block.role === 'counter';
      const active = outputLike ? booleanState(plcState, block.variable || block.destination) || rungActive : booleanState(plcState, block.variable || block.sourceA);
      return {
        block,
        rungLabel: `R${rungIndex + 1}`,
        active,
        outputLike,
      };
    });
  });
}

export const MobileLiveBlockStrip = memo(function MobileLiveBlockStrip(props: MobileLiveBlockStripProps) {
  const liveBlocks = useMemo(() => collectLiveBlocks(props), [props.editorProject, props.plcState, props.evaluation]);
  const activeCount = liveBlocks.filter((item) => item.active).length;

  if (liveBlocks.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, activeCount > 0 && styles.cardOn]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Monitor Ladder</Text>
          <Text style={styles.title}>Blocos energizados</Text>
        </View>
        <Text style={[styles.counter, activeCount > 0 && styles.counterOn]}>{activeCount}/{liveBlocks.length} ON</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {liveBlocks.map(({ block, rungLabel, active, outputLike }) => (
          <View key={block.id} style={[styles.blockChip, outputLike && styles.outputChip, active && styles.blockChipOn]}>
            <View style={styles.blockTopRow}>
              <Text style={[styles.rungBadge, active && styles.rungBadgeOn]}>{rungLabel}</Text>
              <View style={[styles.lamp, active && styles.lampOn]} />
            </View>
            <Text style={[styles.symbol, active && styles.symbolOn]}>{blockSymbol(block)}</Text>
            <Text style={[styles.address, active && styles.addressOn]} numberOfLines={1}>{blockTag(block)}</Text>
            <Text style={styles.name} numberOfLines={1}>{block.name}</Text>
            <Text style={[styles.mode, active && styles.modeOn]}>{blockMode(block)}</Text>
          </View>
        ))}
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
  counter: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  counterOn: {
    color: colors.green,
  },
  rail: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  blockChip: {
    width: 132,
    minHeight: 126,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    gap: 4,
  },
  outputChip: {
    borderStyle: 'dashed',
  },
  blockChipOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  blockTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rungBadge: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  rungBadgeOn: {
    color: colors.green,
  },
  lamp: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textDim,
    backgroundColor: colors.background,
  },
  lampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  symbol: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  symbolOn: {
    color: colors.green,
  },
  address: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  addressOn: {
    color: colors.green,
  },
  name: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  mode: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 'auto',
  },
  modeOn: {
    color: colors.green,
  },
});
