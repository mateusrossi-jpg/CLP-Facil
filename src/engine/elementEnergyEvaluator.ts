import { LadderProject, PlcState } from './projectTypes';

export type EnergizedElements = Record<string, boolean>;

export function evaluateElementEnergy(project: LadderProject, state: PlcState): EnergizedElements {
  const energized: EnergizedElements = {};

  for (const rung of project.rungs) {
    let linePower = true;

    for (const contact of rung.seriesContacts) {
      const value = Boolean(state[contact.variableId]);
      const active = contact.type === 'NO' ? value : !value;

      energized[contact.id] = linePower && active;
      linePower = linePower && active;
    }

    // Paralelo (OR)
    for (const branch of rung.parallelBranches) {
      let branchPower = true;

      for (const contact of branch.contacts) {
        const value = Boolean(state[contact.variableId]);
        const active = contact.type === 'NO' ? value : !value;

        energized[contact.id] = branchPower && active;
        branchPower = branchPower && active;
      }
    }

    energized[rung.coilVariableId] = linePower;
  }

  return energized;
}
