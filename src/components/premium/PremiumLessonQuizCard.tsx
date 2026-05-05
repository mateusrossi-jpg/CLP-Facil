import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ClpLessonQuiz, QuizOption } from '../../education/clpLessonQuizzes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumSection } from './index';

type PremiumLessonQuizCardProps = {
  quiz: ClpLessonQuiz;
};

function optionTone(option: QuizOption, selectedId?: string) {
  if (!selectedId) return styles.optionIdle;
  if (option.id !== selectedId) return styles.optionMuted;
  return option.isCorrect ? styles.optionCorrect : styles.optionWrong;
}

export const PremiumLessonQuizCard = memo(function PremiumLessonQuizCard({ quiz }: PremiumLessonQuizCardProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const selected = quiz.options.find((option) => option.id === selectedId);

  return (
    <PremiumSection title="Checagem de domínio" subtitle="Responda e veja a explicação" tone="amber">
      <View style={styles.questionBox}>
        <View style={styles.questionTop}>
          <Text style={styles.questionLabel}>Pergunta</Text>
          <PremiumBadge label={selected?.isCorrect ? 'Correto' : selected ? 'Revisar' : 'Pendente'} tone={selected?.isCorrect ? 'green' : selected ? 'amber' : 'neutral'} />
        </View>
        <Text style={styles.questionText}>{quiz.question}</Text>
      </View>

      <View style={styles.optionList}>
        {quiz.options.map((option) => (
          <Pressable key={option.id} onPress={() => setSelectedId(option.id)} style={[styles.optionCard, optionTone(option, selectedId)]}>
            <Text style={styles.optionLetter}>{option.id.toUpperCase()}</Text>
            <Text style={styles.optionText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      {selected ? (
        <View style={[styles.feedbackBox, selected.isCorrect ? styles.feedbackCorrect : styles.feedbackReview]}>
          <Text style={[styles.feedbackTitle, selected.isCorrect ? styles.feedbackCorrectTitle : styles.feedbackReviewTitle]}>
            {selected.isCorrect ? 'Boa! Domínio confirmado.' : 'Quase lá. Revise o conceito.'}
          </Text>
          <Text style={styles.feedbackText}>{selected.explanation}</Text>
        </View>
      ) : null}
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  questionBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  questionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  questionLabel: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  questionText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
  },
  optionList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
  },
  optionIdle: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  optionMuted: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    opacity: 0.72,
  },
  optionCorrect: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  optionWrong: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  optionLetter: {
    width: 26,
    height: 26,
    borderRadius: 999,
    overflow: 'hidden',
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '900',
  },
  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  feedbackBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
  },
  feedbackCorrect: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  feedbackReview: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },
  feedbackCorrectTitle: {
    color: colors.green,
  },
  feedbackReviewTitle: {
    color: colors.amber,
  },
  feedbackText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
