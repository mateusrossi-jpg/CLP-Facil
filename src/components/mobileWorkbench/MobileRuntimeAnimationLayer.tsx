import { ComponentProps, memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileRuntimeAnimationLayerProps = Pick<
  ComponentProps<typeof MobilePlcExperience>,
  'editorProject' | 'evaluation' | 'mode' | 'autoScan'
>;

function activeScanIndex(scanNumber: number, rungCount: number): number {
  if (rungCount <= 0) return 0;
  return scanNumber % rungCount;
}

export const MobileRuntimeAnimationLayer = memo(function MobileRuntimeAnimationLayer({
  editorProject,
  evaluation,
  mode = 'simulate',
  autoScan = false,
}: MobileRuntimeAnimationLayerProps) {
  const rungs = editorProject.rungs.slice(0, 8);
  const scanNumber = evaluation.scanNumber ?? 0;
  const running = mode === 'simulate';
  const scanIndex = activeScanIndex(scanNumber, rungs.length);
  const energizedCount = useMemo(
    () => rungs.filter((rung) => Boolean(evaluation.rungResults?.[rung.id])).length,
    [evaluation.rungResults, rungs],
  );
  const pulseStep = scanNumber % 5;

  if (rungs.length === 0) return null;

  return (
    <View style={[styles.card, running && styles.cardRun, energizedCount > 0 && styles.cardLive]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Animated Runtime</Text>
          <Text style={styles.title}>Energia e scan em movimento</Text>
        </View>
        <View style={[styles.heartbeatBadge, running && styles.heartbeatBadgeRun]}>
          <View style={[styles.heartbeatDot, running && styles.heartbeatDotRun]} />
          <View>
            <Text style={[styles.heartbeatText, running && styles.heartbeatTextRun]}>{running ? 'RUN' : 'EDIT'}</Text>
            <Text style={styles.tickText}>TICK {scanNumber}</Text>
          </View>
        </View>
      </View>

      <View style={styles.scanRail}>
        {rungs.map((rung, index) => {
          const energized = Boolean(evaluation.rungResults?.[rung.id]);
          const scanning = running && index === scanIndex;
          return (
            <View key={rung.id} style={[styles.scanCell, energized && styles.scanCellOn, scanning && styles.scanCellScanning]}>
              <Text style={[styles.scanCellLabel, energized && styles.scanCellLabelOn, scanning && styles.scanCellLabelScanning]}>R{index + 1}</Text>
              <View style={styles.energyTrack}>
                <View style={[styles.energyLine, energized && styles.energyLineOn]} />
                {energized ? <View style={[styles.energyPulse, styles[`pulse${pulseStep}` as keyof typeof styles]]} /> : null}
              </View>
              <Text style={[styles.scanState, energized && styles.scanStateOn]}>{scanning ? 'SCAN' : energized ? 'TRUE' : 'OFF'}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.flowBox}>
        <Text style={styles.flowLabel}>Fluxo runtime</Text>
        <View style={styles.flowTrack}>
          <View style={[styles.flowBase, energizedCount > 0 && styles.flowBaseOn]} />
          {energizedCount > 0 ? (
            <>
              <View style={[styles.flowSpark, styles[`spark${pulseStep}` as keyof typeof styles]]} />
              <View style={[styles.flowSparkSmall, styles[`spark${(pulseStep + 2) % 5}` as keyof typeof styles]]} />
            </>
          ) : null}
        </View>
        <Text style={[styles.flowValue, energizedCount > 0 && styles.flowValueOn]}>{energizedCount} caminho(s) energizado(s) • {autoScan ? 'AUTO' : 'MANUAL'}</Text>
      </View>
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
    gap: spacing.md,
  },
  cardRun: {
    borderColor: colors.cyan,
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
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  heartbeatBadge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heartbeatBadgeRun: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  heartbeatDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textDim,
    backgroundColor: colors.background,
  },
  heartbeatDotRun: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  heartbeatText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  heartbeatTextRun: {
    color: colors.green,
  },
  tickText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
  },
  scanRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  scanCell: {
    flexGrow: 1,
    minWidth: 82,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xs,
    gap: 4,
  },
  scanCellOn: {
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  scanCellScanning: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  scanCellLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  scanCellLabelOn: {
    color: colors.green,
  },
  scanCellLabelScanning: {
    color: colors.cyan,
  },
  energyTrack: {
    minHeight: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  energyLine: {
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  energyLineOn: {
    backgroundColor: colors.green,
  },
  energyPulse: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    top: 1,
  },
  scanState: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  scanStateOn: {
    color: colors.green,
  },
  flowBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  flowLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  flowTrack: {
    minHeight: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  flowBase: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  flowBaseOn: {
    backgroundColor: colors.green,
  },
  flowSpark: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    opacity: 0.55,
  },
  flowSparkSmall: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.text,
    opacity: 0.55,
  },
  flowValue: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  flowValueOn: {
    color: colors.green,
  },
  pulse0: { left: '4%' },
  pulse1: { left: '24%' },
  pulse2: { left: '44%' },
  pulse3: { left: '64%' },
  pulse4: { left: '82%' },
  spark0: { left: '4%' },
  spark1: { left: '24%' },
  spark2: { left: '44%' },
  spark3: { left: '64%' },
  spark4: { left: '82%' },
});
