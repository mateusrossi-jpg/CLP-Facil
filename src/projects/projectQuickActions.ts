import { getProjectActionPlan } from './projectActionPlans';
import type { TrainingProject } from './projectCatalog';
import { getProjectExportPlan } from './projectExportPlans';
import { getProjectWorkspaceSummary } from './projectWorkspaceSummary';

export type ProjectQuickActionKind = 'study' | 'simulate' | 'technical' | 'bench' | 'code';

export type ProjectQuickAction = {
  kind: ProjectQuickActionKind;
  title: string;
  description: string;
  tone: 'cyan' | 'green' | 'amber' | 'purple' | 'neutral';
  icon: string;
  enabled: boolean;
};

export function getProjectQuickActions(project: TrainingProject): ProjectQuickAction[] {
  const summary = getProjectWorkspaceSummary(project);
  const actionPlan = getProjectActionPlan(project);
  const exportPlan = getProjectExportPlan(project);
  const benchAction = actionPlan.items.find((item) => item.kind === 'bench');
  const studyAction = actionPlan.items.find((item) => item.kind === 'study');
  const simulateAction = actionPlan.items.find((item) => item.kind === 'simulate');
  const editAction = actionPlan.items.find((item) => item.kind === 'edit');
  const exportAction = actionPlan.items.find((item) => item.kind === 'export');

  return [
    {
      kind: 'study',
      title: 'Estudar lição',
      description: studyAction?.description ?? 'Abrir conteúdo educativo vinculado ao projeto.',
      tone: summary.learningScore > 0 ? 'green' : 'amber',
      icon: '◎',
      enabled: summary.learningScore > 0,
    },
    {
      kind: 'simulate',
      title: 'Simular no celular',
      description: simulateAction?.description ?? 'Abrir execução mobile com rung compacto.',
      tone: summary.rungPreviewCount > 0 ? 'cyan' : 'amber',
      icon: '▶',
      enabled: summary.rungPreviewCount > 0,
    },
    {
      kind: 'technical',
      title: 'Ver técnico',
      description: editAction?.description ?? 'Abrir mapa de I/O, rungs, bancada e diagnóstico.',
      tone: summary.ioPointCount > 0 ? 'purple' : 'amber',
      icon: '⌘',
      enabled: summary.ioPointCount > 0,
    },
    {
      kind: 'bench',
      title: 'Montar bancada',
      description: benchAction?.description ?? 'Revisar pinos e notas de segurança.',
      tone: summary.safetyCriticalCount > 0 ? 'amber' : 'green',
      icon: '⚡',
      enabled: summary.hasBenchMapping,
    },
    {
      kind: 'code',
      title: 'Ver código',
      description: exportAction?.description ?? 'Abrir prévias Arduino, ESP32 e ESPHome.',
      tone: exportPlan.readyTargetCount > 0 ? 'cyan' : 'amber',
      icon: '{ }',
      enabled: exportPlan.readyTargetCount > 0,
    },
  ];
}
