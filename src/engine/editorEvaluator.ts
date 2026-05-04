import { EditorBlock, EditorCoilMode, EditorCounterMode, EditorParallelBranch, EditorProjectState, EditorRung, EditorTimerMode } from './editorTypes';
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

function contactRawValue(block: EditorBlock, state: PlcState): boolean {
  return Boolean(state[normalizeVariable(block.variable)]);
}

function evaluateContact(block: EditorBlock, state: PlcState, runtime?: EditorRuntimeState): boolean {
  if (block.compareMode) return evaluateCompare(block, state);
  const value = contactRawValue(block, state);
  if (block.contactMode === 'NC') return !value;
  if (block.contactMode === 'RISING') return value && !Boolean(runtime?.previousContactValues[block.id]);
  if (block.contactMode === 'FALLING') return !value && Boolean(runtime?.previousContactValues[block.id]);
  return value;
}

function normalizeVariable(variable: string): string {
  return variable.trim().toUpperCase();
}

function isInputAddress(variable: string): boolean {
  return normalizeVariable(variable).startsWith('I');
}

function addressPrefix(variable: string): string {
  return normalizeVariable(variable).charAt(0);
}

function isValidAddress(variable: string): boolean {
  return /^[IQOMCTN]\d+(\.\d+)?$/.test(normalizeVariable(variable));
}

function isNumericAddress(variable: string): boolean {
  return ['N', 'T', 'C'].includes(addressPrefix(variable));
}

function isBooleanAddress(variable: string): boolean {
  return ['I', 'Q', 'O', 'M'].includes(addressPrefix(variable));
}

function isNumericLiteral(source: string | undefined): boolean {
  if (!source) return false;
  const value = Number(source.trim().replace(',', '.'));
  return Number.isFinite(value);
}

function readNumericValue(source: string | undefined, state: PlcState): number {
  const raw = (source ?? '0').trim().toUpperCase();
  if (!raw) return 0;
  const literal = Number(raw.replace(',', '.'));
  if (Number.isFinite(literal)) return literal;
  const value = state[raw];
  if (typeof value === 'number') return value;
  return value ? 1 : 0;
}

function readBooleanValue(source: string | undefined, state: PlcState): boolean {
  const raw = (source ?? '').trim().toUpperCase();
  if (!raw) return false;
  const literal = Number(raw.replace(',', '.'));
  if (Number.isFinite(literal)) return literal !== 0;
  return Boolean(state[raw]);
}

function evaluateCompare(block: EditorBlock, state: PlcState): boolean {
  const left = readNumericValue(block.sourceA, state);
  const right = readNumericValue(block.sourceB, state);

  switch (block.compareMode) {
    case 'NEQ':
      return left !== right;
    case 'GRT':
      return left > right;
    case 'LES':
      return left < right;
    case 'GEQ':
      return left >= right;
    case 'LEQ':
      return left <= right;
    case 'EQU':
    default:
      return left === right;
  }
}

function evaluateSeries(blocks: EditorBlock[], state: PlcState, runtime?: EditorRuntimeState): boolean {
  const contacts = blocks.filter(isContact);
  if (contacts.length === 0) return true;
  return contacts.every((block) => evaluateContact(block, state, runtime));
}

function evaluateParallel(blocks: EditorBlock[], state: PlcState, runtime?: EditorRuntimeState): boolean {
  const contacts = blocks.filter(isContact);
  if (contacts.length === 0) return false;
  return contacts.some((block) => evaluateContact(block, state, runtime));
}

function parallelBranchesFor(rung: EditorRung): EditorParallelBranch[] {
  if (rung.parallelBranches) return rung.parallelBranches;
  return rung.parallelBlocks.map((block, index) => ({
    id: `${rung.id}-legacy-branch-${block.id}`,
    seriesIndex: block.parallelIndex ?? index,
    blocks: [block],
  }));
}

function evaluateBranch(branch: EditorParallelBranch, state: PlcState, runtime?: EditorRuntimeState): boolean {
  const contacts = branch.blocks.filter(isContact);
  if (contacts.length === 0) return false;
  return contacts.every((block) => evaluateContact(block, state, runtime));
}

function branchEndIndex(branch: EditorParallelBranch, seriesLength: number): number {
  const startIndex = Math.min(Math.max(branch.seriesIndex, 0), Math.max(seriesLength - 1, 0));
  const branchSpan = Math.max(branch.blocks.filter(isContact).length, 1);
  return Math.min(startIndex + branchSpan, seriesLength);
}

