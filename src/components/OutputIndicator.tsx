import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type OutputIndicatorProps = {
  label: string;
  description?: string;
  active: boolean;
};

export function OutputIndicator({ label, description, active }: OutputIndicatorProps) {
  return (
    <View style={[styles.container, active && styles.active]}>
      <View style={[styles.led, active && styles.ledActive]} />
      <View style={styles.textBox}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Text style={[styles.state, active && styles.stateActive]}>{active ? 'LIGADO' : 'DESLIGADO'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  active: {
    borderColor: colors.green,
  },
  led: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.inactive,
  },
  ledActive: {
    backgroundColor: colors.green,
  },
  textBox: {
    flex: 1,
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
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  stateActive: {
    color: colors.green,
  },
});
