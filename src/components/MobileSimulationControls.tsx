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
    <View style={styles.stack}>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Bancada</Text>
        <Text style={[styles.statusValue, editMode ? styles.statusEdit : styles.statusSimulate]}>
          {editMode ? 'Montando lógica' : 'Testando lógica'}
        </Text>
      </View>

      <View style={styles.bar}>
        <Pressable disabled={editMode} onPress={onRunScan} style={({ pressed }) => [styles.button, styles.primaryButton, editMode && styles.disabled, pressed && !editMode && styles.pressed]}>
          <Text style={styles.primaryText}>Scan</Text>
          <Text style={styles.buttonHint}>executar</Text>
        </Pressable>
        <Pressable disabled={editMode} onPress={onToggleAutoScan} style={({ pressed }) => [styles.button, autoScan && styles.autoOn, editMode && styles.disabled, pressed && !editMode && styles.pressed]}>
          <Text style={[styles.buttonText, autoScan && styles.autoTextOn]}>{autoScan ? 'Auto ON' : 'Auto'}</Text>
          <Text style={styles.buttonHint}>ciclo</Text>
        </Pressable>
        <Pressable onPress={onToggleEdit} style={({ pressed }) => [styles.button, editMode && styles.editOn, pressed && styles.pressed]}>
          <Text style={[styles.buttonText, editMode && styles.editTextOn]}>{editMode ? 'Testar' : 'Editar'}</Text>
          <Text style={styles.buttonHint}>{editMode ? 'simular' : 'montar'}</Text>
        </Pressable>
        <Pressable onPress={onToggleHint} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Dica</Text>
          <Text style={styles.buttonHint}>ajuda</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xs,
  },
  statusRow: {
    minHeight: 30,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusEdit: {
    color: colors.amber,
  },
  statusSimulate: {
    color: colors.green,
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  button: {
    flex: 1,
    minHeight: 48,
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
  buttonHint: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
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
