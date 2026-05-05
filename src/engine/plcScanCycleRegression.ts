import { createInitialEditorProject } from './editorTypes';
import { runPlcScanCycle } from './plcScanCycle';
import { createInitialRuntimeState } from './runtimeTypes';

export type PlcScanCycleRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): PlcScanCycleRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runPlcScanCycleRegressionSuite(): PlcScanCycleRegressionResult[] {
  const project = createInitialEditorProject();
  const first = runPlcScanCycle(project, { 'I0.0': true, 'I0.1': false, 'Q0.0': false }, 1, createInitialRuntimeState());
  const sealed = runPlcScanCycle(project, { ...first.evaluation.state, 'I0.0': false, 'I0.1': false }, 2, first.evaluation.runtime);
  const stopped = runPlcScanCycle(project, { ...sealed.evaluation.state, 'I0.1': true }, 3, sealed.evaluation.runtime);

  return [
    assertResult(
      'ciclo PLC separa imagem de entradas e saidas',
      first.inputImage['I0.0'] === true &&
        first.inputImage['I0.1'] === false &&
        first.outputImage['Q0.0'] === true &&
        first.activeRungCount === 1 &&
        first.activeOutputCount === 1,
      JSON.stringify({ input: first.inputImage, output: first.outputImage, explanation: first.cycleExplanation }),
    ),
    assertResult(
      'ciclo PLC preserva selo entre scans',
      sealed.outputImage['Q0.0'] === true &&
        sealed.trace.rungs[0].activeBranchIds.includes('starter-branch-seal') &&
        sealed.cycleExplanation.includes('branch'),
      JSON.stringify({ output: sealed.outputImage, trace: sealed.trace, explanation: sealed.cycleExplanation }),
    ),
    assertResult(
      'ciclo PLC desliga saida quando stop NF abre',
      stopped.outputImage['Q0.0'] === false &&
        stopped.activeRungCount === 0 &&
        stopped.phases.some((phase) => phase.id === 'output_image' && phase.completed),
      JSON.stringify({ output: stopped.outputImage, phases: stopped.phases }),
    ),
    assertResult(
      'ciclo PLC expõe quatro fases didáticas do scan',
      first.phases.map((phase) => phase.id).join(',') === 'input_image,program_solve,output_image,diagnostics' &&
        first.phases.every((phase) => phase.completed),
      JSON.stringify(first.phases),
    ),
  ];
}
