import { getProjectQuickActionNavigation } from './projectQuickActionNavigation';

type ProjectQuickActionNavigationRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectQuickActionNavigationRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectQuickActionNavigationRegressionSuite(): ProjectQuickActionNavigationRegressionResult[] {
  const study = getProjectQuickActionNavigation('study');
  const simulate = getProjectQuickActionNavigation('simulate');
  const technical = getProjectQuickActionNavigation('technical');
  const bench = getProjectQuickActionNavigation('bench');
  const code = getProjectQuickActionNavigation('code');

  return [
    assertResult(
      'atalho estudar navega para aprender sem trocar aba tecnica',
      study.route === 'learn' && study.tab === 'summary',
      `study=${JSON.stringify(study)}`,
    ),
    assertResult(
      'atalho simular navega para simulacao sem trocar aba tecnica',
      simulate.route === 'simulate' && simulate.tab === 'summary',
      `simulate=${JSON.stringify(simulate)}`,
    ),
    assertResult(
      'atalho tecnico abre aba tecnica interna',
      technical.route === undefined && technical.tab === 'technical',
      `technical=${JSON.stringify(technical)}`,
    ),
    assertResult(
      'atalho bancada abre aba tecnica interna',
      bench.route === undefined && bench.tab === 'technical',
      `bench=${JSON.stringify(bench)}`,
    ),
    assertResult(
      'atalho codigo abre aba codigo interna',
      code.route === undefined && code.tab === 'code',
      `code=${JSON.stringify(code)}`,
    ),
  ];
}
