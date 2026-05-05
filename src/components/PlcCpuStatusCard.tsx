import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcCpuStatusCardProps = {
  isRunning: boolean;
  isAutoScan: boolean;
  scanCount: number;
  lastScanMs: number;
  runtime?: EditorRuntimeState;
};

function watchdogState(lastScanMs: number, runtime?: EditorRuntimeState): 'ok' | 'warn' | 'fault' {
  const base = runtime?.scanStepMs ?? 100;
  if (lastScanMs > base * 3) return 'fault';
  if (lastScanMs > base * 1.5) return 'warn';
  return 'ok';
}

function watchdogLabel(state: 'ok' | 'warn' | 'fault'): string {
  if (state === 'fault') return 'WATCHDOG';
  if (state === 'warn') return 'LENTO';
  return 'OK';
}

function scanMode(isAutoScan: boolean): string {
  return isAutoScan ? 'Ciclo automático' : 'Passo manual';
}

export const PlcCpuStatusCard = memo(function PlcCpuStatusCard({
  isRunning,
  isAutoScan,
  scanCount,
  lastScanMs,
  runtime,
}: PlcCpuStatusCardProps) {
  const watchdog = watchdogState(lastScanMs, runtime);
  const scanStepMs = runtime?.scanStepMs ?? 100;

  return (
    <View style={[styles.card, isRunning && styles.cardRun, watchdog === 'fault' && styles.cardFault]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>CPU / Runtime PLC</Text>
          <Text style={[styles.title, isRunning && styles.titleRun]}>{isRunning ? 'CPU em RUN' : 'CPU em STOP'}</Text>
        </View>
        <View style={[styles.modePill, isRunning && styles.modePillRun]}>
          <Text style={[styles.modePillText, isRunning && styles.modePillTextRun]}>{isRunning ? 'RUN' : 'STOP'}</Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Modo</Text>
          <Text style={styles.metricValueSmall}>{scanMode(isAutoScan)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Scan</Text>
          <Text style={styles.metricValue}>#{scanCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Último</Text>
          <Text style={styles.metricValue}>{lastScanMs} ms</Text>
        </View>
        <View style={[styles.metricCard, watchdog === 'warn' && styles.metricWarn, watchdog === 'fault' && styles.metricFault]}>
          <Text style={styles.metricLabel}>Watchdog</Text>
          <Text style={[styles.metricValue, watchdog === 'warn' && styles.metricValueWarn, watchdog === 'fault' && styles.metricValueFault]}>{watchdogLabel(watchdog)}</Text>
        </View>
      </View>

      <View style={styles.timelineBox}>
        <View style={styles.timelineRow}>
          <Text style={styles.timelineLabel}>Base do ciclo</Text>
          <Text style={styles.timelineValue}>{scanStepMs} ms</Text>
        </View>
        <View style={styles.timelineTrack}>
          <View style={[styles.timelineFill, { width: `${Math.min(100, Math.max(4, Math.round((lastScanMs / Math.max(scanStepMs, 1)) * 100)))}%` }, watchdog === 'warn' && styles.timelineFillWarn, watchdog === 'fault' && styles.timelineFillFault]} />
        </View>
      </View>

      <Text style={styles.explanation}>
        Em um CLP real, a CPU executa scans repetidos em RUN. O watchdog ajuda a perceber se o ciclo ficou lento demais para uma simulação confiável.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  cardRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  cardFault: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
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
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 2,
  },
  titleRun: {
    color: colors.green,
  },
  modePill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
  },
  modePillRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  modePillText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  modePillTextRun: {
    color: colors.green,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 110,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  metricWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  metricFault: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
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
  metricValueSmall: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  metricValueWarn: {
    color: colors.amber,
  },
  metricValueFault: {
    color: colors.red,
  },
  timelineBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timelineLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  timelineValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  timelineTrack: {
    height: 8,
    borderRadius: 999,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  timelineFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.green,
  },
  timelineFillWarn: {
    backgroundColor: colors.amber,
  },
  timelineFillFault: {
    backgroundColor: colors.red,
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
