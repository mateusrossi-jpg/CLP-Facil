import { ComponentProps, memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { MobilePlcExperience } from '../MobilePlcExperience';

type MobileRuntimeHudProps = Pick<ComponentProps<typeof MobilePlcExperience>, 'editorProject' | 'plcState' | 'evaluation' | 'mode' | 'autoScan'>;

function isOutputOn(address: string, value: unknown): boolean {
  const normalized = address.trim().toUpperCase();
  const active = typeof value === 'number' ? value !== 0 : Boolean(value);
  return active && (normalized.startsWith('Q') || normalized.startsWith('O'));
}

export const MobileRuntimeHud = memo(function MobileRuntimeHud({ editorProject, plcState, evaluation, mode = 'simulate', autoScan = false }: MobileRuntimeHudProps) {
  const energizedRungs = useMemo(
    () => editorProject.rungs.filter((rung) => Boolean(evaluation.rungResults?.[rung.id])).length,
    [editorProject.rungs, evaluation.rungResults],
  );
  const activeOutputs = useMemo(
    () => Object.entries(plcState).filter(([address, value]) => isOutputOn(address, value)).length,
    [plcState],
  );
  const diagnosticsCount = evaluation.diagnostics?.length ?? 0;
  const running = mode === 'simulate';
  const status = diagnosticsCount > 0 ? 'FAULT' : running ? 'RUN' : 'EDIT';
  const cycleMs = evaluation.runtime?.scanStepMs ?? 100;
  const scanNumber = evaluation.scanNumber ?? 0;

  return (
    <View style={[styles.card, running && styles.cardRun, diagnosticsCount > 0 && styles.cardFault]}>
      <View style={styles.statusBlock}>
        <View style={[styles.statusLamp, running && styles.statusLampRun, diagnosticsCount > 0 && styles.statusLampFault]} />
        <View style={styles.statusCopy}>
          <Text style={[styles.statusText, running && styles.statusTextRun, diagnosticsCount > 0 && styles.statusTextFault]}>{status}</Text>
          <Text style={styles.statusHint}>{autoScan ? 'AUTO SCAN' : 'MANUAL'}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>SCAN</Text>
          <Text style={styles.metricValue}>#{scanNumber}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>CICLO</Text>
          <Text style={styles.metricValue}>{cycleMs}ms</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>RUNG</Text>
          <Text style={[styles.metricValue, energizedRungs > 0 && styles.metricValueOn]}>{energizedRungs}/{editorProject.rungs.length}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Q ON</Text>
          <Text style={[styles.metricValue, activeOutputs > 0 && styles.metricValueOn]}>{activeOutputs}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>FAULT</Text>
          <Text style={[styles.metricValue, diagnosticsCount > 0 && styles.metricValueFault]}>{diagnosticsCount}</Text>
        </View>
      </View>
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
  cardRun: {
    borderColor: colors.green,
  },
  cardFault: {
    borderColor: colors.red,
  },
  statusBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusLamp: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textDim,
    backgroundColor: colors.surfaceElevated,
  },
  statusLampRun: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  statusLampFault: {
    borderColor: colors.red,
    backgroundColor: colors.red,
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
  },
  statusText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statusTextRun: {
    color: colors.green,
  },
  statusTextFault: {
    color: colors.red,
  },
  statusHint: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metricBox: {
    flexGrow: 1,
    minWidth: 82,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  metricValueOn: {
    color: colors.green,
  },
  metricValueFault: {
    color: colors.red,
  },
});
