import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type InputButtonProps = {
  label: string;
  description?: string;
  active: boolean;
  danger?: boolean;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onPress?: () => void;
};

export function InputButton({ label, description, active, danger, onPress, onPressIn, onPressOut }: InputButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.button,
        active && styles.active,
        danger && active && styles.dangerActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <Text style={[styles.state, active && styles.stateActive]}>{active ? 'ATIVO' : 'INATIVO'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    margin: spacing.xs,
  },
  active: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  dangerActive: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  state: {
    color: colors.inactive,
    fontSize: 11,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  stateActive: {
    color: colors.green,
  },
});
