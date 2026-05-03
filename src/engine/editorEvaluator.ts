import { EditorBlock, EditorCoilMode, EditorCounterMode, EditorProjectState, EditorRung, EditorTimerMode } from './editorTypes';
import { PlcState } from './projectTypes';
import { createInitialRuntimeState, CounterRuntimeState, EditorRuntimeState, getCounterRuntime, getTimerRuntime, TimerRuntimeState } from './runtimeTypes';

export type EditorDiagnosticSeverity = 'info' | 'warning' | 'error';

export type EditorDiagnostic = {
  id: string;
  severity: EditorDiagnosticSeverity;
  message: string;
};

export type EditorEvaluationResult = {
  state: PlcState;
  rungResults: Record<string, boolean>;
  diagnostics: EditorDiagnostic[];
  runtime: EditorRuntimeState;
  scanNumber: number;
  explanation: string;
};

export function createInitialEditorState(): PlcState {
  return {
    I0: false,
    I1: false,
    I2: false,
    I3: false,
    Q0: false,
    Q1: false,
    M0: false,
    M1: false,
    T0: false,
    T1: false,
    C0: false,
    C1: false,
  };
}

function isContact(block: EditorBlock): boolean {
  return block.role === 'contact';
}

function isWritableFunctionalBlock(block: EditorBlock | null): block is EditorBlock {
  return Boolean(block && ['coil', 'timer', 'counter'].includes(block.role) && block.variable);
}

function evaluateContact(block: EditorBlock, state: PlcState): boolean {
  const value = Boolean(state[block.variable]);
  return block.contactMode === 'NC' ? !value : value;
}

function evaluateSeries(blocks: EditorBlock[], state: PlcState): boolean {
  const contacts = blocks.filter(isContact);
  if (contacts.length === 0) return true;
  return contacts.every((block) => evaluateContact(block, state));
}

function evaluateParallel(blocks: EditorBlock[], state: PlcState): boolean {
  const contacts = blocks.filter(isContact);
  if (contacts.length === 0) return false;
  return contacts.some((block) => evaluateContact(block, state));
}

function evaluateRung(rung: EditorRung, state: PlcState): boolean {
  const seriesOk = evaluateSeries(rung.seriesBlocks, state);
  const hasParallel = rung.parallelBlocks.some(isContact);
  const parallelOk = hasParallel ? evaluateParallel(rung.parallelBlocks, state) : true;
  return seriesOk && parallelOk;
}

function applyCoilMode(state: PlcState, variable: string, energized: boolean, mode: EditorCoilMode | undefined): PlcState {
  const nextState = { ...state };

  switch (mode) {
    case 'SET':
      if (energized) nextState[variable] = true;
      break;
    case 'RESET':
      if (energized) nextState[variable] = false;
      break;
    case 'PULSE':
      nextState[variable] = energized;
      break;
    case 'NORMAL':
    default:
      nextState[variable] = energized;
      break;
  }

  return nextState;
}

