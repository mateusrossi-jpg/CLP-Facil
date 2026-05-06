import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type MobileWorkspaceMode = 'guided' | 'free';

type MobileWorkspaceModePanelProps = {
  mode: MobileWorkspaceMode;
  missionTitle?: string;
  missionProgress?: string;
  onChangeMode: (mode: MobileWorkspaceMode) => void;
  onOpenMissions?: () => void;
};

export const MobileWorkspaceModePanel = memo(function MobileWorkspaceModePanel({
  mode,
  missionTitle,
  missionProgress,
  onChangeMode,
  onOpenMissions,
}: MobileWorkspaceModePanelProps) {
  const guided = mode === 'guided';
  return (
    <View style={styles.bar}>
      <View style={styles.modeSwitch}>
        <Pressable onPress={() => onChangeMode('guided')} style={[styles.modeButton, guided && styles.modeButtonGuidedOn]}>
          <Text style={[styles.modeButtonText, guided && styles.modeButtonTextGuidedOn]}>Guiado</Text>
        </Pressable>
        <Pressable onPress={() => onChangeMode('free')} style={[styles.modeButton, !guided && styles.modeButtonFreeOn]}>
          <Text style={[styles.modeButtonText, !guided && styles.modeButtonTextFreeOn]}>Livre</Text>
        </Pressable>
      </View>

      <View style={styles.contextRow}>
        <View style={styles.contextCopy}>
          <Text style={styles.contextLabel}>{guided ? 'Missão' : 'Bancada livre'}</Text>
          <Text style={styles.contextTitle} numberOfLines={1}>{missionTitle || (guided ? 'Escolha uma missão' : 'Editor + simulador')}</Text>
          <Text style={styles.contextText} numberOfLines={2}>
            {guided
              ? missionProgress || 'Resolva o desafio direto na bancada Ladder.'
              : 'Monte, clique nos blocos, mude variáveis e simule no mesmo local.'}
          </Text>
        </View>
        {guided && onOpenMissions ? (
          <Pressable onPress={onOpenMissions} style={({ pressed }) => [styles.missionButton, pressed && styles.pressed]}>
            <Text style={styles.missionButtonText}>Trilha</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  modeSwitch: {
    flexDirection: 'row',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.background,
    padding: 3,
    gap: 3,
  },
  modeButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  modeButtonGuidedOn: {
    backgroundColor: colors.greenSoft,
  },
  modeButtonFreeOn: {
    backgroundColor: colors.amberSoft,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modeButtonTextGuidedOn: {
    color: colors.green,
  },
  modeButtonTextFreeOn: {
    color: colors.amber,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contextCopy: {
    flex: 1,
    minWidth: 0,
  },
  contextLabel: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  contextTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  contextText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  missionButton: {
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  missionButtonText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.72,
  },
});
