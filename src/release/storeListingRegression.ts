import { privacyPolicyDraft, storeListingDraft, storeScreenshotPlan } from './storeListingDraft';

type StoreListingRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): StoreListingRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runStoreListingContentRegression(): StoreListingRegressionResult {
  const shortHasCore = /Ladder/i.test(storeListingDraft.shortDescription) && /ESP32/i.test(storeListingDraft.shortDescription);
  const fullHasSafety = storeListingDraft.fullDescription.some((paragraph) => /não substitui|segurança|certificado/i.test(paragraph));
  const hasFeatures = storeListingDraft.featureBullets.length >= 5;

  return assertResult(
    'rascunho de loja comunica proposta e aviso de seguranca',
    shortHasCore && fullHasSafety && hasFeatures,
    `short=${shortHasCore}, safety=${fullHasSafety}, features=${storeListingDraft.featureBullets.length}`,
  );
}

function runScreenshotPlanRegression(): StoreListingRegressionResult {
  const targets = storeScreenshotPlan.map((shot) => shot.id);
  const hasHome = targets.includes('home_flow');
  const hasSimulator = targets.includes('simulator_run');
  const hasHardware = targets.includes('hardware_gpio');
  const hasReference = targets.includes('reference_protocols');

  return assertResult(
    'plano de prints cobre telas principais',
    hasHome && hasSimulator && hasHardware && hasReference,
    `targets=${targets.join(',')}`,
  );
}

function runPrivacyDraftRegression(): StoreListingRegressionResult {
  const hasNoSalePromise = privacyPolicyDraft.promises.some((promise) => /Não vender/i.test(promise));
  const hasLocalSummary = /local/i.test(privacyPolicyDraft.summary);

  return assertResult(
    'rascunho de privacidade cobre uso local e nao venda de dados',
    hasNoSalePromise && hasLocalSummary,
  );
}

export function runStoreListingRegressionSuite(): StoreListingRegressionResult[] {
  return [
    runStoreListingContentRegression(),
    runScreenshotPlanRegression(),
    runPrivacyDraftRegression(),
  ];
}
