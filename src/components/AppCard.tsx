import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type AppCardTone = 'default' | 'cyan' | 'green' | 'amber';

type AppCardProps = {
  title: string;
  description: string;
  badge?: string;
  icon?: ReactNode;
  tone?: AppCardTone;
  onPress?: () => void;
};

function toneStyle(tone: AppCardTone) {
  if (tone === 'amber') return styles.cardAmber;
  if (tone === 'green') return styles.cardGreen;
  if (tone === 'cyan') return styles.cardCyan;
  return null;
}

function badgeStyle(tone: AppCardTone) {
  if (tone === 'green') return styles.badgeGreen;
  if (tone === 'cyan') return styles.badgeCyan;
  return styles.badgeAmber;
}

export function AppCard({ title, description, badge, icon, tone = 'default', onPress }: AppCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, toneStyle(tone), pressed && styles.pressed]}>
      <View style={[styles.accent, accentStyle(tone)]} />
      <View style={styles.row}>
        {icon ? <View style={[styles.icon, toneStyle(tone)]}>{icon}</View> : null}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge ? <Text style={[styles.badge, badgeStyle(tone)]}>{badge}</Text> : null}
          </View>
          <Text style={styles.description}>{description}</Text>
        </View>
        {onPress ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

function accentStyle(tone: AppCardTone) {
  if (tone === 'amber') return styles.accentAmber;
  if (tone === 'green') return styles.accentGreen;
  if (tone === 'cyan') return styles.accentCyan;
  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
    overflow: 'hidden',
  },
  cardCyan: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardGreen: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardAmber: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.border,
  },
  accentCyan: {
    backgroundColor: colors.cyan,
  },
  accentGreen: {
    backgroundColor: colors.green,
  },
  accentAmber: {
    backgroundColor: colors.gold,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  badge: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  badgeAmber: {
    color: colors.amber,
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  badgeCyan: {
    color: colors.cyan,
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  badgeGreen: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  chevron: {
    color: colors.cyan,
    fontSize: 26,
    fontWeight: '700',
  },
});