function evaluateRung(rung: EditorRung, state: PlcState, runtime: EditorRuntimeState): boolean {
  const seriesContacts = rung.seriesBlocks.filter(isContact);
  const parallelBranches = parallelBranchesFor(rung);
  const seriesLength = seriesContacts.length;

  if (seriesLength === 0 && parallelBranches.length === 0) return false;
  if (seriesLength === 0) return parallelBranches.some((branch) => evaluateBranch(branch, state, runtime));

  const reachable = new Set<number>([0]);

  for (let nodeIndex = 0; nodeIndex < seriesLength; nodeIndex += 1) {
    if (!reachable.has(nodeIndex)) continue;

    if (evaluateContact(seriesContacts[nodeIndex], state, runtime)) {
      reachable.add(nodeIndex + 1);
    }

    for (const branch of parallelBranches) {
      if (branch.seriesIndex !== nodeIndex) continue;
      if (evaluateBranch(branch, state, runtime)) {
        reachable.add(branchEndIndex(branch, seriesLength));
      }
    }
  }

  return reachable.has(seriesLength);
}

function applyCoilMode(
  state: PlcState,
  variable: string,
  energized: boolean,
  mode: EditorCoilMode | undefined,
  previousRungPower: boolean,
): PlcState {
  const nextState = { ...state };
  const address = normalizeVariable(variable);

  switch (mode) {
    case 'SET':
      if (energized) nextState[address] = true;
      break;
    case 'RESET':
      if (energized) nextState[address] = false;
      break;
    case 'PULSE':
      nextState[address] = energized && !previousRungPower;
      break;
    case 'NORMAL':
    default:
      nextState[address] = energized;
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
  state: PlcState,
  runtime: EditorRuntimeState,
): { runtime: EditorRuntimeState; q: boolean } {
  const previous = getCounterRuntime(runtime, block.id);
  const preset = Math.max(block.preset ?? 1, 1);
  const mode: EditorCounterMode = block.counterMode ?? 'CTU';
  const risingEdge = energized && !previous.previousCu;
  const downInput = mode === 'CTUD' ? readBooleanValue(block.downSource, state) : false;
  const resetInput = readBooleanValue(block.resetSource, state);
  const fallingOrRisingCd = downInput && !previous.previousCd;
  const resetEdge = resetInput && !previous.previousReset;
  let currentValue = previous.currentValue;

  if (resetEdge) {
    currentValue = 0;
  } else if (mode === 'CTD' && previous.currentValue === 0 && !previous.previousCu) {
    currentValue = preset;
  }

  if (!resetEdge && risingEdge && mode === 'CTU') {
    currentValue = Math.min(currentValue + 1, preset);
  }

  if (!resetEdge && risingEdge && mode === 'CTD') {
    currentValue = Math.max(currentValue - 1, 0);
  }

  if (!resetEdge && risingEdge && mode === 'CTUD') {
    currentValue = Math.min(currentValue + 1, preset);
  }

  if (!resetEdge && fallingOrRisingCd && mode === 'CTUD') {
    currentValue = Math.max(currentValue - 1, 0);
  }

  const nextCounter: CounterRuntimeState = {
    currentValue,
    q: mode === 'CTD' ? currentValue <= 0 : currentValue >= preset,
    previousCu: energized,
    previousCd: downInput,
    previousReset: resetInput,
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
  previousRungPower: boolean,
): { state: PlcState; runtime: EditorRuntimeState } {
  const variable = normalizeVariable(block.variable);

  if (block.role === 'coil') {
    if (block.mathMode) {
      return applyMathBlock(state, runtime, block, energized);
    }

    return {
      state: applyCoilMode(state, variable, energized, block.coilMode, previousRungPower),
      runtime,
    };
  }

  if (block.role === 'timer') {
    const result = evaluateTimer(block, energized, runtime);
    return {
      state: { ...state, [variable]: result.q },
      runtime: result.runtime,
    };
  }

  if (block.role === 'counter') {
    const result = evaluateCounter(block, energized, state, runtime);
    return {
      state: { ...state, [variable]: result.q },
      runtime: result.runtime,
    };
  }

  return { state, runtime };
}

function applyMathBlock(
  state: PlcState,
  runtime: EditorRuntimeState,
  block: EditorBlock,
  energized: boolean,
): { state: PlcState; runtime: EditorRuntimeState } {
  if (!energized) return { state, runtime };

  const destination = normalizeVariable(block.destination ?? block.variable);
  const left = readNumericValue(block.sourceA, state);
  const right = readNumericValue(block.sourceB, state);
  let result = left;

  switch (block.mathMode) {
    case 'ADD':
      result = left + right;
      break;
    case 'SUB':
      result = left - right;
      break;
    case 'MUL':
      result = left * right;
      break;
    case 'DIV':
      result = right === 0 ? 0 : left / right;
      break;
    case 'MOV':
    default:
      result = left;
      break;
  }

  return {
    state: {
      ...state,
      [destination]: result,
    },
    runtime,
  };
}

function allBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...parallelBranchesFor(rung).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function resetFunctionalRuntimeByVariable(
  project: EditorProjectState,
  runtime: EditorRuntimeState,
  variable: string,
): EditorRuntimeState {
  const address = normalizeVariable(variable);
  let nextRuntime = runtime;

  for (const block of allBlocks(project)) {
    if (normalizeVariable(block.variable) !== address) continue;

    if (block.role === 'timer') {
      nextRuntime = {
        ...nextRuntime,
        timers: {
          ...nextRuntime.timers,
          [block.id]: {
            elapsedMs: 0,
            q: false,
            previousIn: false,
          },
        },
      };
    }

    if (block.role === 'counter') {
      nextRuntime = {
        ...nextRuntime,
        counters: {
          ...nextRuntime.counters,
          [block.id]: {
            currentValue: 0,
            q: false,
            previousCu: false,
            previousCd: false,
            previousReset: false,
          },
        },
      };
    }
  }

  return nextRuntime;
}

function captureContactValues(project: EditorProjectState, state: PlcState): Record<string, boolean> {
  const values: Record<string, boolean> = {};
  for (const block of allBlocks(project)) {
    if (!isContact(block) || block.compareMode) continue;
    values[block.id] = contactRawValue(block, state);
  }
  return values;
}

function validateProject(project: EditorProjectState): EditorDiagnostic[] {
  const diagnostics: EditorDiagnostic[] = [];
  const writers = new Map<string, { label: string; mode: EditorCoilMode | 'FUNCTION' }[]>();
  const declaredVariables = new Set((project.projectVariables ?? []).map((variable) => normalizeVariable(variable.id)));
  const usedAddresses = new Set<string>();

  for (const rung of project.rungs) {
    const hasLogic = rung.seriesBlocks.some(isContact) || rung.parallelBlocks.some(isContact) || parallelBranchesFor(rung).some((branch) => branch.blocks.some(isContact));

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
        message: `${rung.label}: a linha ainda não possui saída/função no final do rung.`,
      });
      continue;
    }

    for (const branch of parallelBranchesFor(rung)) {
      const branchContacts = branch.blocks.filter(isContact);
      if (branchContacts.length === 0) {
        diagnostics.push({
          id: `${branch.id}-empty-branch`,
          severity: 'warning',
          message: `${rung.label}: um ramo paralelo está sem contatos válidos. Em Ladder, um ramo vazio não deve fechar a lógica sozinho.`,
        });
      }

      if (branch.seriesIndex < 0 || branch.seriesIndex >= Math.max(rung.seriesBlocks.filter(isContact).length, 1)) {
        diagnostics.push({
          id: `${branch.id}-invalid-branch-start`,
          severity: 'warning',
          message: `${rung.label}: um ramo paralelo começa fora dos pontos válidos da linha.`,
        });
      }
    }

    if (!isWritableFunctionalBlock(rung.coilBlock)) {
      diagnostics.push({
        id: `${rung.id}-invalid-functional-block`,
        severity: 'error',
        message: `${rung.label}: o bloco final não é uma bobina, temporizador, contador ou função válida.`,
      });
      continue;
    }

    const variable = normalizeVariable(rung.coilBlock.variable);
    const currentWriters = writers.get(variable) ?? [];
    writers.set(variable, [
      ...currentWriters,
      {
        label: rung.label,
        mode: rung.coilBlock.role === 'coil' ? rung.coilBlock.coilMode ?? 'NORMAL' : 'FUNCTION',
      },
    ]);

    const blocks = [...rung.seriesBlocks, ...rung.parallelBlocks, ...parallelBranchesFor(rung).flatMap((branch) => branch.blocks), rung.coilBlock].filter(Boolean) as EditorBlock[];
    for (const block of blocks) {
      const addressEntries = [
        { value: block.variable, label: 'variável' },
        { value: block.sourceA, label: 'A' },
        { value: block.sourceB, label: 'B' },
        { value: block.destination, label: 'destino' },
        { value: block.downSource, label: 'CD' },
        { value: block.resetSource, label: 'RES' },
      ].filter((entry): entry is { value: string; label: string } => Boolean(entry.value && !isNumericLiteral(entry.value)));

      for (const entry of addressEntries) {
        const address = normalizeVariable(entry.value);
        if (!isValidAddress(address)) {
          diagnostics.push({
            id: `${block.id}-invalid-address-${entry.label}`,
            severity: 'warning',
            message: `${block.name}: endereço de ${entry.label} "${entry.value}" fora do padrão sugerido. Use exemplos como I0.0, Q0.0, M10.0, N0, T1 ou C1.`,
          });
        } else {
          usedAddresses.add(address);
        }
      }

      const address = normalizeVariable(block.variable);
      if (block.role === 'coil' && isInputAddress(address)) {
        diagnostics.push({
          id: `${block.id}-coil-input-address`,
          severity: 'warning',
          message: `${block.name}: bobina escrevendo em entrada ${address}. Em CLP real, entradas são imagem de campo e normalmente não devem ser escritas pelo programa.`,
        });
      }

      if (block.role === 'timer' && addressPrefix(address) !== 'T') {
        diagnostics.push({
          id: `${block.id}-timer-address-type`,
          severity: 'warning',
          message: `${block.name}: temporizador deveria usar uma Timer tag como T0, T1 ou T2. Endereço atual: ${address}.`,
        });
      }

      if (block.role === 'counter' && addressPrefix(address) !== 'C') {
        diagnostics.push({
          id: `${block.id}-counter-address-type`,
          severity: 'warning',
          message: `${block.name}: contador deveria usar uma Counter tag como C0, C1 ou C2. Endereço atual: ${address}.`,
        });
      }

      if (block.role === 'coil' && !block.mathMode && ['T', 'C', 'N'].includes(addressPrefix(address)) && block.coilMode !== 'RESET') {
        diagnostics.push({
          id: `${block.id}-coil-structured-address`,
          severity: 'warning',
          message: `${block.name}: bobina normal deve escrever em saída ou memória booleana, como Q0.0 ou M0.0. Use RESET para T/C quando precisar zerar temporizador ou contador.`,
        });
      }

      if (
        block.role === 'contact' &&
        !block.compareMode &&
        isValidAddress(address) &&
        !isBooleanAddress(address) &&
        !['T', 'C'].includes(addressPrefix(address))
      ) {
        diagnostics.push({
          id: `${block.id}-contact-numeric-address`,
          severity: 'warning',
          message: `${block.name}: contato NA/NF deveria usar tag booleana, como I0.0, Q0.0 ou M0.0. Para N use comparadores; T/C podem ser usados como contato do bit Q.`,
        });
      }

      if (block.mathMode) {
        const destination = normalizeVariable(block.destination ?? block.variable);
        if (isValidAddress(destination) && !isNumericAddress(destination)) {
          diagnostics.push({
            id: `${block.id}-math-destination-type`,
            severity: 'warning',
            message: `${block.name}: destino matemático deveria ser tag numérica, como N0. Destino atual: ${destination}.`,
          });
        }
      }

      if (block.compareMode) {
        for (const source of [block.sourceA, block.sourceB]) {
          if (!source || isNumericLiteral(source)) continue;
          const sourceAddress = normalizeVariable(source);
          if (isValidAddress(sourceAddress) && !isNumericAddress(sourceAddress)) {
            diagnostics.push({
              id: `${block.id}-compare-source-${sourceAddress}`,
              severity: 'info',
              message: `${block.name}: comparador está usando ${sourceAddress}. Tags booleanas serão lidas como 0/1; para valores analógicos prefira N/T/C.`,
            });
          }
        }
      }
    }

    if (rung.coilBlock.role === 'counter' && rung.coilBlock.counterMode === 'CTUD') {
      const hasDownSource = Boolean(rung.coilBlock.downSource?.trim());
      const hasResetSource = Boolean(rung.coilBlock.resetSource?.trim());
      if (!hasDownSource || !hasResetSource) {
        diagnostics.push({
          id: `${rung.id}-ctud-missing-pin`,
          severity: 'warning',
          message: `${rung.label}: CTUD precisa de CU pela energia da linha e tags booleanas para CD/RES no editor do bloco.`,
        });
      }
    }
  }

  for (const address of usedAddresses) {
    if (!declaredVariables.has(address)) {
      diagnostics.push({
        id: `undeclared-variable-${address}`,
        severity: 'info',
        message: `${address} está sendo usado no Ladder, mas ainda não foi declarado na Tabela de Tags/I/O. A simulação cria o estado automaticamente; declarar a tag ajuda a organizar o projeto.`,
      });
    }
  }

  for (const [variable, writerEntries] of writers.entries()) {
    if (writerEntries.length > 1) {
      const hasOnlySetReset = writerEntries.every((entry) => entry.mode === 'SET' || entry.mode === 'RESET');
      const hasFunctionWithReset = writerEntries.every((entry) => entry.mode === 'FUNCTION' || entry.mode === 'RESET')
        && writerEntries.some((entry) => entry.mode === 'FUNCTION')
        && writerEntries.some((entry) => entry.mode === 'RESET');
      diagnostics.push({
        id: `duplicate-writer-${variable}`,
        severity: hasOnlySetReset || hasFunctionWithReset ? 'info' : 'warning',
        message: hasOnlySetReset
          ? `A variável ${variable} possui SET/RESET em mais de uma linha: ${writerEntries.map((entry) => entry.label).join(', ')}. Esse padrão é válido, mas revise a ordem de varredura.`
          : hasFunctionWithReset
            ? `A variável ${variable} possui bloco funcional e RESET dedicado: ${writerEntries.map((entry) => entry.label).join(', ')}. Esse padrão é válido para temporizadores/contadores.`
          : `A variável ${variable} é escrita por mais de uma linha: ${writerEntries.map((entry) => entry.label).join(', ')}. Em CLP, a última escrita no scan pode prevalecer.`,
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
    previousRungPower: { ...currentRuntime.previousRungPower },
    previousContactValues: { ...currentRuntime.previousContactValues },
  };
  const rungResults: Record<string, boolean> = {};
  const nextRungPower: Record<string, boolean> = {};

  for (const rung of project.rungs) {
    const energized = isWritableFunctionalBlock(rung.coilBlock) ? evaluateRung(rung, nextState, nextRuntime) : false;
    const previousRungPower = Boolean(currentRuntime.previousRungPower[rung.id]);
    rungResults[rung.id] = energized;
    nextRungPower[rung.id] = energized;

    if (isWritableFunctionalBlock(rung.coilBlock)) {
      const result = applyFunctionalBlock(nextState, nextRuntime, rung.coilBlock, energized, previousRungPower);
      nextState = result.state;
      nextRuntime = result.runtime;

      if (rung.coilBlock.role === 'coil' && rung.coilBlock.coilMode === 'RESET' && energized) {
        const variable = normalizeVariable(rung.coilBlock.variable);
        nextRuntime = resetFunctionalRuntimeByVariable(project, nextRuntime, variable);
        nextState = {
          ...nextState,
          [variable]: false,
        };
      }
    }
  }

  nextRuntime = {
    ...nextRuntime,
    previousRungPower: nextRungPower,
    previousContactValues: captureContactValues(project, nextState),
  };

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
  const address = normalizeVariable(inputId);
  return evaluateEditorProject(project, {
    ...state,
    [address]: value,
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
  const hasLogic = project.rungs.some((rung) => rung.seriesBlocks.length > 0 || rung.parallelBlocks.length > 0 || parallelBranchesFor(rung).some((branch) => branch.blocks.length > 0));

  if (hasError) return 'Há erro estrutural na lógica. Corrija os blocos inválidos antes de confiar na simulação.';
  if (!hasLogic) return 'O editor ainda não possui contatos ou entradas. Adicione blocos em Série ou Paralelo para criar uma condição lógica.';
  if (!hasFunctionalBlock) return 'A lógica possui contatos, mas ainda não tem saída/função no final da linha.';
  if (hasWarning) return 'A lógica foi simulada, mas há avisos importantes. Revise os diagnósticos antes de avançar.';
  if (energizedCount > 0) return `Há ${energizedCount} linha(s) energizada(s). Bobinas, temporizadores e contadores foram atualizados pelo ciclo de varredura.`;
  return 'Nenhuma linha está energizada. Verifique as entradas virtuais e os contatos NA/NF inseridos no editor.';
}
