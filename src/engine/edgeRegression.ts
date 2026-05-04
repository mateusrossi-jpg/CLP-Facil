import { evaluateEditorProject } from './editorEvaluator';
import { EditorBlock, EditorProjectState } from './editorTypes';
import { PlcState } from './projectTypes';
import { createInitialRuntimeState, EditorRuntimeState } from './runtimeTypes';

type EdgeRegressionStep = {
  state: PlcState;
  runtime: EditorRuntimeState;
  scan: number;
};

type EdgeRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function edgeContact(id: string, variable: string, contactMode: 'RISING' | 'FALLING'): EditorBlock {
  return {
    id,
    componentId: contactMode === 'RISING' ? 'contact-ons' : 'contact-osf',
    name: contactMode === 'RISING' ? 'ONS' : 'OSF',
    description: 'Contato de borda para regressão.',
    isPro: false,
    zone: 'series',
    variable,
    role: 'contact',
    contactMode,
    category: 'logic',
  };
}

function coil(id: string, variable: string): EditorBlock {
  return {
    id,
    componentId: 'coil-q',
    name: id,
    description: 'Bobina de teste.',
    isPro: false,
    zone: 'coil',
    variable,
    role: 'coil',
    coilMode: 'NORMAL',
    category: 'output',
  };
}

function projectFor(contactMode: 'RISING' | 'FALLING', outputVariable: string): EditorProjectState {
  return {
    selectedRungId: `${contactMode.toLowerCase()}-rung`,
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: `${contactMode.toLowerCase()}-rung`,
        label: contactMode === 'RISING' ? 'Linha 1 - ONS' : 'Linha 1 - OSF',
        seriesBlocks: [edgeContact(`${contactMode.toLowerCase()}-contact`, 'I0.0', contactMode)],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil(`${contactMode.toLowerCase()}-coil`, outputVariable),
      },
    ],
  };
}

function scan(project: EditorProjectState, step: EdgeRegressionStep, patch: PlcState = {}): EdgeRegressionStep {
  const result = evaluateEditorProject(project, { ...step.state, ...patch }, step.scan + 1, step.runtime);
  return {
    state: result.state,
    runtime: result.runtime,
    scan: result.scanNumber,
  };
}

function initialStep(state: PlcState = {}): EdgeRegressionStep {
  return {
    state,
    runtime: createInitialRuntimeState(),
    scan: 0,
  };
}

function assertResult(name: string, condition: boolean, details?: string): EdgeRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runRisingEdgeRegression(): EdgeRegressionResult {
  const project = projectFor('RISING', 'Q0.0');
  let step = initialStep({ 'I0.0': false, 'Q0.0': false });

  step = scan(project, step, { 'I0.0': true });
  const firstPulse = step.state['Q0.0'] === true;
  step = scan(project, step, { 'I0.0': true });
  const heldOff = step.state['Q0.0'] === false;
  step = scan(project, step, { 'I0.0': false });
  const releaseOff = step.state['Q0.0'] === false;
  step = scan(project, step, { 'I0.0': true });
  const secondPulse = step.state['Q0.0'] === true;

  return assertResult(
    'ONS gera pulso de 1 scan',
    firstPulse && heldOff && releaseOff && secondPulse,
    `firstPulse=${firstPulse}, heldOff=${heldOff}, releaseOff=${releaseOff}, secondPulse=${secondPulse}`,
  );
}

function runFallingEdgeRegression(): EdgeRegressionResult {
  const project = projectFor('FALLING', 'Q0.1');
  let step = initialStep({ 'I0.0': true, 'Q0.1': false });

  step = scan(project, step, { 'I0.0': true });
  const initialOff = step.state['Q0.1'] === false;
  step = scan(project, step, { 'I0.0': false });
  const firstPulse = step.state['Q0.1'] === true;
  step = scan(project, step, { 'I0.0': false });
  const heldOff = step.state['Q0.1'] === false;
  step = scan(project, step, { 'I0.0': true });
  step = scan(project, step, { 'I0.0': false });
  const secondPulse = step.state['Q0.1'] === true;

  return assertResult(
    'OSF gera pulso de 1 scan',
    initialOff && firstPulse && heldOff && secondPulse,
    `initialOff=${initialOff}, firstPulse=${firstPulse}, heldOff=${heldOff}, secondPulse=${secondPulse}`,
  );
}

function runPreviewDoesNotConsumeEdgeRegression(): EdgeRegressionResult {
  const project = projectFor('RISING', 'Q0.0');
  const step = initialStep({ 'I0.0': true, 'Q0.0': false });

  const preview = evaluateEditorProject(project, step.state, step.scan, step.runtime);
  const previewDidNotAdvance = preview.scanNumber === 0;
  const previewKeptRuntime = Object.keys(preview.runtime.previousContactValues).length === 0;

  const committed = scan(project, step, { 'I0.0': true });
  const pulseAfterPreview = committed.state['Q0.0'] === true;

  return assertResult(
    'visualização não consome borda antes do scan',
    previewDidNotAdvance && previewKeptRuntime && pulseAfterPreview,
    `previewScan=${preview.scanNumber}, previous=${JSON.stringify(preview.runtime.previousContactValues)}, pulseAfterPreview=${pulseAfterPreview}`,
  );
}

export function runEdgeContactRegressionSuite(): EdgeRegressionResult[] {
  return [
    runRisingEdgeRegression(),
    runFallingEdgeRegression(),
    runPreviewDoesNotConsumeEdgeRegression(),
  ];
}
