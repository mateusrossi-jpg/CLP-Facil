import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  onSimulate: () => void;
  onLearn: () => void;
  onProjects: () => void;
};

export function HomeScreen({ onSimulate, onLearn, onProjects }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Easy CLP</Text>
      <Text style={styles.subtitle}>Simulador profissional de lógica Ladder</Text>

      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={onSimulate}>
          <Text style={styles.buttonText}>⚡ Simular CLP</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onLearn}>
          <Text style={styles.buttonText}>📚 Aprender</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onProjects}>
          <Text style={styles.buttonText}>📂 Projetos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '900',
    textAlign: 'center',
  },
});
