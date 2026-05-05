import { trainingProjects } from './projectCatalog';
import { getProjectSimulationFocus } from './projectSimulationFocus';

type ProjectSimulationFocusRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectSimulationFocusRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectSimulationFocusRegressionSuite(): ProjectSimulationFocusRegressionResult[] {
  const focuses = trainingProjects.map((project) => getProjectSimulationFocus(project.id));
  const everyProjectHasFocus = focuses.every(Boolean);
  const everyFocusHasRungsAndIo = focuses.every((focus) => Boolean(focus && focus.rungs.length > 0 && focus.ioPoints.length > 0));
  const countsMatchIoKinds = focuses.every((focus) => {
    if (!focus) return false;
    return focus.inputCount === focus.ioPoints.filter((point) => point.kind === 'input').length &&
      focus.outputCount === focus.ioPoints.filter((point) => point.kind === 'output').length &&
      focus.memoryCount === focus.ioPoints.filter((point) => point.kind === 'memory').length &&
      focus.timerCount === focus.ioPoints.filter((point) => point.kind === 'timer').length &&
      focus.counterCount === focus.ioPoints.filter((point) => point.kind === 'counter').length;
  });
  const invalidProjectReturnsUndefined = getProjectSimulationFocus('projeto-inexistente') === undefined;
  const seloFocus = getProjectSimulationFocus('selo');
  const seloFocusIsUseful = Boolean(
    seloFocus &&
      seloFocus.project.id === 'selo' &&
      seloFocus.rungs.length >= 2 &&
      seloFocus.inputCount >= 2 &&
      seloFocus.outputCount >= 1 &&
      seloFocus.diagnosticHint.length > 20,
  );
  const riskyProjectsHaveDiagnosticWarning = ['partida-direta', 'reversao', 'estrela-triangulo', 'portao-automatico'].every((projectId) => {
    const focus = getProjectSimulationFocus(projectId);
    return Boolean(focus && focus.safetyPoints.length > 0 && focus.diagnosticHint.includes('críticos'));
  });

  return [
    assertResult(
      'todos os projetos possuem foco de simulacao',
      everyProjectHasFocus,
      `focuses=${focuses.map((focus) => focus?.project.id ?? 'undefined').join(',')}`,
    ),
    assertResult(
      'foco de simulacao possui rungs e IO',
      everyFocusHasRungsAndIo,
      `counts=${focuses.map((focus) => focus ? `${focus.project.id}:r${focus.rungs.length}:io${focus.ioPoints.length}` : 'undefined').join(',')}`,
    ),
    assertResult(
      'contagens do foco de simulacao batem com tipos de IO',
      countsMatchIoKinds,
      'alguma contagem input/output/memory/timer/counter divergiu',
    ),
    assertResult(
      'projeto inexistente nao gera foco de simulacao',
      invalidProjectReturnsUndefined,
      'getProjectSimulationFocus deveria retornar undefined para id invalido',
    ),
    assertResult(
      'foco de simulacao do selo permanece util',
      seloFocusIsUseful,
      `selo=${seloFocus ? JSON.stringify({ rungs: seloFocus.rungs.length, inputs: seloFocus.inputCount, outputs: seloFocus.outputCount, hint: seloFocus.diagnosticHint }) : 'undefined'}`,
    ),
    assertResult(
      'projetos de risco geram dica de diagnostico para pontos criticos',
      riskyProjectsHaveDiagnosticWarning,
      `risky=${['partida-direta', 'reversao', 'estrela-triangulo', 'portao-automatico'].map((id) => `${id}:${getProjectSimulationFocus(id)?.diagnosticHint}`).join('|')}`,
    ),
  ];
}
