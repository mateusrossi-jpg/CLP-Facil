import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';

type EditorRung = EditorProjectState['rungs'][number];
type EditorCoilBlock = NonNullable<EditorRung['coilBlock']>;

export type RungOutputSummary = {
  rungId: string;
  rungLabel: string;
  isDefined: boolean;
  outputAddress: string;
  outputName: string;
  instruction: string;
  isActive: boolean;
  stateLabel: 'ON' | 'OFF' | 'SEM SAÍDA';
  helperText: string;
};

function normalizeVariable(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function readBooleanState(state: PlcState, variable: string): boolean {
  const normalized = normalizeVariable(variable);
  if (!normalized) return false;
  const value = state[normalized];
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function instructionForOutput(block: EditorCoilBlock): string {
  if (block.role === 'timer') return block.timerMode ?? 'TON';
  if (block.role === 'counter') return block.counterMode ?? 'CTU';
  if (block.mathMode) return block.mathMode;
  if (block.coilMode === 'SET') return 'SET/LATCH';
  if (block.coilMode === 'RESET') return 'RESET/UNLATCH';
  if (block.coilMode === 'PULSE') return 'PULSO';
  return 'BOBINA';
}

export function createRungOutputSummary(rung: EditorRung, state: PlcState): RungOutputSummary {
  if (!rung.coilBlock) {
    return {
      rungId: rung.id,
      rungLabel: rung.label,
      isDefined: false,
      outputAddress: '—',
      outputName: 'Sem carga/saída definida',
      instruction: 'SEM SAÍDA',
      isActive: false,
      stateLabel: 'SEM SAÍDA',
      helperText: 'Adicione uma bobina, saída, temporizador ou contador para finalizar esta linha.',
    };
  }

  const outputAddress = normalizeVariable(rung.coilBlock.variable);
  const isActive = readBooleanState(state, outputAddress);
  const instruction = instructionForOutput(rung.coilBlock);

  return {
    rungId: rung.id,
    rungLabel: rung.label,
    isDefined: true,
    outputAddress,
    outputName: rung.coilBlock.name || outputAddress,
    instruction,
    isActive,
    stateLabel: isActive ? 'ON' : 'OFF',
    helperText: isActive
      ? 'A carga/saída desta linha está ativa neste scan.'
      : 'A carga/saída desta linha está desligada neste scan.',
  };
}

export function createProjectRungOutputSummaries(project: EditorProjectState, state: PlcState): RungOutputSummary[] {
  return project.rungs.map((rung) => createRungOutputSummary(rung, state));
}
