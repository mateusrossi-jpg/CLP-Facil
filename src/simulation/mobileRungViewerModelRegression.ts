import { createInitialEditorProject } from '../engine/editorTypes';
import { createInitialEditorState, evaluateEditorProject } from '../engine/editorEvaluator';
import { createInitialRuntimeState } from '../engine/runtimeTypes';
import { createInitialZoomState, defaultZoomForScope, firstOutputLikeBlock, MOBILE_RUNG_DEFAULT_ZOOM, resolveVisibleOutputSummary, updateScopeZoomState } from '../components/mobileRungViewerModel';

type Regression = { name: string; passed: boolean; details?: string };

function runDefaultZoomRegression(): Regression {
  const individual = defaultZoomForScope('individual');
  const compiled = defaultZoomForScope('compiled');
  return {
    name: 'zoom padrao do viewer mobile diferencia rung e programa',
    passed: individual === MOBILE_RUNG_DEFAULT_ZOOM.individual && compiled === MOBILE_RUNG_DEFAULT_ZOOM.compiled,
    details: `individual=${individual}, compiled=${compiled}`,
  };
}

function runFirstOutputLikeBlockRegression(): Regression {
  const project = createInitialEditorProject();
  const firstRung = project.rungs[0];
  const output = firstOutputLikeBlock(firstRung);
  return {
    name: 'viewer mobile resolve bobina principal da rung',
    passed: Boolean(output?.variable?.toUpperCase().startsWith('Q')),
    details: `output=${output?.variable ?? 'none'}`,
  };
}

function runCompiledOutputRegression(): Regression {
  const project = createInitialEditorProject();
  const state = createInitialEditorState();
  const evaluation = evaluateEditorProject(project, state, 0, createInitialRuntimeState());
  const firstRung = project.rungs[0];
  const summary = resolveVisibleOutputSummary(project, evaluation, state, 'compiled', firstRung);
  return {
    name: 'saida visivel no modo programa usa rung energizada',
    passed: Boolean(summary.block?.variable) && summary.active === true,
    details: `output=${summary.block?.variable ?? 'none'}, active=${summary.active}`,
  };
}

function runZoomStateRegression(): Regression {
  const initial = createInitialZoomState();
  const next = updateScopeZoomState(initial, 'compiled', 0.9);
  return {
    name: 'viewer mobile preserva zoom independente por escopo',
    passed: next.compiled === 0.9 && next.individual === initial.individual,
    details: `individual=${next.individual}, compiled=${next.compiled}`,
  };
}

export function runMobileRungViewerModelRegressionSuite(): Regression[] {
  return [
    runDefaultZoomRegression(),
    runFirstOutputLikeBlockRegression(),
    runCompiledOutputRegression(),
    runZoomStateRegression(),
  ];
}
