import { ProfessionalTagRow } from './professionalClpView';

export type IoTab = 'overview' | 'inputs' | 'outputs' | 'memories' | 'timers' | 'counters';

export type IoSection = {
  key: IoTab;
  label: string;
  shortLabel: string;
  rows: ProfessionalTagRow[];
};

export function isActiveValue(value: boolean | number): boolean {
  return typeof value === 'number' ? value !== 0 : value;
}

export function splitIoSections(rows: ProfessionalTagRow[]): IoSection[] {
  const inputs = rows.filter((row) => row.scope === 'input');
  const outputs = rows.filter((row) => row.scope === 'output');
  return [
    { key: 'overview', label: 'I/O', shortLabel: 'I/O', rows: [...inputs, ...outputs] },
    { key: 'inputs', label: 'Entradas', shortLabel: 'IN', rows: inputs },
    { key: 'outputs', label: 'Saídas', shortLabel: 'OUT', rows: outputs },
    { key: 'memories', label: 'Memórias', shortLabel: 'MEM', rows: rows.filter((row) => row.scope === 'memory' && row.type === 'boolean') },
    { key: 'timers', label: 'Timers', shortLabel: 'TIM', rows: rows.filter((row) => row.type === 'timer') },
    { key: 'counters', label: 'Contadores', shortLabel: 'CNT', rows: rows.filter((row) => row.type === 'counter') },
  ];
}

export function activeCount(rows: ProfessionalTagRow[]): number {
  return rows.filter((row) => isActiveValue(row.value)).length;
}

export function valueLabel(row: ProfessionalTagRow): string {
  if (typeof row.value === 'number') return String(row.value);
  return row.value ? 'ON' : 'OFF';
}
