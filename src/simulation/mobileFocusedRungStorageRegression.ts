import { clearFocusedRungPreferences, loadFocusedRungPreferences, saveFocusedRungPreferences } from './mobileFocusedRungStorage';

type Regression = { name: string; passed: boolean; details?: string };

function runFocusedStorageFallbackRegression(): Regression {
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  try {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    const loaded = loadFocusedRungPreferences();
    return { name: 'storage foco rung retorna vazio sem localStorage', passed: Object.keys(loaded).length === 0, details: JSON.stringify(loaded) };
  } finally {
    if (previousStorage) (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
  }
}

function runFocusedStorageRoundtripRegression(): Regression {
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
    saveFocusedRungPreferences({ '1:rung-1': 'rung-1' });
    const loaded = loadFocusedRungPreferences();
    return { name: 'storage foco rung salva e restaura preferencias', passed: loaded['1:rung-1'] === 'rung-1', details: JSON.stringify(loaded) };
  } finally {
    if (previousStorage) (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
  }
}

export function runMobileFocusedRungStorageRegressionSuite(): Regression[] {
  return [runFocusedStorageFallbackRegression(), runFocusedStorageRoundtripRegression(), runFocusedStorageClearRegression()];
}

function runFocusedStorageClearRegression(): Regression {
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
    saveFocusedRungPreferences({ '1:rung-1': 'rung-1' });
    clearFocusedRungPreferences();
    const loaded = loadFocusedRungPreferences();
    return { name: 'storage foco rung remove preferencias ao limpar', passed: Object.keys(loaded).length === 0, details: JSON.stringify(loaded) };
  } finally {
    if (previousStorage) (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
  }
}
