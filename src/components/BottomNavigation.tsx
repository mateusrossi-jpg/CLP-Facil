import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type BottomNavKey = 'home' | 'learn' | 'simulate' | 'projects' | 'pro';

type BottomNavigationProps = {
  active: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
  compact?: boolean;
};

const items: { key: BottomNavKey; label: string; shortLabel: string }[] = [
  { key: 'home', label: 'Início', shortLabel: 'Início' },
  { key: 'learn', label: 'Aprender', shortLabel: 'Aula' },
  { key: 'simulate', label: 'Simular', shortLabel: 'Sim' },
  { key: 'projects', label: 'Hardware', shortLabel: 'HW' },
  { key: 'pro', label: 'Pro', shortLabel: 'Pro' },
];

export function BottomNavigation({ active, onChange, compact }: BottomNavigationProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={({ pressed }) => [styles.item, compact && styles.itemCompact, selected && styles.itemActive, pressed && styles.pressed]}>
            {selected ? <View style={styles.activeIndicator} /> : null}
            <Text style={[styles.label, compact && styles.labelCompact, selected && styles.activeText]}>{compact ? item.shortLabel : item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    padding: spacing.xs,
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
  },
  itemCompact: {
    borderRadius: 8,
    minHeight: 36,
    paddingVertical: spacing.xs,
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
  label: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '800',
  },
  labelCompact: {
    fontSize: 11,
  },
  activeText: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.75,
  },
});
