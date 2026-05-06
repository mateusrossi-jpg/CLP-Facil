import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ComponentProps } from 'react';
import { MobilePlcExperience } from '../MobilePlcExperience';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type MobileEnergyFlowProps = Pick<ComponentProps<typeof MobilePlcExperience>, 'editorProject' | 'plcState' | 'evaluation'>;

function isActiveValue(value: unknown): boolean {
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

function activeIoCount(state: MobileEnergyFlowProps['plcState'], prefix: 'I' | 'Q' | 'O'): number {
  return Object.entries(state).filter(([address, value]) => address.trim().toUpperCase().startsWith(prefix) && isActiveValue(value)).length;
}

export const MobileEnergyFlow = memo(function MobileEnergyFlow({ editorProject, plcState, evaluation }: MobileEnergyFlowProps) {
  const activeInputs = useMemo(() => activeIoCount(plcState, 'I'), [plcState]);
  const activeOutputs = useMemo(() => activeIoCount(plcState, 'Q') + activeIoCount(plcState, 'O'), [plcState]);
  const energizedRungs = useMemo(
    () => editorProject.rungs.filter((rung) => Boolean(evaluation.rungResults?.[rung.id])).length,
    [editorProject.rungs, evaluation.rungResults],
  );
  const hasEnergy = activeInputs > 0 || energizedRungs > 0 || activeOutputs > 0;
  const ladderActive = energizedRungs > 0;
  const outputActive = activeOutputs > 0;

  return (
    <View style={[styles.card, hasEnergy && styles.cardLive]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Energia lógica</Text>
          <Text style={styles.title}>I/O → Ladder → Q</Text>
        </View>
        <View style={[styles.liveBadge, hasEnergy && styles.liveBadgeOn]}>
          <Text style={[styles.liveText, hasEnergy && styles.liveTextOn]}>{hasEnergy ? 'LIVE' : 'IDLE'}</Text>
        </View>
      </View>

      <View style={styles.flowRow}>
        <View style={[styles.node, activeInputs > 0 && styles.nodeOn]}>
          <View style={[styles.dot, activeInputs > 0 && styles.dotOn]} />
          <Text style={[styles.nodeLabel, activeInputs > 0 && styles.nodeLabelOn]}>I</Text>
          <Text style={styles.nodeValue}>{activeInputs} ON</Text>
        </View>

        <View style={[styles.energyLine, ladderActive && styles.energyLineOn]}>
          {ladderActive ? <View style={styles.energyPulse} /> : null}
        </View>

        <View style={[styles.node, ladderActive && styles.nodeOn]}>
          <View style={[styles.dot, ladderActive && styles.dotOn]} />
          <Text style={[styles.nodeLabel, ladderActive && styles.nodeLabelOn]}>Ladder</Text>
          <Text style={styles.nodeValue}>{energizedRungs}/{editorProject.rungs.length}</Text>
        </View>

        <View style={[styles.energyLine, outputActive && styles.energyLineOn]}>
          {outputActive ? <View style={styles.energyPulse} /> : null}
        </View>

        <View style={[styles.node, outputActive && styles.nodeOn]}>
          <View style={[styles.dot, outputActive && styles.dotOn]} />
          <Text style={[styles.nodeLabel, outputActive && styles.nodeLabelOn]}>Q</Text>
          <Text style={styles.nodeValue}>{activeOutputs} ON</Text>
        </View>
      </View>

      <Text style={styles.hint}>Acione uma entrada, rode SCAN e acompanhe a energia chegando na saída.</Text>
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
  cardLive: {
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
  liveBadge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surfaceElevated,
  },
  liveBadgeOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  liveText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  liveTextOn: {
    color: colors.green,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  node: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: 3,
  },
  nodeOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textDim,
    backgroundColor: colors.background,
  },
  dotOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  nodeLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  nodeLabelOn: {
    color: colors.green,
  },
  nodeValue: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  energyLine: {
    width: 26,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  energyLineOn: {
    backgroundColor: colors.green,
  },
  energyPulse: {
    width: 12,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.text,
    opacity: 0.75,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
