import { trainingProjects } from './projectCatalog';
import { getProjectWorkspaceSummary } from './projectWorkspaceSummary';

type ProjectWorkspaceSummaryRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectWorkspaceSummaryRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectWorkspaceSummaryRegressionSuite(): ProjectWorkspaceSummaryRegressionResult[] {
  const summaries = trainingProjects.map((project) => getProjectWorkspaceSummary(project));
  const everySummaryHasProject = summaries.every((summary) => trainingProjects.some((project) => project.id === summary.projectId));
  const scoresInRange = summaries.every((summary) =>
    summary.learningScore >= 0 &&
    summary.learningScore <= 100 &&
    summary.readinessScore >= 0 &&
    summary.readinessScore <= 100,
  );
  const everySummaryHasUsefulMetrics = summaries.every((summary) =>
    summary.ioPointCount >= 0 &&
    summary.rungPreviewCount >= 0 &&
    summary.exportReadyTargetCount >= 0 &&
    summary.exportReadyTargetCount <= 3 &&
    summary.compactHighlights.length >= 5,
  );
  const everySummaryHasNextAction = summaries.every((summary) => summary.nextBestAction.length > 3);
  const seloSummary = getProjectWorkspaceSummary(trainingProjects.find((project) => project.id === 'selo') ?? trainingProjects[0]);
  const seloSummaryIsStrong =
    seloSummary.readinessScore >= 80 &&
    seloSummary.learningScore > 0 &&
    seloSummary.ioPointCount >= 4 &&
    seloSummary.rungPreviewCount >= 2 &&
    seloSummary.exportReadyTargetCount === 3 &&
    seloSummary.hasBenchMapping;
  const riskyProjectsHaveCriticalCount = summaries
    .filter((summary) => ['partida-direta', 'reversao', 'estrela-triangulo', 'portao-automatico'].includes(summary.projectId))
    .every((summary) => summary.safetyCriticalCount > 0);

  return [
    assertResult(
      'resumos compactos apontam para projetos existentes',
      everySummaryHasProject,
      `summaries=${summaries.map((summary) => summary.projectId).join(',')}`,
    ),
    assertResult(
      'scores do resumo compacto ficam entre 0 e 100',
      scoresInRange,
      `scores=${summaries.map((summary) => `${summary.projectId}:${summary.readinessScore}/${summary.learningScore}`).join(',')}`,
    ),
    assertResult(
      'resumos compactos possuem metricas e highlights suficientes',
      everySummaryHasUsefulMetrics,
      `metrics=${summaries.map((summary) => `${summary.projectId}:io${summary.ioPointCount}:r${summary.rungPreviewCount}:e${summary.exportReadyTargetCount}`).join(',')}`,
    ),
    assertResult(
      'resumos compactos possuem proximo melhor passo',
      everySummaryHasNextAction,
      `actions=${summaries.map((summary) => `${summary.projectId}:${summary.nextBestAction}`).join(',')}`,
    ),
    assertResult(
      'resumo compacto do selo permanece forte para fluxo completo',
      seloSummaryIsStrong,
      `selo=${JSON.stringify(seloSummary)}`,
    ),
    assertResult(
      'projetos de risco exibem pontos criticos no resumo compacto',
      riskyProjectsHaveCriticalCount,
      `critical=${summaries.map((summary) => `${summary.projectId}:${summary.safetyCriticalCount}`).join(',')}`,
    ),
  ];
}
