import { createInitialEditorProject } from '../engine/editorTypes';
import { clampProgramMode, mobileSessionContextLabel, persistFocusedRungForProject, persistProgramModeForProject, programModeLabel, projectModeKey, recommendProgramMode, resolveFocusedRungId, resolveRungIndex, restoreFocusedRungForProject, restoreProgramModeForProject, shouldShowProgramModeRecommendation } from './mobileSimulationState';

type Regression = { name: string; passed: boolean; details?: string };

function runResolveFocusedRungRegression(): Regression {
  const project = createInitialEditorProject();
  const selected = resolveFocusedRungId(project, null);
  const invalid = resolveFocusedRungId(project, 'rung-inexistente');
  return {
    name: 'estado mobile resolve foco de rung para ids validos',
    passed: Boolean(selected) && selected === invalid,
    details: `selected=${selected}, invalidResolved=${invalid}`,
  };
}

function runClampProgramModeRegression(): Regression {
  const valid = clampProgramMode('flow');
  const invalid = clampProgramMode('qualquer-coisa');
  return {
    name: 'estado mobile limita modo de programa para opcoes conhecidas',
    passed: valid === 'flow' && invalid === 'compact_rung',
    details: `valid=${valid}, invalid=${invalid}`,
  };
}

export function runMobileSimulationStateRegressionSuite(): Regression[] {
  return [runResolveFocusedRungRegression(), runClampProgramModeRegression(), runRungIndexClampRegression(), runRecommendProgramModeRegression(), runModeRecommendationVisibilityRegression(), runProjectModeKeyRegression(), runProgramModePreferencesRegression(), runFocusedRungPreferencesRegression(), runProgramModeLabelRegression(), runSessionContextLabelRegression()];
}

function runRungIndexClampRegression(): Regression {
  const project = createInitialEditorProject();
  const low = resolveRungIndex(project, -10);
  const high = resolveRungIndex(project, 999);
  return {
    name: 'estado mobile limita indice de rung aos limites do projeto',
    passed: low === 0 && high === Math.max(project.rungs.length - 1, 0),
    details: `low=${low}, high=${high}`,
  };
}

function runSessionContextLabelRegression(): Regression {
  const withFocus = mobileSessionContextLabel('flow', 'rung-2');
  const noFocus = mobileSessionContextLabel('list', null);
  return {
    name: 'estado mobile gera resumo textual do contexto salvo',
    passed: withFocus === 'Fluxo • RUNG-2' && noFocus === 'Lista • RUNG INICIAL',
    details: `withFocus=${withFocus}, noFocus=${noFocus}`,
  };
}

function runProgramModeLabelRegression(): Regression {
  return {
    name: 'estado mobile traduz labels de modo de programa',
    passed: programModeLabel('compact_rung') === 'Rung compacto' && programModeLabel('list') === 'Lista' && programModeLabel('flow') === 'Fluxo',
    details: `compact=${programModeLabel('compact_rung')}, list=${programModeLabel('list')}, flow=${programModeLabel('flow')}`,
  };
}

function runFocusedRungPreferencesRegression(): Regression {
  const project = createInitialEditorProject();
  const firstRung = project.rungs[0]?.id ?? '';
  const persisted = persistFocusedRungForProject({}, project, firstRung);
  const restored = restoreFocusedRungForProject(persisted, project);
  const invalid = restoreFocusedRungForProject({ ...persisted, [`${project.rungs.length}:rung-1`]: 'invalida' }, project);
  return {
    name: 'estado mobile persiste foco de rung por projeto',
    passed: restored === firstRung && invalid === null,
    details: `restored=${restored}, invalid=${invalid}`,
  };
}

function runProgramModePreferencesRegression(): Regression {
  const project = createInitialEditorProject();
  const persisted = persistProgramModeForProject({}, project, 'flow');
  const restored = restoreProgramModeForProject(persisted, project, 'compact_rung');
  const fallback = restoreProgramModeForProject({}, project, 'list');
  return {
    name: 'estado mobile persiste e restaura modo por projeto',
    passed: restored === 'flow' && fallback === 'list',
    details: `restored=${restored}, fallback=${fallback}`,
  };
}

function runProjectModeKeyRegression(): Regression {
  const project = createInitialEditorProject();
  const key = projectModeKey(project);
  const expectedPrefix = `${project.rungs.length}:`;
  return {
    name: 'estado mobile gera chave estavel para preferencia de modo por projeto',
    passed: key.startsWith(expectedPrefix) && key.length > expectedPrefix.length,
    details: `key=${key}`,
  };
}

function runModeRecommendationVisibilityRegression(): Regression {
  const visible = shouldShowProgramModeRecommendation('compact_rung', 'flow', false);
  const hiddenByDismiss = shouldShowProgramModeRecommendation('compact_rung', 'flow', true);
  const hiddenByMatch = shouldShowProgramModeRecommendation('list', 'list', false);
  return {
    name: 'estado mobile mostra recomendacao apenas quando necessario',
    passed: visible === true && hiddenByDismiss === false && hiddenByMatch === false,
    details: `visible=${visible}, dismissed=${hiddenByDismiss}, matched=${hiddenByMatch}`,
  };
}

function runRecommendProgramModeRegression(): Regression {
  const small = recommendProgramMode(2);
  const medium = recommendProgramMode(5);
  const large = recommendProgramMode(10);
  return {
    name: 'estado mobile recomenda modo de programa por tamanho ladder',
    passed: small === 'compact_rung' && medium === 'list' && large === 'flow',
    details: `small=${small}, medium=${medium}, large=${large}`,
  };
}
