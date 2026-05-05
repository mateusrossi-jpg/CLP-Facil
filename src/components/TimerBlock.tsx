import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  label: string;
  elapsedMs: number;
  presetMs: number;
  q: boolean;
};

export function TimerBlock({ label, elapsedMs, presetMs, q }: Props) {
  const progress = Math.min(elapsedMs / presetMs, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.row}>
        <Text style={styles.text}>ET: {Math.floor(elapsedMs)} ms</Text>
        <Text style={styles.text}>PT: {presetMs} ms</Text>
      </View>

      <View style={[styles.qIndicator, q && styles.qActive]}>
        <Text style={styles.qText}>Q</Text>
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
    marginTop: spacing.md,
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.text,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  barBackground: {
    height: 10,
    backgroundColor: colors.inactive,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    backgroundColor: colors.cyan,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  text: {
    color: colors.textMuted,
    fontSize: 12,
  },
  qIndicator: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  qActive: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.green,
  },
  qText: {
    color: colors.text,
    fontWeight: '900',
  },
});
