import { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createProjectNavigationIntent, type ProjectNavigationIntent } from '../../projects/projectNavigationIntent';
import type { TrainingProject } from '../../projects/projectCatalog';
import { getProjectQuickActionNavigation, type ProjectWorkspaceTab } from '../../projects/projectQuickActionNavigation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { BottomNavKey } from '../navigationTypes';
import { PremiumSegmented } from './PremiumControls';
import { PremiumProjectDetailCard } from './PremiumProjectDetailCard';
import { PremiumProjectExportCodePreviews } from './PremiumProjectExportCodePreviews';
import { PremiumProjectQuickSummary } from './PremiumProjectQuickSummary';

type PremiumProjectWorkspaceProps = {
  project: TrainingProject;
  onNavigate?: (route: BottomNavKey, intent?: ProjectNavigationIntent) => void;
};

export const PremiumProjectWorkspace = memo(function PremiumProjectWorkspace({ project, onNavigate }: PremiumProjectWorkspaceProps) {
  const [tab, setTab] = useState<ProjectWorkspaceTab>('summary');

  return (
    <View style={styles.workspace}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Projeto aberto</Text>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.subtitle}>Resumo, dados técnicos e exportação organizados para uso no celular.</Text>
        </View>
      </View>

      <PremiumSegmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'summary', label: 'Resumo' },
          { value: 'technical', label: 'Técnico' },
          { value: 'code', label: 'Código' },
        ]}
      />

      {tab === 'summary' ? (
        <PremiumProjectQuickSummary
          project={project}
          onQuickAction={(kind) => {
            const target = getProjectQuickActionNavigation(kind);
            if (target.route) {
              onNavigate?.(target.route, createProjectNavigationIntent(project, kind, target.route));
              return;
            }
            setTab(target.tab);
          }}
        />
      ) : null}
      {tab === 'technical' ? <PremiumProjectDetailCard project={project} /> : null}
      {tab === 'code' ? <PremiumProjectExportCodePreviews project={project} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  workspace: {
    gap: spacing.md,
  },
  header: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  headerCopy: { gap: spacing.xs },
  eyebrow: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
