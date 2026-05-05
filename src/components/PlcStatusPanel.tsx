import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  scan: number;
  isRunning: boolean;
  cycleMs?: number;
};

export function PlcStatusPanel({ scan, isRunning, cycleMs }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>STATUS DO CLP</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Modo:</Text>
        <Text style={[styles.value, isRunning && styles.run]}>
          {isRunning ? 'RUN' : 'STOP'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Scan:</Text>
        <Text style={styles.value}>{scan}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Ciclo:</Text>
        <Text style={styles.value}>{cycleMs ?? 0} ms</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textMuted,
  },
  value: {
    color: colors.text,
    fontWeight: '800',
  },
  run: {
    color: colors.green,
  },
});
