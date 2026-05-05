import { trainingProjects } from './projectCatalog';
import {
  getIoPointsByKind,
  getIoPointsForProject,
  getSafetyCriticalIoPoints,
  projectIoPoints,
} from './projectIoMaps';

type ProjectIoMapsRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectIoMapsRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectIoMapsRegressionSuite(): ProjectIoMapsRegressionResult[] {
  const everyPointHasProject = projectIoPoints.every((point) => trainingProjects.some((project) => project.id === point.projectId));
  const everyPointHasCoreFields = projectIoPoints.every((point) => point.id && point.tag && point.label && point.description.length > 10);
  const everyProjectHasSomeIo = trainingProjects.every((project) => getIoPointsForProject(project.id).length > 0);
  const requiredProjectsHaveOutputs = ['partida-direta', 'selo', 'reversao', 'semaforo', 'esteira', 'reservatorio'].every((projectId) =>
    getIoPointsByKind(projectId, 'output').length > 0,
  );
  const safetyProjectsHaveCriticalPoints = ['partida-direta', 'reversao', 'estrela-triangulo', 'bomba-alternada', 'portao-automatico', 'reservatorio'].every((projectId) =>
    getSafetyCriticalIoPoints(projectId).length > 0,
  );
  const seloHasInputOutputMemory =
    getIoPointsByKind('selo', 'input').length >= 2 &&
    getIoPointsByKind('selo', 'output').length >= 1 &&
    getIoPointsByKind('selo', 'memory').length >= 1;

  return [
    assertResult(
      'mapa de IO aponta para projetos existentes',
      everyPointHasProject,
      `points=${projectIoPoints.map((point) => `${point.id}:${point.projectId}`).join(',')}`,
    ),
    assertResult(
      'pontos de IO possuem tag, label e descricao',
      everyPointHasCoreFields,
      `points=${projectIoPoints.length}`,
    ),
    assertResult(
      'todos os projetos possuem ao menos um ponto de IO',
      everyProjectHasSomeIo,
      `missing=${trainingProjects.filter((project) => getIoPointsForProject(project.id).length === 0).map((project) => project.id).join(',')}`,
    ),
    assertResult(
      'projetos principais possuem saidas mapeadas',
      requiredProjectsHaveOutputs,
      'outputs obrigatorias ausentes em algum projeto principal',
    ),
    assertResult(
      'projetos com risco possuem pontos criticos sinalizados',
      safetyProjectsHaveCriticalPoints,
      'algum projeto de risco ficou sem safetyCritical',
    ),
    assertResult(
      'projeto selo possui entradas, saida e memoria didatica',
      seloHasInputOutputMemory,
      `selo inputs=${getIoPointsByKind('selo', 'input').length}; outputs=${getIoPointsByKind('selo', 'output').length}; memories=${getIoPointsByKind('selo', 'memory').length}`,
    ),
  ];
}
