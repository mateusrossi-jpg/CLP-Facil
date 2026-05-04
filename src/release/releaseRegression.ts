import { criticalReleaseStages, releaseChecklistStages, releaseStatusLabel } from './releaseChecklist';

type ReleaseRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): ReleaseRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runReleaseCoverageRegression(): ReleaseRegressionResult {
  const ids = releaseChecklistStages.map((stage) => stage.id);
  const hasCore = ids.includes('core_stability');
  const hasVisual = ids.includes('mobile_visual');
  const hasProfessional = ids.includes('professional_plc_features');
  const hasLearning = ids.includes('guided_learning');
  const hasHardware = ids.includes('hardware_export');
  const hasBeta = ids.includes('beta_test');
  const hasStore = ids.includes('store_listing');

  return assertResult(
    'checklist de divulgacao cobre etapas essenciais',
    hasCore && hasVisual && hasProfessional && hasLearning && hasHardware && hasBeta && hasStore,
    `ids=${ids.join(',')}`,
  );
}

function runCriticalReleaseRegression(): ReleaseRegressionResult {
  const critical = criticalReleaseStages();
  const hasCriticalItems = critical.length >= 6;
  const eachHasReadyDefinition = critical.every((stage) => stage.readyDefinition.length > 0 && stage.checklist.length > 0);

  return assertResult(
    'etapas criticas possuem definicao de pronto',
    hasCriticalItems && eachHasReadyDefinition,
    `critical=${critical.map((stage) => stage.id).join(',')}`,
  );
}

function runPromptCompletionChecklistRegression(): ReleaseRegressionResult {
  const mobile = releaseChecklistStages.find((stage) => stage.id === 'mobile_visual');
  const professional = releaseChecklistStages.find((stage) => stage.id === 'professional_plc_features');
  const learning = releaseChecklistStages.find((stage) => stage.id === 'guided_learning');
  const reference = releaseChecklistStages.find((stage) => stage.id === 'reference_content');

  const mobileHasRungFlow = Boolean(mobile?.checklist.some((item) => /Fluxo|saída|carga/i.test(item.text)));
  const professionalHasForce = Boolean(professional?.checklist.some((item) => /Force ON/i.test(item.text)) && professional?.checklist.some((item) => /Force OFF/i.test(item.text)));
  const professionalHasRoutines = Boolean(professional?.checklist.some((item) => /rotinas|MainRoutine|MotorControl|SafetyLogic|Sequencer/i.test(item.text)));
  const learningHasMastery = Boolean(learning?.checklist.some((item) => /domínio/i.test(item.text)));
  const referenceHasTags = Boolean(reference?.checklist.some((item) => /tags/i.test(item.text)));
  const referenceHasRoutines = Boolean(reference?.checklist.some((item) => /rotinas|programas/i.test(item.text)));

  return assertResult(
    'checklist cobre prompt mobile profissional aprendizado e referencia',
    mobileHasRungFlow && professionalHasForce && professionalHasRoutines && learningHasMastery && referenceHasTags && referenceHasRoutines,
    `mobile=${mobileHasRungFlow}, force=${professionalHasForce}, routines=${professionalHasRoutines}, mastery=${learningHasMastery}, tags=${referenceHasTags}, refRoutines=${referenceHasRoutines}`,
  );
}

function runReleaseLabelsRegression(): ReleaseRegressionResult {
  return assertResult(
    'labels de release estao definidos',
    releaseStatusLabel('critical') === 'Crítico' && releaseStatusLabel('important') === 'Importante',
  );
}

export function runReleaseRegressionSuite(): ReleaseRegressionResult[] {
  return [
    runReleaseCoverageRegression(),
    runCriticalReleaseRegression(),
    runPromptCompletionChecklistRegression(),
    runReleaseLabelsRegression(),
  ];
}
