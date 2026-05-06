import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorRunMode } from '../EditorModeToggle';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type MobileWorkbenchHeaderProps = {
  title: string;
  mode?: EditorRunMode;
  autoScan?: boolean;
  onChangeMode?: (mode: EditorRunMode) => void;
  onToggleAutoScan?: () => void;
  onRunScan?: () => void;
};

export const MobileWorkbenchHeader = memo(function MobileWorkbenchHeader({
  title,
  mode = 'simulate',
  autoScan = false,
  onChangeMode,
  onToggleAutoScan,
  onRunScan,
}: MobileWorkbenchHeaderProps) {
  const editMode = mode === 'edit';
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={styles.eyebrow}>I/O → Ladder → Q</Text>
          <Text style={styles.title}>PLC Simulator</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{title}</Text>
        </View>
        <View style={[styles.statusPill, editMode ? styles.editPill : styles.testPill]}>
          <Text style={[styles.statusText, editMode ? styles.editText : styles.testText]}>{editMode ? 'EDITAR' : 'TESTAR'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Pressable onPress={onRunScan} disabled={editMode} style={({ pressed }) => [styles.button, styles.scanButton, editMode && styles.buttonDisabled, pressed && !editMode && styles.pressed]}>
          <Text style={[styles.buttonText, styles.scanText]}>SCAN</Text>
        </Pressable>
        <Pressable onPress={onToggleAutoScan} disabled={editMode} style={({ pressed }) => [styles.button, autoScan && styles.autoButtonOn, editMode && styles.buttonDisabled, pressed && !editMode && styles.pressed]}>
          <Text style={[styles.buttonText, autoScan && styles.autoTextOn]}>{autoScan ? 'AUTO ON' : 'AUTO'}</Text>
        </Pressable>
        <Pressable onPress={() => onChangeMode?.(editMode ? 'simulate' : 'edit')} style={({ pressed }) => [styles.button, editMode && styles.editButtonOn, pressed && styles.pressed]}>
          <Text style={[styles.buttonText, editMode && styles.editTextOn]}>{editMode ? 'TESTAR' : 'EDITAR'}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  editPill: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  testPill: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  editText: {
    color: colors.amber,
  },
  testText: {
    color: colors.green,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  button: {
    flexGrow: 1,
    minWidth: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  scanButton: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  autoButtonOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  editButtonOn: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  buttonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  scanText: {
    color: colors.cyan,
  },
  autoTextOn: {
    color: colors.green,
  },
  editTextOn: {
    color: colors.amber,
  },
  pressed: {
    opacity: 0.72,
  },
});
