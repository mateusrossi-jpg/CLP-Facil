import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type BrandLogoProps = {
  compact?: boolean;
  markOnly?: boolean;
};

export function BrandLogo({ compact, markOnly }: BrandLogoProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <View style={styles.railRow}>
          <View style={styles.rail} />
          <View style={styles.contact}>
            <View style={styles.contactBar} />
            <View style={styles.contactGap} />
            <View style={styles.contactBar} />
          </View>
          <View style={styles.coil}>
            <Text style={[styles.coilText, compact && styles.coilTextCompact]}>E</Text>
          </View>
        </View>
      </View>
      {markOnly ? null : (
        <View style={styles.wordBox}>
          <Text style={[styles.brand, compact && styles.brandCompact]}>
            Easy<Text style={styles.brandAccent}>-CLP</Text>
          </Text>
          {!compact ? <Text style={styles.tagline}>Ladder e automação na prática</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mark: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: colors.black,
    borderColor: colors.slate,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  markCompact: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  railRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {
    width: 14,
    height: 2,
    backgroundColor: colors.gold,
  },
  contact: {
    width: 24,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  contactBar: {
    width: 3,
    height: 24,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  contactGap: {
    width: 5,
    height: 2,
    backgroundColor: colors.gold,
  },
  coil: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderColor: colors.cyanGlow,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  coilText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
  coilTextCompact: {
    fontSize: 12,
  },
  wordBox: {
    flexShrink: 1,
  },
  brand: {
    color: colors.text,
    fontSize: 37,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandCompact: {
    fontSize: 17,
  },
  brandAccent: {
    color: colors.gold,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 2,
  },
});
