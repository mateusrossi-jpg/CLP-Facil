import { EditorBlock, EditorProjectState, EditorRung } from '../engine/editorTypes';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { PlcState } from '../engine/projectTypes';

export type MobileRungScope = 'individual' | 'compiled';

export type MobileRungOutputSummary = {
  block: EditorBlock | null;
  active: boolean;
};

export const MOBILE_RUNG_DEFAULT_ZOOM: Record<MobileRungScope, number> = {
  individual: 0.76,
  compiled: 0.62,
};

export type MobileRungZoomState = Record<MobileRungScope, number>;

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

export function blockActive(block: EditorBlock, state: PlcState, rungActive: boolean): boolean {
  if (block.role === 'coil' || block.role === 'timer' || block.role === 'counter') return rungActive || Boolean(state[normalize(block.variable)]);
  const raw = Boolean(state[normalize(block.variable)]);
  return block.contactMode === 'NC' ? !raw : raw;
}

export function defaultZoomForScope(scope: MobileRungScope): number {
  return MOBILE_RUNG_DEFAULT_ZOOM[scope];
}

export function createInitialZoomState(): MobileRungZoomState {
  return { ...MOBILE_RUNG_DEFAULT_ZOOM };
}

export function updateScopeZoomState(
  state: MobileRungZoomState,
  scope: MobileRungScope,
  zoom: number,
): MobileRungZoomState {
  return { ...state, [scope]: zoom };
}

export function firstOutputLikeBlock(rung: EditorRung | undefined): EditorBlock | null {
  if (!rung) return null;
  return rung.coilBlock ?? rung.seriesBlocks.find((block) => block.role === 'coil' || block.role === 'timer' || block.role === 'counter') ?? null;
}

export function resolveVisibleOutputSummary(
  editorProject: EditorProjectState,
  evaluation: EditorEvaluationResult,
  plcState: PlcState,
  rungScope: MobileRungScope,
  rung: EditorRung | undefined,
): MobileRungOutputSummary {
  const localBlock = firstOutputLikeBlock(rung);
  const localActive = localBlock ? blockActive(localBlock, plcState, Boolean(rung && evaluation.rungResults?.[rung.id])) : false;
  if (rungScope === 'individual') return { block: localBlock, active: localActive };

  const compiledActiveRung = editorProject.rungs.find((item) => evaluation.rungResults?.[item.id]) ?? editorProject.rungs[0];
  const compiledBlock = firstOutputLikeBlock(compiledActiveRung);
  const compiledActive = compiledBlock ? blockActive(compiledBlock, plcState, true) : false;
  return { block: compiledBlock, active: compiledActive };
}
