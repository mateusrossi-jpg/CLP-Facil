import { StyleSheet, Text, View } from 'react-native';
import { mandatorySafetyItems, safetyCategories, safetyLevelLabel } from '../safety/safetyCatalog';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

function levelTone(level: string) {
  if (level === 'mandatory') return styles.mandatoryBadge;
  if (level === 'recommended') return styles.recommendedBadge;
  return styles.attentionBadge;
}

function levelTextTone(level: string) {
  if (level === 'mandatory') return styles.mandatoryText;
  if (level === 'recommended') return styles.recommendedText;
  return styles.attentionText;
}

export function SafetyReadinessPanel() {
  const mandatoryCount = mandatorySafetyItems().length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Segurança e validação</Text>
          <Text style={styles.title}>Checklist para bancada e divulgação</Text>
          <Text style={styles.subtitle}>Use esta referência para manter o app didático, seguro e honesto ao exportar lógica para microcontroladores.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{mandatoryCount} críticos</Text>
        </View>
      </View>

      <View style={styles.mainWarning}>
        <Text style={styles.mainWarningTitle}>Regra de ouro</Text>
        <Text style={styles.mainWarningText}>O Easy-CLP pode ensinar, simular e gerar código de bancada. Ele não substitui CLP certificado, cadeia de segurança, projeto elétrico profissional ou proteção física independente.</Text>
      </View>

      <View style={styles.categoryList}>
        {safetyCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryTitleBox}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySummary}>{category.summary}</Text>
              </View>
              <View style={[styles.levelBadge, levelTone(category.level)]}>
                <Text style={[styles.levelBadgeText, levelTextTone(category.level)]}>{safetyLevelLabel(category.level)}</Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Atenção</Text>
              <Text style={styles.warningText}>{category.warning}</Text>
            </View>

            <View style={styles.checklistBox}>
              <Text style={styles.sectionTitle}>Checklist</Text>
              {category.checklist.map((item) => (
                <Text key={item.id} style={styles.checkItem}>• {item.text}</Text>
              ))}
            </View>

            <View style={styles.supportBox}>
              <Text style={styles.sectionTitleSupport}>Como o app apoia</Text>
              {category.appSupport.map((item) => (
                <Text key={item} style={styles.supportItem}>• {item}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

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
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.goldSoft,
  },
  badgeText: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
  },
  mainWarning: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.redSoft,
  },
  mainWarningTitle: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  mainWarningText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  categoryList: {
    gap: spacing.md,
  },
  categoryCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  categoryTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  categoryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  categorySummary: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  levelBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  mandatoryBadge: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  recommendedBadge: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  attentionBadge: {
    borderColor: colors.amber,
    backgroundColor: colors.goldSoft,
  },
  mandatoryText: {
    color: colors.red,
  },
  recommendedText: {
    color: colors.green,
  },
  attentionText: {
    color: colors.amber,
  },
  warningBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.goldSoft,
  },
  warningTitle: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  warningText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  checklistBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  checkItem: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  supportBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.black,
  },
  sectionTitleSupport: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  supportItem: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
