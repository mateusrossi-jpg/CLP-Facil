import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getProjectExportCodePreviews } from '../../projects/projectExportCodePreviews';
import type { TrainingProject } from '../../projects/projectCatalog';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumSection } from './PremiumCards';

type PremiumProjectExportCodePreviewsProps = {
  project: TrainingProject;
};

export const PremiumProjectExportCodePreviews = memo(function PremiumProjectExportCodePreviews({ project }: PremiumProjectExportCodePreviewsProps) {
  const previews = getProjectExportCodePreviews(project);

  if (previews.length === 0) {
    return null;
  }

  return (
    <PremiumSection title="Prévia de código" subtitle="Geração didática baseada no mapa de bancada" tone="cyan">
      {previews.map((preview) => (
        <View key={preview.target} style={styles.previewCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{preview.label}</Text>
              <Text style={styles.fileName}>{preview.fileName}</Text>
            </View>
            <PremiumBadge label={preview.language.toUpperCase()} tone={preview.language === 'yaml' ? 'amber' : 'cyan'} />
          </View>

          {preview.warnings.map((warning) => (
            <View key={warning} style={styles.warningBox}>
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeScroll}>
            <Text style={styles.codeText}>{preview.code}</Text>
          </ScrollView>
        </View>
      ))}
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  previewCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900' },
  fileName: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '800', marginTop: 2 },
  warningBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.amberSoft,
  },
  warningText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  codeScroll: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#020817',
  },
  codeText: {
    color: '#F8FAFC',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    padding: spacing.md,
  },
});
