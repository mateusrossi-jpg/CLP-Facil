import { createInitialEditorProject, EditorBlock, EditorProjectState } from './editorTypes';
import { evaluateEditorProject } from './editorEvaluator';
import { traceEditorScan } from './editorScanTrace';
import { createInitialRuntimeState } from './runtimeTypes';

export type EditorScanTraceRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): EditorScanTraceRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

function contact(id: string, variable: string, contactMode: 'NO' | 'NC' = 'NO'): EditorBlock {
  return {
    id,
    componentId: contactMode === 'NC' ? 'contact-nc' : 'contact-no',
    name: id,
    description: 'Contato de teste.',
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

function runSealTraceRegression(): EditorScanTraceRegressionResult {
  const project = createInitialEditorProject();
  const runtime = createInitialRuntimeState();
  const trace = traceEditorScan(project, { 'I0.0': false, 'I0.1': false, 'Q0.0': true }, runtime);
  const rung = trace.rungs[0];

  return assertResult(
    'trace identifica selo energizado por branch paralelo',
    trace.energizedRungIds.includes('rung-1') &&
      trace.energizedOutputs.includes('Q0.0') &&
      rung.activeBranchIds.includes('starter-branch-seal') &&
      rung.branchTraces.some((branch) => branch.branchId === 'starter-branch-seal' && branch.energized),
    JSON.stringify(trace),
  );
}

function runAndBlockedTraceRegression(): EditorScanTraceRegressionResult {
  const project = createInitialEditorProject();
  const trace = traceEditorScan(project, { 'I0.0': true, 'I0.1': true, 'Q0.0': false }, createInitialRuntimeState());
  const rung = trace.rungs[0];

  return assertResult(
    'trace mostra stop NC bloqueando linha',
    !rung.energized &&
      rung.seriesContacts.some((contactTrace) => contactTrace.variable === 'I0.1' && contactTrace.mode === 'NC' && !contactTrace.energized),
    JSON.stringify(rung),
  );
}

function runMultiBranchTraceRegression(): EditorScanTraceRegressionResult {
  const project: EditorProjectState = {
    selectedRungId: 'or-rung',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'or-rung',
        label: 'Linha OR real',
        seriesBlocks: [contact('start', 'I0.0'), contact('permit', 'I0.1')],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'manual-bypass',
            seriesIndex: 0,
            blocks: [contact('bypass', 'M0.0')],
          },
        ],
        coilBlock: coil('motor', 'Q0.0'),
      },
    ],
  };
  const trace = traceEditorScan(project, { 'I0.0': false, 'I0.1': false, 'M0.0': true, 'Q0.0': false }, createInitialRuntimeState());
  const rung = trace.rungs[0];

  return assertResult(
    'trace avalia paralelo como caminho OR ate a saida',
    rung.energized &&
      rung.activeBranchIds.includes('manual-bypass') &&
      trace.energizedOutputs.includes('Q0.0'),
    JSON.stringify(rung),
  );
}

function runTraceMatchesEvaluatorRegression(): EditorScanTraceRegressionResult {
  const project = createInitialEditorProject();
  const runtime = createInitialRuntimeState();
  const result = evaluateEditorProject(project, { 'I0.0': true, 'I0.1': false, 'Q0.0': false }, 1, runtime);
  const trace = traceEditorScan(project, { 'I0.0': true, 'I0.1': false, 'Q0.0': false }, runtime);

  return assertResult(
    'trace de rung bate com evaluator',
    trace.rungs.every((rung) => rung.energized === result.rungResults[rung.rungId]),
    `trace=${JSON.stringify(trace.rungs)} results=${JSON.stringify(result.rungResults)}`,
  );
}

export function runEditorScanTraceRegressionSuite(): EditorScanTraceRegressionResult[] {
  return [
    runSealTraceRegression(),
    runAndBlockedTraceRegression(),
    runMultiBranchTraceRegression(),
    runTraceMatchesEvaluatorRegression(),
  ];
}
