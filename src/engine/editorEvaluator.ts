import { EditorBlock, EditorCoilMode, EditorProjectState, EditorRung } from './editorTypes';
import { PlcState } from './projectTypes';

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
  };
}

function isContact(block: EditorBlock): boolean {
  return block.role === 'contact';
}

function isWritableCoil(block: EditorBlock | null): block is EditorBlock {
  return Boolean(block && block.role === 'coil' && block.variable);
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
        message: `${rung.label}: a linha ainda não possui bobina/saída.`,
      });
      continue;
    }

    if (!isWritableCoil(rung.coilBlock)) {
      diagnostics.push({
        id: `${rung.id}-invalid-coil`,
        severity: 'error',
        message: `${rung.label}: o bloco na zona Bobina não é uma bobina válida.`,
      });
      continue;
    }

    const variable = rung.coilBlock.variable;
    const currentWriters = writers.get(variable) ?? [];
    writers.set(variable, [...currentWriters, rung.label]);

    if (rung.coilBlock.coilMode === 'SET' && rung.coilBlock.isPro) {
      diagnostics.push({
        id: `${rung.id}-set-pro`,
        severity: 'info',
        message: `${rung.label}: SET é um recurso Pro para projetos próprios, mas permanece visível para estudo.`,
      });
    }

    if (rung.coilBlock.coilMode === 'RESET' && rung.coilBlock.isPro) {
      diagnostics.push({
        id: `${rung.id}-reset-pro`,
        severity: 'info',
        message: `${rung.label}: RESET é um recurso Pro para projetos próprios, mas permanece visível para estudo.`,
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

export function evaluateEditorProject(project: EditorProjectState, currentState: PlcState, previousScan = 0): EditorEvaluationResult {
  let nextState: PlcState = { ...currentState };
  const rungResults: Record<string, boolean> = {};

  for (const rung of project.rungs) {
    const energized = isWritableCoil(rung.coilBlock) ? evaluateRung(rung, nextState) : false;
    rungResults[rung.id] = energized;

    if (isWritableCoil(rung.coilBlock)) {
      nextState = applyCoilMode(nextState, rung.coilBlock.variable, energized, rung.coilBlock.coilMode);
    }
  }

  const diagnostics = validateProject(project);

  return {
    state: nextState,
    rungResults,
    diagnostics,
    scanNumber: previousScan + 1,
    explanation: buildEditorExplanation(project, nextState, rungResults, diagnostics),
  };
}

export function setEditorInput(project: EditorProjectState, state: PlcState, inputId: string, value: boolean): EditorEvaluationResult {
  return evaluateEditorProject(project, {
    ...state,
    [inputId]: value,
  });
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
  const hasCoil = project.rungs.some((rung) => Boolean(rung.coilBlock));
  const hasLogic = project.rungs.some((rung) => rung.seriesBlocks.length > 0 || rung.parallelBlocks.length > 0);

  if (hasError) return 'Há erro estrutural na lógica. Corrija os blocos inválidos antes de confiar na simulação.';
  if (!hasLogic) return 'O editor ainda não possui contatos ou entradas. Adicione blocos em Série ou Paralelo para criar uma condição lógica.';
  if (!hasCoil) return 'A lógica possui contatos, mas ainda não tem bobina/saída. Adicione uma bobina Q, contator ou motor na zona Bobina.';
  if (hasWarning) return 'A lógica foi simulada, mas há avisos importantes. Revise os diagnósticos antes de avançar.';
  if (energizedCount > 0) return `Há ${energizedCount} linha(s) energizada(s). As bobinas foram atualizadas pelo ciclo de varredura.`;
  return 'Nenhuma linha está energizada. Verifique as entradas virtuais e os contatos NA/NF inseridos no editor.';
}
