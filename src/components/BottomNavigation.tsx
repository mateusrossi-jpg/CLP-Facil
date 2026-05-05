import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { BottomNavKey } from './navigationTypes';
import { PremiumRouteContent } from './premium/PremiumRouteContent';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type BottomNavigationProps = {
  active: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
  compact?: boolean;
  renderContent?: boolean;
};

const items: { key: BottomNavKey; label: string; shortLabel: string }[] = [
  { key: 'home', label: 'Início', shortLabel: 'Início' },
  { key: 'learn', label: 'Aprender', shortLabel: 'Aula' },
  { key: 'simulate', label: 'Simular', shortLabel: 'Sim' },
  { key: 'projects', label: 'Projetos', shortLabel: 'Proj' },
  { key: 'pro', label: 'Editor', shortLabel: 'Edit' },
  { key: 'reference', label: 'Ref', shortLabel: 'Ref' },
];

export function BottomNavigation({ active, onChange, compact, renderContent = true }: BottomNavigationProps) {
  const { width } = useWindowDimensions();
  const effectiveCompact = Boolean(compact || width < 720);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, effectiveCompact && styles.containerCompact]}>
        {items.map((item) => {
          const selected = active === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                styles.item,
                effectiveCompact && styles.itemCompact,
                selected && styles.itemActive,
                pressed && styles.pressed,
              ]}
            >
              {selected ? <View style={[styles.activeIndicator, effectiveCompact && styles.activeIndicatorCompact]} /> : null}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                style={[styles.label, effectiveCompact && styles.labelCompact, selected && styles.activeText]}
              >
                {effectiveCompact ? item.shortLabel : item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {renderContent ? <PremiumRouteContent active={active} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.sm,
    marginTop: spacing.xl,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  containerCompact: {
    gap: 3,
    borderRadius: 14,
    padding: 4,
    marginTop: spacing.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    minHeight: 42,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 0,
  },
  itemCompact: {
    borderRadius: 10,
    minHeight: 38,
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  itemActive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  activeIndicator: {
    width: 20,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.gold,
    marginBottom: spacing.xs,
  },
  activeIndicatorCompact: {
    width: 18,
    marginBottom: 3,
  },
  label: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 10,
    letterSpacing: -0.2,
  },
  activeText: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.75,
  },
});
