import { clearMobileRungZoomState, loadMobileRungZoomState, saveMobileRungZoomState } from './mobileRungZoomStorage';

type Regression = { name: string; passed: boolean; details?: string };

function runRungZoomFallbackRegression(): Regression {
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  try {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    const loaded = loadMobileRungZoomState();
    return {
      name: 'storage zoom mobile retorna fallback sem localStorage',
      passed: typeof loaded.individual === 'number' && typeof loaded.compiled === 'number',
      details: `individual=${loaded.individual}, compiled=${loaded.compiled}`,
    };
  } finally {
    if (previousStorage) (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
  }
}

function runRungZoomRoundtripRegression(): Regression {
  const store = new Map<string, string>();
  const fakeStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } as Storage;
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  (globalThis as { localStorage?: Storage }).localStorage = fakeStorage;
  try {
    saveMobileRungZoomState({ individual: 0.88, compiled: 0.54 });
    const loaded = loadMobileRungZoomState();
    return {
      name: 'storage zoom mobile salva e restaura estado',
      passed: loaded.individual === 0.88 && loaded.compiled === 0.54,
      details: `individual=${loaded.individual}, compiled=${loaded.compiled}`,
    };
  } finally {
    if (previousStorage) (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
  }
}

export function runMobileRungZoomStorageRegressionSuite(): Regression[] {
  return [runRungZoomFallbackRegression(), runRungZoomRoundtripRegression(), runRungZoomClearRegression()];
}

function runRungZoomClearRegression(): Regression {
  const store = new Map<string, string>();
  const fakeStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } as Storage;
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  (globalThis as { localStorage?: Storage }).localStorage = fakeStorage;
  try {
    saveMobileRungZoomState({ individual: 0.81, compiled: 0.57 });
    clearMobileRungZoomState();
    const loaded = loadMobileRungZoomState();
    return {
      name: 'storage zoom mobile remove preferencias ao limpar',
      passed: loaded.individual === 0.76 && loaded.compiled === 0.62,
      details: `individual=${loaded.individual}, compiled=${loaded.compiled}`,
    };
  } finally {
    if (previousStorage) (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
  }
}
