import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type EditorRunMode = 'edit' | 'simulate';

type EditorModeToggleProps = {
  mode: EditorRunMode;
  onChangeMode: (mode: EditorRunMode) => void;
};

export function EditorModeToggle({ mode, onChangeMode }: EditorModeToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBox}>
        <Text style={styles.title}>Modo do editor</Text>
        <Text style={styles.subtitle}>{mode === 'edit' ? 'Edite rungs, blocos e variáveis.' : 'Edição travada. Acione entradas para simular o ciclo lógico.'}</Text>
      </View>
      <View style={styles.toggleRow}>
        <Pressable onPress={() => onChangeMode('edit')} style={({ pressed }) => [styles.option, mode === 'edit' && styles.optionActive, pressed && styles.pressed]}>
          <Text style={[styles.optionText, mode === 'edit' && styles.optionTextActive]}>Editar</Text>
        </Pressable>
        <Pressable onPress={() => onChangeMode('simulate')} style={({ pressed }) => [styles.option, mode === 'simulate' && styles.optionActive, pressed && styles.pressed]}>
          <Text style={[styles.optionText, mode === 'simulate' && styles.optionTextActive]}>Simular</Text>
        </Pressable>
      </View>
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
  textBox: {
    marginBottom: spacing.md,
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
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  optionActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '900',
  },
  optionTextActive: {
    color: colors.cyan,
  },
  pressed: {
    opacity: 0.75,
  },
});
