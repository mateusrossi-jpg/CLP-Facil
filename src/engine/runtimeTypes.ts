export type TimerRuntimeState = {
  elapsedMs: number;
  q: boolean;
  previousIn: boolean;
};

export type CounterRuntimeState = {
  currentValue: number;
  q: boolean;
  previousCu: boolean;
  previousCd: boolean;
};

export type EditorRuntimeState = {
  scanNumber: number;
  scanStepMs: number;
  timers: Record<string, TimerRuntimeState>;
  counters: Record<string, CounterRuntimeState>;
};

export function createInitialRuntimeState(): EditorRuntimeState {
  return {
    scanNumber: 0,
    scanStepMs: 100,
    timers: {},
    counters: {},
  };
}

export function getTimerRuntime(runtime: EditorRuntimeState, blockId: string): TimerRuntimeState {
  return runtime.timers[blockId] ?? {
    elapsedMs: 0,
    q: false,
    previousIn: false,
  };
}

export function getCounterRuntime(runtime: EditorRuntimeState, blockId: string): CounterRuntimeState {
  return runtime.counters[blockId] ?? {
    currentValue: 0,
    q: false,
    previousCu: false,
    previousCd: false,
  };
}
