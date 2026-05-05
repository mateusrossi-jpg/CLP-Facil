import { memo, useMemo, useRef } from 'react';
import { DimensionValue, StyleSheet, Text, View } from 'react-native';
import { traceEditorScan } from '../engine/editorScanTrace';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcScanHistoryCardProps = {
  project: EditorProjectState;
  state: PlcState;
  runtime?: EditorRuntimeState;
  scanNumber: number;
  lastScanMs: number;
};

type ScanHistorySample = {
  scanNumber: number;
  lastScanMs: number;
  activeRungs: number;
  activeOutputs: number;
  activeBranches: number;
  watchdog: 'ok' | 'warn' | 'fault';
};

function activeOutputCount(state: PlcState): number {
  return Object.entries(state)
    .filter(([address]) => {
      const normalized = address.trim().toUpperCase();
      return normalized.startsWith('Q') || normalized.startsWith('O');
    })
    .filter(([, value]) => typeof value === 'number' ? value !== 0 : Boolean(value))
    .length;
}

function watchdogState(lastScanMs: number, runtime?: EditorRuntimeState): ScanHistorySample['watchdog'] {
  const base = runtime?.scanStepMs ?? 100;
  if (lastScanMs > base * 3) return 'fault';
  if (lastScanMs > base * 1.5) return 'warn';
  return 'ok';
}

function watchdogLabel(watchdog: ScanHistorySample['watchdog']): string {
  if (watchdog === 'fault') return 'WD';
  if (watchdog === 'warn') return 'Lento';
  return 'OK';
}

function barWidth(value: number, max: number): DimensionValue {
  if (max <= 0) return '4%';
  return `${Math.min(100, Math.max(4, Math.round((value / max) * 100)))}%`;
}

function useScanHistory(sample: ScanHistorySample): ScanHistorySample[] {
  const historyRef = useRef<ScanHistorySample[]>([]);
  const lastScanRef = useRef<number | null>(null);

  if (lastScanRef.current !== sample.scanNumber) {
    historyRef.current = [sample, ...historyRef.current.filter((item) => item.scanNumber !== sample.scanNumber)].slice(0, 8);
    lastScanRef.current = sample.scanNumber;
  }

  return historyRef.current;
}

export const PlcScanHistoryCard = memo(function PlcScanHistoryCard({
  project,
  state,
  runtime,
  scanNumber,
  lastScanMs,
}: PlcScanHistoryCardProps) {
  const trace = useMemo(() => traceEditorScan(project, state, runtime), [project, runtime, state]);
  const sample = useMemo<ScanHistorySample>(() => ({
    scanNumber,
    lastScanMs,
    activeRungs: trace.energizedRungIds.length,
    activeOutputs: activeOutputCount(state),
    activeBranches: trace.rungs.reduce((total, rung) => total + rung.activeBranchIds.length, 0),
    watchdog: watchdogState(lastScanMs, runtime),
  }), [lastScanMs, runtime, scanNumber, state, trace.energizedRungIds.length, trace.rungs]);
  const history = useScanHistory(sample);
  const maxTime = Math.max(...history.map((item) => item.lastScanMs), runtime?.scanStepMs ?? 100, 1);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Histórico de scans</Text>
          <Text style={styles.title}>Últimos ciclos executados</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countLabel}>Amostras</Text>
          <Text style={styles.countValue}>{history.length}</Text>
        </View>
      </View>

      <View style={styles.historyStack}>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum scan registrado ainda.</Text>
        ) : history.map((item) => (
          <View key={item.scanNumber} style={[styles.sampleRow, item.watchdog === 'warn' && styles.sampleRowWarn, item.watchdog === 'fault' && styles.sampleRowFault]}>
            <View style={styles.sampleTopRow}>
              <Text style={styles.scanLabel}>#{item.scanNumber}</Text>
              <Text style={styles.sampleMetric}>{item.lastScanMs} ms</Text>
              <Text style={styles.sampleMetric}>{item.activeRungs} rung(s)</Text>
              <Text style={styles.sampleMetric}>{item.activeOutputs} saída(s)</Text>
              <Text style={[styles.watchdogText, item.watchdog === 'warn' && styles.watchdogWarn, item.watchdog === 'fault' && styles.watchdogFault]}>{watchdogLabel(item.watchdog)}</Text>
            </View>
            <View style={styles.timeTrack}>
              <View style={[styles.timeFill, { width: barWidth(item.lastScanMs, maxTime) }, item.watchdog === 'warn' && styles.timeFillWarn, item.watchdog === 'fault' && styles.timeFillFault]} />
            </View>
            {item.activeBranches > 0 ? <Text style={styles.branchText}>{item.activeBranches} branch(es) paralelo(s) ativo(s)</Text> : null}
          </View>
        ))}
      </View>

      <Text style={styles.explanation}>O histórico ajuda a observar a repetição do scan e a estabilidade do tempo de ciclo, como em telas de diagnóstico de CLP.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.greenSoft,
    gap: spacing.sm,
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
    color: colors.green,
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
  countPill: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  countValue: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '900',
  },
  historyStack: {
    gap: spacing.xs,
  },
  sampleRow: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  sampleRowWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  sampleRowFault: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  sampleTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scanLabel: {
    color: colors.green,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  sampleMetric: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  watchdogText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  watchdogWarn: {
    color: colors.amber,
  },
  watchdogFault: {
    color: colors.red,
  },
  timeTrack: {
    height: 8,
    borderRadius: 999,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  timeFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.green,
  },
  timeFillWarn: {
    backgroundColor: colors.amber,
  },
  timeFillFault: {
    backgroundColor: colors.red,
  },
  branchText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
