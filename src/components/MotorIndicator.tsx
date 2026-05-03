import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MotorIndicatorProps = {
  active: boolean;
};

export function MotorIndicator({ active }: MotorIndicatorProps) {
  return (
    <View style={[styles.container, active && styles.active]}>
      <View style={[styles.motor, active && styles.motorActive]}>
        <Text style={styles.motorText}>M</Text>
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>Motor MTR1</Text>
        <Text style={styles.description}>{active ? 'Motor em funcionamento pelo contator K1.' : 'Motor parado aguardando comando.'}</Text>
      </View>
      <Text style={[styles.state, active && styles.stateActive]}>{active ? 'GIRANDO' : 'PARADO'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  active: {
    borderColor: colors.green,
  },
  motor: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.inactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motorActive: {
    backgroundColor: colors.green,
  },
  motorText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: '900',
  },
  textBox: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  state: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  stateActive: {
    color: colors.green,
  },
});
