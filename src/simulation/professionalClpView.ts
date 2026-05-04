import { EditorBlock, EditorProjectState, EditorVariableDataType, EditorVariableScope } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';

export type EducationalForceMode = 'normal' | 'force_on' | 'force_off';

export type EducationalForceMap = Record<string, EducationalForceMode>;

export type ProfessionalTagRow = {
  tag: string;
  type: EditorVariableDataType;
  scope: EditorVariableScope;
  value: boolean | number;
  description: string;
  forced: EducationalForceMode;
  forcedLabel: 'Normal' | 'Force ON' | 'Force OFF';
  safetyWarning?: string;
};

export type RungCommentRow = {
  rungId: string;
  rungLabel: string;
  comment: string;
  hasCustomComment: boolean;
};

function normalizeVariable(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function inferScope(variable: string): EditorVariableScope {
  const normalized = normalizeVariable(variable);
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  return 'memory';
}

function inferDataType(variable: string): EditorVariableDataType {
  const normalized = normalizeVariable(variable);
  if (normalized.startsWith('T')) return 'timer';
  if (normalized.startsWith('C')) return 'counter';
  if (normalized.startsWith('N')) return 'number';
  return 'boolean';
}

function defaultDescription(scope: EditorVariableScope, dataType: EditorVariableDataType): string {
  if (dataType === 'timer') return 'Temporizador usado pelo programa.';
  if (dataType === 'counter') return 'Contador usado pelo programa.';
  if (scope === 'input') return 'Entrada de campo ou comando didático.';
  if (scope === 'output') return 'Saída/carga acionada pelo programa.';
  return 'Memória interna auxiliar do programa.';
}

function forcedLabel(force: EducationalForceMode): ProfessionalTagRow['forcedLabel'] {
  if (force === 'force_on') return 'Force ON';
  if (force === 'force_off') return 'Force OFF';
  return 'Normal';
}

function forceWarning(force: EducationalForceMode): string | undefined {
  if (force === 'normal') return undefined;
  return 'Force didático ativo: use apenas em simulação/aula. Em bancada real, force pode mascarar falhas e acionar cargas sem condição segura.';
}

function allEditorBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

export function applyEducationalForce(value: boolean | number, force: EducationalForceMode): boolean | number {
  if (typeof value === 'number') return value;
  if (force === 'force_on') return true;
  if (force === 'force_off') return false;
  return value;
}

export function createProfessionalTagRows(
  project: EditorProjectState,
  state: PlcState,
  forces: EducationalForceMap = {},
): ProfessionalTagRow[] {
  const rows = new Map<string, ProfessionalTagRow>();

  const register = (
    variable: string | undefined,
    fallbackDescription?: string,
    fallbackScope?: EditorVariableScope,
    fallbackType?: EditorVariableDataType,
  ) => {
    const tag = normalizeVariable(variable);
    if (!tag || isNumericLiteral(tag) || rows.has(tag)) return;
    const scope = fallbackScope ?? inferScope(tag);
    const type = fallbackType ?? inferDataType(tag);
    const rawValue = state[tag] ?? (type === 'number' ? 0 : false);
    const force = forces[tag] ?? 'normal';
    const value = applyEducationalForce(rawValue, force);

    rows.set(tag, {
      tag,
      type,
      scope,
      value,
      description: fallbackDescription || defaultDescription(scope, type),
      forced: force,
      forcedLabel: forcedLabel(force),
      safetyWarning: forceWarning(force),
    });
  };

  for (const variable of project.projectVariables ?? []) {
    register(variable.address || variable.id, variable.name, variable.scope, variable.dataType);
  }

  for (const block of allEditorBlocks(project)) {
    register(block.variable, block.name);
    register(block.sourceA);
    register(block.sourceB);
    register(block.destination);
    register(block.downSource);
    register(block.resetSource);
  }

  return Array.from(rows.values()).sort((left, right) => left.tag.localeCompare(right.tag));
}

export function createRungCommentRows(
  project: EditorProjectState,
  comments: Record<string, string> = {},
): RungCommentRow[] {
  return project.rungs.map((rung, index) => {
    const custom = comments[rung.id]?.trim();
    const output = rung.coilBlock?.variable ? ` aciona ${normalizeVariable(rung.coilBlock.variable)}` : ' ainda não possui saída final';
    const automatic = `Linha ${index + 1}${output}. Use este comentário para explicar a intenção da lógica.`;

    return {
      rungId: rung.id,
      rungLabel: rung.label,
      comment: custom || automatic,
      hasCustomComment: Boolean(custom),
    };
  });
}
