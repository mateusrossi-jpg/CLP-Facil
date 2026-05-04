import { createInitialEditorProject, EditorBlock, EditorProjectState } from './editorTypes';
import { evaluateEditorProject } from './editorEvaluator';
import { createInitialRuntimeState, EditorRuntimeState } from './runtimeTypes';
import { PlcState } from './projectTypes';
import { getGuidedPracticeSteps } from '../education/guidedPractice';
import { createLessonEditorProject } from '../data/lessonEditorProjects';
import { lessons } from '../data/learningContent';

type RegressionStep = {
  state: PlcState;
  runtime: EditorRuntimeState;
  scan: number;
};

type RegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function contact(id: string, variable: string, contactMode: 'NO' | 'NC' | 'RISING' | 'FALLING' = 'NO'): EditorBlock {
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

function scan(project: EditorProjectState, step: RegressionStep, patch: PlcState = {}): RegressionStep {
  const result = evaluateEditorProject(project, { ...step.state, ...patch }, step.scan + 1, step.runtime);
  return {
    state: result.state,
    runtime: result.runtime,
    scan: result.scanNumber,
  };
}

function initialStep(state: PlcState = {}): RegressionStep {
  return {
    state,
    runtime: createInitialRuntimeState(),
    scan: 0,
  };
}

function assertResult(name: string, condition: boolean, details?: string): RegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runSealRegression(): RegressionResult {
  const project = createInitialEditorProject();
  let step = initialStep({ 'I0.0': false, 'I0.1': false, 'Q0.0': false });

  step = scan(project, step, { 'I0.0': true });
  const started = step.state['Q0.0'] === true;
  step = scan(project, step, { 'I0.0': false });
  const sealed = step.state['Q0.0'] === true;
  step = scan(project, step, { 'I0.1': true });
  const stopped = step.state['Q0.0'] === false;

  return assertResult('partida com selo', started && sealed && stopped, `started=${started}, sealed=${sealed}, stopped=${stopped}`);
}

function runTonRegression(): RegressionResult {
  const project: EditorProjectState = {
    selectedRungId: 'ton-rung',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'ton-rung',
        label: 'Linha 1 - TON',
        seriesBlocks: [contact('ton-enable', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: 'ton-block',
          componentId: 'timer-ton',
          name: 'TON',
          description: 'Temporizador TON.',
          isPro: false,
          zone: 'coil',
          variable: 'T0',
          role: 'timer',
          timerMode: 'TON',
          presetMs: 300,
          category: 'timer',
        },
      },
    ],
  };
  let step = initialStep({ 'I0.0': true, T0: false });
  step = scan(project, step, { 'I0.0': true });
  const firstScanOff = step.state.T0 === false;
  step = scan(project, step, { 'I0.0': true });
  const secondScanOff = step.state.T0 === false;
  step = scan(project, step, { 'I0.0': true });
  const thirdScanOn = step.state.T0 === true;
  step = scan(project, step, { 'I0.0': false });
  const resetOff = step.state.T0 === false && step.runtime.timers['ton-block'].elapsedMs === 0;

  return assertResult('TON acumula e reseta', firstScanOff && secondScanOff && thirdScanOn && resetOff, `state=${JSON.stringify(step.state)}`);
}

function runCtuRegression(): RegressionResult {
  const project: EditorProjectState = {
    selectedRungId: 'ctu-rung',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'ctu-rung',
        label: 'Linha 1 - CTU',
        seriesBlocks: [contact('ctu-pulse', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: 'ctu-block',
          componentId: 'counter-ctu',
          name: 'CTU',
          description: 'Contador crescente.',
          isPro: false,
          zone: 'coil',
          variable: 'C0',
          role: 'counter',
          counterMode: 'CTU',
          preset: 2,
          resetSource: 'M0.0',
          category: 'counter',
        },
      },
    ],
  };
  let step = initialStep({ 'I0.0': false, 'M0.0': false, C0: false });
  step = scan(project, step, { 'I0.0': true });
  const firstCount = step.runtime.counters['ctu-block'].currentValue === 1 && step.state.C0 === false;
  step = scan(project, step, { 'I0.0': false });
  step = scan(project, step, { 'I0.0': true });
  const done = step.runtime.counters['ctu-block'].currentValue === 2 && step.state.C0 === true;
  step = scan(project, step, { 'M0.0': true });
  const reset = step.runtime.counters['ctu-block'].currentValue === 0 && step.state.C0 === false;

  return assertResult('CTU conta bordas e reseta', firstCount && done && reset, `counter=${JSON.stringify(step.runtime.counters['ctu-block'])}`);
}

