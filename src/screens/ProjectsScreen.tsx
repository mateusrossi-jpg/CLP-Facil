import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { createInitialEditorProject } from '../engine/editorTypes';
import { createInitialEditorState } from '../engine/editorEvaluator';
import { createInitialRuntimeState } from '../engine/runtimeTypes';

// 🔥 Projeto integrado diretamente ao editor (sem duplicação)
function createDirectStartEditorProject() {
  const project = createInitialEditorProject();
  return project;
}

type Props = {
  onOpenProject: (project: any, state: any, runtime: any) => void;
};

export function ProjectsScreen({ onOpenProject }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projetos</Text>

      <Pressable
        style={styles.card}
        onPress={() => {
          const project = createDirectStartEditorProject();
          const state = createInitialEditorState();
          const runtime = createInitialRuntimeState();

          onOpenProject(project, state, runtime);
        }}
      >
        <Text style={styles.name}>Partida Direta</Text>
      </Pressable>

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
