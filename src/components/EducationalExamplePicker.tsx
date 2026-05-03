import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorExampleProject } from '../data/editorExampleProjects';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type EducationalExamplePickerProps = {
  examples: EditorExampleProject[];
  locked?: boolean;
  onLoadExample: (example: EditorExampleProject) => void;
};

export function EducationalExamplePicker({ examples, locked, onLoadExample }: EducationalExamplePickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Exemplos educativos</Text>
          <Text style={styles.subtitle}>Carregue projetos prontos com blocos avançados para estudar gratuitamente.</Text>
        </View>
        <Text style={styles.badge}>Livre</Text>
      </View>

      {examples.map((example) => (
        <Pressable
          key={example.id}
          onPress={() => !locked && onLoadExample(example)}
          style={({ pressed }) => [styles.exampleCard, locked && styles.disabled, pressed && !locked && styles.pressed]}
        >
          <View style={styles.exampleHeader}>
            <Text style={styles.exampleTitle}>{example.title}</Text>
            <Text style={styles.difficulty}>{example.difficulty}</Text>
          </View>
          <Text style={styles.description}>{example.description}</Text>
          <Text style={styles.loadText}>{locked ? 'Volte para Editar para carregar' : 'Carregar exemplo'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  badge: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  exampleCard: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  exampleTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  difficulty: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  loadText: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
});
