import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type BottomNavKey = 'home' | 'learn' | 'simulate' | 'projects' | 'pro';

type BottomNavigationProps = {
  active: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
};

const items: { key: BottomNavKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'learn', label: 'Aprender', icon: '▤' },
  { key: 'simulate', label: 'Simular', icon: '▷' },
  { key: 'projects', label: 'Projetos', icon: '▣' },
  { key: 'pro', label: 'Pro', icon: '♕' },
];

export function BottomNavigation({ active, onChange }: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={({ pressed }) => [styles.item, selected && styles.itemActive, pressed && styles.pressed]}>
            <Text style={[styles.icon, selected && styles.activeText]}>{item.icon}</Text>
            <Text style={[styles.label, selected && styles.activeText]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.sm,
    marginTop: spacing.xl,
    shadowColor: colors.black,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: spacing.sm,
  },
  itemActive: {
    backgroundColor: colors.cyanSoft,
    borderColor: colors.cyan,
    borderWidth: 1,
  },
  icon: {
    color: colors.textDim,
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  activeText: {
    color: colors.cyan,
  },
  pressed: {
    opacity: 0.75,
  },
});
