import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { privacyPolicyDraft, storeListingDraft, storeScreenshotPlan } from '../release/storeListingDraft';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const StoreListingPanel = memo(function StoreListingPanel() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Play Store</Text>
          <Text style={styles.title}>Rascunho da página de divulgação</Text>
          <Text style={styles.subtitle}>Texto base para nome, descrição, prints, palavras-chave e política de privacidade antes do teste fechado.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DRAFT</Text>
        </View>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Nomes candidatos</Text>
        <View style={styles.chipRow}>
          {storeListingDraft.appNameCandidates.map((name) => <Text key={name} style={styles.chip}>{name}</Text>)}
        </View>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Descrição curta</Text>
        <Text style={styles.bodyText}>{storeListingDraft.shortDescription}</Text>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Descrição longa</Text>
        {storeListingDraft.fullDescription.map((paragraph) => <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>)}
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Recursos principais</Text>
        {storeListingDraft.featureBullets.map((feature) => <Text key={feature} style={styles.bullet}>• {feature}</Text>)}
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>Aviso obrigatório</Text>
        <Text style={styles.warningText}>{storeListingDraft.safetyDisclaimer}</Text>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Plano de prints</Text>
        {storeScreenshotPlan.map((shot, index) => (
          <View key={shot.id} style={styles.screenshotCard}>
            <Text style={styles.screenshotIndex}>Print {index + 1}</Text>
            <Text style={styles.screenshotTitle}>{shot.title}</Text>
            <Text style={styles.screenshotText}>{shot.subtitle}</Text>
            <Text style={styles.screenshotTarget}>Tela: {shot.captureTarget}</Text>
            <Text style={styles.screenshotMessage}>{shot.message}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Palavras-chave</Text>
        <View style={styles.chipRow}>
          {storeListingDraft.keywords.map((keyword) => <Text key={keyword} style={styles.keywordChip}>{keyword}</Text>)}
        </View>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Privacidade — base do texto</Text>
        <Text style={styles.bodyText}>{privacyPolicyDraft.summary}</Text>
        {privacyPolicyDraft.dataItems.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}
        <Text style={styles.sectionSubtitle}>Compromissos</Text>
        {privacyPolicyDraft.promises.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  badge: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cyanSoft,
  },
  badgeText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  sectionBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  paragraph: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  bullet: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    color: colors.text,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: colors.surface,
  },
  keywordChip: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: colors.cyanSoft,
  },
  warningBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.goldSoft,
  },
  warningTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  warningText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  screenshotCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  screenshotIndex: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  screenshotTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  screenshotText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  screenshotTarget: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  screenshotMessage: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});
