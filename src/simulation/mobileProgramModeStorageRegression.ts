import { clearProgramModePreferences, loadProgramModePreferences, saveProgramModePreferences } from './mobileProgramModeStorage';

type Regression = { name: string; passed: boolean; details?: string };

function runStorageFallbackRegression(): Regression {
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  try {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    const loaded = loadProgramModePreferences();
    return { name: 'storage mobile retorna vazio sem localStorage', passed: Object.keys(loaded).length === 0, details: JSON.stringify(loaded) };
  } finally {
    if (previousStorage) {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
}

function runStorageRoundtripRegression(): Regression {
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
    saveProgramModePreferences({ '1:rung-1': 'flow' });
    const loaded = loadProgramModePreferences();
    return { name: 'storage mobile salva e restaura preferencias', passed: loaded['1:rung-1'] === 'flow', details: JSON.stringify(loaded) };
  } finally {
    if (previousStorage) {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
}

export function runMobileProgramModeStorageRegressionSuite(): Regression[] {
  return [runStorageFallbackRegression(), runStorageRoundtripRegression(), runStorageClearRegression()];
}

function runStorageClearRegression(): Regression {
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
    saveProgramModePreferences({ '1:rung-1': 'flow' });
    clearProgramModePreferences();
    const loaded = loadProgramModePreferences();
    return { name: 'storage mobile remove preferencias ao limpar', passed: Object.keys(loaded).length === 0, details: JSON.stringify(loaded) };
  } finally {
    if (previousStorage) (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
  }
}
