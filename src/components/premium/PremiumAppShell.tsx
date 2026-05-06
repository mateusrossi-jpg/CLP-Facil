import { memo, ReactNode, useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { ThemeMode, useAppTheme } from '../../theme/theme';

export type PremiumMainRoute = 'home' | 'simulate' | 'lab' | 'hardware' | 'settings';

type PremiumAppShellProps = {
  route: PremiumMainRoute;
  themeMode: ThemeMode;
  onRouteChange: (route: PremiumMainRoute) => void;
  onToggleTheme: () => void;
  children: ReactNode;
};

const navItems: { route: PremiumMainRoute; label: string; short: string }[] = [
  { route: 'home', label: 'Início', short: 'IN' },
  { route: 'simulate', label: 'Simulador', short: 'SIM' },
  { route: 'lab', label: 'Lab 2.5D', short: 'LAB' },
  { route: 'hardware', label: 'Hardware', short: 'HW' },
  { route: 'settings', label: 'Config.', short: 'CFG' },
];

export const PremiumAppShell = memo(function PremiumAppShell({
  route,
  themeMode,
  onRouteChange,
  onToggleTheme,
  children,
}: PremiumAppShellProps) {
  const { width } = useWindowDimensions();
  const theme = useAppTheme();
  const compact = width < 720;
  const styles = useMemo(() => createStyles(theme.colors, compact), [theme.colors, compact]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CLP</Text>
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>CLP Fácil</Text>
            <Text style={styles.brandSubtitle}>Simulador de CLP mobile-first</Text>
          </View>
          <Pressable onPress={onToggleTheme} style={({ pressed }) => [styles.themeButton, pressed && styles.pressed]}>
            <Text style={styles.themeButtonText}>{themeMode === 'dark' ? 'Light' : 'Dark'}</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View style={styles.nav}>
          {navItems.map((item) => {
            const active = item.route === route;
            return (
              <Pressable
                key={item.route}
                onPress={() => onRouteChange(item.route)}
                style={({ pressed }) => [styles.navItem, active && styles.navItemActive, pressed && styles.pressed]}
              >
                <Text style={[styles.navShort, active && styles.navShortActive]}>{item.short}</Text>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.navLabel, active && styles.navLabelActive]}>
                  {compact ? item.short : item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
});

function createStyles(c: ReturnType<typeof useAppTheme>['colors'], compact: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    shell: {
      flex: 1,
      backgroundColor: c.background,
      paddingHorizontal: compact ? spacing.sm : spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    topBar: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: spacing.sm,
      backgroundColor: c.surface,
    },
    brandMark: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cyan,
      backgroundColor: c.cyanSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandMarkText: {
      color: c.cyan,
      fontSize: 12,
      fontWeight: '900',
    },
    brandCopy: {
      flex: 1,
      minWidth: 0,
    },
    brandTitle: {
      color: c.text,
      fontSize: compact ? 18 : 22,
      fontWeight: '900',
    },
    brandSubtitle: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '800',
      marginTop: 2,
    },
    themeButton: {
      minHeight: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.borderStrong,
      backgroundColor: c.surfaceElevated,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeButtonText: {
      color: c.text,
      fontSize: 11,
      fontWeight: '900',
    },
    contentScroll: {
      flex: 1,
    },
    content: {
      width: '100%',
      maxWidth: 1180,
      alignSelf: 'center',
      gap: spacing.md,
      paddingBottom: spacing.lg,
    },
    nav: {
      flexDirection: 'row',
      gap: 5,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: 5,
      backgroundColor: c.surface,
    },
    navItem: {
      flex: 1,
      minWidth: 0,
      minHeight: 46,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 2,
    },
    navItemActive: {
      borderWidth: 1,
      borderColor: c.cyan,
      backgroundColor: c.cyanSoft,
    },
    navShort: {
      color: c.textDim,
      fontSize: 10,
      fontWeight: '900',
    },
    navShortActive: {
      color: c.cyan,
    },
    navLabel: {
      color: c.textMuted,
      fontSize: compact ? 9 : 11,
      fontWeight: '900',
      textAlign: 'center',
    },
    navLabelActive: {
      color: c.text,
    },
    pressed: {
      opacity: 0.75,
    },
  });
}
