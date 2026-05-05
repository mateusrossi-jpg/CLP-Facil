import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcSimulationOverviewCardProps = {
  project: EditorProjectState;
  state: PlcState;
  evaluation: EditorEvaluationResult;
  autoScan: boolean;
  onRunScan: () => void;
  onToggleAutoScan: () => void;
};

type OverviewMetrics = {
  activeInputs: number;
  activeOutputs: number;
  activeMemories: number;
  activeRungs: number;
  diagnostics: number;
};

function normalize(address: string): string {
  return address.trim().toUpperCase();
}

function isActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function computeMetrics(state: PlcState, evaluation: EditorEvaluationResult): OverviewMetrics {
  const entries = Object.entries(state);
  return {
    activeInputs: entries.filter(([address, value]) => normalize(address).startsWith('I') && isActive(value)).length,
    activeOutputs: entries.filter(([address, value]) => {
      const normalized = normalize(address);
      return (normalized.startsWith('Q') || normalized.startsWith('O')) && isActive(value);
    }).length,
    activeMemories: entries.filter(([address, value]) => normalize(address).startsWith('M') && isActive(value)).length,
    activeRungs: Object.values(evaluation.rungResults ?? {}).filter(Boolean).length,
    diagnostics: evaluation.diagnostics?.length ?? 0,
  };
}

function projectTitle(project: EditorProjectState): string {
  const rungCount = project.rungs?.length ?? 0;
  const variableCount = project.projectVariables?.length ?? 0;
  return `Projeto ladder • ${rungCount} linha(s) • ${variableCount} tag(s)`;
}

export const PlcSimulationOverviewCard = memo(function PlcSimulationOverviewCard({
  project,
  state,
  evaluation,
  autoScan,
  onRunScan,
  onToggleAutoScan,
}: PlcSimulationOverviewCardProps) {
  const metrics = useMemo(() => computeMetrics(state, evaluation), [evaluation, state]);
  const title = useMemo(() => projectTitle(project), [project]);
  const hasDiagnostics = metrics.diagnostics > 0;

  return (
    <View style={[styles.card, hasDiagnostics && styles.cardWarn]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Resumo da simulação</Text>
          <Text style={styles.title}>{title} • Scan #{evaluation.scanNumber || 0}</Text>
        </View>
        <View style={[styles.modePill, autoScan && styles.modePillAuto]}>
          <Text style={[styles.modePillText, autoScan && styles.modePillTextAuto]}>{autoScan ? 'AUTO' : 'MANUAL'}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Entradas</Text>
          <Text style={styles.metricValue}>{metrics.activeInputs}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Saídas</Text>
          <Text style={[styles.metricValue, metrics.activeOutputs > 0 && styles.metricValueOn]}>{metrics.activeOutputs}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Memórias</Text>
          <Text style={styles.metricValue}>{metrics.activeMemories}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Rungs</Text>
          <Text style={styles.metricValue}>{metrics.activeRungs}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={onRunScan} style={[styles.actionButton, styles.scanButton]}>
          <Text style={styles.scanButtonText}>Executar scan</Text>
        </Pressable>
        <Pressable onPress={onToggleAutoScan} style={[styles.actionButton, autoScan && styles.autoButtonOn]}>
          <Text style={[styles.actionButtonText, autoScan && styles.autoButtonTextOn]}>{autoScan ? 'Desligar auto' : 'Ligar auto'}</Text>
        </Pressable>
      </View>

      <View style={[styles.diagnosticStrip, hasDiagnostics && styles.diagnosticStripWarn]}>
        <Text style={[styles.diagnosticText, hasDiagnostics && styles.diagnosticTextWarn]}>
          {hasDiagnostics ? `${metrics.diagnostics} diagnóstico(s) ativo(s). Abra Diagnóstico para revisar.` : 'Sem diagnósticos ativos neste scan.'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
    gap: spacing.sm,
  },
  cardWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
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
  modePill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  modePillAuto: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  modePillText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  modePillTextAuto: {
    color: colors.green,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 72,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
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
    fontSize: 19,
    fontWeight: '900',
    marginTop: 2,
  },
  metricValueOn: {
    color: colors.green,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  scanButton: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyan,
  },
  scanButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
  actionButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  autoButtonOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  autoButtonTextOn: {
    color: colors.green,
  },
  diagnosticStrip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  diagnosticStripWarn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  diagnosticText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  diagnosticTextWarn: {
    color: colors.amber,
  },
});
