import { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { createProfessionalTagRows, createRungCommentRows, EducationalForceMap, EducationalForceMode } from '../simulation/professionalClpView';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProfessionalClpPanelProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  forces?: EducationalForceMap;
  rungComments?: Record<string, string>;
  onSetForce?: (tag: string, force: EducationalForceMode) => void;
};

const forceOptions: { mode: EducationalForceMode; label: string }[] = [
  { mode: 'normal', label: 'Normal' },
  { mode: 'force_on', label: 'Force ON' },
  { mode: 'force_off', label: 'Force OFF' },
];

function formatValue(value: boolean | number): string {
  if (typeof value === 'number') return String(value);
  return value ? 'ON' : 'OFF';
}

export const ProfessionalClpPanel = memo(function ProfessionalClpPanel({
  editorProject,
  plcState,
  forces = {},
  rungComments = {},
  onSetForce,
}: ProfessionalClpPanelProps) {
  const tagRows = useMemo(() => createProfessionalTagRows(editorProject, plcState, forces), [editorProject, forces, plcState]);
  const commentRows = useMemo(() => createRungCommentRows(editorProject, rungComments), [editorProject, rungComments]);
  const forcedRows = tagRows.filter((row) => row.forced !== 'normal');
  const forceEditable = Boolean(onSetForce);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>CLP profissional</Text>
          <Text style={styles.title}>Tags, comentários e force didático</Text>
        </View>
        <View style={[styles.forceBadge, forcedRows.length > 0 && styles.forceBadgeActive]}>
          <Text style={[styles.forceBadgeText, forcedRows.length > 0 && styles.forceBadgeTextActive]}>
            {forcedRows.length > 0 ? `${forcedRows.length} FORCE` : 'NORMAL'}
          </Text>
        </View>
      </View>

      {forcedRows.length > 0 ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Alerta de segurança</Text>
          <Text style={styles.warningText}>{forcedRows[0].safetyWarning}</Text>
        </View>
      ) : null}

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Tabela de tags</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.tagTable}>
          <View>
            <View style={[styles.tagRow, styles.tagHeaderRow]}>
              <Text style={[styles.tagCell, styles.tagHeaderCell, styles.tagNameCell]}>Tag</Text>
              <Text style={[styles.tagCell, styles.tagHeaderCell]}>Tipo</Text>
              <Text style={[styles.tagCell, styles.tagHeaderCell]}>Escopo</Text>
              <Text style={[styles.tagCell, styles.tagHeaderCell]}>Valor</Text>
              <Text style={[styles.tagCell, styles.tagHeaderCell, styles.tagDescriptionCell]}>Descrição</Text>
              <Text style={[styles.tagCell, styles.tagHeaderCell, styles.tagForceCell]}>Forçado</Text>
            </View>
            {tagRows.map((row) => (
              <View key={row.tag} style={[styles.tagRow, row.forced !== 'normal' && styles.tagRowForced]}>
                <Text style={[styles.tagCell, styles.tagNameCell]}>{row.tag}</Text>
                <Text style={styles.tagCell}>{row.type}</Text>
                <Text style={styles.tagCell}>{row.scope}</Text>
                <Text style={[styles.tagCell, row.value && styles.tagCellOn]}>{formatValue(row.value)}</Text>
                <Text style={[styles.tagCell, styles.tagDescriptionCell]} numberOfLines={1}>{row.description}</Text>
                <View style={[styles.tagCell, styles.tagForceCell]}>
                  <Text style={[styles.forceReadout, row.forced !== 'normal' && styles.tagForceOn]}>{row.forcedLabel}</Text>
                  {forceEditable && row.type === 'boolean' ? (
                    <View style={styles.forceButtonRow}>
                      {forceOptions.map((option) => {
                        const selected = row.forced === option.mode;
                        return (
                          <Pressable
                            key={`${row.tag}-${option.mode}`}
                            onPress={() => onSetForce?.(row.tag, option.mode)}
                            style={[styles.forceButton, selected && styles.forceButtonSelected]}
                          >
                            <Text style={[styles.forceButtonText, selected && styles.forceButtonTextSelected]}>{option.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Comentários por rung</Text>
        <View style={styles.commentList}>
          {commentRows.map((row, index) => (
            <View key={row.rungId} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentRung}>Linha {index + 1}</Text>
                <Text style={[styles.commentBadge, row.hasCustomComment && styles.commentBadgeCustom]}>
                  {row.hasCustomComment ? 'Comentado' : 'Auto'}
                </Text>
              </View>
              <Text style={styles.commentLabel} numberOfLines={1}>{row.rungLabel}</Text>
              <Text style={styles.commentText}>{row.comment}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  forceBadge: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.greenSoft,
  },
  forceBadgeActive: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  forceBadgeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  forceBadgeTextActive: {
    color: colors.red,
  },
  warningBox: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.redSoft,
  },
  warningTitle: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  warningText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionBox: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tagTable: {
    paddingBottom: 2,
  },
  tagRow: {
    flexDirection: 'row',
    minHeight: 38,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.surface,
  },
  tagHeaderRow: {
    backgroundColor: colors.black,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tagRowForced: {
    backgroundColor: colors.redSoft,
  },
  tagCell: {
    width: 86,
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tagHeaderCell: {
    color: '#F8FAFC',
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  tagNameCell: {
    width: 88,
    fontFamily: 'monospace',
  },
  tagDescriptionCell: {
    width: 180,
  },
  tagForceCell: {
    width: 238,
  },
  tagCellOn: {
    color: colors.green,
  },
  forceReadout: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },
  tagForceOn: {
    color: colors.red,
    fontWeight: '900',
  },
  forceButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  forceButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: colors.surfaceElevated,
  },
  forceButtonSelected: {
    borderColor: colors.amber,
    backgroundColor: colors.goldSoft,
  },
  forceButtonText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  forceButtonTextSelected: {
    color: colors.amber,
  },
  commentList: {
    gap: spacing.xs,
  },
  commentCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commentRung: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  commentBadge: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: '900',
  },
  commentBadgeCustom: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  commentLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  commentText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
