import { memo, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumTone, premiumToneColor, premiumToneSoft } from './premiumTokens';

type SectionProps = { children: ReactNode; title?: string; subtitle?: string; tone?: PremiumTone };
type BadgeProps = { label: string; tone?: PremiumTone };
type MetricProps = { label: string; value: string | number; hint?: string; tone?: PremiumTone };
type ProgressProps = { value: number; label?: string };

export const PremiumSection = memo(function PremiumSection({ children, title, subtitle, tone = 'cyan' }: SectionProps) {
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <View style={[styles.accent, { backgroundColor: premiumToneColor(tone) }]} />
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      ) : null}
      {children}
    </View>
  );
});

export const PremiumBadge = memo(function PremiumBadge({ label, tone = 'neutral' }: BadgeProps) {
  const color = premiumToneColor(tone);
  return <Text style={[styles.badge, { color, borderColor: color, backgroundColor: premiumToneSoft(tone) }]}>{label}</Text>;
});

export const PremiumMetric = memo(function PremiumMetric({ label, value, hint, tone = 'cyan' }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: premiumToneColor(tone) }]}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
});

export const PremiumProgress = memo(function PremiumProgress({ value, label }: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressBlock}>
      {label ? <Text style={styles.progressLabel}>{label}</Text> : null}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${safeValue}%` }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accent: { width: 4, height: 34, borderRadius: 999 },
  copy: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
  },
  metric: {
    flex: 1,
    minWidth: 96,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  metricValue: { fontSize: 20, lineHeight: 25, fontWeight: '900', marginTop: 3 },
  metricHint: { color: colors.textMuted, fontSize: 10, lineHeight: 14, marginTop: 2 },
  progressBlock: { gap: spacing.xs },
  progressLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    borderColor: colors.border,
    borderWidth: 1,
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.green },
});
