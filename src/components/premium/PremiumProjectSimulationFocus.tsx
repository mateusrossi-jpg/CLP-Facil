import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ProjectNavigationIntent } from '../../projects/projectNavigationIntent';
import { getProjectIoKindLabel, type ProjectIoKind } from '../../projects/projectIoMaps';
import { getProjectSimulationFocus } from '../../projects/projectSimulationFocus';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumSection } from './PremiumCards';

type PremiumProjectSimulationFocusProps = {
  intent?: ProjectNavigationIntent;
};

const visibleKinds: ProjectIoKind[] = ['input', 'output', 'memory', 'timer', 'counter'];

export const PremiumProjectSimulationFocus = memo(function PremiumProjectSimulationFocus({ intent }: PremiumProjectSimulationFocusProps) {
  if (!intent) return null;

  const focus = getProjectSimulationFocus(intent.projectId);
  if (!focus) return null;

  return (
    <PremiumSection title="Foco de simulação" subtitle="Rungs e I/Os do projeto selecionado" tone="cyan">
      <View style={styles.projectCard}>
        <View style={styles.projectCopy}>
          <Text style={styles.eyebrow}>Projeto para simular</Text>
          <Text style={styles.title}>{focus.project.title}</Text>
          <Text style={styles.description}>{focus.project.description}</Text>
        </View>
        <View style={styles.badgeRow}>
          <PremiumBadge label={`${focus.rungs.length} rungs`} tone="cyan" />
          <PremiumBadge label={`${focus.ioPoints.length} I/O`} tone="green" />
          {focus.safetyPoints.length > 0 ? <PremiumBadge label={`${focus.safetyPoints.length} críticos`} tone="amber" /> : null}
        </View>
      </View>

      <View style={styles.diagnosticBox}>
        <Text style={styles.diagnosticTitle}>Dica de diagnóstico</Text>
        <Text style={styles.diagnosticText}>{focus.diagnosticHint}</Text>
      </View>

      {visibleKinds.map((kind) => {
        const points = focus.ioPoints.filter((point) => point.kind === kind);
        if (points.length === 0) return null;
        return (
          <View key={kind} style={styles.ioGroup}>
            <Text style={styles.groupTitle}>{getProjectIoKindLabel(kind)}</Text>
            <View style={styles.chipRow}>
              {points.map((point) => (
                <Text key={point.id} style={[styles.ioChip, point.safetyCritical && styles.ioChipCritical]}>
                  {point.tag} • {point.label}
                </Text>
              ))}
            </View>
          </View>
        );
      })}

      {focus.rungs.length > 0 ? (
        <View style={styles.rungList}>
          {focus.rungs.slice(0, 3).map((rung) => (
            <View key={rung.id} style={styles.rungCard}>
              <View style={styles.rungTop}>
                <Text style={styles.rungNumber}>R{rung.rungNumber}</Text>
                <View style={styles.rungCopy}>
                  <Text style={styles.rungTitle}>{rung.title}</Text>
                  <Text style={styles.rungText}>{rung.description}</Text>
                </View>
              </View>
              <View style={styles.rungLogic}>
                <Text style={styles.rungCondition}>{rung.conditions.join(' + ')}</Text>
                <Text style={styles.rungArrow}>→</Text>
                <Text style={styles.rungOutput}>{rung.output}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </PremiumSection>
  );
});

const styles = StyleSheet.create({
  projectCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: spacing.md, backgroundColor: colors.surfaceElevated, gap: spacing.sm },
  projectCopy: { gap: 3 },
  eyebrow: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '900' },
  description: { color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  diagnosticBox: { borderColor: colors.green, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.greenSoft, gap: 3 },
  diagnosticTitle: { color: colors.green, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  diagnosticText: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  ioGroup: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.surfaceElevated, gap: spacing.xs },
  groupTitle: { color: colors.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  ioChip: { color: colors.textMuted, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 5, fontSize: 10, fontWeight: '900', backgroundColor: colors.surface },
  ioChipCritical: { color: colors.amber, borderColor: colors.amber, backgroundColor: colors.amberSoft },
  rungList: { gap: spacing.sm },
  rungCard: { borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: spacing.sm, backgroundColor: colors.surfaceElevated, gap: spacing.sm },
  rungTop: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  rungNumber: { color: colors.cyan, fontSize: 11, fontWeight: '900', borderColor: colors.cyan, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: colors.cyanSoft },
  rungCopy: { flex: 1, minWidth: 0 },
  rungTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '900' },
  rungText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, fontWeight: '800' },
  rungLogic: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rungCondition: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15, fontWeight: '800' },
  rungArrow: { color: colors.green, fontSize: 16, fontWeight: '900' },
  rungOutput: { color: colors.green, fontSize: 11, lineHeight: 16, fontWeight: '900' },
});
