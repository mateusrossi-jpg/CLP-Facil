import { getProjectLearningLinkSummary } from '../education/projectLearningLinks';
import { getProjectActionPlan } from './projectActionPlans';
import { getBenchMappingForProject } from './projectBenchMappings';
import type { TrainingProject } from './projectCatalog';
import { getProjectExportPlan } from './projectExportPlans';
import { getIoPointsForProject, getSafetyCriticalIoPoints } from './projectIoMaps';
import { getRungTemplatesForProject } from './projectLadderTemplates';

export type ProjectWorkspaceSummary = {
  projectId: TrainingProject['id'];
  title: string;
  difficulty: TrainingProject['difficulty'];
  learningScore: number;
  readinessScore: number;
  exportReadyTargetCount: number;
  ioPointCount: number;
  rungPreviewCount: number;
  hasBenchMapping: boolean;
  safetyCriticalCount: number;
  nextBestAction: string;
  compactHighlights: string[];
};

export function getProjectWorkspaceSummary(project: TrainingProject): ProjectWorkspaceSummary {
  const learning = getProjectLearningLinkSummary(project.id);
  const actionPlan = getProjectActionPlan(project);
  const exportPlan = getProjectExportPlan(project);
  const ioPoints = getIoPointsForProject(project.id);
  const safetyPoints = getSafetyCriticalIoPoints(project.id);
  const rungs = getRungTemplatesForProject(project.id);
  const bench = getBenchMappingForProject(project.id);
  const nextBestAction = actionPlan.items.find((item) => item.status === 'recommended')?.title
    ?? actionPlan.items.find((item) => item.status === 'attention')?.title
    ?? actionPlan.items[0]?.title
    ?? 'Abrir projeto';

  return {
    projectId: project.id,
    title: project.title,
    difficulty: project.difficulty,
    learningScore: learning.teachingScore,
    readinessScore: actionPlan.readinessScore,
    exportReadyTargetCount: exportPlan.readyTargetCount,
    ioPointCount: ioPoints.length,
    rungPreviewCount: rungs.length,
    hasBenchMapping: Boolean(bench),
    safetyCriticalCount: safetyPoints.length,
    nextBestAction,
    compactHighlights: [
      `${learning.linkedLessons.length} lições`,
      `${learning.linkedPracticeCount} práticas`,
      `${rungs.length} rungs preview`,
      `${ioPoints.length} pontos de I/O`,
      `${exportPlan.readyTargetCount}/3 exportações`,
    ],
  };
}
