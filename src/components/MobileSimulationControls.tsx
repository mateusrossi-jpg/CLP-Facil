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
        <View style={styles.statusLeft}>
          <View style={[styles.runtimeLed, editMode ? styles.runtimeLedEdit : styles.runtimeLedRun]} />
          <Text style={styles.statusLabel}>Bancada</Text>
        </View>
        <Text style={[styles.statusValue, editMode ? styles.statusEdit : styles.statusSimulate]}>
          {editMode ? 'Montando lógica' : autoScan ? 'Testando em ciclo' : 'Testando por scan'}
        </Text>
      </View>

      <View style={[styles.scanFlowStrip, !editMode && styles.scanFlowStripRun]}>
        <Text style={[styles.scanFlowStep, !editMode && styles.scanFlowStepRun]}>Ler I</Text>
        <Text style={styles.scanFlowArrow}>→</Text>
        <Text style={[styles.scanFlowStep, !editMode && styles.scanFlowStepRun]}>Resolver Ladder</Text>
        <Text style={styles.scanFlowArrow}>→</Text>
        <Text style={[styles.scanFlowStep, !editMode && styles.scanFlowStepRun]}>Atualizar Q</Text>
      </View>

      <View style={styles.bar}>
        <Pressable disabled={editMode} onPress={onRunScan} style={({ pressed }) => [styles.button, styles.primaryButton, editMode && styles.disabled, pressed && !editMode && styles.pressed]}>
          <Text style={styles.primaryText}>SCAN</Text>
          <Text style={styles.primaryHint}>1 ciclo</Text>
        </Pressable>
        <Pressable disabled={editMode} onPress={onToggleAutoScan} style={({ pressed }) => [styles.button, autoScan && styles.autoOn, editMode && styles.disabled, pressed && !editMode && styles.pressed]}>
          <Text style={[styles.buttonText, autoScan && styles.autoTextOn]}>AUTO</Text>
          <Text style={[styles.buttonHint, autoScan && styles.autoTextOn]}>{autoScan ? 'rodando' : 'parado'}</Text>
        </Pressable>
        <Pressable onPress={onToggleEdit} style={({ pressed }) => [styles.button, editMode && styles.editOn, pressed && styles.pressed]}>
          <Text style={[styles.buttonText, editMode && styles.editTextOn]}>{editMode ? 'TESTAR' : 'EDITAR'}</Text>
          <Text style={styles.buttonHint}>{editMode ? 'simular' : 'blocos'}</Text>
        </Pressable>
        <Pressable onPress={onToggleHint} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>DICA</Text>
          <Text style={styles.buttonHint}>missão</Text>
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
    minHeight: 32,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  runtimeLed: {
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  runtimeLedRun: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  runtimeLedEdit: {
    borderColor: colors.amber,
    backgroundColor: colors.amber,
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
  scanFlowStrip: {
    minHeight: 28,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  scanFlowStripRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  scanFlowStep: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scanFlowStepRun: {
    color: colors.green,
  },
  scanFlowArrow: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  button: {
    flex: 1,
    minHeight: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
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
    letterSpacing: 0.5,
  },
  primaryHint: {
    color: colors.background,
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
    opacity: 0.82,
    textTransform: 'uppercase',
  },
  buttonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
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
