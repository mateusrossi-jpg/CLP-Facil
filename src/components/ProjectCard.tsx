import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LadderProject } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProjectCardProps = {
  project: LadderProject;
  badge?: string;
  onPress?: () => void;
};

export function ProjectCard({ project, badge = 'Exemplo', onPress }: ProjectCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.badge}>{badge}</Text>
      </View>
      <Text style={styles.description}>{project.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{project.variables.length} variáveis</Text>
        <Text style={styles.meta}>{project.rungs.length} linha Ladder</Text>
      </View>
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
  pressed: {
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  badge: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  meta: {
    color: colors.inactive,
    fontSize: 12,
    fontWeight: '800',
  },
});
