import { trainingProjects } from './projectCatalog';
import { getProjectExportPlan } from './projectExportPlans';

type ProjectExportPlansRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectExportPlansRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectExportPlansRegressionSuite(): ProjectExportPlansRegressionResult[] {
  const plans = trainingProjects.map((project) => getProjectExportPlan(project));
  const everyPlanHasProject = plans.every((plan) => trainingProjects.some((project) => project.id === plan.projectId));
  const everyPlanHasThreeTargets = plans.every((plan) => plan.targets.length === 3);
  const everyPlanHasAllTargets = plans.every((plan) => {
    const targets = plan.targets.map((target) => target.target);
    return ['arduino', 'esp32', 'esphome'].every((target) => targets.includes(target as never));
  });
  const everyTargetHasChecklist = plans.every((plan) =>
    plan.targets.every((target) => target.label.length > 3 && target.pinSummary.length > 5 && target.checklist.length >= 3),
  );
  const readyCountIsValid = plans.every((plan) =>
    plan.readyTargetCount >= 0 &&
    plan.readyTargetCount <= 3 &&
    plan.readyTargetCount === plan.targets.filter((target) => target.status === 'ready' || target.status === 'attention').length,
  );
  const seloPlan = getProjectExportPlan(trainingProjects.find((project) => project.id === 'selo') ?? trainingProjects[0]);
  const seloHasAttentionForPhysicalOutputs =
    seloPlan.targets.length === 3 &&
    seloPlan.readyTargetCount === 3 &&
    seloPlan.targets.some((target) => target.status === 'attention' && target.warnings.length > 0);

  return [
    assertResult(
      'planos de exportacao apontam para projetos existentes',
      everyPlanHasProject,
      `plans=${plans.map((plan) => plan.projectId).join(',')}`,
    ),
    assertResult(
      'planos de exportacao cobrem Arduino ESP32 e ESPHome',
      everyPlanHasThreeTargets && everyPlanHasAllTargets,
      `targets=${plans.map((plan) => `${plan.projectId}:${plan.targets.map((target) => target.target).join('|')}`).join(',')}`,
    ),
    assertResult(
      'alvos de exportacao possuem resumo e checklist',
      everyTargetHasChecklist,
      'algum alvo ficou sem checklist suficiente',
    ),
    assertResult(
      'contador de alvos prontos permanece coerente',
      readyCountIsValid,
      `ready=${plans.map((plan) => `${plan.projectId}:${plan.readyTargetCount}`).join(',')}`,
    ),
    assertResult(
      'projeto selo exporta para tres alvos com alerta de saida fisica',
      seloHasAttentionForPhysicalOutputs,
      `selo=${seloPlan.targets.map((target) => `${target.target}:${target.status}:${target.warnings.length}`).join(',')}`,
    ),
  ];
}
