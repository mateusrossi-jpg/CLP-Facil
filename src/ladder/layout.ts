import { LadderRung } from './types';

export function blockWidthForRung(rung: LadderRung) {
  const count = Math.max(rung.series.length, 1);
  return Math.max(84, 220 / count);
}
