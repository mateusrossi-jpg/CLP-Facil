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
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>I/O → Ladder → Q</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <Pressable onPress={() => onChangeMode?.(mode === 'edit' ? 'simulate' : 'edit')} style={styles.button}>
          <Text style={styles.buttonText}>{mode === 'edit' ? 'Modo edição' : 'Modo simulação'}</Text>
        </Pressable>
        <Pressable onPress={onToggleAutoScan} style={[styles.button, autoScan && styles.buttonOn]}>
          <Text style={styles.buttonText}>{autoScan ? 'Auto Scan ON' : 'Auto Scan OFF'}</Text>
        </Pressable>
        <Pressable onPress={onRunScan} style={[styles.button, styles.scanButton]}>
          <Text style={styles.buttonText}>Scan</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing.md, backgroundColor: colors.surface, gap: spacing.xs },
  eyebrow: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 16, fontWeight: '900' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 8, backgroundColor: colors.surfaceElevated },
  buttonOn: { borderColor: colors.green },
  scanButton: { borderColor: colors.cyan },
  buttonText: { color: colors.text, fontSize: 11, fontWeight: '800' },
});
