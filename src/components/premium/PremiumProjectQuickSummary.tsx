import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getProjectWorkspaceSummary } from '../../projects/projectWorkspaceSummary';
import type { TrainingProject } from '../../projects/projectCatalog';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumProgress, PremiumSection } from './PremiumCards';

type PremiumProjectQuickSummaryProps = {
  project: TrainingProject;
};

function difficultyLabel(difficulty: TrainingProject['difficulty']): string {
  if (difficulty === 'basic') return 'Básico';
  if (difficulty === 'intermediate') return 'Intermediário';
  return 'Avançado';
}

function difficultyTone(difficulty: TrainingProject['difficulty']): 'green' | 'amber' | 'purple' {
  if (difficulty === 'basic') return 'green';
  if (difficulty === 'intermediate') return 'amber';
  return 'purple';
}

export const PremiumProjectQuickSummary = memo(function PremiumProjectQuickSummary({ project }: PremiumProjectQuickSummaryProps) {
  const summary = getProjectWorkspaceSummary(project);

  return (
    <PremiumSection title="Resumo rápido" subtitle="Visão compacta para decidir o próximo passo" tone="green">
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Projeto aberto</Text>
            <Text style={styles.title}>{project.title}</Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>
          <PremiumBadge label={difficultyLabel(project.difficulty)} tone={difficultyTone(project.difficulty)} />
        </View>

        <View style={styles.progressGroup}>
          <PremiumProgress value={summary.readinessScore} label={`Prontidão ${summary.readinessScore}%`} />
          <PremiumProgress value={summary.learningScore} label={`Score didático ${summary.learningScore}%`} />
        </View>

        <View style={styles.nextActionBox}>
          <Text style={styles.nextActionLabel}>Próximo melhor passo</Text>
          <Text style={styles.nextActionText}>{summary.nextBestAction}</Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{summary.rungPreviewCount}</Text><Text style={styles.metricLabel}>rungs</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{summary.ioPointCount}</Text><Text style={styles.metricLabel}>I/O</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{summary.exportReadyTargetCount}/3</Text><Text style={styles.metricLabel}>export</Text></View>
        <View style={[styles.metricCard, summary.safetyCriticalCount > 0 && styles.metricCardAlert]}><Text style={[styles.metricValue, summary.safetyCriticalCount > 0 && styles.metricValueAlert]}>{summary.safetyCriticalCount}</Text><Text style={styles.metricLabel}>críticos</Text></View>
      </View>

      <View style={styles.highlightsRow}>
        {summary.compactHighlights.map((highlight) => <Text key={highlight} style={styles.highlightChip}>{highlight}</Text>)}
        {summary.hasBenchMapping ? <Text style={styles.highlightChip}>bancada pronta</Text> : <Text style={styles.highlightChip}>bancada pendente</Text>}
      </View>
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  heroCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: '900', marginTop: 2 },
  description: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 3 },
  progressGroup: { gap: spacing.sm },
  nextActionBox: { borderColor: colors.green, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.greenSoft },
  nextActionLabel: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  nextActionText: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900', marginTop: 4 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: { flexGrow: 1, flexBasis: 72, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surfaceElevated },
  metricCardAlert: { borderColor: colors.amber, backgroundColor: colors.amberSoft },
  metricValue: { color: colors.cyan, fontSize: 18, fontWeight: '900' },
  metricValueAlert: { color: colors.amber },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  highlightsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  highlightChip: { color: colors.textMuted, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 5, fontSize: 10, fontWeight: '900', backgroundColor: colors.surface },
});
