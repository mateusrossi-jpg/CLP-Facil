import { trainingProjects } from './projectCatalog';
import { createEditorProjectFromTrainingProject, createEditorProjectFromTrainingProjectId } from './projectEditorAdapter';
import { getIoPointsForProject } from './projectIoMaps';
import { getRungTemplatesForProject } from './projectLadderTemplates';

type ProjectEditorAdapterRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectEditorAdapterRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectEditorAdapterRegressionSuite(): ProjectEditorAdapterRegressionResult[] {
  const adaptedProjects = trainingProjects.map((project) => ({
    project,
    editor: createEditorProjectFromTrainingProject(project),
    ioPoints: getIoPointsForProject(project.id),
    templates: getRungTemplatesForProject(project.id),
  }));

  const everyProjectHasVariables = adaptedProjects.every((entry) =>
    (entry.editor.projectVariables?.length ?? 0) === entry.ioPoints.length && entry.ioPoints.length > 0,
  );
  const everyProjectHasRungs = adaptedProjects.every((entry) =>
    entry.editor.rungs.length === entry.templates.length && entry.templates.length > 0,
  );
  const everyRungHasLogicAndCoil = adaptedProjects.every((entry) =>
    entry.editor.rungs.every((rung) => rung.seriesBlocks.length > 0 && Boolean(rung.coilBlock)),
  );
  const everySelectedRungIsValid = adaptedProjects.every((entry) =>
    entry.editor.rungs.some((rung) => rung.id === entry.editor.selectedRungId),
  );
  const invalidProjectReturnsUndefined = createEditorProjectFromTrainingProjectId('projeto-inexistente') === undefined;

  const selo = createEditorProjectFromTrainingProjectId('selo');
  const seloIsUseful = Boolean(
    selo &&
      selo.projectVariables?.some((variable) => variable.address === 'I0.0' && variable.scope === 'input') &&
      selo.projectVariables?.some((variable) => variable.address === 'Q0.0' && variable.scope === 'output') &&
      selo.rungs.length >= 2 &&
      selo.rungs.some((rung) => rung.coilBlock?.variable === 'Q0.0') &&
      selo.rungs.some((rung) => rung.coilBlock?.variable === 'M0.0'),
  );

  const semaforo = createEditorProjectFromTrainingProjectId('semaforo');
  const semaforoHasThreeOutputs = Boolean(
    semaforo &&
      ['Q0.0', 'Q0.1', 'Q0.2'].every((address) =>
        semaforo.rungs.some((rung) => rung.coilBlock?.variable === address),
      ),
  );

  return [
    assertResult(
      'adaptador cria variaveis para todos os pontos de IO',
      everyProjectHasVariables,
      `vars=${adaptedProjects.map((entry) => `${entry.project.id}:${entry.editor.projectVariables?.length ?? 0}/${entry.ioPoints.length}`).join(',')}`,
    ),
    assertResult(
      'adaptador cria rungs para todos os templates',
      everyProjectHasRungs,
      `rungs=${adaptedProjects.map((entry) => `${entry.project.id}:${entry.editor.rungs.length}/${entry.templates.length}`).join(',')}`,
    ),
    assertResult(
      'rungs adaptados possuem contatos e saida funcional',
      everyRungHasLogicAndCoil,
      'algum rung adaptado ficou sem lógica ou sem coilBlock',
    ),
    assertResult(
      'selectedRungId aponta para rung existente',
      everySelectedRungIsValid,
      `selected=${adaptedProjects.map((entry) => `${entry.project.id}:${entry.editor.selectedRungId}`).join(',')}`,
    ),
    assertResult(
      'projeto inexistente nao gera editor project',
      invalidProjectReturnsUndefined,
      'createEditorProjectFromTrainingProjectId deveria retornar undefined para id invalido',
    ),
    assertResult(
      'projeto selo vira editor project util para execucao mobile',
      seloIsUseful,
      `selo=${selo ? JSON.stringify({ vars: selo.projectVariables?.length, rungs: selo.rungs.length, coils: selo.rungs.map((rung) => rung.coilBlock?.variable) }) : 'undefined'}`,
    ),
    assertResult(
      'semaforo preserva tres saidas principais no editor project',
      semaforoHasThreeOutputs,
      `semaforo=${semaforo ? semaforo.rungs.map((rung) => rung.coilBlock?.variable).join(',') : 'undefined'}`,
    ),
  ];
}
