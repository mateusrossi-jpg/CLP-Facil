import { EditorScanTrace, EditorRungTrace } from '../engine/editorScanTrace';

export type MobileScanTraceSummary = {
  activeRungCount: number;
  activeOutputCount: number;
  activeBranchCount: number;
  focusedRungId?: string;
  focusedRungLabel?: string;
  focusedOutput?: string;
  focusedActiveBranches: string[];
  headline: string;
  explanation: string;
};

function firstActiveRung(trace: EditorScanTrace, focusedRungId?: string | null): EditorRungTrace | undefined {
  if (focusedRungId) {
    const focused = trace.rungs.find((rung) => rung.rungId === focusedRungId);
    if (focused) return focused;
  }
  return trace.rungs.find((rung) => rung.energized) ?? trace.rungs[0];
}

export function createMobileScanTraceSummary(trace: EditorScanTrace, focusedRungId?: string | null): MobileScanTraceSummary {
  const focused = firstActiveRung(trace, focusedRungId);
  const activeBranchCount = trace.rungs.reduce((total, rung) => total + rung.activeBranchIds.length, 0);
  const activeRungCount = trace.energizedRungIds.length;
  const activeOutputCount = trace.energizedOutputs.length;

  if (!focused) {
    return {
      activeRungCount,
      activeOutputCount,
      activeBranchCount,
      focusedActiveBranches: [],
      headline: 'Nenhuma linha disponível',
      explanation: 'O projeto ainda não possui rungs para rastrear o scan.',
    };
  }

  const outputText = focused.outputVariable ? `Saída ${focused.outputVariable}` : 'Sem saída definida';
  const branchText = focused.activeBranchIds.length > 0
    ? `Branch ativo: ${focused.activeBranchIds.join(', ')}`
    : 'Nenhum branch paralelo ativo';

  return {
    activeRungCount,
    activeOutputCount,
    activeBranchCount,
    focusedRungId: focused.rungId,
    focusedRungLabel: focused.label,
    focusedOutput: focused.outputVariable,
    focusedActiveBranches: focused.activeBranchIds,
    headline: focused.energized
      ? `${focused.label} energizada • ${outputText}`
      : `${focused.label} desenergizada • ${outputText}`,
    explanation: focused.energized
      ? `${branchText}. O caminho lógico fechou neste scan e pode acionar a função final da linha.`
      : `${branchText}. O caminho lógico não fechou neste scan; revise contatos em série, NF/NA e entradas virtuais.`,
  };
}
