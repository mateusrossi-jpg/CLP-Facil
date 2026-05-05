import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcSimulationTestReportCardProps = {
  project: EditorProjectState;
  state: PlcState;
  evaluation: EditorEvaluationResult;
  autoScan: boolean;
};

type ReportSeverity = 'approved' | 'attention' | 'blocked';

type ReportMetric = {
  label: string;
  value: string | number;
  highlight?: boolean;
};

function normalize(address: string): string {
  return address.trim().toUpperCase();
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function countByPrefix(state: PlcState, prefixes: string[]): number {
  return Object.entries(state).filter(([address, value]) => {
    const normalized = normalize(address);
    return prefixes.some((prefix) => normalized.startsWith(prefix)) && isActive(value);
  }).length;
}

function activeAddresses(state: PlcState, prefixes: string[]): string[] {
  return Object.entries(state)
    .filter(([address, value]) => {
      const normalized = normalize(address);
      return prefixes.some((prefix) => normalized.startsWith(prefix)) && isActive(value);
    })
    .map(([address]) => normalize(address))
    .sort((left, right) => left.localeCompare(right))
    .slice(0, 8);
}

function reportSeverity(project: EditorProjectState, state: PlcState, evaluation: EditorEvaluationResult): ReportSeverity {
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const hasProgram = project.rungs.length > 0;
  const outputsOn = countByPrefix(state, ['Q', 'O']);

  if (!hasProgram) return 'blocked';
  if (diagnostics > 0 || outputsOn > 0) return 'attention';
  return 'approved';
}

function severityTitle(severity: ReportSeverity): string {
  if (severity === 'blocked') return 'Teste pendente';
  if (severity === 'attention') return 'Teste com atenção';
  return 'Teste estável';
}

function severityDescription(severity: ReportSeverity): string {
  if (severity === 'blocked') return 'Crie ou carregue um programa antes de gerar uma conclusão de teste.';
  if (severity === 'attention') return 'A simulação executou, mas há saídas ativas ou diagnósticos que precisam ser revisados.';
  return 'A simulação não apresentou diagnósticos ativos e nenhuma saída permaneceu ligada neste scan.';
}

function buildMetrics(project: EditorProjectState, state: PlcState, evaluation: EditorEvaluationResult, autoScan: boolean): ReportMetric[] {
  return [
    { label: 'Modo', value: autoScan ? 'Auto' : 'Manual' },
    { label: 'Scan', value: evaluation.scanNumber || 0 },
    { label: 'Linhas', value: project.rungs.length },
    { label: 'Tags', value: project.projectVariables?.length ?? 0 },
    { label: 'Entradas ON', value: countByPrefix(state, ['I']), highlight: countByPrefix(state, ['I']) > 0 },
    { label: 'Saídas ON', value: countByPrefix(state, ['Q', 'O']), highlight: countByPrefix(state, ['Q', 'O']) > 0 },
    { label: 'Rungs TRUE', value: Object.values(evaluation.rungResults ?? {}).filter(Boolean).length, highlight: true },
    { label: 'Diagnósticos', value: evaluation.diagnostics?.length ?? 0, highlight: (evaluation.diagnostics?.length ?? 0) > 0 },
  ];
}

export const PlcSimulationTestReportCard = memo(function PlcSimulationTestReportCard({
  project,
  state,
  evaluation,
  autoScan,
}: PlcSimulationTestReportCardProps) {
  const severity = useMemo(() => reportSeverity(project, state, evaluation), [evaluation, project, state]);
  const metrics = useMemo(() => buildMetrics(project, state, evaluation, autoScan), [autoScan, evaluation, project, state]);
  const inputAddresses = useMemo(() => activeAddresses(state, ['I']), [state]);
  const outputAddresses = useMemo(() => activeAddresses(state, ['Q', 'O']), [state]);

  return (
    <View style={[styles.card, severity === 'approved' && styles.cardApproved, severity === 'attention' && styles.cardAttention, severity === 'blocked' && styles.cardBlocked]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Relatório de teste</Text>
          <Text style={styles.title}>{severityTitle(severity)}</Text>
        </View>
        <View style={[styles.statusPill, severity === 'approved' && styles.statusPillApproved, severity === 'attention' && styles.statusPillAttention, severity === 'blocked' && styles.statusPillBlocked]}>
          <Text style={[styles.statusText, severity === 'approved' && styles.statusTextApproved, severity === 'attention' && styles.statusTextAttention, severity === 'blocked' && styles.statusTextBlocked]}>
            {severity === 'approved' ? 'OK' : severity === 'attention' ? 'Revisar' : 'Pendente'}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{severityDescription(severity)}</Text>

      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={[styles.metricCard, metric.highlight && styles.metricCardHighlight]}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={[styles.metricValue, metric.highlight && styles.metricValueHighlight]}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.addressBox}>
        <Text style={styles.addressTitle}>Sinais ativos</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>Entradas</Text>
          <Text style={styles.addressValue}>{inputAddresses.length > 0 ? inputAddresses.join(', ') : 'nenhuma'}</Text>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>Saídas</Text>
          <Text style={[styles.addressValue, outputAddresses.length > 0 && styles.addressValueAttention]}>{outputAddresses.length > 0 ? outputAddresses.join(', ') : 'nenhuma'}</Text>
        </View>
      </View>

      <Text style={styles.explanation}>Este relatório resume o estado do teste atual. Ele pode evoluir depois para exportação em PDF, histórico por projeto e modo professor.</Text>
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
  cardApproved: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  cardAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  cardBlocked: {
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
    backgroundColor: colors.surface,
  },
  statusPillApproved: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  statusPillAttention: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  statusPillBlocked: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  statusTextApproved: {
    color: colors.green,
  },
  statusTextAttention: {
    color: colors.amber,
  },
  statusTextBlocked: {
    color: colors.red,
  },
  description: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 78,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  metricCardHighlight: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  metricValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  metricValueHighlight: {
    color: colors.cyan,
  },
  addressBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  addressTitle: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addressLabel: {
    width: 64,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  addressValue: {
    flex: 1,
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800',
  },
  addressValueAttention: {
    color: colors.amber,
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
