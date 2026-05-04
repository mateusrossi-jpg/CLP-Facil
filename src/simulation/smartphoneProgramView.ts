import { PlcProfileProjectView, PlcProfileRungView } from '../plcProfiles/plcProfiles';

export type SmartphoneProgramViewMode = 'list' | 'flow';

export type SmartphoneProgramLine = {
  rungId: string;
  label: string;
  text: string;
  active: boolean;
  focused: boolean;
  explanation: string;
};

export type SmartphoneProgramSummary = {
  dialectName: string;
  dialectShortName: string;
  disclaimer: string;
  activeCount: number;
  focusedLine: SmartphoneProgramLine | null;
  lines: SmartphoneProgramLine[];
};

function outputName(rung: PlcProfileRungView): string {
  return rung.output ? `${rung.output.instruction}(${rung.output.operand})` : 'sem saída definida';
}

function conditionCount(rung: PlcProfileRungView): number {
  return rung.series.length + rung.parallelBranches.reduce((total, branch) => total + branch.length, 0);
}

function makeRungExplanation(rung: PlcProfileRungView, active: boolean, dialectShortName: string): string {
  const conditions = conditionCount(rung);
  const output = outputName(rung);
  const status = active ? 'neste scan a linha está verdadeira' : 'neste scan a linha está falsa';
  const branchText = rung.parallelBranches.length > 0
    ? ` Há ${rung.parallelBranches.length} caminho(s) paralelo(s), então a saída pode ligar por mais de uma condição.`
    : '';

  if (conditions === 0) {
    return `Em ${dialectShortName}, esta linha não possui condição de entrada. Ela aponta para ${output}; ${status}.`;
  }

  return `Em ${dialectShortName}, a linha avalia ${conditions} condição(ões) antes de escrever em ${output}; ${status}.${branchText}`;
}

export function createSmartphoneProgramSummary(
  profileView: PlcProfileProjectView,
  rungResults: Record<string, boolean>,
  selectedRungId: string | undefined,
  focusedRungId: string | null,
  viewMode: SmartphoneProgramViewMode,
): SmartphoneProgramSummary {
  const firstActiveRungId = profileView.rungs.find((rung) => Boolean(rungResults[rung.rungId]))?.rungId;
  const effectiveFocus = focusedRungId ?? firstActiveRungId ?? selectedRungId ?? profileView.rungs[0]?.rungId;

  const lines = profileView.rungs.map((rung, index) => {
    const active = Boolean(rungResults[rung.rungId]);
    const focused = rung.rungId === effectiveFocus;
    const prefix = viewMode === 'flow' ? `${index + 1} ▶ ` : `${index + 1}. `;
    return {
      rungId: rung.rungId,
      label: rung.label,
      text: `${prefix}${rung.textLine}`,
      active,
      focused,
      explanation: makeRungExplanation(rung, active, profileView.profile.shortName),
    };
  });

  return {
    dialectName: profileView.profile.name,
    dialectShortName: profileView.profile.shortName,
    disclaimer: profileView.profile.disclaimer,
    activeCount: lines.filter((line) => line.active).length,
    focusedLine: lines.find((line) => line.focused) ?? lines[0] ?? null,
    lines,
  };
}
