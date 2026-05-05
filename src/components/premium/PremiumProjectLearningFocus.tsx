import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getGuidedPracticesLinkedToProject, getLessonsLinkedToProject } from '../../education/projectLearningLinks';
import type { ProjectNavigationIntent } from '../../projects/projectNavigationIntent';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumSection } from './PremiumCards';

type PremiumProjectLearningFocusProps = {
  intent?: ProjectNavigationIntent;
};

export const PremiumProjectLearningFocus = memo(function PremiumProjectLearningFocus({ intent }: PremiumProjectLearningFocusProps) {
  if (!intent) return null;

  const lessons = getLessonsLinkedToProject(intent.projectId);
  const practices = getGuidedPracticesLinkedToProject(intent.projectId);

  if (lessons.length === 0 && practices.length === 0) {
    return (
      <PremiumSection title="Aprendizado do projeto" subtitle="Ainda sem lições vinculadas" tone="amber">
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sem trilha dedicada para este projeto</Text>
          <Text style={styles.emptyText}>O projeto foi aberto corretamente, mas ainda precisa de lições e práticas guiadas vinculadas.</Text>
        </View>
      </PremiumSection>
    );
  }

  return (
    <PremiumSection title="Aprendizado do projeto" subtitle="Lições e práticas ligadas ao projeto selecionado" tone="green">
      <View style={styles.summaryRow}>
        <PremiumBadge label={`${lessons.length} lições`} tone="green" />
        <PremiumBadge label={`${practices.length} práticas`} tone="cyan" />
      </View>

      {lessons.map((lesson) => (
        <View key={lesson.id} style={styles.lessonCard}>
          <Text style={styles.lessonEyebrow}>Lição vinculada</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonText}>{lesson.concept}</Text>
          <Text style={styles.lessonWhy}>{lesson.whyItMatters}</Text>
        </View>
      ))}

      {practices.map((practice) => (
        <View key={`${practice.lessonId}-${practice.title}`} style={styles.practiceCard}>
          <Text style={styles.practiceEyebrow}>Prática guiada</Text>
          <Text style={styles.lessonTitle}>{practice.title}</Text>
          <Text style={styles.lessonText}>{practice.objective}</Text>
          <Text style={styles.stepCount}>{practice.steps.length} passos guiados</Text>
        </View>
      ))}
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  emptyCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  emptyTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  emptyText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  lessonCard: { borderColor: colors.green, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.greenSoft, gap: spacing.xs },
  practiceCard: { borderColor: colors.cyan, borderWidth: 1, borderRadius: 18, padding: spacing.md, backgroundColor: colors.cyanSoft, gap: spacing.xs },
  lessonEyebrow: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  practiceEyebrow: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  lessonTitle: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900' },
  lessonText: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  lessonWhy: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  stepCount: { color: colors.text, fontSize: 10, lineHeight: 15, fontWeight: '900' },
});
