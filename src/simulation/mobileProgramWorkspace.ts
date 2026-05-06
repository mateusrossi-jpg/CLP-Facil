import { PlcProfileRungView } from '../plcProfiles/plcProfiles';

export type ProgramMode = 'list' | 'flow' | 'compact_rung';

export function compactText(text: string): string {
  return text
    .replace(/\s*→\s*/g, '  •  ')
    .replace(/\s+/g, ' ')
    .replace(/Linha \d+\s+[—-]\s+/, '')
    .trim();
}

export function rungTitle(rung?: PlcProfileRungView): string {
  if (!rung) return 'Partida com selo do motor';
  return rung.label.replace(/^Linha \d+\s+[—-]\s+/, '') || 'Linha Ladder';
}

export function outputText(rung?: PlcProfileRungView): string {
  if (!rung?.output) return 'Q0.0';
  return `${rung.output.instruction} ${rung.output.operand}`;
}

export function visibleProgramLines<T>(lines: T[]): T[] {
  return lines;
}