function runCtudRegression(): RegressionResult {
  const project: EditorProjectState = {
    selectedRungId: 'ctud-rung',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'ctud-rung',
        label: 'Linha 1 - CTUD',
        seriesBlocks: [contact('ctud-up', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: 'ctud-block',
          componentId: 'counter-ctud',
          name: 'CTUD',
          description: 'Contador crescente/decrescente.',
          isPro: false,
          zone: 'coil',
          variable: 'C1',
          role: 'counter',
          counterMode: 'CTUD',
          downSource: 'I0.1',
          resetSource: 'M0.0',
          preset: 2,
          category: 'counter',
        },
      },
    ],
  };
  let step = initialStep({ 'I0.0': false, 'I0.1': false, 'M0.0': false, C1: false });
  step = scan(project, step, { 'I0.0': true });
  step = scan(project, step, { 'I0.0': false });
  step = scan(project, step, { 'I0.0': true });
  const countedUp = step.runtime.counters['ctud-block'].currentValue === 2 && step.state.C1 === true;
  step = scan(project, step, { 'I0.0': false });
  step = scan(project, step, { 'I0.1': true });
  const countedDown = step.runtime.counters['ctud-block'].currentValue === 1 && step.state.C1 === false;
  step = scan(project, step, { 'I0.1': false, 'M0.0': true });
  const reset = step.runtime.counters['ctud-block'].currentValue === 0 && step.state.C1 === false;

  return assertResult('CTUD conta, desconta e reseta', countedUp && countedDown && reset, `counter=${JSON.stringify(step.runtime.counters['ctud-block'])}`);
}

function runMathCompareRegression(): RegressionResult {
  const project: EditorProjectState = {
    selectedRungId: 'math-rung',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'math-rung',
        label: 'Linha 1 - ADD',
        seriesBlocks: [contact('math-enable', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: 'add-block',
          componentId: 'math-add',
          name: 'ADD',
          description: 'Soma.',
          isPro: false,
          zone: 'coil',
          variable: 'N2',
          role: 'coil',
          coilMode: 'NORMAL',
          mathMode: 'ADD',
          sourceA: 'N0',
          sourceB: 'N1',
          destination: 'N2',
          category: 'math',
        },
      },
      {
        id: 'compare-rung',
        label: 'Linha 2 - EQU',
        seriesBlocks: [{
          ...contact('compare-eq', 'N2'),
          componentId: 'cmp-equ',
          name: 'EQU',
          compareMode: 'EQU',
          sourceA: 'N2',
          sourceB: '7',
          category: 'compare',
        }],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('compare-output', 'Q0.0'),
      },
    ],
  };
  let step = initialStep({ 'I0.0': true, N0: 3, N1: 4, N2: 0, 'Q0.0': false });
  step = scan(project, step);
  const sumOk = step.state.N2 === 7;
  const compareOk = step.state['Q0.0'] === true;

  return assertResult('matemática e comparador', sumOk && compareOk, `state=${JSON.stringify(step.state)}`);
}

function collectGuidedSteps(lessonId: string, sequence: PlcState[]): Set<string> {
  const project = createLessonEditorProject(lessonId);
  let state: PlcState = {};
  let runtime = createInitialRuntimeState();
  const completed = new Set<string>();

  for (let index = 0; index < sequence.length; index += 1) {
    const result = evaluateEditorProject(project, { ...state, ...sequence[index] }, index + 1, runtime);
    state = result.state;
    runtime = result.runtime;
    for (const guidedStep of getGuidedPracticeSteps(lessonId, result)) {
      if (guidedStep.passed) completed.add(guidedStep.id);
    }
  }

  return completed;
}

