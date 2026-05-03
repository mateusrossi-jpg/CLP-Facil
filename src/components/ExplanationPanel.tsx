import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ExplanationPanelProps = {
  text: string;
};

export function ExplanationPanel({ text }: ExplanationPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explicação do estado</Text>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.warning}>Uso educativo: não substitui projeto, norma técnica ou validação em máquina real.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  warning: {
    color: colors.amber,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
});
