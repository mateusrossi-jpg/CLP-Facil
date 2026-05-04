import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { criticalReleaseStages, releaseChecklistStages, releaseStatusLabel } from '../release/releaseChecklist';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

function statusTone(status: string) {
  if (status === 'critical') return styles.criticalBadge;
  if (status === 'important') return styles.importantBadge;
  return styles.polishBadge;
}

function statusTextTone(status: string) {
  if (status === 'critical') return styles.criticalText;
  if (status === 'important') return styles.importantText;
  return styles.polishText;
}

export const ReleaseReadinessPanel = memo(function ReleaseReadinessPanel() {
  const criticalCount = criticalReleaseStages().length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Preparação para divulgação</Text>
          <Text style={styles.title}>Checklist de lançamento do CLP Fácil</Text>
          <Text style={styles.subtitle}>Um roteiro prático para saber o que falta antes do teste fechado, divulgação e publicação.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{criticalCount} críticos</Text>
        </View>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Ordem recomendada</Text>
        <Text style={styles.summaryText}>Estabilizar o simulador, validar visual no celular, testar exemplos, confirmar Hardware, revisar referência/segurança e só depois preparar loja e beta.</Text>
      </View>

      <View style={styles.stageList}>
        {releaseChecklistStages.map((stage, index) => (
          <View key={stage.id} style={styles.stageCard}>
            <View style={styles.stageHeader}>
              <View style={styles.stageTitleBox}>
                <Text style={styles.stageIndex}>Etapa {index + 1}</Text>
                <Text style={styles.stageTitle}>{stage.title}</Text>
              </View>
              <View style={[styles.statusBadge, statusTone(stage.status)]}>
                <Text style={[styles.statusText, statusTextTone(stage.status)]}>{releaseStatusLabel(stage.status)}</Text>
              </View>
            </View>

            <Text style={styles.goalText}>{stage.goal}</Text>

            <View style={styles.readyBox}>
              <Text style={styles.readyTitle}>Definição de pronto</Text>
              <Text style={styles.readyText}>{stage.readyDefinition}</Text>
            </View>

            <View style={styles.checklistBox}>
              <Text style={styles.sectionTitle}>Checklist</Text>
              {stage.checklist.map((item) => <Text key={item.id} style={styles.checkItem}>• {item.text}</Text>)}
            </View>

            <View style={styles.evidenceRow}>
              {stage.evidence.map((item) => <Text key={item} style={styles.evidenceChip}>{item}</Text>)}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  badge: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.greenSoft,
  },
  badgeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  summaryBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.goldSoft,
  },
  summaryTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  summaryText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  stageList: {
    gap: spacing.md,
  },
  stageCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stageTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  stageIndex: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stageTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  criticalBadge: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  importantBadge: {
    borderColor: colors.amber,
    backgroundColor: colors.goldSoft,
  },
  polishBadge: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  criticalText: {
    color: colors.red,
  },
  importantText: {
    color: colors.amber,
  },
  polishText: {
    color: colors.cyan,
  },
  goalText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  readyBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  readyTitle: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  readyText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  checklistBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.black,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  checkItem: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  evidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  evidenceChip: {
    color: colors.text,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: colors.surface,
  },
});
