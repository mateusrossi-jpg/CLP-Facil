import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Lesson } from '../data/learningContent';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LessonCardProps = {
  lesson: Lesson;
  index?: number;
  onPress?: () => void;
};

function lessonIcon(lesson: Lesson) {
  if (lesson.id.includes('closed')) return ']/[';
  if (lesson.id.includes('seal')) return '⟳';
  if (lesson.id.includes('motor')) return '⚙';
  return '] [';
}

export function LessonCard({ lesson, index = 0, onPress }: LessonCardProps) {
  const planned = lesson.status === 'planned';

  return (
    <Pressable onPress={planned ? undefined : onPress} style={({ pressed }) => [styles.card, planned && styles.planned, pressed && !planned && styles.pressed]}>
      <View style={styles.leftRail} />
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{lessonIcon(lesson)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Lição {String(index + 1).padStart(2, '0')}</Text>
          <Text style={[styles.badge, planned ? styles.badgePlanned : styles.badgeAvailable]}>{planned ? 'Futuro' : 'Livre'}</Text>
        </View>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.description}>{lesson.shortDescription}</Text>
        <View style={styles.footerRow}>
          {lesson.simulatorProjectId ? <Text style={styles.simulator}>Prática no simulador</Text> : <Text style={styles.theory}>Aula teórica</Text>}
          {!planned ? <Text style={styles.openText}>Abrir ›</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  planned: {
    opacity: 0.58,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  leftRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.cyan,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  icon: {
    color: colors.cyan,
    fontSize: 16,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  step: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  badge: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  badgeAvailable: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  badgePlanned: {
    color: colors.amber,
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  simulator: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
  },
  theory: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  openText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
});
