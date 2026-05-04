import { EditorProjectState } from '../engine/editorTypes';

export type ProfessionalRoutineId = 'MainRoutine' | 'MotorControl' | 'SafetyLogic' | 'Sequencer';

export type ProfessionalRoutine = {
  id: ProfessionalRoutineId;
  title: string;
  purpose: string;
  rungIds: string[];
  recommended: boolean;
};

function inferRoutineId(label: string): ProfessionalRoutineId {
  const normalized = label.toLowerCase();
  if (/seguran|safety|stop|sobrecarga|emerg|fim de curso/.test(normalized)) return 'SafetyLogic';
  if (/motor|partida|revers|estrela|triângulo|triangulo|bomba|contator|k\d/.test(normalized)) return 'MotorControl';
  if (/sequ|passo|semáforo|semaforo|esteira|ciclo|lote/.test(normalized)) return 'Sequencer';
  return 'MainRoutine';
}

const routineBase: Record<ProfessionalRoutineId, Omit<ProfessionalRoutine, 'rungIds'>> = {
  MainRoutine: {
    id: 'MainRoutine',
    title: 'MainRoutine',
    purpose: 'Rotina principal para lógica geral, chamadas e pequenos comandos.',
    recommended: true,
  },
  MotorControl: {
    id: 'MotorControl',
    title: 'MotorControl',
    purpose: 'Rotina para partida, selo, reversão, contatores, bombas e intertravamentos de motor.',
    recommended: true,
  },
  SafetyLogic: {
    id: 'SafetyLogic',
    title: 'SafetyLogic',
    purpose: 'Rotina didática para paradas, falhas, proteções, permissivos e condições de segurança.',
    recommended: true,
  },
  Sequencer: {
    id: 'Sequencer',
    title: 'Sequencer',
    purpose: 'Rotina para sequências, semáforo, esteira, lote, passos e temporizações encadeadas.',
    recommended: true,
  },
};

export function createProfessionalRoutinePlan(project: EditorProjectState): ProfessionalRoutine[] {
  const grouped = new Map<ProfessionalRoutineId, string[]>();
  for (const id of Object.keys(routineBase) as ProfessionalRoutineId[]) grouped.set(id, []);

  for (const rung of project.rungs) {
    const routineId = inferRoutineId(rung.label);
    grouped.set(routineId, [...(grouped.get(routineId) ?? []), rung.id]);
  }

  const main = grouped.get('MainRoutine') ?? [];
  if (main.length === 0 && project.rungs[0]) grouped.set('MainRoutine', [project.rungs[0].id]);

  return (Object.keys(routineBase) as ProfessionalRoutineId[]).map((id) => ({
    ...routineBase[id],
    rungIds: grouped.get(id) ?? [],
  }));
}

export function routineCompletionHint(routine: ProfessionalRoutine): string {
  if (routine.rungIds.length > 0) return `${routine.rungIds.length} linha(s) associada(s).`;
  if (routine.id === 'SafetyLogic') return 'Adicione permissivos, stop, sobrecarga ou fim de curso para preencher esta rotina.';
  if (routine.id === 'Sequencer') return 'Adicione passos, timers ou contador para preencher esta rotina.';
  if (routine.id === 'MotorControl') return 'Adicione partida, selo, reversão, bomba ou contatores para preencher esta rotina.';
  return 'Use esta rotina para lógica geral ou chamadas futuras.';
}
