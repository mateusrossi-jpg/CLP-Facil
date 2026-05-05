import { createInitialEditorProject } from '../engine/editorTypes';
import { traceEditorScan } from '../engine/editorScanTrace';
import { createInitialRuntimeState } from '../engine/runtimeTypes';
import { createMobileScanTraceSummary } from './mobileScanTraceSummary';

export type MobileScanTraceSummaryRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): MobileScanTraceSummaryRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runMobileScanTraceSummaryRegressionSuite(): MobileScanTraceSummaryRegressionResult[] {
  const project = createInitialEditorProject();
  const runtime = createInitialRuntimeState();
  const sealTrace = traceEditorScan(project, { 'I0.0': false, 'I0.1': false, 'Q0.0': true }, runtime);
  const sealSummary = createMobileScanTraceSummary(sealTrace);
  const stopTrace = traceEditorScan(project, { 'I0.0': true, 'I0.1': true, 'Q0.0': false }, runtime);
  const stopSummary = createMobileScanTraceSummary(stopTrace, 'rung-1');

  return [
    assertResult(
      'resumo mobile identifica rung e saida energizados',
      sealSummary.activeRungCount === 1 &&
        sealSummary.activeOutputCount === 1 &&
        sealSummary.focusedOutput === 'Q0.0' &&
        sealSummary.headline.includes('energizada') &&
        sealSummary.explanation.includes('caminho lógico fechou'),
      JSON.stringify(sealSummary),
    ),
    assertResult(
      'resumo mobile identifica branch ativo do selo',
      sealSummary.activeBranchCount === 1 &&
        sealSummary.focusedActiveBranches.includes('starter-branch-seal') &&
        sealSummary.explanation.includes('starter-branch-seal'),
      JSON.stringify(sealSummary),
    ),
    assertResult(
      'resumo mobile explica rung bloqueado pelo scan',
      stopSummary.activeRungCount === 0 &&
        stopSummary.focusedRungId === 'rung-1' &&
        stopSummary.headline.includes('desenergizada') &&
        stopSummary.explanation.includes('não fechou'),
      JSON.stringify(stopSummary),
    ),
  ];
}
