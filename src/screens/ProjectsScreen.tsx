import { View, Text, Pressable, StyleSheet } from 'react-native';
import { projects } from '../data/projects';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  onOpenProject: (project: any) => void;
};

export function ProjectsScreen({ onOpenProject }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projetos</Text>

      {projects.map((p) => (
        <Pressable
          key={p.id}
          style={styles.card}
          onPress={() => onOpenProject(p)}
        >
          <Text style={styles.name}>{p.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
  },
});
