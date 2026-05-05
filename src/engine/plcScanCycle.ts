import { evaluateEditorProject, EditorEvaluationResult } from './editorEvaluator';
import { traceEditorScan, EditorScanTrace } from './editorScanTrace';
import { EditorProjectState } from './editorTypes';
import { PlcState } from './projectTypes';
import { createInitialRuntimeState, EditorRuntimeState } from './runtimeTypes';

export type PlcScanPhaseId = 'input_image' | 'program_solve' | 'output_image' | 'diagnostics';

export type PlcScanPhase = {
  id: PlcScanPhaseId;
  label: string;
  active: boolean;
  completed: boolean;
  description: string;
};

export type PlcScanCycleResult = {
  scanNumber: number;
  inputImage: PlcState;
  outputImage: PlcState;
  evaluation: EditorEvaluationResult;
  trace: EditorScanTrace;
  phases: PlcScanPhase[];
  activeRungCount: number;
  activeOutputCount: number;
  cycleExplanation: string;
};

function normalizeAddress(address: string): string {
  return address.trim().toUpperCase();
}

function isInputAddress(address: string): boolean {
  return normalizeAddress(address).startsWith('I');
}

function isOutputAddress(address: string): boolean {
  const normalized = normalizeAddress(address);
  return normalized.startsWith('Q') || normalized.startsWith('O');
}

function pickStateByKind(state: PlcState, predicate: (address: string) => boolean): PlcState {
  return Object.fromEntries(Object.entries(state).filter(([address]) => predicate(address)));
}

function countActive(state: PlcState): number {
  return Object.values(state).filter((value) => typeof value === 'number' ? value !== 0 : Boolean(value)).length;
}

function buildPhases(inputImage: PlcState, outputImage: PlcState, trace: EditorScanTrace): PlcScanPhase[] {
  const activeInputs = countActive(inputImage);
  const activeOutputs = countActive(outputImage);
  return [
    {
      id: 'input_image',
      label: '1. Imagem de entradas',
      active: activeInputs > 0,
      completed: true,
      description: activeInputs > 0
        ? `${activeInputs} entrada(s) lida(s) como ON antes da lógica.`
        : 'Nenhuma entrada ON na imagem de entradas deste scan.',
    },
    {
      id: 'program_solve',
      label: '2. Resolver programa',
      active: trace.energizedRungIds.length > 0,
      completed: true,
      description: trace.energizedRungIds.length > 0
        ? `${trace.energizedRungIds.length} linha(s) fecharam durante a execução rung a rung.`
        : 'Nenhuma linha fechou durante a execução do programa.',
    },
    {
      id: 'output_image',
      label: '3. Imagem de saídas',
      active: activeOutputs > 0,
      completed: true,
      description: activeOutputs > 0
        ? `${activeOutputs} saída(s) ficaram ON na imagem de saídas.`
        : 'A imagem de saídas terminou sem bobinas ON.',
    },
    {
      id: 'diagnostics',
      label: '4. Diagnóstico',
      active: trace.rungs.some((rung) => rung.activeBranchIds.length > 0),
      completed: true,
      description: trace.rungs.some((rung) => rung.activeBranchIds.length > 0)
        ? 'Há branch paralelo ativo neste scan; destaque o caminho para o aluno entender o OR/selo.'
        : 'Sem branch paralelo ativo neste scan.',
    },
  ];
}

function buildCycleExplanation(inputImage: PlcState, outputImage: PlcState, trace: EditorScanTrace): string {
  const activeInputs = countActive(inputImage);
  const activeOutputs = countActive(outputImage);
  const activeBranches = trace.rungs.reduce((total, rung) => total + rung.activeBranchIds.length, 0);

  if (trace.energizedRungIds.length === 0) {
    return `Scan concluído: ${activeInputs} entrada(s) ON, nenhuma linha fechada e ${activeOutputs} saída(s) ON.`;
  }

  if (activeBranches > 0) {
    return `Scan concluído: ${activeInputs} entrada(s) ON, ${trace.energizedRungIds.length} linha(s) fechada(s), ${activeBranches} branch(es) paralelo(s) ativo(s) e ${activeOutputs} saída(s) ON.`;
  }

  return `Scan concluído: ${activeInputs} entrada(s) ON, ${trace.energizedRungIds.length} linha(s) fechada(s) em série e ${activeOutputs} saída(s) ON.`;
}

export function runPlcScanCycle(
  project: EditorProjectState,
  currentState: PlcState,
  scanNumber: number,
  runtime: EditorRuntimeState = createInitialRuntimeState(),
): PlcScanCycleResult {
  const inputImage = pickStateByKind(currentState, isInputAddress);
  const evaluation = evaluateEditorProject(project, currentState, scanNumber, runtime);
  const outputImage = pickStateByKind(evaluation.state, isOutputAddress);
  const trace = traceEditorScan(project, evaluation.state, evaluation.runtime);
  const phases = buildPhases(inputImage, outputImage, trace);

  return {
    scanNumber: evaluation.scanNumber,
    inputImage,
    outputImage,
    evaluation,
    trace,
    phases,
    activeRungCount: trace.energizedRungIds.length,
    activeOutputCount: countActive(outputImage),
    cycleExplanation: buildCycleExplanation(inputImage, outputImage, trace),
  };
}
