import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumTone, premiumToneColor, premiumToneSoft } from './premiumTokens';

type SegmentOption<T extends string> = { value: T; label: string };
type SegmentedProps<T extends string> = { value: T; options: SegmentOption<T>[]; onChange: (value: T) => void };
type ActionTileProps = { title: string; description?: string; icon?: string; tone?: PremiumTone; onPress?: () => void };

export function PremiumSegmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segmentButton, selected && styles.segmentButtonActive]}>
            <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PremiumActionTile({ title, description, icon = '⌁', tone = 'cyan', onPress }: ActionTileProps) {
  const color = premiumToneColor(tone);
  return (
    <Pressable onPress={onPress} style={styles.actionTile}>
      <View style={[styles.actionIcon, { borderColor: color, backgroundColor: premiumToneSoft(tone) }]}>
        <Text style={[styles.actionIconText, { color }]}>{icon}</Text>
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        {description ? <Text style={styles.actionDescription}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    backgroundColor: colors.surfaceElevated,
  },
  segmentButton: { flex: 1, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  segmentButtonActive: { backgroundColor: colors.cyanSoft, borderColor: colors.cyan, borderWidth: 1 },
  segmentText: { color: colors.textMuted, fontSize: 11, fontWeight: '900' },
  segmentTextActive: { color: colors.cyan },
  actionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: { fontSize: 20, fontWeight: '900' },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  actionDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
});
