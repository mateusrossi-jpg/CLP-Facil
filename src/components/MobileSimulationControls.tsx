import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type MobileSimulationControlsProps = {
  autoScan?: boolean;
  editing?: boolean;
  mode?: 'edit' | 'simulate';
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
  onToggleEdit?: () => void;
  onToggleHint?: () => void;
};

const noop = () => undefined;

export const MobileSimulationControls = memo(function MobileSimulationControls({
  autoScan = false,
  editing = false,
  mode = editing ? 'edit' : 'simulate',
  onRunScan = noop,
  onToggleAutoScan = noop,
  onToggleEdit = noop,
  onToggleHint = noop,
}: MobileSimulationControlsProps) {
  const editMode = mode === 'edit';
  return (
    <View style={styles.bar}>
      <Pressable disabled={editMode} onPress={onRunScan} style={({ pressed }) => [styles.button, styles.primaryButton, editMode && styles.disabled, pressed && !editMode && styles.pressed]}>
        <Text style={styles.primaryText}>Scan</Text>
      </Pressable>
      <Pressable disabled={editMode} onPress={onToggleAutoScan} style={({ pressed }) => [styles.button, autoScan && styles.autoOn, editMode && styles.disabled, pressed && !editMode && styles.pressed]}>
        <Text style={[styles.buttonText, autoScan && styles.autoTextOn]}>{autoScan ? 'Auto ON' : 'Auto'}</Text>
      </Pressable>
      <Pressable onPress={onToggleEdit} style={({ pressed }) => [styles.button, editMode && styles.editOn, pressed && styles.pressed]}>
        <Text style={[styles.buttonText, editMode && styles.editTextOn]}>{editMode ? 'Simular' : 'Editar'}</Text>
      </Pressable>
      <Pressable onPress={onToggleHint} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Dica</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  button: {
    flex: 1,
    minHeight: 42,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
  },
  primaryButton: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyan,
  },
  primaryText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
  },
  buttonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  autoOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  autoTextOn: {
    color: colors.green,
  },
  editOn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  editTextOn: {
    color: colors.amber,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.48,
  },
});
