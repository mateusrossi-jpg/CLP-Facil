import { EditorBlock, EditorProjectState, EditorRung } from './editorTypes';
import { PlcState } from './projectTypes';

export type EditorEvaluationResult = {
  state: PlcState;
  rungResults: Record<string, boolean>;
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

function isNormallyClosed(block: EditorBlock): boolean {
  return block.componentId.includes('nc') || block.name.includes('NF');
}

function isInputLike(block: EditorBlock): boolean {
  return block.componentId.includes('button') || block.componentId.includes('contact') || block.componentId.includes('emergency') || block.componentId.includes('selector') || block.componentId.includes('memory');
}

function isOutputLike(block: EditorBlock): boolean {
  return block.componentId.includes('coil') || block.componentId.includes('contactor') || block.componentId.includes('motor') || block.componentId.includes('light');
}

function evaluateBlock(block: EditorBlock, state: PlcState): boolean {
  const value = Boolean(state[block.variable]);
  return isNormallyClosed(block) ? !value : value;
}

function evaluateSeries(blocks: EditorBlock[], state: PlcState): boolean {
  const inputBlocks = blocks.filter(isInputLike);
  if (inputBlocks.length === 0) return true;
  return inputBlocks.every((block) => evaluateBlock(block, state));
}

function evaluateParallel(blocks: EditorBlock[], state: PlcState): boolean {
  const inputBlocks = blocks.filter(isInputLike);
  if (inputBlocks.length === 0) return true;
  return inputBlocks.some((block) => evaluateBlock(block, state));
}

function evaluateRung(rung: EditorRung, state: PlcState): boolean {
  const seriesOk = evaluateSeries(rung.seriesBlocks, state);
  const parallelOk = evaluateParallel(rung.parallelBlocks, state);
  return seriesOk && parallelOk;
}

function findCoilVariable(rung: EditorRung): string | null {
  if (!rung.coilBlock) return null;
  if (!isOutputLike(rung.coilBlock)) return null;
  return rung.coilBlock.variable;
}

export function evaluateEditorProject(project: EditorProjectState, currentState: PlcState): EditorEvaluationResult {
  const nextState: PlcState = { ...currentState };
  const rungResults: Record<string, boolean> = {};

  for (const rung of project.rungs) {
    const coilVariable = findCoilVariable(rung);
    const energized = coilVariable ? evaluateRung(rung, nextState) : false;
    rungResults[rung.id] = energized;

    if (coilVariable) {
      nextState[coilVariable] = energized;
    }
  }

  return {
    state: nextState,
    rungResults,
    explanation: buildEditorExplanation(project, nextState, rungResults),
  };
}

export function setEditorInput(project: EditorProjectState, state: PlcState, inputId: string, value: boolean): EditorEvaluationResult {
  return evaluateEditorProject(project, {
    ...state,
    [inputId]: value,
  });
}

function buildEditorExplanation(project: EditorProjectState, state: PlcState, rungResults: Record<string, boolean>): string {
  const energizedCount = Object.values(rungResults).filter(Boolean).length;
  const hasCoil = project.rungs.some((rung) => Boolean(rung.coilBlock));
  const hasLogic = project.rungs.some((rung) => rung.seriesBlocks.length > 0 || rung.parallelBlocks.length > 0);

  if (!hasLogic) {
    return 'O editor ainda não possui contatos ou entradas. Adicione blocos em Série ou Paralelo para criar uma condição lógica.';
  }

  if (!hasCoil) {
    return 'A lógica possui contatos, mas ainda não tem bobina/saída. Adicione uma bobina Q, contator ou motor na zona Bobina.';
  }

  if (energizedCount > 0) {
    return `Há ${energizedCount} linha(s) energizada(s). As bobinas associadas foram atualizadas conforme os blocos inseridos.`;
  }

  return 'Nenhuma linha está energizada. Verifique as entradas virtuais e os contatos NA/NF inseridos no editor.';
}
