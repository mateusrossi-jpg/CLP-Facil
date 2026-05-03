import { ComponentCategory, SimulatorComponent } from '../data/componentLibrary';

export type EditorInsertionZone = 'series' | 'parallel' | 'coil';
export type EditorBlockRole = 'contact' | 'coil' | 'device' | 'timer' | 'counter' | 'actuator';
export type EditorContactMode = 'NO' | 'NC';
export type EditorCoilMode = 'NORMAL' | 'SET' | 'RESET' | 'PULSE';
export type EditorTimerMode = 'TON' | 'TOF' | 'TP';
export type EditorCounterMode = 'CTU' | 'CTD' | 'CTUD';

export type EditorBlock = {
  id: string;
  componentId: string;
  name: string;
  description: string;
  isPro: boolean;
  zone: EditorInsertionZone;
  variable: string;
  role: EditorBlockRole;
  contactMode?: EditorContactMode;
  coilMode?: EditorCoilMode;
  timerMode?: EditorTimerMode;
  counterMode?: EditorCounterMode;
  presetMs?: number;
  preset?: number;
  category: ComponentCategory;
};

export type EditorRung = {
  id: string;
  label: string;
  seriesBlocks: EditorBlock[];
  parallelBlocks: EditorBlock[];
  coilBlock: EditorBlock | null;
};

export type EditorProjectState = {
  selectedRungId: string;
  selectedBlockId: string | null;
  selectedZone: EditorInsertionZone;
  rungs: EditorRung[];
};

export function createInitialEditorProject(): EditorProjectState {
  return {
    selectedRungId: 'rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    rungs: [
      {
        id: 'rung-1',
        label: 'Linha 1 — Novo comando',
        seriesBlocks: [],
        parallelBlocks: [],
        coilBlock: null,
      },
    ],
  };
}

function inferContactMode(component: SimulatorComponent): EditorContactMode | undefined {
  if (component.id.includes('-nc') || component.name.includes('NF')) return 'NC';
  if (component.id.includes('-no') || component.name.includes('NA')) return 'NO';
  if (component.id.includes('contact') || component.id.includes('button') || component.id.includes('selector') || component.id.includes('emergency')) return 'NO';
  return undefined;
}

function inferCoilMode(component: SimulatorComponent): EditorCoilMode | undefined {
  if (component.id.includes('coil-set')) return 'SET';
  if (component.id.includes('coil-reset')) return 'RESET';
  if (component.id.includes('pulse')) return 'PULSE';
  if (component.id.includes('coil') || component.id.includes('contactor') || component.id.includes('motor') || component.id.includes('light')) return 'NORMAL';
  return undefined;
}

function inferTimerMode(component: SimulatorComponent): EditorTimerMode | undefined {
  if (component.id.includes('timer-ton')) return 'TON';
  if (component.id.includes('timer-tof')) return 'TOF';
  if (component.id.includes('timer-tp')) return 'TP';
  return undefined;
}

function inferCounterMode(component: SimulatorComponent): EditorCounterMode | undefined {
  if (component.id.includes('counter-ctu')) return 'CTU';
  if (component.id.includes('counter-ctd')) return 'CTD';
  return undefined;
}

function inferRole(component: SimulatorComponent, zone: EditorInsertionZone): EditorBlockRole {
  if (component.category === 'timer') return 'timer';
  if (component.category === 'counter') return 'counter';
  if (zone === 'coil') return 'coil';
  if (component.category === 'motor') return 'actuator';
  if (component.category === 'output') return zone === 'coil' ? 'coil' : 'device';
  return 'contact';
}

function defaultVariableFor(component: SimulatorComponent, zone: EditorInsertionZone): string {
  if (component.category === 'timer') return 'T0';
  if (component.category === 'counter') return 'C0';

  if (zone === 'coil') {
    if (component.id.includes('memory')) return 'M0';
    return 'Q0';
  }

  if (component.category === 'logic') return component.id.includes('memory') ? 'M0' : 'I0';
  if (component.category === 'output' || component.category === 'motor') return 'Q0';
  return 'I0';
}

export function createEditorBlock(component: SimulatorComponent, zone: EditorInsertionZone): EditorBlock {
  const role = inferRole(component, zone);
  const contactMode = role === 'contact' ? inferContactMode(component) ?? 'NO' : undefined;
  const coilMode = role === 'coil' ? inferCoilMode(component) ?? 'NORMAL' : undefined;
  const timerMode = role === 'timer' ? inferTimerMode(component) ?? 'TON' : undefined;
  const counterMode = role === 'counter' ? inferCounterMode(component) ?? 'CTU' : undefined;

  return {
    id: `${component.id}-${Date.now()}`,
    componentId: component.id,
    name: component.name,
    description: component.description,
    isPro: component.isPro,
    zone,
    variable: defaultVariableFor(component, zone),
    role,
    contactMode,
    coilMode,
    timerMode,
    counterMode,
    presetMs: role === 'timer' ? 3000 : undefined,
    preset: role === 'counter' ? 5 : undefined,
    category: component.category,
  };
}
