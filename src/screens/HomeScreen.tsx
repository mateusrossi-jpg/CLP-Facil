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
      <Text style={styles.subtitle}>Simulador Ladder simples, direto e mobile</Text>

      <View style={styles.buttons}>
        <Pressable style={[styles.button, styles.primaryButton]} onPress={onSimulate}>
          <Text style={[styles.buttonText, styles.primaryButtonText]}>▶ Abrir Simulador</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onLearn}>
          <Text style={styles.buttonText}>🧪 Ver Exemplos</Text>
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
    backgroundColor: '#F4F7FB',
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
    color: '#475569',
    marginBottom: spacing.lg,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: '900',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
