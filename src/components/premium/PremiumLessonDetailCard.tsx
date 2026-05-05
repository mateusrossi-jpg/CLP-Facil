import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ClpLesson } from '../../education/clpLessonCatalog';
import { getQuizForLesson } from '../../education/clpLessonQuizzes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumSection } from './index';
import { PremiumLessonQuizCard } from './PremiumLessonQuizCard';

type PremiumLessonDetailCardProps = {
  lesson: ClpLesson;
};

function difficultyLabel(difficulty: ClpLesson['difficulty']): string {
  if (difficulty === 'intro') return 'Introdutório';
  if (difficulty === 'basic') return 'Básico';
  if (difficulty === 'intermediate') return 'Intermediário';
  return 'Avançado';
}

function difficultyTone(difficulty: ClpLesson['difficulty']): 'cyan' | 'green' | 'amber' | 'purple' {
  if (difficulty === 'intro') return 'cyan';
  if (difficulty === 'basic') return 'green';
  if (difficulty === 'intermediate') return 'amber';
  return 'purple';
}

export const PremiumLessonDetailCard = memo(function PremiumLessonDetailCard({ lesson }: PremiumLessonDetailCardProps) {
  const quiz = getQuizForLesson(lesson.id);

  return (
    <>
      <PremiumSection title="Detalhe da lição" subtitle="Conceito, prática e domínio" tone="green">
        <View style={styles.lessonHero}>
          <View style={styles.lessonTop}>
            <View style={styles.lessonCopy}>
              <Text style={styles.lessonEyebrow}>Lição guiada</Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonMeta}>{lesson.durationMinutes} min • {lesson.moduleId}</Text>
            </View>
            <PremiumBadge label={difficultyLabel(lesson.difficulty)} tone={difficultyTone(lesson.difficulty)} />
          </View>
          {lesson.exampleProjectId ? (
            <View style={styles.projectPill}>
              <Text style={styles.projectPillText}>Exemplo vinculado: {lesson.exampleProjectId}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.blockList}>
          <View style={styles.infoBlock}>
            <Text style={styles.blockLabel}>Conceito</Text>
            <Text style={styles.blockText}>{lesson.concept}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.blockLabel}>Por que importa</Text>
            <Text style={styles.blockText}>{lesson.whyItMatters}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.blockLabel}>Prática</Text>
            <Text style={styles.blockText}>{lesson.practice}</Text>
          </View>
          <View style={[styles.infoBlock, styles.masteryBlock]}>
            <Text style={styles.masteryLabel}>Checagem de domínio</Text>
            <Text style={styles.masteryText}>{lesson.masteryCheck}</Text>
          </View>
        </View>
      </PremiumSection>
      {quiz ? <PremiumLessonQuizCard quiz={quiz} /> : null}
    </>
  );
});

const styles = StyleSheet.create({
  lessonHero: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  lessonTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  lessonCopy: {
    flex: 1,
    minWidth: 0,
  },
  lessonEyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  lessonTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  lessonMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  projectPill: {
    alignSelf: 'flex-start',
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.cyanSoft,
  },
  projectPillText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  blockList: {
    gap: spacing.sm,
  },
  infoBlock: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  blockLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  blockText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  masteryBlock: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  masteryLabel: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  masteryText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
});
