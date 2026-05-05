import { trainingProjects } from './projectCatalog';
import { getRungTemplatesForProject, projectRungTemplates } from './projectLadderTemplates';

type ProjectLadderTemplatesRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectLadderTemplatesRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectLadderTemplatesRegressionSuite(): ProjectLadderTemplatesRegressionResult[] {
  const everyTemplateHasProject = projectRungTemplates.every((rung) => trainingProjects.some((project) => project.id === rung.projectId));
  const everyTemplateHasLogic = projectRungTemplates.every((rung) => rung.conditions.length > 0 && rung.output.length > 0 && rung.outputDescription.length > 0);
  const requiredProjects = ['partida-direta', 'selo', 'reversao', 'semaforo', 'esteira', 'reservatorio'];
  const requiredProjectsHaveTemplates = requiredProjects.every((projectId) => getRungTemplatesForProject(projectId).length > 0);
  const seloTemplates = getRungTemplatesForProject('selo');
  const orderedSeloTemplates = seloTemplates.every((rung, index, array) => index === 0 || array[index - 1].rungNumber <= rung.rungNumber);

  return [
    assertResult(
      'templates ladder apontam para projetos existentes',
      everyTemplateHasProject,
      `templates=${projectRungTemplates.map((rung) => `${rung.id}:${rung.projectId}`).join(',')}`,
    ),
    assertResult(
      'templates ladder possuem condicoes e saida',
      everyTemplateHasLogic,
      `templates=${projectRungTemplates.length}`,
    ),
    assertResult(
      'projetos principais possuem previa ladder compacta',
      requiredProjectsHaveTemplates,
      `missing=${requiredProjects.filter((projectId) => getRungTemplatesForProject(projectId).length === 0).join(',')}`,
    ),
    assertResult(
      'templates de selo permanecem ordenados por numero de rung',
      seloTemplates.length >= 2 && orderedSeloTemplates,
      `selo=${seloTemplates.map((rung) => rung.rungNumber).join(',')}`,
    ),
  ];
}
