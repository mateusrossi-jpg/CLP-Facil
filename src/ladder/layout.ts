import { LadderRung } from './types';

export function blockWidthForRung(rung: LadderRung) {
  const count = Math.max(rung.series.length, 1);
  return Math.max(84, 220 / count);
}

export function createEmptyRung(id: string): LadderRung {
  return {
    id,
    series: [],
    parallel: [],
    coil: undefined,
  };
}

export function insertEmptyRung(logic: LadderRung[], id: string): LadderRung[] {
  return [...logic, createEmptyRung(id)];
}