function repeatedPatch(count: number, patch: PlcState): PlcState[] {
  return Array.from({ length: count }, () => patch);
}

const guidedPracticeSequences: Record<string, PlcState[]> = {
  'normally-open-contact': [
    { 'I0.0': true },
    { 'I0.0': false },
  ],
  'normally-closed-contact': [
    {},
    { 'I0.1': true },
  ],
  'output-coil': [
    { 'I0.0': true },
    { 'I0.0': false },
  ],
  'and-logic': [
    { 'I0.0': true },
    { 'I0.2': true },
  ],
  'or-logic': [
    { 'I0.0': true },
    { 'I0.0': false, 'M0.0': true },
  ],
  'seal-circuit': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.1': true },
  ],
  'direct-start-simple': [
    { 'I0.0': true },
    { 'I0.0': false },
  ],
  'direct-start-with-seal': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.1': true },
  ],
  'direct-start-stop-button': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.1': true },
  ],
  'direct-start-emergency': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.2': true },
  ],
  'direct-start-overload': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.3': true },
  ],
  'logical-interlock': [
    { 'I0.0': true },
    { 'I0.1': true },
    { 'I0.0': false, 'I0.2': true },
    { 'I0.1': true, 'I0.2': false },
  ],
  'motor-reversing': [
    { 'I0.0': true },
    { 'I0.1': true },
    { 'I0.0': false, 'I0.2': true },
    { 'I0.1': true, 'I0.2': false },
  ],
  'ton-delay': [
    ...repeatedPatch(30, { I0: true }),
    { I0: false },
  ],
  'tof-delay': [
    { I0: true },
    ...repeatedPatch(15, { I0: false }),
    ...repeatedPatch(20, { I0: false }),
  ],
  'tp-pulse': [
    { I0: true },
    { I0: false },
    ...repeatedPatch(30, { I0: false }),
  ],
  'ctu-counter': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.0': true },
  ],
  'ctd-counter': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.0': true },
  ],
  'ctud-counter': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.1': true },
    { 'I0.1': false, 'M0.0': true },
  ],
  'edge-contacts': [
    { 'I0.0': true },
    { 'I0.0': true },
  ],
  'set-reset-coils': [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.1': true },
  ],
  'compare-equ': [
    { N0: 10 },
  ],
  'math-add-mov': [
    { N0: 6, N1: 4, 'I0.0': true },
  ],
  'star-delta': [
    { 'I0.0': true },
    ...repeatedPatch(50, { 'I0.0': false }),
  ],
  'reversing-star-delta': [
    { 'I0.0': true },
    ...repeatedPatch(50, { 'I0.0': false }),
    { 'I0.1': true },
    ...repeatedPatch(55, { 'I0.1': false }),
  ],
  'reversing-star-delta-tof': [
    { 'I0.0': true },
    ...repeatedPatch(10, { 'I0.0': false }),
    { 'I0.1': true },
    ...repeatedPatch(25, { 'I0.1': false }),
    ...repeatedPatch(45, { 'I0.1': false }),
  ],
  'pump-level-control': [
    { 'I0.0': true },
    { 'I0.0': false, 'I0.1': true },
    { 'I0.1': false, 'I0.0': true },
    { 'I0.0': false, 'I0.2': true },
  ],
  'conveyor-batch-counter': [
    { 'I0.2': true },
    { 'I0.2': true, 'I0.0': true },
    { 'I0.2': true, 'I0.0': false },
    { 'I0.2': true, 'I0.0': true },
    { 'I0.2': true, 'I0.0': false },
    { 'I0.2': true, 'I0.0': true },
    { 'I0.2': true, 'I0.0': false },
    { 'I0.2': true, 'I0.0': true },
    { 'I0.2': true, 'I0.0': false },
    { 'I0.2': true, 'I0.0': true },
    { 'I0.2': true, 'I0.0': false },
    { 'I0.2': true, 'I0.1': true },
  ],
  'sequential-motors': [
    { 'I0.0': true },
    ...repeatedPatch(30, { 'I0.0': false }),
    ...repeatedPatch(30, { 'I0.0': false }),
    { 'I0.1': true },
  ],
  'traffic-light-sequence': [
    { 'I0.0': true },
    ...repeatedPatch(30, { 'I0.0': true }),
    ...repeatedPatch(20, { 'I0.0': true }),
  ],
  'compressor-pressure': [
    { 'I0.0': true },
    ...repeatedPatch(20, { 'I0.0': false }),
    { 'I0.1': true },
    { 'I0.1': false, 'I0.0': true },
    { 'I0.0': false, 'I0.2': true },
  ],
};