function evaluateTimer(
  block: EditorBlock,
  energized: boolean,
  runtime: EditorRuntimeState,
): { runtime: EditorRuntimeState; q: boolean } {
  const previous = getTimerRuntime(runtime, block.id);
  const presetMs = Math.max(block.presetMs ?? 1000, runtime.scanStepMs);
  const mode: EditorTimerMode = block.timerMode ?? 'TON';
  let nextTimer: TimerRuntimeState = previous;

  if (mode === 'TON') {
    const elapsedMs = energized ? Math.min(previous.elapsedMs + runtime.scanStepMs, presetMs) : 0;
    nextTimer = {
      elapsedMs,
      q: energized && elapsedMs >= presetMs,
      previousIn: energized,
    };
  }

  if (mode === 'TOF') {
    if (energized) {
      nextTimer = { elapsedMs: 0, q: true, previousIn: true };
    } else if (previous.q) {
      const elapsedMs = Math.min(previous.elapsedMs + runtime.scanStepMs, presetMs);
      nextTimer = {
        elapsedMs,
        q: elapsedMs < presetMs,
        previousIn: false,
      };
    } else {
      nextTimer = { elapsedMs: 0, q: false, previousIn: false };
    }
  }

  if (mode === 'TP') {
    const risingEdge = energized && !previous.previousIn;

    if (risingEdge) {
      nextTimer = { elapsedMs: 0, q: true, previousIn: energized };
    } else if (previous.q) {
      const elapsedMs = Math.min(previous.elapsedMs + runtime.scanStepMs, presetMs);
      nextTimer = {
        elapsedMs,
        q: elapsedMs < presetMs,
        previousIn: energized,
      };
    } else {
      nextTimer = { elapsedMs: 0, q: false, previousIn: energized };
    }
  }

  return {
    runtime: {
      ...runtime,
      timers: {
        ...runtime.timers,
        [block.id]: nextTimer,
      },
    },
    q: nextTimer.q,
  };
}

function evaluateCounter(
  block: EditorBlock,
  energized: boolean,
  runtime: EditorRuntimeState,
): { runtime: EditorRuntimeState; q: boolean } {
  const previous = getCounterRuntime(runtime, block.id);
  const preset = Math.max(block.preset ?? 1, 1);
  const mode: EditorCounterMode = block.counterMode ?? 'CTU';
  const risingEdge = energized && !previous.previousCu;
  let currentValue = previous.currentValue;

  if (risingEdge && mode === 'CTU') {
    currentValue += 1;
  }

  if (risingEdge && mode === 'CTD') {
    currentValue = Math.max(currentValue - 1, 0);
  }

  const nextCounter: CounterRuntimeState = {
    currentValue,
    q: mode === 'CTD' ? currentValue <= 0 : currentValue >= preset,
    previousCu: energized,
    previousCd: false,
  };

  return {
    runtime: {
      ...runtime,
      counters: {
        ...runtime.counters,
        [block.id]: nextCounter,
      },
    },
    q: nextCounter.q,
  };
}

function applyFunctionalBlock(
  state: PlcState,
  runtime: EditorRuntimeState,
  block: EditorBlock,
  energized: boolean,
): { state: PlcState; runtime: EditorRuntimeState } {
  if (block.role === 'coil') {
    return {
      state: applyCoilMode(state, block.variable, energized, block.coilMode),
      runtime,
    };
  }

  if (block.role === 'timer') {
    const result = evaluateTimer(block, energized, runtime);
    return {
      state: { ...state, [block.variable]: result.q },
      runtime: result.runtime,
    };
  }

  if (block.role === 'counter') {
    const result = evaluateCounter(block, energized, runtime);
    return {
      state: { ...state, [block.variable]: result.q },
      runtime: result.runtime,
    };
  }

  return { state, runtime };
}

function validateProject(project: EditorProjectState): EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];
  const writers = new Map<string, string[]>();

  for (const rung of project.rungs) {
    const hasLogic = rung.seriesBlocks.some(isContact) || rung.parallelBlocks.some(isContact);

    if (!hasLogic) {
      diagnostics.push({
        id: `${rung.id}-no-logic`,
        severity: 'info',
        message: `${rung.label}: adicione pelo menos um contato em Série ou Paralelo para criar uma condição.`,
      });
    }

    if (!rung.coilBlock) {
      diagnostics.push({
        id: `${rung.id}-no-coil`,
        severity: 'warning',
        message: `${rung.label}: a linha ainda não possui bobina/saída/bloco funcional.`,
      });
      continue;
    }

    if (!isWritableFunctionalBlock(rung.coilBlock)) {
      diagnostics.push({
        id: `${rung.id}-invalid-functional-block`,
        severity: 'error',
        message: `${rung.label}: o bloco final não é uma bobina, temporizador ou contador válido.`,
      });
      continue;
    }

    const variable = rung.coilBlock.variable;
    const currentWriters = writers.get(variable) ?? [];
    writers.set(variable, [...currentWriters, rung.label]);

    if (rung.coilBlock.isPro) {
      diagnostics.push({
        id: `${rung.id}-pro-functional-block`,
        severity: 'info',
        message: `${rung.label}: ${rung.coilBlock.name} é recurso Pro para projetos próprios, mas pode ser estudado no modo educativo.`,
      });
    }
  }

  for (const [variable, rungLabels] of writers.entries()) {
    if (rungLabels.length > 1) {
      diagnostics.push({
        id: `duplicate-writer-${variable}`,
        severity: 'warning',
        message: `A variável ${variable} é escrita por mais de uma linha: ${rungLabels.join(', ')}. Em CLP isso pode causar comportamento confuso.`,
      });
    }
  }

  return diagnostics;
}

