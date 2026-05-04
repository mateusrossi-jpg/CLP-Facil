import { mandatorySafetyItems, safetyCategories, safetyLevelLabel } from './safetyCatalog';

type SafetyRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): SafetyRegressionResult {
  return { name, passed, details: condition ? undefined : details };
}

function runSafetyCoverageRegression(): SafetyRegressionResult {
  const ids = safetyCategories.map((category) => category.id);
  const hasDidactic = ids.includes('didactic_scope');
  const hasPower = ids.includes('power_isolation');
  const hasRelay = ids.includes('relay_outputs');
  const hasBoot = ids.includes('boot_states');
  const hasEmergency = ids.includes('emergency_stop');
  const hasProtocolWrites = ids.includes('protocol_writes');
  const hasValidation = ids.includes('validation');

  return assertResult(
    'checklist de seguranca cobre riscos principais',
    hasDidactic && hasPower && hasRelay && hasBoot && hasEmergency && hasProtocolWrites && hasValidation,
    `ids=${ids.join(',')}`,
  );
}

function runMandatorySafetyRegression(): SafetyRegressionResult {
  const mandatory = mandatorySafetyItems();
  const hasMandatoryItems = mandatory.length >= 5;
  const eachHasChecklist = mandatory.every((category) => category.checklist.length > 0 && category.warning.length > 0);

  return assertResult(
    'itens obrigatorios de seguranca possuem checklist e aviso',
    hasMandatoryItems && eachHasChecklist,
    `mandatory=${mandatory.map((item) => item.id).join(',')}`,
  );
}

function runSafetyLabelsRegression(): SafetyRegressionResult {
  return assertResult(
    'labels de seguranca estao definidos',
    safetyLevelLabel('mandatory') === 'Obrigatório' && safetyLevelLabel('recommended') === 'Recomendado',
  );
}

export function runSafetyRegressionSuite(): SafetyRegressionResult[] {
  return [
    runSafetyCoverageRegression(),
    runMandatorySafetyRegression(),
    runSafetyLabelsRegression(),
  ];
}
