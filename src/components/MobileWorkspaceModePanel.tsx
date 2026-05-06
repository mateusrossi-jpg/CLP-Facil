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
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Modo de uso</Text>
          <Text style={styles.title}>{mode === 'guided' ? 'Aprendizado guiado' : 'Simulação livre'}</Text>
        </View>
        <View style={[styles.modeBadge, mode === 'guided' ? styles.modeBadgeGuided : styles.modeBadgeFree]}>
          <Text style={[styles.modeBadgeText, mode === 'guided' ? styles.modeBadgeTextGuided : styles.modeBadgeTextFree]}>
            {mode === 'guided' ? 'Missão' : 'Livre'}
          </Text>
        </View>
      </View>

      <View style={styles.modeGrid}>
        <Pressable
          onPress={() => onChangeMode('guided')}
          style={[styles.modeButton, mode === 'guided' && styles.modeButtonGuidedActive]}
        >
          <Text style={[styles.modeButtonTitle, mode === 'guided' && styles.modeButtonTitleGuided]}>Guiado</Text>
          <Text style={styles.modeButtonText}>Missões curtas, objetivo claro, dica e validação automática.</Text>
        </Pressable>

        <Pressable
          onPress={() => onChangeMode('free')}
          style={[styles.modeButton, mode === 'free' && styles.modeButtonFreeActive]}
        >
          <Text style={[styles.modeButtonTitle, mode === 'free' && styles.modeButtonTitleFree]}>Livre</Text>
          <Text style={styles.modeButtonText}>Monte, toque, teste e edite sem seguir uma trilha obrigatória.</Text>
        </Pressable>
      </View>

      <View style={styles.contextBox}>
        <Text style={styles.contextLabel}>{mode === 'guided' ? 'Missão atual' : 'Workspace livre'}</Text>
        <Text style={styles.contextTitle} numberOfLines={1}>{missionTitle || (mode === 'guided' ? 'Escolha uma missão para começar' : 'Mesa de simulação independente')}</Text>
        <Text style={styles.contextText}>
          {mode === 'guided'
            ? missionProgress || 'O app orienta o aluno: acione entradas, observe a rung, valide saídas e avance.'
            : 'Ideal para quem já conhece CLP: a tela fica simples, direta e sem bloquear experimentação.'}
        </Text>
      </View>

      {mode === 'guided' && onOpenMissions ? (
        <Pressable onPress={onOpenMissions} style={styles.missionButton}>
          <Text style={styles.missionButtonText}>Ver trilha de missões</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerCopy: {
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
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 2,
  },
  modeBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  modeBadgeGuided: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  modeBadgeFree: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  modeBadgeTextGuided: {
    color: colors.green,
  },
  modeBadgeTextFree: {
    color: colors.amber,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modeButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: 4,
  },
  modeButtonGuidedActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  modeButtonFreeActive: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  modeButtonTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  modeButtonTitleGuided: {
    color: colors.green,
  },
  modeButtonTitleFree: {
    color: colors.amber,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
  },
  contextBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: 3,
  },
  contextLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  contextTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  contextText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  missionButton: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.green,
  },
  missionButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
});
