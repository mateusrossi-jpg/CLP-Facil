import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { useAppTheme } from '../../theme/theme';

export type PremiumDashboardItem = {
  label: string;
  value: string;
  detail?: string;
  tone?: 'cyan' | 'green' | 'amber' | 'purple' | 'red';
};

type PremiumDashboardProps = {
  items: PremiumDashboardItem[];
};

export const PremiumDashboard = memo(function PremiumDashboard({ items }: PremiumDashboardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const tone = toneColor(theme.colors, item.tone ?? 'cyan');
        return (
          <View key={item.label} style={styles.card}>
            <View style={[styles.dot, { backgroundColor: tone }]} />
            <Text style={styles.label}>{item.label}</Text>
            <Text style={[styles.value, { color: tone }]}>{item.value}</Text>
            {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
          </View>
        );
      })}
    </View>
  );
});

function toneColor(c: ReturnType<typeof useAppTheme>['colors'], tone: NonNullable<PremiumDashboardItem['tone']>) {
  if (tone === 'green') return c.green;
  if (tone === 'amber') return c.amber;
  if (tone === 'purple') return c.purple;
  if (tone === 'red') return c.red;
  return c.cyan;
}

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    card: {
      flexBasis: 145,
      flexGrow: 1,
      minHeight: 104,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      backgroundColor: c.surface,
      padding: spacing.md,
      gap: 4,
    },
    dot: {
      width: 9,
      height: 9,
      borderRadius: 999,
      marginBottom: 2,
    },
    label: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    value: {
      fontSize: 18,
      lineHeight: 23,
      fontWeight: '900',
    },
    detail: {
      color: c.textDim,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '700',
    },
  });
}
