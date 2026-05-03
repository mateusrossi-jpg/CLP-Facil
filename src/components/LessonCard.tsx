import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Lesson } from '../data/learningContent';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LessonCardProps = {
  lesson: Lesson;
  onPress?: () => void;
};

export function LessonCard({ lesson, onPress }: LessonCardProps) {
  const planned = lesson.status === 'planned';

  return (
    <Pressable onPress={planned ? undefined : onPress} style={({ pressed }) => [styles.card, planned && styles.planned, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={[styles.badge, planned && styles.badgePlanned]}>{planned ? 'Futuro' : 'Lição'}</Text>
      </View>
      <Text style={styles.description}>{lesson.shortDescription}</Text>
      {lesson.simulatorProjectId ? <Text style={styles.simulator}>Inclui prática no simulador</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  planned: {
    opacity: 0.62,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  badge: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  badgePlanned: {
    color: colors.amber,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  simulator: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.md,
  },
});
