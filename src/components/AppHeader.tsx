import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { BrandLogo } from './BrandLogo';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export function AppHeader({ title, subtitle, compact }: AppHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <BrandLogo compact />
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  containerCompact: {
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 22,
    letterSpacing: 0,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 620,
  },
  subtitleCompact: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
});
