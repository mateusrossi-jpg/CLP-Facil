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
  const hasHardware = ids.includes('hardware_export');
  const hasBeta = ids.includes('beta_test');
  const hasStore = ids.includes('store_listing');

  return assertResult(
    'checklist de divulgacao cobre etapas essenciais',
    hasCore && hasVisual && hasHardware && hasBeta && hasStore,
    `ids=${ids.join(',')}`,
  );
}

function runCriticalReleaseRegression(): ReleaseRegressionResult {
  const critical = criticalReleaseStages();
  const hasCriticalItems = critical.length >= 4;
  const eachHasReadyDefinition = critical.every((stage) => stage.readyDefinition.length > 0 && stage.checklist.length > 0);

  return assertResult(
    'etapas criticas possuem definicao de pronto',
    hasCriticalItems && eachHasReadyDefinition,
    `critical=${critical.map((stage) => stage.id).join(',')}`,
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
    runReleaseLabelsRegression(),
  ];
}
