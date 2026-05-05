import { trainingProjects } from './projectCatalog';
import { getProjectQuickActions } from './projectQuickActions';

type ProjectQuickActionsRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectQuickActionsRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectQuickActionsRegressionSuite(): ProjectQuickActionsRegressionResult[] {
  const actionSets = trainingProjects.map((project) => ({ project, actions: getProjectQuickActions(project) }));
  const everyProjectHasFiveActions = actionSets.every((set) => set.actions.length === 5);
  const everyProjectHasCoreActions = actionSets.every((set) => {
    const kinds = set.actions.map((action) => action.kind);
    return ['study', 'simulate', 'technical', 'bench', 'code'].every((kind) => kinds.includes(kind as never));
  });
  const everyActionHasUiData = actionSets.every((set) =>
    set.actions.every((action) => action.title.length > 3 && action.description.length > 15 && action.icon.length > 0 && action.tone.length > 0),
  );
  const everyProjectHasAtLeastOneEnabledAction = actionSets.every((set) => set.actions.some((action) => action.enabled));
  const seloActions = getProjectQuickActions(trainingProjects.find((project) => project.id === 'selo') ?? trainingProjects[0]);
  const seloHasFullFlow = ['study', 'simulate', 'technical', 'bench', 'code'].every((kind) =>
    seloActions.some((action) => action.kind === kind && action.enabled),
  );

  return [
    assertResult(
      'acoes rapidas possuem cinco atalhos por projeto',
      everyProjectHasFiveActions,
      `actions=${actionSets.map((set) => `${set.project.id}:${set.actions.length}`).join(',')}`,
    ),
    assertResult(
      'acoes rapidas cobrem estudo simulacao tecnico bancada codigo',
      everyProjectHasCoreActions,
      `kinds=${actionSets.map((set) => `${set.project.id}:${set.actions.map((action) => action.kind).join('|')}`).join(',')}`,
    ),
    assertResult(
      'acoes rapidas possuem dados visuais suficientes',
      everyActionHasUiData,
      'alguma ação ficou sem título, descrição, ícone ou tom',
    ),
    assertResult(
      'cada projeto possui ao menos uma acao rapida ativa',
      everyProjectHasAtLeastOneEnabledAction,
      `enabled=${actionSets.map((set) => `${set.project.id}:${set.actions.filter((action) => action.enabled).length}`).join(',')}`,
    ),
    assertResult(
      'projeto selo possui fluxo completo de acoes rapidas ativo',
      seloHasFullFlow,
      `selo=${seloActions.map((action) => `${action.kind}:${action.enabled}`).join(',')}`,
    ),
  ];
}
