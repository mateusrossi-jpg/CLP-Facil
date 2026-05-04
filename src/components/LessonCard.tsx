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
      <View style={styles.footer}>
        {lesson.ladderPattern ? <Text style={styles.pattern} numberOfLines={1}>{lesson.ladderPattern}</Text> : null}
        {lesson.simulatorProjectId ? <Text style={styles.simulator}>Prática no simulador</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
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
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.cyanSoft,
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
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  footer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  pattern: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
});
