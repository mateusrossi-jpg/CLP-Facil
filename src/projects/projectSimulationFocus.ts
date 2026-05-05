import { getTrainingProjectById, type TrainingProject } from './projectCatalog';
import { getIoPointsForProject, getSafetyCriticalIoPoints, type ProjectIoPoint } from './projectIoMaps';
import { getRungTemplatesForProject, type ProjectRungTemplate } from './projectLadderTemplates';

export type ProjectSimulationFocus = {
  project: TrainingProject;
  rungs: ProjectRungTemplate[];
  ioPoints: ProjectIoPoint[];
  safetyPoints: ProjectIoPoint[];
  inputCount: number;
  outputCount: number;
  memoryCount: number;
  timerCount: number;
  counterCount: number;
  diagnosticHint: string;
};

export function getProjectSimulationFocus(projectId: string): ProjectSimulationFocus | undefined {
  const project = getTrainingProjectById(projectId);
  if (!project) return undefined;

  const rungs = getRungTemplatesForProject(project.id);
  const ioPoints = getIoPointsForProject(project.id);
  const safetyPoints = getSafetyCriticalIoPoints(project.id);

  return {
    project,
    rungs,
    ioPoints,
    safetyPoints,
    inputCount: ioPoints.filter((point) => point.kind === 'input').length,
    outputCount: ioPoints.filter((point) => point.kind === 'output').length,
    memoryCount: ioPoints.filter((point) => point.kind === 'memory').length,
    timerCount: ioPoints.filter((point) => point.kind === 'timer').length,
    counterCount: ioPoints.filter((point) => point.kind === 'counter').length,
    diagnosticHint: safetyPoints.length > 0
      ? 'Acompanhe pontos críticos, intertravamentos e saídas antes de usar carga real.'
      : 'Acompanhe estado dos I/Os, linha ativa e último scan durante a simulação.',
  };
}
