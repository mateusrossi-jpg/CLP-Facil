import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';

export type MobileIoKind = 'input' | 'output';

export type MobileIoPoint = {
  id: string;
  address: string;
  name: string;
  kind: MobileIoKind;
  value: boolean | number | undefined;
};

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function ioKind(address: string): MobileIoKind | null {
  const normalized = normalize(address);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  return null;
}

function collectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function addPoint(points: Map<string, MobileIoPoint>, address: string | undefined, name: string | undefined, state: PlcState) {
  const normalized = normalize(address);
  if (!normalized || isNumericLiteral(normalized) || points.has(normalized)) return;
  const kind = ioKind(normalized);
  if (!kind) return;
  points.set(normalized, {
    id: normalized,
    address: normalized,
    name: name || (kind === 'input' ? 'Entrada' : 'Saida'),
    kind,
    value: state[normalized],
  });
}

export function collectMobileIoPoints(project: EditorProjectState, state: PlcState): MobileIoPoint[] {
  const points = new Map<string, MobileIoPoint>();

  for (const variable of project.projectVariables ?? []) {
    addPoint(points, variable.address || variable.id, variable.name, state);
  }

  for (const block of collectBlocks(project)) {
    addPoint(points, block.variable, block.name, state);
    addPoint(points, block.sourceA, block.name, state);
    addPoint(points, block.sourceB, block.name, state);
    addPoint(points, block.destination, block.name, state);
    addPoint(points, block.downSource, block.name, state);
    addPoint(points, block.resetSource, block.name, state);
  }

  return Array.from(points.values()).sort((left, right) => left.address.localeCompare(right.address));
}

export function isMobileIoActive(value: boolean | number | undefined): boolean {
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

export function mobileIoValueLabel(value: boolean | number | undefined): string {
  if (typeof value === 'number') return String(value);
  return isMobileIoActive(value) ? 'ON' : 'OFF';
}
