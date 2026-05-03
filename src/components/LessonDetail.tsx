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

      <Text style={styles.sectionTitle}>Objetivo</Text>
      <Text style={styles.text}>{lesson.objective}</Text>

      <Text style={styles.sectionTitle}>Teoria prática</Text>
      {lesson.theory.map((item) => (
        <Text key={item} style={styles.bullet}>• {item}</Text>
      ))}

      <Text style={styles.sectionTitle}>Exemplo</Text>
      <Text style={styles.text}>{lesson.practicalExample}</Text>

      {lesson.simulatorProjectId ? (
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onOpenSimulator}>
          <Text style={styles.buttonText}>Abrir no simulador</Text>
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
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  kicker: {
    color: colors.cyan,
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
  button: {
    backgroundColor: colors.cyan,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '900',
  },
});
