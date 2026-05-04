import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../engine/editorTypes';
import { createProfessionalRoutinePlan, routineCompletionHint } from '../simulation/professionalRoutineModel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProfessionalRoutinePanelProps = {
  editorProject: EditorProjectState;
};

export const ProfessionalRoutinePanel = memo(function ProfessionalRoutinePanel({ editorProject }: ProfessionalRoutinePanelProps) {
  const routines = useMemo(() => createProfessionalRoutinePlan(editorProject), [editorProject]);
  const totalAssigned = routines.reduce((sum, routine) => sum + routine.rungIds.length, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Rotinas / Programas</Text>
          <Text style={styles.title}>Organização profissional do projeto</Text>
          <Text style={styles.subtitle}>Modelo didático para evoluir de um Ladder simples para rotinas como MainRoutine, MotorControl, SafetyLogic e Sequencer.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalAssigned} linhas</Text>
        </View>
      </View>

      <View style={styles.routineList}>
        {routines.map((routine) => (
          <View key={routine.id} style={[styles.routineCard, routine.rungIds.length > 0 && styles.routineCardActive]}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineTitle}>{routine.title}</Text>
              <Text style={[styles.routineCount, routine.rungIds.length > 0 && styles.routineCountActive]}>{routine.rungIds.length}</Text>
            </View>
            <Text style={styles.routinePurpose}>{routine.purpose}</Text>
            <Text style={styles.routineHint}>{routineCompletionHint(routine)}</Text>
            {routine.rungIds.length > 0 ? (
              <View style={styles.rungChipRow}>
                {routine.rungIds.map((rungId) => (
                  <Text key={`${routine.id}-${rungId}`} style={styles.rungChip}>{rungId}</Text>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  badge: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cyanSoft,
  },
  badgeText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  routineList: {
    gap: spacing.sm,
  },
  routineCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  routineCardActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routineTitle: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
  },
  routineCount: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '900',
  },
  routineCountActive: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.surface,
  },
  routinePurpose: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  routineHint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  rungChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  rungChip: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.cyanSoft,
    fontSize: 10,
    fontWeight: '900',
  },
});
