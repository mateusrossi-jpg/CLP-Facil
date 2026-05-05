import { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TrainingProject } from '../../projects/projectCatalog';
import type { ProjectQuickActionKind } from '../../projects/projectQuickActions';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumSegmented } from './PremiumControls';
import { PremiumProjectDetailCard } from './PremiumProjectDetailCard';
import { PremiumProjectExportCodePreviews } from './PremiumProjectExportCodePreviews';
import { PremiumProjectQuickSummary } from './PremiumProjectQuickSummary';

type ProjectWorkspaceTab = 'summary' | 'technical' | 'code';

type PremiumProjectWorkspaceProps = {
  project: TrainingProject;
};

function getTabForQuickAction(kind: ProjectQuickActionKind): ProjectWorkspaceTab {
  if (kind === 'code') return 'code';
  if (kind === 'technical' || kind === 'bench') return 'technical';
  return 'summary';
}

export const PremiumProjectWorkspace = memo(function PremiumProjectWorkspace({ project }: PremiumProjectWorkspaceProps) {
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

      {tab === 'summary' ? <PremiumProjectQuickSummary project={project} onQuickAction={(kind) => setTab(getTabForQuickAction(kind))} /> : null}
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
