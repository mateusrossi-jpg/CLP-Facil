import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { traceEditorScan } from '../engine/editorScanTrace';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { createMobileScanTraceSummary } from '../simulation/mobileScanTraceSummary';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ScanTraceDiagnosticCardProps = {
  project: EditorProjectState;
  state: PlcState;
  runtime?: EditorRuntimeState;
  focusedRungId?: string | null;
};

export const ScanTraceDiagnosticCard = memo(function ScanTraceDiagnosticCard({
  project,
  state,
  runtime,
  focusedRungId,
}: ScanTraceDiagnosticCardProps) {
  const trace = useMemo(() => traceEditorScan(project, state, runtime), [project, runtime, state]);
  const summary = useMemo(() => createMobileScanTraceSummary(trace, focusedRungId), [focusedRungId, trace]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Diagnóstico do scan real</Text>
          <Text style={styles.title}>{summary.headline}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillLabel}>Rungs ON</Text>
          <Text style={styles.statusPillValue}>{summary.activeRungCount}</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Saídas ON</Text>
          <Text style={styles.metricValue}>{summary.activeOutputCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Branches ON</Text>
          <Text style={styles.metricValue}>{summary.activeBranchCount}</Text>
        </View>
        <View style={styles.metricCardWide}>
          <Text style={styles.metricLabel}>Foco</Text>
          <Text style={styles.metricValueSmall} numberOfLines={1}>{summary.focusedOutput ?? '—'}</Text>
        </View>
      </View>

      {summary.focusedActiveBranches.length > 0 ? (
        <View style={styles.branchWrap}>
          {summary.focusedActiveBranches.map((branchId) => (
            <Text key={branchId} style={styles.branchChip}>{branchId}</Text>
          ))}
        </View>
      ) : null}

      <Text style={styles.explanation}>{summary.explanation}</Text>
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
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  statusPill: {
    minWidth: 72,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  statusPillLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusPillValue: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '900',
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metricCard: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  metricCardWide: {
    flex: 1.25,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  metricValueSmall: {
    color: colors.green,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  branchWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  branchChip: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cyanSoft,
    fontSize: 10,
    fontWeight: '900',
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
