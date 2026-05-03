import { StyleSheet, Text, View } from 'react-native';
import { LearningModule, Lesson } from '../data/learningContent';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type LearningModuleCardProps = {
  module: LearningModule;
  lessons: Lesson[];
};

function moduleIcon(moduleId: LearningModule['id']) {
  if (moduleId === 'motors') return '⚙';
  if (moduleId === 'timers') return '◴';
  if (moduleId === 'counters') return '#';
  return '┤├';
}

export function LearningModuleCard({ module, lessons }: LearningModuleCardProps) {
  const availableCount = lessons.filter((lesson) => lesson.status === 'available').length;
  const planned = module.status === 'planned';
  const total = Math.max(lessons.length, 1);
  const progress = Math.round((availableCount / total) * 100);

  return (
    <View style={[styles.container, planned && styles.containerPlanned]}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{moduleIcon(module.id)}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{module.title}</Text>
            <Text style={[styles.badge, planned ? styles.badgePlanned : styles.badgeAvailable]}>{planned ? 'Futuro' : 'Livre'}</Text>
          </View>
          <Text style={styles.description}>{module.description}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{availableCount}/{total} lições disponíveis</Text>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }, planned && styles.progressPlanned]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  containerPlanned: {
    borderColor: colors.amber,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.cyanSoft,
    borderColor: colors.cyan,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.cyan,
    fontSize: 24,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    flex: 1,
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  progressText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.backgroundSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.green,
  },
  progressPlanned: {
    backgroundColor: colors.amber,
  },
});