function runGuidedPracticeRegression(): RegressionResult {
  const seal = collectGuidedSteps('direct-start-with-seal', [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.1': true },
  ]);
  const ton = collectGuidedSteps('ton-delay', [
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: true },
    { I0: false },
  ]);
  const ctu = collectGuidedSteps('ctu-counter', [
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.0': true },
    { 'I0.0': false },
    { 'I0.0': true },
  ]);
  const ctdProject = createLessonEditorProject('ctd-counter');
  const ctdDiagnostics = evaluateEditorProject(ctdProject, {}, 1, createInitialRuntimeState()).diagnostics
    .filter((diagnostic) => diagnostic.severity !== 'info');

  const passed = seal.size === 3 && ton.size === 3 && ctu.size === 2 && ctdDiagnostics.length === 0;
  return assertResult('teste guiado das lições', passed, `seal=${seal.size}, ton=${ton.size}, ctu=${ctu.size}, ctdDiagnostics=${ctdDiagnostics.length}`);
}

function runAllLessonDiagnosticsRegression(): RegressionResult {
  const availableLessons = lessons.filter((lesson) => lesson.status === 'available');
  const failures: string[] = [];

  for (const lesson of availableLessons) {
    const project = createLessonEditorProject(lesson.id);
    const diagnostics = evaluateEditorProject(project, {}, 1, createInitialRuntimeState()).diagnostics;
    const seriousDiagnostics = diagnostics.filter((diagnostic) => diagnostic.severity !== 'info');
    const undeclaredInfo = diagnostics.filter((diagnostic) => diagnostic.id.startsWith('undeclared-variable-'));
    const unexpectedInfo = diagnostics.filter((diagnostic) =>
      diagnostic.severity === 'info' &&
      !diagnostic.id.startsWith('duplicate-writer-') &&
      !diagnostic.id.startsWith('undeclared-variable-'),
    );

    if (seriousDiagnostics.length > 0 || undeclaredInfo.length > 0 || unexpectedInfo.length > 0) {
      failures.push(`${lesson.id}: serious=${seriousDiagnostics.length}, undeclared=${undeclaredInfo.length}, unexpectedInfo=${unexpectedInfo.length}`);
    }
  }

  return assertResult('diagnósticos de todas as lições', failures.length === 0, failures.join(' | '));
}

function runAllGuidedLessonsRegression(): RegressionResult {
  const availableLessons = lessons.filter((lesson) => lesson.status === 'available');
  const failures: string[] = [];

  for (const lesson of availableLessons) {
    const sequence = guidedPracticeSequences[lesson.id];
    if (!sequence) {
      failures.push(`${lesson.id}: sem sequência`);
      continue;
    }

    const project = createLessonEditorProject(lesson.id);
    const baseline = evaluateEditorProject(project, {}, 0, createInitialRuntimeState());
    const expectedCount = getGuidedPracticeSteps(lesson.id, baseline).length;
    const completed = collectGuidedSteps(lesson.id, sequence);
    if (completed.size !== expectedCount) {
      failures.push(`${lesson.id}: ${completed.size}/${expectedCount}`);
    }
  }

  return assertResult('teste guiado de todas as lições', failures.length === 0, failures.join(' | '));
}

export function runEditorEvaluatorRegressionSuite(): RegressionResult[] {
  return [
    runSealRegression(),
    runTonRegression(),
    runCtuRegression(),
    runCtudRegression(),
    runMathCompareRegression(),
    runGuidedPracticeRegression(),
    runAllLessonDiagnosticsRegression(),
    runAllGuidedLessonsRegression(),
  ];
}
