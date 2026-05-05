import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getProjectLearningLinkSummary } from '../../education/projectLearningLinks';
import { getProjectCategoryLabel, getProjectDifficultyLabel, type ProjectDifficulty, type TrainingProject } from '../../projects/projectCatalog';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumProgress, PremiumSection } from './PremiumCards';

type PremiumProjectDetailCardProps = {
  project: TrainingProject;
};

function difficultyTone(difficulty: ProjectDifficulty): 'green' | 'amber' | 'purple' {
  if (difficulty === 'basic') return 'green';
  if (difficulty === 'intermediate') return 'amber';
  return 'purple';
}

export const PremiumProjectDetailCard = memo(function PremiumProjectDetailCard({ project }: PremiumProjectDetailCardProps) {
  const learning = getProjectLearningLinkSummary(project.id);

  return (
    <PremiumSection title="Projeto aberto" subtitle="Detalhe técnico e didático do exemplo selecionado" tone="green">
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{project.title.slice(0, 1)}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Biblioteca Easy-PLC</Text>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <PremiumBadge label={getProjectDifficultyLabel(project.difficulty)} tone={difficultyTone(project.difficulty)} />
        <PremiumBadge label={getProjectCategoryLabel(project.category)} tone="cyan" />
        <PremiumBadge label={`${project.estimatedMinutes} min`} tone="neutral" />
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.rungs}</Text><Text style={styles.metricLabel}>rungs</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.timers}</Text><Text style={styles.metricLabel}>timers</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.counters}</Text><Text style={styles.metricLabel}>contadores</Text></View>
        <View style={styles.metricCard}><Text style={styles.metricValue}>{project.ioSummary.inputs}/{project.ioSummary.outputs}</Text><Text style={styles.metricLabel}>I/O</Text></View>
      </View>

      <View style={styles.learningBox}>
        <Text style={styles.learningTitle}>Ligação com Aprender</Text>
        <Text style={styles.learningText}>{learning.linkedLessons.length} lições vinculadas • {learning.linkedPracticeCount} práticas guiadas</Text>
        <PremiumProgress value={learning.teachingScore} label={`Score didático ${learning.teachingScore}%`} />
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Objetivos de aprendizagem</Text>
        {project.learningGoals.map((goal) => <Text key={goal} style={styles.blockText}>• {goal}</Text>)}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Instruções utilizadas</Text>
        <View style={styles.instructionRow}>
          {project.instructions.map((instruction) => <Text key={instruction} style={styles.instructionChip}>{instruction}</Text>)}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Tags de estudo</Text>
        <View style={styles.instructionRow}>
          {project.tags.map((tag) => <Text key={tag} style={styles.tagChip}>{tag}</Text>)}
        </View>
      </View>
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderColor: colors.green,
    borderWidth: 1,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: colors.green, fontSize: 22, fontWeight: '900' },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 17, lineHeight: 23, fontWeight: '900', marginTop: 2 },
  description: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 3, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    flexGrow: 1,
    flexBasis: 90,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  metricValue: { color: colors.cyan, fontSize: 19, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  learningBox: { borderColor: colors.green, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.greenSoft, gap: spacing.sm },
  learningTitle: { color: colors.green, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  learningText: { color: colors.text, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  block: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  blockTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  blockText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  instructionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  instructionChip: { color: colors.cyan, borderColor: colors.cyan, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.cyanSoft },
  tagChip: { color: colors.textMuted, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '900', backgroundColor: colors.surface },
});
