import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { ThemeMode, useAppTheme } from '../../theme/theme';
import { PremiumDashboard, PremiumDashboardItem } from './PremiumDashboard';

type PremiumSimulatorHomeProps = {
  themeMode: ThemeMode;
  statusItems: PremiumDashboardItem[];
  onOpenSimulator: () => void;
  onOpenLab: () => void;
  onOpenHardware: () => void;
  onToggleTheme: () => void;
};

export const PremiumSimulatorHome = memo(function PremiumSimulatorHome({
  themeMode,
  statusItems,
  onOpenSimulator,
  onOpenLab,
  onOpenHardware,
  onToggleTheme,
}: PremiumSimulatorHomeProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);

  return (
    <View style={styles.stack}>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>CLP</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>CLP Fácil</Text>
            <Text style={styles.title}>Simulador de CLP</Text>
            <Text style={styles.subtitle}>Ladder, I/O, scan, HMI/SCADA, laboratório 2.5D e exportação para ESP32/OpenPLC em uma bancada premium mobile-first.</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onOpenSimulator} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Abrir Simulador</Text>
          </Pressable>
          <Pressable onPress={onOpenLab} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Laboratório 2.5D</Text>
          </Pressable>
          <Pressable onPress={onOpenHardware} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Exportar Hardware</Text>
          </Pressable>
        </View>
      </View>

      <PremiumDashboard items={statusItems} />

      <View style={styles.betaCard}>
        <View style={styles.betaStatus}>
          <Text style={styles.betaCheck}>OK</Text>
        </View>
        <View style={styles.betaCopy}>
          <Text style={styles.betaTitle}>Pronto para beta</Text>
          <Text style={styles.betaText}>Experiência principal agora abre como produto de simulação CLP, com runtime, I/O, Ladder e exportação no fluxo central.</Text>
        </View>
        <Pressable onPress={onToggleTheme} style={({ pressed }) => [styles.themeButton, pressed && styles.pressed]}>
          <Text style={styles.themeButtonText}>{themeMode === 'dark' ? 'Tema claro' : 'Tema escuro'}</Text>
        </Pressable>
      </View>
    </View>
  );
});

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    stack: {
      gap: spacing.md,
    },
    hero: {
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: 24,
      backgroundColor: c.surface,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    heroHeader: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'center',
    },
    logo: {
      width: 62,
      height: 62,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.green,
      backgroundColor: c.greenSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: c.green,
      fontSize: 16,
      fontWeight: '900',
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    eyebrow: {
      color: c.cyan,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    title: {
      color: c.text,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      marginTop: 2,
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '700',
      marginTop: spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    primaryButton: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: c.cyan,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: c.background,
      fontSize: 14,
      fontWeight: '900',
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.borderStrong,
      backgroundColor: c.surfaceElevated,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: c.text,
      fontSize: 13,
      fontWeight: '900',
    },
    betaCard: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: c.green,
      borderRadius: 20,
      backgroundColor: c.greenSoft,
      padding: spacing.md,
    },
    betaStatus: {
      width: 42,
      height: 42,
      borderRadius: 999,
      backgroundColor: c.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    betaCheck: {
      color: c.background,
      fontSize: 12,
      fontWeight: '900',
    },
    betaCopy: {
      flex: 1,
      minWidth: 190,
    },
    betaTitle: {
      color: c.text,
      fontSize: 16,
      fontWeight: '900',
    },
    betaText: {
      color: c.textMuted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '800',
      marginTop: 3,
    },
    themeButton: {
      minHeight: 40,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.green,
      backgroundColor: c.surface,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeButtonText: {
      color: c.green,
      fontSize: 12,
      fontWeight: '900',
    },
    pressed: {
      opacity: 0.75,
    },
  });
}
