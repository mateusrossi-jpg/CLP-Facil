import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { runPlcScanCycle } from '../engine/plcScanCycle';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { EditorRuntimeState } from '../engine/runtimeTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcScanCycleCardProps = {
  project: EditorProjectState;
  state: PlcState;
  scanNumber: number;
  runtime?: EditorRuntimeState;
};

function phaseTone(active: boolean): 'active' | 'idle' {
  return active ? 'active' : 'idle';
}

export const PlcScanCycleCard = memo(function PlcScanCycleCard({
  project,
  state,
  scanNumber,
  runtime,
}: PlcScanCycleCardProps) {
  const cycle = useMemo(
    () => runPlcScanCycle(project, state, Math.max(scanNumber, 1), runtime),
    [project, runtime, scanNumber, state],
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Ciclo de varredura PLC</Text>
          <Text style={styles.title}>Scan #{cycle.scanNumber || scanNumber || 0}</Text>
        </View>
        <View style={styles.scanPill}>
          <Text style={styles.scanPillLabel}>Modelo</Text>
          <Text style={styles.scanPillValue}>Real</Text>
        </View>
      </View>

      <View style={styles.phaseStack}>
        {cycle.phases.map((phase, index) => {
          const tone = phaseTone(phase.active);
          return (
            <View key={phase.id} style={[styles.phaseRow, tone === 'active' && styles.phaseRowActive]}>
              <View style={[styles.phaseNumber, tone === 'active' && styles.phaseNumberActive]}>
                <Text style={[styles.phaseNumberText, tone === 'active' && styles.phaseNumberTextActive]}>{index + 1}</Text>
              </View>
              <View style={styles.phaseCopy}>
                <Text style={[styles.phaseLabel, tone === 'active' && styles.phaseLabelActive]}>{phase.label}</Text>
                <Text style={styles.phaseDescription}>{phase.description}</Text>
              </View>
              <Text style={[styles.phaseStatus, tone === 'active' && styles.phaseStatusActive]}>{phase.active ? 'ON' : 'OK'}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryLabel}>Linhas ON</Text>
          <Text style={styles.summaryValue}>{cycle.activeRungCount}</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryLabel}>Saídas ON</Text>
          <Text style={styles.summaryValue}>{cycle.activeOutputCount}</Text>
        </View>
      </View>

      <Text style={styles.explanation}>{cycle.cycleExplanation}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
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
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  scanPill: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  scanPillLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scanPillValue: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: '900',
  },
  phaseStack: {
    gap: spacing.xs,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  phaseRowActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  phaseNumber: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.borderStrong,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
  },
  phaseNumberActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  phaseNumberText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  phaseNumberTextActive: {
    color: colors.green,
  },
  phaseCopy: {
    flex: 1,
    minWidth: 0,
  },
  phaseLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  phaseLabelActive: {
    color: colors.green,
  },
  phaseDescription: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
    fontWeight: '700',
  },
  phaseStatus: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
  },
  phaseStatusActive: {
    color: colors.green,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  summaryTile: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.cyan,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  explanation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
