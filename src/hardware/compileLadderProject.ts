import { EditorBlock, EditorParallelBranch, EditorProjectState, EditorRung } from '../engine/editorTypes';
import {
  CompiledHardwareBranch,
  CompiledHardwareContact,
  CompiledHardwareOutput,
  CompiledHardwareProject,
  CompiledHardwareVariable,
  HardwareExportConfig,
  HardwarePinMap,
  HardwareVariableScope,
} from './hardwareTypes';

function normalizeVariable(variable: string | undefined): string {
  return (variable ?? '').trim().toUpperCase();
}

function isContact(block: EditorBlock): boolean {
  return block.role === 'contact';
}

function isOutputBlock(block: EditorBlock | null): block is EditorBlock {
  return Boolean(block && ['coil', 'timer', 'counter'].includes(block.role) && block.variable);
}

function parallelBranchesFor(rung: EditorRung): EditorParallelBranch[] {
  if (rung.parallelBranches) return rung.parallelBranches;
  return rung.parallelBlocks.map((block, index) => ({
    id: `${rung.id}-legacy-branch-${block.id}`,
    seriesIndex: block.parallelIndex ?? index,
    blocks: [block],
  }));
}

function inferScope(variable: string): HardwareVariableScope {
  const normalized = normalizeVariable(variable);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  return 'memory';
}

function inferDataType(variable: string): CompiledHardwareVariable['dataType'] {
  const normalized = normalizeVariable(variable);
  if (normalized.startsWith('N')) return 'number';
  if (normalized.startsWith('T')) return 'timer';
  if (normalized.startsWith('C')) return 'counter';
  return 'boolean';
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed);
}

function addVariable(
  variables: Map<string, CompiledHardwareVariable>,
  variable: string | undefined,
  fallbackName?: string,
  forcedScope?: HardwareVariableScope,
): void {
  const normalized = normalizeVariable(variable);
  if (!normalized || isNumericLiteral(normalized)) return;
  if (variables.has(normalized)) return;

  variables.set(normalized, {
    variable: normalized,
    name: fallbackName || normalized,
    scope: forcedScope ?? inferScope(normalized),
    dataType: inferDataType(normalized),
  });
}

function compileContact(block: EditorBlock): CompiledHardwareContact {
  return {
    id: block.id,
    variable: normalizeVariable(block.variable),
    mode: block.contactMode ?? 'NO',
    compareMode: block.compareMode,
    sourceA: normalizeVariable(block.sourceA),
    sourceB: normalizeVariable(block.sourceB),
  };
}

function compileOutput(block: EditorBlock | null): CompiledHardwareOutput | null {
  if (!isOutputBlock(block)) return null;

  return {
    id: block.id,
    variable: normalizeVariable(block.variable),
    role: block.role as 'coil' | 'timer' | 'counter',
    coilMode: block.coilMode,
    timerMode: block.timerMode,
    counterMode: block.counterMode,
    presetMs: block.presetMs,
    preset: block.preset,
    downSource: normalizeVariable(block.downSource),
    resetSource: normalizeVariable(block.resetSource),
    mathMode: block.mathMode,
    sourceA: normalizeVariable(block.sourceA),
    sourceB: normalizeVariable(block.sourceB),
    destination: normalizeVariable(block.destination),
  };
}

function compileBranch(branch: EditorParallelBranch): CompiledHardwareBranch {
  return {
    id: branch.id,
    seriesIndex: branch.seriesIndex,
    contacts: branch.blocks.filter(isContact).map(compileContact),
  };
}

function ensurePinsForUsedIo(pinMap: HardwarePinMap[], variables: CompiledHardwareVariable[]): string[] {
  const warnings: string[] = [];
  const mapped = new Set(pinMap.map((pin) => normalizeVariable(pin.variable)));

  for (const variable of variables) {
    if ((variable.scope === 'input' || variable.scope === 'output') && !mapped.has(variable.variable)) {
      warnings.push(`Variável ${variable.variable} ainda não possui pino definido no mapa de hardware.`);
    }
  }

  return warnings;
}

export function compileLadderProjectForHardware(
  project: EditorProjectState,
  config: HardwareExportConfig,
): CompiledHardwareProject {
  const variables = new Map<string, CompiledHardwareVariable>();
  const edgeVariables = new Set<string>();
  const warnings: string[] = [];

  for (const variable of project.projectVariables ?? []) {
    addVariable(variables, variable.id, variable.name, variable.scope);
  }

  const rungs = project.rungs.map((rung) => {
    const seriesContacts = rung.seriesBlocks.filter(isContact).map((block) => {
      addVariable(variables, block.variable, block.name);
      if (block.contactMode === 'RISING' || block.contactMode === 'FALLING') edgeVariables.add(normalizeVariable(block.variable));
      if (block.compareMode) {
        addVariable(variables, block.sourceA, block.name);
        addVariable(variables, block.sourceB, block.name);
      }
      return compileContact(block);
    });

    const branches = parallelBranchesFor(rung).map((branch) => {
      for (const block of branch.blocks.filter(isContact)) {
        addVariable(variables, block.variable, block.name);
        if (block.contactMode === 'RISING' || block.contactMode === 'FALLING') edgeVariables.add(normalizeVariable(block.variable));
        if (block.compareMode) {
          addVariable(variables, block.sourceA, block.name);
          addVariable(variables, block.sourceB, block.name);
        }
      }
      return compileBranch(branch);
    });

    const output = compileOutput(rung.coilBlock);
    if (output) {
      addVariable(variables, output.variable, rung.coilBlock?.name);
      addVariable(variables, output.downSource, rung.coilBlock?.name);
      addVariable(variables, output.resetSource, rung.coilBlock?.name);
      addVariable(variables, output.sourceA, rung.coilBlock?.name);
      addVariable(variables, output.sourceB, rung.coilBlock?.name);
      addVariable(variables, output.destination, rung.coilBlock?.name);
    } else {
      warnings.push(`${rung.label}: linha sem bobina, timer ou contador de saída. Ela será ignorada no código gerado.`);
    }

    return {
      id: rung.id,
      label: rung.label,
      seriesContacts,
      parallelBranches: branches,
      output,
    };
  });

  const variableList = Array.from(variables.values()).sort((left, right) => left.variable.localeCompare(right.variable));
  warnings.push(...ensurePinsForUsedIo(config.pinMap, variableList));

  return {
    nodeName: config.nodeName.trim() || 'easy_clp_node',
    target: config.target,
    scanMs: Math.max(config.scanMs || 50, 1),
    variables: variableList,
    rungs,
    pinMap: config.pinMap.map((pin) => ({ ...pin, variable: normalizeVariable(pin.variable) })),
    edgeVariables: Array.from(edgeVariables).sort(),
    warnings,
  };
}
