import {
  criticalMarketRiskAreas,
  criticalMarketRisks,
  marketRiskCoverageByArea,
  plcSimulatorMarketRisks,
} from './plcSimulatorMarketRisks';

type MarketRiskRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): MarketRiskRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runMarketRiskStructureRegression(): MarketRiskRegressionResult {
  const invalidRisks = plcSimulatorMarketRisks.filter((risk) => (
    risk.id.length === 0 ||
    risk.competitor.length === 0 ||
    !/^https:\/\//.test(risk.sourceUrl) ||
    risk.sourceSignal.length < 24 ||
    risk.risk.length < 24 ||
    risk.guardrail.length < 24 ||
    risk.acceptanceCriteria.length < 2
  ));

  return assertResult(
    'referencias negativas possuem guardrail e aceite acionaveis',
    invalidRisks.length === 0 && plcSimulatorMarketRisks.length >= 8,
    `invalid=${invalidRisks.map((risk) => risk.id).join(',')}, total=${plcSimulatorMarketRisks.length}`,
  );
}

function runMarketRiskAreaCoverageRegression(): MarketRiskRegressionResult {
  const coverage = marketRiskCoverageByArea();
  const missingAreas = criticalMarketRiskAreas.filter((area) => (coverage[area] ?? 0) === 0);

  return assertResult(
    'guardrails cobrem dores criticas de simuladores ladder mobile',
    missingAreas.length === 0,
    `missing=${missingAreas.join(',')}`,
  );
}

function runNoFixedLimitRegression(): MarketRiskRegressionResult {
  const largeProjectRisk = plcSimulatorMarketRisks.find((risk) => risk.id === 'too_limited_or_missing_memory_bits');
  const text = [
    largeProjectRisk?.guardrail,
    ...(largeProjectRisk?.acceptanceCriteria ?? []),
  ].join(' ');

  return assertResult(
    'guardrail de projetos grandes proibe limite fixo artificial',
    /sem limite fixo|nao apenas uma amostra fixa/i.test(text) && /muitas rungs|todos os pontos/i.test(text),
    text,
  );
}

function runMobileClutterRegression(): MarketRiskRegressionResult {
  const editorRisk = plcSimulatorMarketRisks.find((risk) => risk.id === 'painful_simple_program_flow');
  const diagnosticsRisk = plcSimulatorMarketRisks.find((risk) => risk.id === 'realism_gap_without_diagnostics');
  const text = [
    editorRisk?.guardrail,
    diagnosticsRisk?.guardrail,
    ...(editorRisk?.acceptanceCriteria ?? []),
    ...(diagnosticsRisk?.acceptanceCriteria ?? []),
  ].join(' ');

  return assertResult(
    'guardrails mantem simulacao limpa com analises sob demanda',
    /I\/O visivel/i.test(text) && /sob demanda/i.test(text) && /PIP|recolhiveis/i.test(text),
    text,
  );
}

function runCriticalMarketRiskRegression(): MarketRiskRegressionResult {
  const critical = criticalMarketRisks();
  const stages = new Set(critical.map((risk) => risk.releaseStageId));

  return assertResult(
    'riscos criticos atravessam release mobile aprendizado hardware e profissional',
    critical.length >= criticalMarketRiskAreas.length &&
      stages.has('core_stability') &&
      stages.has('mobile_visual') &&
      stages.has('guided_learning') &&
      stages.has('hardware_export') &&
      stages.has('professional_plc_features'),
    `critical=${critical.length}, stages=${Array.from(stages).join(',')}`,
  );
}

export function runPlcSimulatorMarketRisksRegressionSuite(): MarketRiskRegressionResult[] {
  return [
    runMarketRiskStructureRegression(),
    runMarketRiskAreaCoverageRegression(),
    runNoFixedLimitRegression(),
    runMobileClutterRegression(),
    runCriticalMarketRiskRegression(),
  ];
}
