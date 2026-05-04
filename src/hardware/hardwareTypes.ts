import { EditorContactMode, EditorCoilMode, EditorCounterMode, EditorTimerMode } from '../engine/editorTypes';

export type HardwareTarget = 'esp32' | 'esp8266' | 'arduino_uno' | 'arduino_nano' | 'generic_arduino' | 'esphome';

export type HardwareVariableScope = 'input' | 'output' | 'memory';
export type HardwareDataType = 'boolean' | 'number' | 'timer' | 'counter';
export type HardwarePinMode = 'input_pullup' | 'input_pulldown' | 'input_floating' | 'output';
export type HardwareOutputPolarity = 'active_high' | 'active_low';

export type HardwarePinMap = {
  variable: string;
  label?: string;
  pin: string;
  mode: HardwarePinMode;
  outputPolarity?: HardwareOutputPolarity;
  safeState?: boolean;
  debounceMs?: number;
};

export type HardwareExportConfig = {
  target: HardwareTarget;
  nodeName: string;
  scanMs: number;
  pinMap: HardwarePinMap[];
};

export type CompiledHardwareVariable = {
  variable: string;
  name: string;
  scope: HardwareVariableScope;
  dataType: HardwareDataType;
};

export type CompiledHardwareContact = {
  id: string;
  variable: string;
  mode: EditorContactMode;
  compareMode?: string;
  sourceA?: string;
  sourceB?: string;
};

export type CompiledHardwareBranch = {
  id: string;
  seriesIndex: number;
  contacts: CompiledHardwareContact[];
};

export type CompiledHardwareOutput = {
  id: string;
  variable: string;
  role: 'coil' | 'timer' | 'counter';
  coilMode?: EditorCoilMode;
  timerMode?: EditorTimerMode;
  counterMode?: EditorCounterMode;
  presetMs?: number;
  preset?: number;
  downSource?: string;
  resetSource?: string;
  mathMode?: string;
  sourceA?: string;
  sourceB?: string;
  destination?: string;
};

export type CompiledHardwareRung = {
  id: string;
  label: string;
  seriesContacts: CompiledHardwareContact[];
  parallelBranches: CompiledHardwareBranch[];
  output: CompiledHardwareOutput | null;
};

export type CompiledHardwareProject = {
  nodeName: string;
  target: HardwareTarget;
  scanMs: number;
  variables: CompiledHardwareVariable[];
  rungs: CompiledHardwareRung[];
  pinMap: HardwarePinMap[];
  edgeVariables: string[];
  warnings: string[];
};
