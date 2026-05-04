import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { BrandLogo } from './BrandLogo';

export function HomeHero() {
  return (
    <View style={styles.container}>
      <View style={styles.heroTop}>
        <View style={styles.logoWrap}>
          <BrandLogo />
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Laboratório Ladder</Text>
        </View>
      </View>
      <View style={styles.textBox}>
        <Text style={styles.headline}>Aprenda Ladder com uma bancada visual, clara e profissional.</Text>
        <Text style={styles.description}>Lições guiadas, bancada de simulação e testes passo a passo para aprender lógica de CLP com clareza.</Text>
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>TON</Text>
            <Text style={styles.metricLabel}>Timers</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>CTU</Text>
            <Text style={styles.metricLabel}>Contadores</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>LAD</Text>
            <Text style={styles.metricLabel}>Simulação</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: spacing.md,
    columnGap: spacing.lg,
  },
  logoWrap: {
    minWidth: 0,
    flexShrink: 1,
  },
  textBox: {
    marginTop: spacing.xl,
  },
  heroBadge: {
    flexShrink: 0,
    maxWidth: '100%',
    alignSelf: 'flex-start',
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headline: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 96,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
});