export function evaluateEditorProject(
  project: EditorProjectState,
  currentState: PlcState,
  scanNumber = 0,
  currentRuntime: EditorRuntimeState = createInitialRuntimeState(),
): EditorEvaluationResult {
  let nextState: PlcState = { ...currentState };
  let nextRuntime: EditorRuntimeState = {
    ...currentRuntime,
    scanNumber,
  };
  const rungResults: Record<string, boolean> = {};

  for (const rung of project.rungs) {
    const energized = isWritableFunctionalBlock(rung.coilBlock) ? evaluateRung(rung, nextState) : false;
    rungResults[rung.id] = energized;

    if (isWritableFunctionalBlock(rung.coilBlock)) {
      const result = applyFunctionalBlock(nextState, nextRuntime, rung.coilBlock, energized);
      nextState = result.state;
      nextRuntime = result.runtime;
    }
  }

  const diagnostics = validateProject(project);

  return {
    state: nextState,
    rungResults,
    diagnostics,
    runtime: nextRuntime,
    scanNumber,
    explanation: buildEditorExplanation(project, nextState, rungResults, diagnostics),
  };
}

export function setEditorInput(
  project: EditorProjectState,
  state: PlcState,
  inputId: string,
  value: boolean,
  scanNumber = 0,
  runtime: EditorRuntimeState = createInitialRuntimeState(),
): EditorEvaluationResult {
  return evaluateEditorProject(project, {
    ...state,
    [inputId]: value,
  }, scanNumber, runtime);
}

function buildEditorExplanation(
  project: EditorProjectState,
  state: PlcState,
  rungResults: Record<string, boolean>,
  diagnostics: EditorDiagnostic[],
): string {
  const energizedCount = Object.values(rungResults).filter(Boolean).length;
  const hasError = diagnostics.some((diagnostic) => diagnostic.severity === 'error');
  const hasWarning = diagnostics.some((diagnostic) => diagnostic.severity === 'warning');
  const hasFunctionalBlock = project.rungs.some((rung) => Boolean(rung.coilBlock));
  const hasLogic = project.rungs.some((rung) => rung.seriesBlocks.length > 0 || rung.parallelBlocks.length > 0);

  if (hasError) return 'Há erro estrutural na lógica. Corrija os blocos inválidos antes de confiar na simulação.';
  if (!hasLogic) return 'O editor ainda não possui contatos ou entradas. Adicione blocos em Série ou Paralelo para criar uma condição lógica.';
  if (!hasFunctionalBlock) return 'A lógica possui contatos, mas ainda não tem bobina, temporizador ou contador no final da linha.';
  if (hasWarning) return 'A lógica foi simulada, mas há avisos importantes. Revise os diagnósticos antes de avançar.';
  if (energizedCount > 0) return `Há ${energizedCount} linha(s) energizada(s). Bobinas, temporizadores e contadores foram atualizados pelo ciclo de varredura.`;
  return 'Nenhuma linha está energizada. Verifique as entradas virtuais e os contatos NA/NF inseridos no editor.';
}
