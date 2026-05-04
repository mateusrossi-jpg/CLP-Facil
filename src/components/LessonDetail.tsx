import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Lesson } from '../data/learningContent';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LessonDetailProps = {
  lesson: Lesson;
  onOpenSimulator?: () => void;
};

export function LessonDetail({ lesson, onOpenSimulator }: LessonDetailProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Lição guiada</Text>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.description}>{lesson.shortDescription}</Text>

      <View style={styles.flowRail}>
        <View style={styles.flowItem}>
          <Text style={styles.flowNumber}>1</Text>
          <Text style={styles.flowText}>Entender</Text>
        </View>
        <View style={styles.flowDivider} />
        <View style={styles.flowItem}>
          <Text style={styles.flowNumber}>2</Text>
          <Text style={styles.flowText}>Ver regra</Text>
        </View>
        <View style={styles.flowDivider} />
        <View style={styles.flowItem}>
          <Text style={styles.flowNumber}>3</Text>
          <Text style={styles.flowText}>Simular</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Objetivo</Text>
      <Text style={styles.text}>{lesson.objective}</Text>

      {lesson.keyConcepts && lesson.keyConcepts.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Conceitos-chave</Text>
          <View style={styles.conceptGrid}>
            {lesson.keyConcepts.map((item) => (
              <Text key={item} style={styles.conceptChip}>{item}</Text>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Teoria prática</Text>
      {lesson.theory.map((item) => (
        <Text key={item} style={styles.bullet}>• {item}</Text>
      ))}

      {lesson.ladderPattern ? (
        <>
          <Text style={styles.sectionTitle}>Padrão Ladder</Text>
          <View style={styles.patternBox}>
            <Text style={styles.patternText}>{lesson.ladderPattern}</Text>
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Exemplo</Text>
      <Text style={styles.text}>{lesson.practicalExample}</Text>

      {lesson.practiceSteps && lesson.practiceSteps.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Prática guiada</Text>
          {lesson.practiceSteps.map((item, index) => (
            <View key={`${index}-${item}`} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{item}</Text>
            </View>
          ))}
        </>
      ) : null}

      {lesson.expectedResult ? (
        <View style={styles.expectedBox}>
          <Text style={styles.expectedLabel}>Resultado esperado</Text>
          <Text style={styles.expectedText}>{lesson.expectedResult}</Text>
        </View>
      ) : null}

      {lesson.commonMistakes && lesson.commonMistakes.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Erros comuns</Text>
          {lesson.commonMistakes.map((item) => (
            <Text key={item} style={styles.warningBullet}>• {item}</Text>
          ))}
        </>
      ) : null}

      {lesson.reviewQuestion ? (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewLabel}>Pergunta de revisão</Text>
          <Text style={styles.reviewText}>{lesson.reviewQuestion}</Text>
        </View>
      ) : null}

      {onOpenSimulator ? (
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onOpenSimulator}>
          <Text style={styles.buttonText}>Entendi, ir para simulação</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  flowRail: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    marginTop: spacing.lg,
  },
  flowItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  flowNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.goldSoft,
    borderColor: colors.gold,
    borderWidth: 1,
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22,
  },
  flowText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  flowDivider: {
    width: 18,
    height: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  bullet: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  conceptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  conceptChip: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    fontSize: 12,
    fontWeight: '900',
  },
  patternBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
  },
  patternText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 19,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: colors.cyan,
    borderWidth: 1,
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  expectedBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.greenSoft,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  expectedLabel: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  expectedText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  warningBullet: {
    color: colors.amber,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  reviewBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  reviewLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  reviewText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.black,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
});
