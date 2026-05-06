import { EditorProjectState } from '../engine/editorTypes';

export type MobileProgramMode = 'list' | 'flow' | 'compact_rung';

export function resolveFocusedRungId(
  project: EditorProjectState,
  focusedRungId: string | null,
): string | null {
  const rungIds = new Set(project.rungs.map((rung) => rung.id));
  if (focusedRungId && rungIds.has(focusedRungId)) return focusedRungId;
  if (project.selectedRungId && rungIds.has(project.selectedRungId)) return project.selectedRungId;
  return project.rungs[0]?.id ?? null;
}

export function clampProgramMode(mode: string): MobileProgramMode {
  if (mode === 'list' || mode === 'flow' || mode === 'compact_rung') return mode;
  return 'compact_rung';
}

export function resolveRungIndex(project: EditorProjectState, rungIndex: number): number {
  if (project.rungs.length === 0) return 0;
  return Math.min(Math.max(rungIndex, 0), project.rungs.length - 1);
}

export function recommendProgramMode(rungCount: number): MobileProgramMode {
  if (rungCount >= 8) return 'flow';
  if (rungCount >= 4) return 'list';
  return 'compact_rung';
}

export function programModeLabel(mode: MobileProgramMode): string {
  if (mode === 'flow') return 'Fluxo';
  if (mode === 'list') return 'Lista';
  return 'Rung compacto';
}

export function mobileSessionContextLabel(
  mode: MobileProgramMode,
  focusedRungId: string | null,
): string {
  const rungLabel = focusedRungId ? focusedRungId.toUpperCase() : 'RUNG INICIAL';
  return `${programModeLabel(mode)} • ${rungLabel}`;
}

export function shouldShowProgramModeRecommendation(
  currentMode: MobileProgramMode,
  recommendedMode: MobileProgramMode,
  dismissed: boolean,
): boolean {
  if (dismissed) return false;
  return currentMode !== recommendedMode;
}

export function projectModeKey(project: EditorProjectState): string {
  const first = project.rungs[0]?.id ?? 'empty';
  return `${project.rungs.length}:${first}`;
}

export type MobileProgramModePreferences = Record<string, MobileProgramMode>;
export type MobileFocusedRungPreferences = Record<string, string>;

export function restoreProgramModeForProject(
  preferences: MobileProgramModePreferences,
  project: EditorProjectState,
  fallbackMode: MobileProgramMode,
): MobileProgramMode {
  const key = projectModeKey(project);
  const saved = preferences[key];
  return saved ? clampProgramMode(saved) : fallbackMode;
}

export function persistProgramModeForProject(
  preferences: MobileProgramModePreferences,
  project: EditorProjectState,
  mode: MobileProgramMode,
): MobileProgramModePreferences {
  const key = projectModeKey(project);
  return { ...preferences, [key]: clampProgramMode(mode) };
}

export function restoreFocusedRungForProject(
  preferences: MobileFocusedRungPreferences,
  project: EditorProjectState,
): string | null {
  const key = projectModeKey(project);
  const focused = preferences[key];
  if (!focused) return null;
  return project.rungs.some((rung) => rung.id === focused) ? focused : null;
}

export function persistFocusedRungForProject(
  preferences: MobileFocusedRungPreferences,
  project: EditorProjectState,
  rungId: string,
): MobileFocusedRungPreferences {
  const key = projectModeKey(project);
  return { ...preferences, [key]: rungId };
}
