import { MobileFocusedRungPreferences } from './mobileSimulationState';

const STORAGE_KEY = 'easy_clp_mobile_focused_rung_preferences_v1';

function hasLocalStorage(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
}

export function loadFocusedRungPreferences(): MobileFocusedRungPreferences {
  if (!hasLocalStorage()) return {};
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
}

export function saveFocusedRungPreferences(preferences: MobileFocusedRungPreferences): void {
  if (!hasLocalStorage()) return;
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // ignore write failures
  }
}

export function clearFocusedRungPreferences(): void {
  if (!hasLocalStorage()) return;
  try {
    globalThis.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore failures
  }
}
