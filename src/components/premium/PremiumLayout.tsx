import { memo, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type ScreenProps = { children: ReactNode };
type HeaderProps = { title: string; subtitle?: string; eyebrow?: string; right?: ReactNode };

export function PremiumScreen({ children }: ScreenProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export const PremiumHeader = memo(function PremiumHeader({ title, subtitle, eyebrow = 'Easy-PLC', right }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  screen: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '900', marginTop: 4 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
});
