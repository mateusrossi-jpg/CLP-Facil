import { createInitialZoomState, MobileRungZoomState } from '../components/mobileRungViewerModel';

const STORAGE_KEY = 'easy_clp_mobile_rung_zoom_state_v1';

function hasLocalStorage(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
}

export function loadMobileRungZoomState(): MobileRungZoomState {
  const fallback = createInitialZoomState();
  if (!hasLocalStorage()) return fallback;
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MobileRungZoomState>;
    return {
      individual: typeof parsed.individual === 'number' ? parsed.individual : fallback.individual,
      compiled: typeof parsed.compiled === 'number' ? parsed.compiled : fallback.compiled,
    };
  } catch {
    return fallback;
  }
}

export function saveMobileRungZoomState(state: MobileRungZoomState): void {
  if (!hasLocalStorage()) return;
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write failures
  }
}

export function clearMobileRungZoomState(): void {
  if (!hasLocalStorage()) return;
  try {
    globalThis.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore failures
  }
}
