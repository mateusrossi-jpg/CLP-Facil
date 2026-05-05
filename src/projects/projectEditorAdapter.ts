import type { EditorBlock, EditorContactMode, EditorProjectState, EditorVariable, EditorVariableDataType, EditorVariableScope } from '../engine/editorTypes';
import { getIoPointsForProject, type ProjectIoKind, type ProjectIoPoint } from './projectIoMaps';
import { getRungTemplatesForProject, type ProjectRungTemplate } from './projectLadderTemplates';
import { getTrainingProjectById, type TrainingProject } from './projectCatalog';

function normalizeAddress(value: string): string {
  return value.trim().toUpperCase();
}

function variableScopeForKind(kind: ProjectIoKind): EditorVariableScope {
  if (kind === 'input') return 'input';
  if (kind === 'output') return 'output';
  return 'memory';
}

function variableTypeForKind(kind: ProjectIoKind): EditorVariableDataType {
  if (kind === 'timer') return 'timer';
  if (kind === 'counter') return 'counter';
  return 'boolean';
}

function pointToVariable(point: ProjectIoPoint): EditorVariable {
  return {
    id: normalizeAddress(point.tag),
    address: normalizeAddress(point.tag),
    name: point.label,
    scope: variableScopeForKind(point.kind),
    dataType: variableTypeForKind(point.kind),
  };
}

function extractAddress(text: string): string | undefined {
  return text.match(/\b[IQMCT]\d+(?:\.\d+)?\b/i)?.[0]?.toUpperCase();
}

function conditionMode(condition: string, points: ProjectIoPoint[]): EditorContactMode {
  const address = extractAddress(condition);
  const point = address ? points.find((item) => normalizeAddress(item.tag) === address) : undefined;
  if (point?.normallyClosed) return 'NC';
  if (/\bNF\b/i.test(condition) || /não|nao/i.test(condition)) return 'NC';
  return 'NO';
}

function blockNameFromCondition(condition: string): string {
  return condition.replace(/\b[IQMCT]\d+(?:\.\d+)?\b/i, '').trim() || condition;
}

function outputKind(outputAddress: string): 'coil' | 'timer' | 'counter' {
  if (outputAddress.startsWith('T')) return 'timer';
  if (outputAddress.startsWith('C')) return 'counter';
  return 'coil';
}

function makeContactBlock(rung: ProjectRungTemplate, condition: string, index: number, points: ProjectIoPoint[]): EditorBlock {
  const address = extractAddress(condition) ?? 'M0.0';
  const mode = conditionMode(condition, points);
  return {
    id: `${rung.id}-contact-${index}`,
    componentId: mode === 'NC' ? 'contact-nc' : 'contact-no',
    name: blockNameFromCondition(condition),
    description: condition,
    isPro: false,
    zone: 'series',
    variable: address,
    role: 'contact',
    contactMode: mode,
    category: 'logic',
  };
}

function makeCoilBlock(rung: ProjectRungTemplate): EditorBlock {
  const address = extractAddress(rung.output) ?? 'Q0.0';
  const kind = outputKind(address);
  const base = {
    id: `${rung.id}-output`,
    componentId: kind === 'timer' ? 'timer-ton' : kind === 'counter' ? 'counter-ctu' : 'coil-q',
    name: rung.output,
    description: rung.outputDescription,
    isPro: false,
    zone: 'coil' as const,
    variable: address,
    category: kind === 'timer' ? 'timer' as const : kind === 'counter' ? 'counter' as const : 'output' as const,
  };

  if (kind === 'timer') {
    return {
      ...base,
      role: 'timer',
      timerMode: 'TON',
      presetMs: 3000,
    };
  }

  if (kind === 'counter') {
    return {
      ...base,
      role: 'counter',
      counterMode: 'CTU',
      preset: 5,
      resetSource: 'M0.0',
    };
  }

  return {
    ...base,
    role: 'coil',
    coilMode: 'NORMAL',
  };
}

export function createEditorProjectFromTrainingProject(project: TrainingProject): EditorProjectState {
  const points = getIoPointsForProject(project.id);
  const rungs = getRungTemplatesForProject(project.id);
  const variables = points.map(pointToVariable);
  const editorRungs = rungs.map((rung) => ({
    id: rung.id,
    label: `Rung ${rung.rungNumber} — ${rung.title}`,
    seriesBlocks: rung.conditions.map((condition, index) => makeContactBlock(rung, condition, index, points)),
    parallelBlocks: [],
    parallelBranches: [],
    coilBlock: makeCoilBlock(rung),
  }));

  return {
    selectedRungId: editorRungs[0]?.id ?? 'rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: variables,
    rungs: editorRungs,
  };
}

export function createEditorProjectFromTrainingProjectId(projectId: string): EditorProjectState | undefined {
  const project = getTrainingProjectById(projectId);
  if (!project) return undefined;
  return createEditorProjectFromTrainingProject(project);
}
