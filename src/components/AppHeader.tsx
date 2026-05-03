import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>CLP Fácil</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  kicker: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});
