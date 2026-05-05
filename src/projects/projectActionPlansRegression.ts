import { trainingProjects } from './projectCatalog';
import { getProjectActionPlan } from './projectActionPlans';

type ProjectActionPlansRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectActionPlansRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectActionPlansRegressionSuite(): ProjectActionPlansRegressionResult[] {
  const plans = trainingProjects.map((project) => getProjectActionPlan(project));
  const everyPlanHasProject = plans.every((plan) => trainingProjects.some((project) => project.id === plan.projectId));
  const everyReadinessInRange = plans.every((plan) => plan.readinessScore >= 0 && plan.readinessScore <= 100);
  const everyPlanHasFiveSteps = plans.every((plan) => plan.items.length === 5);
  const everyPlanHasCoreActions = plans.every((plan) => {
    const kinds = plan.items.map((item) => item.kind);
    return ['study', 'simulate', 'edit', 'bench', 'export'].every((kind) => kinds.includes(kind as never));
  });
  const everyItemHasChecklist = plans.every((plan) =>
    plan.items.every((item) => item.title.length > 3 && item.description.length > 20 && item.checklist.length >= 3),
  );
  const seloPlan = getProjectActionPlan(trainingProjects.find((project) => project.id === 'selo') ?? trainingProjects[0]);
  const seloReadyEnough = seloPlan.readinessScore >= 80 && seloPlan.items.some((item) => item.kind === 'bench' && item.status === 'attention');

  return [
    assertResult(
      'planos de acao apontam para projetos existentes',
      everyPlanHasProject,
      `plans=${plans.map((plan) => plan.projectId).join(',')}`,
    ),
    assertResult(
      'score de prontidao dos projetos fica entre 0 e 100',
      everyReadinessInRange,
      `scores=${plans.map((plan) => `${plan.projectId}:${plan.readinessScore}`).join(',')}`,
    ),
    assertResult(
      'planos de acao possuem fluxo estudo simulacao edicao bancada exportacao',
      everyPlanHasFiveSteps && everyPlanHasCoreActions,
      `items=${plans.map((plan) => `${plan.projectId}:${plan.items.map((item) => item.kind).join('|')}`).join(',')}`,
    ),
    assertResult(
      'itens dos planos possuem descricao e checklist',
      everyItemHasChecklist,
      'algum item ficou sem descricao ou checklist suficiente',
    ),
    assertResult(
      'projeto selo permanece pronto e com atencao para bancada fisica',
      seloReadyEnough,
      `selo readiness=${seloPlan.readinessScore}; statuses=${seloPlan.items.map((item) => `${item.kind}:${item.status}`).join(',')}`,
    ),
  ];
}
