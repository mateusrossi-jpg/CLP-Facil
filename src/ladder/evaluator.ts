import { LadderBlock, LadderRung, PlcState } from './types';

export type EvalResult = { next: PlcState; energized: Record<string, boolean>; rungPower: Record<string, boolean> };

function closed(block: LadderBlock, state: PlcState) {
  const v = Boolean(state[block.address]);
  if (block.type === 'NC') return !v;
  return v;
}

export function evaluateRungs(rungs: LadderRung[], state: PlcState): EvalResult {
  const next = { ...state };
  const energized: Record<string, boolean> = {};
  const rungPower: Record<string, boolean> = {};

  for (const rung of rungs) {
    const seriesOk = rung.series.every((b) => {
      const on = closed(b, next);
      energized[b.id] = on;
      return on;
    });
    const parallelOk = (rung.parallel ?? []).length > 0 && (rung.parallel ?? []).every((b) => {
      const on = closed(b, next);
      energized[b.id] = on;
      return on;
    });
    const power = seriesOk || parallelOk;
    rungPower[rung.id] = power;

    if (rung.coil) {
      next[rung.coil.address] = power;
      energized[rung.coil.id] = power;
    }
  }
  return { next, energized, rungPower };
}
