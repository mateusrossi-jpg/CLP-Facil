import { EditorBlock, EditorParallelBranch, EditorProjectState, EditorRung } from './editorTypes';
import { PlcState } from './projectTypes';
import { EditorRuntimeState } from './runtimeTypes';

export type EditorContactTrace = {
  blockId: string;
  variable: string;
  rawValue: boolean;
  energized: boolean;
  mode: string;
};

export type EditorBranchTrace = {
  branchId: string;
  seriesIndex: number;
  endIndex: number;
  energized: boolean;
  contacts: EditorContactTrace[];
};

export type EditorRungTrace = {
  rungId: string;
  label: string;
  energized: boolean;
  seriesContacts: EditorContactTrace[];
  branchTraces: EditorBranchTrace[];
  activeBranchIds: string[];
  outputVariable?: string;
  outputRole?: string;
};

export type EditorScanTrace = {
  rungs: EditorRungTrace[];
  energizedRungIds: string[];
  energizedOutputs: string[];
};

function normalizeVariable(variable: string): string {
  return variable.trim().toUpperCase();
}

function isContact(block: EditorBlock): boolean {
  return block.role === 'contact';
}

function readNumericValue(source: string | undefined, state: PlcState): number {
  const raw = (source ?? '0').trim().toUpperCase();
  if (!raw) return 0;
  const literal = Number(raw.replace(',', '.'));
  if (Number.isFinite(literal)) return literal;
  const value = state[raw];
  if (typeof value === 'number') return value;
  return value ? 1 : 0;
}

function evaluateCompare(block: EditorBlock, state: PlcState): boolean {
  const left = readNumericValue(block.sourceA, state);
  const right = readNumericValue(block.sourceB, state);

  switch (block.compareMode) {
    case 'NEQ':
      return left !== right;
    case 'GRT':
      return left > right;
    case 'LES':
      return left < right;
    case 'GEQ':
      return left >= right;
    case 'LEQ':
      return left <= right;
    case 'EQU':
    default:
      return left === right;
  }
}

function contactRawValue(block: EditorBlock, state: PlcState): boolean {
  return Boolean(state[normalizeVariable(block.variable)]);
}

function traceContact(block: EditorBlock, state: PlcState, runtime?: EditorRuntimeState): EditorContactTrace {
  const rawValue = contactRawValue(block, state);
  let energized = rawValue;

  if (block.compareMode) {
    energized = evaluateCompare(block, state);
  } else if (block.contactMode === 'NC') {
    energized = !rawValue;
  } else if (block.contactMode === 'RISING') {
    energized = rawValue && !Boolean(runtime?.previousContactValues[block.id]);
  } else if (block.contactMode === 'FALLING') {
    energized = !rawValue && Boolean(runtime?.previousContactValues[block.id]);
  }

  return {
    blockId: block.id,
    variable: normalizeVariable(block.variable),
    rawValue,
    energized,
    mode: block.compareMode ?? block.contactMode ?? 'NO',
  };
}

function parallelBranchesFor(rung: EditorRung): EditorParallelBranch[] {
  if (rung.parallelBranches) return rung.parallelBranches;
  return rung.parallelBlocks.map((block, index) => ({
    id: `${rung.id}-legacy-branch-${block.id}`,
    seriesIndex: block.parallelIndex ?? index,
    blocks: [block],
  }));
}

function branchEndIndex(branch: EditorParallelBranch, seriesLength: number, outputVariable?: string): number {
  const startIndex = Math.min(Math.max(branch.seriesIndex, 0), Math.max(seriesLength - 1, 0));
  const branchSpan = Math.max(branch.blocks.filter(isContact).length, 1);
  const normalizedOutput = outputVariable ? normalizeVariable(outputVariable) : '';
  const isSealBranch = Boolean(normalizedOutput) && branch.blocks.some((block) => normalizeVariable(block.variable) === normalizedOutput);
  if (!isSealBranch && startIndex === 0) return seriesLength;
  return Math.min(startIndex + branchSpan, seriesLength);
}

function traceBranch(branch: EditorParallelBranch, state: PlcState, runtime: EditorRuntimeState | undefined, seriesLength: number, outputVariable?: string): EditorBranchTrace {
  const contacts = branch.blocks.filter(isContact).map((block) => traceContact(block, state, runtime));
  return {
    branchId: branch.id,
    seriesIndex: branch.seriesIndex,
    endIndex: branchEndIndex(branch, seriesLength, outputVariable),
    energized: contacts.length > 0 && contacts.every((contact) => contact.energized),
    contacts,
  };
}

export function traceEditorRung(rung: EditorRung, state: PlcState, runtime?: EditorRuntimeState): EditorRungTrace {
  const seriesContactBlocks = rung.seriesBlocks.filter(isContact);
  const seriesContacts = seriesContactBlocks.map((block) => traceContact(block, state, runtime));
  const parallelBranches = parallelBranchesFor(rung);
  const branchTraces = parallelBranches.map((branch) => traceBranch(branch, state, runtime, seriesContacts.length, rung.coilBlock?.variable));
  const seriesLength = seriesContacts.length;
  const reachable = new Set<number>([0]);

  if (seriesLength === 0) {
    const energized = branchTraces.some((branch) => branch.energized);
    return {
      rungId: rung.id,
      label: rung.label,
      energized,
      seriesContacts,
      branchTraces,
      activeBranchIds: branchTraces.filter((branch) => branch.energized).map((branch) => branch.branchId),
      outputVariable: rung.coilBlock?.variable ? normalizeVariable(rung.coilBlock.variable) : undefined,
      outputRole: rung.coilBlock?.role,
    };
  }

  for (let nodeIndex = 0; nodeIndex < seriesLength; nodeIndex += 1) {
    if (!reachable.has(nodeIndex)) continue;

    if (seriesContacts[nodeIndex]?.energized) {
      reachable.add(nodeIndex + 1);
    }

    for (const branch of branchTraces) {
      if (branch.seriesIndex !== nodeIndex) continue;
      if (branch.energized) reachable.add(branch.endIndex);
    }
  }

  const energized = reachable.has(seriesLength);

  return {
    rungId: rung.id,
    label: rung.label,
    energized,
    seriesContacts,
    branchTraces,
    activeBranchIds: branchTraces.filter((branch) => branch.energized).map((branch) => branch.branchId),
    outputVariable: rung.coilBlock?.variable ? normalizeVariable(rung.coilBlock.variable) : undefined,
    outputRole: rung.coilBlock?.role,
  };
}

export function traceEditorScan(project: EditorProjectState, state: PlcState, runtime?: EditorRuntimeState): EditorScanTrace {
  const rungs = project.rungs.map((rung) => traceEditorRung(rung, state, runtime));
  return {
    rungs,
    energizedRungIds: rungs.filter((rung) => rung.energized).map((rung) => rung.rungId),
    energizedOutputs: rungs
      .filter((rung) => rung.energized && rung.outputVariable)
      .map((rung) => rung.outputVariable as string),
  };
}
