import { ComponentCategory, SimulatorComponent } from '../data/componentLibrary';

export type EditorInsertionZone = 'series' | 'parallel' | 'coil';
export type EditorBlockRole = 'contact' | 'coil' | 'device' | 'timer' | 'counter' | 'actuator';
export type EditorCompareMode = 'EQU' | 'NEQ' | 'GRT' | 'LES' | 'GEQ' | 'LEQ';
export type EditorMathMode = 'MOV' | 'ADD' | 'SUB' | 'MUL' | 'DIV';
export type EditorContactMode = 'NO' | 'NC' | 'RISING' | 'FALLING';
export type EditorCoilMode = 'NORMAL' | 'SET' | 'RESET' | 'PULSE';
export type EditorTimerMode = 'TON' | 'TOF' | 'TP';
export type EditorCounterMode = 'CTU' | 'CTD' | 'CTUD';
export type EditorVariableDataType = 'boolean' | 'number' | 'timer' | 'counter';
export type EditorVariableScope = 'input' | 'output' | 'memory';

export type EditorVariable = {
  id: string;
  address: string;
  name: string;
  scope: EditorVariableScope;
  dataType: EditorVariableDataType;
};

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
  compareMode?: EditorCompareMode;
  mathMode?: EditorMathMode;
  sourceA?: string;
  sourceB?: string;
  destination?: string;
  downSource?: string;
  resetSource?: string;
  presetMs?: number;
  preset?: number;
  category: ComponentCategory;
  parallelIndex?: number;
};

export type EditorRung = {
  id: string;
  label: string;
  seriesBlocks: EditorBlock[];
  parallelBlocks: EditorBlock[];
  parallelBranches?: EditorParallelBranch[];
  coilBlock: EditorBlock | null;
};

export type EditorParallelBranch = {
  id: string;
  seriesIndex: number;
  blocks: EditorBlock[];
};

export type EditorProjectState = {
  selectedRungId: string;
  selectedBlockId: string | null;
  selectedZone: EditorInsertionZone;
  selectedSeriesIndex: number;
  projectVariables?: EditorVariable[];
  rungs: EditorRung[];
};

export function createInitialEditorProject(): EditorProjectState {
  return {
    selectedRungId: 'rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [
      { id: 'I0.0', address: 'I0.0', name: 'Start', scope: 'input', dataType: 'boolean' },
      { id: 'I0.1', address: 'I0.1', name: 'Stop', scope: 'input', dataType: 'boolean' },
      { id: 'Q0.0', address: 'Q0.0', name: 'Motor', scope: 'output', dataType: 'boolean' },
    ],
    rungs: [
      {
        id: 'rung-1',
        label: 'Linha 1 — Partida com selo',
        seriesBlocks: [
          {
            id: 'starter-i0-start',
            componentId: 'button-no',
            name: 'Start Button',
            description: 'Botão Liga normalmente aberto.',
            isPro: false,
            zone: 'series',
            variable: 'I0.0',
            role: 'contact',
            contactMode: 'NO',
            category: 'input',
          },
          {
            id: 'starter-i1-stop',
            componentId: 'button-nc',
            name: 'Stop Button',
            description: 'Botão Desliga normalmente fechado.',
            isPro: false,
            zone: 'series',
            variable: 'I0.1',
            role: 'contact',
            contactMode: 'NC',
            category: 'input',
          },
        ],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'starter-branch-seal',
            seriesIndex: 0,
            blocks: [
              {
                id: 'starter-q0-seal',
                componentId: 'contact-no',
                name: 'Selo do Motor',
                description: 'Contato auxiliar que mantém a bobina ligada.',
                isPro: false,
                zone: 'parallel',
                variable: 'Q0.0',
                role: 'contact',
                contactMode: 'NO',
                category: 'logic',
                parallelIndex: 0,
              },
            ],
          },
        ],
        coilBlock: {
          id: 'starter-q0-motor',
          componentId: 'coil-q',
          name: 'Motor',
          description: 'Bobina de saída do motor.',
          isPro: false,
          zone: 'coil',
          variable: 'Q0.0',
          role: 'coil',
          coilMode: 'NORMAL',
          category: 'output',
        },
      },
    ],
  };
}

function inferContactMode(component: SimulatorComponent): EditorContactMode | undefined {
  if (component.id.includes('contact-ons')) return 'RISING';
  if (component.id.includes('contact-osf')) return 'FALLING';
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
  if (component.id.includes('counter-ctud')) return 'CTUD';
  return undefined;
}

function inferRole(component: SimulatorComponent, zone: EditorInsertionZone): EditorBlockRole {
  if (component.category === 'timer') return 'timer';
  if (component.category === 'counter') return 'counter';
  if (component.category === 'compare') return 'contact';
  if (component.category === 'math') return 'coil';
  if (zone === 'coil') return 'coil';
  if (component.category === 'motor') return 'actuator';
  if (component.category === 'output') return 'device';
  return 'contact';
}

function defaultVariableFor(component: SimulatorComponent, zone: EditorInsertionZone): string {
  if (component.category === 'timer') return 'T0';
  if (component.category === 'counter') return 'C0';
  if (component.category === 'compare') return 'N0';
  if (component.category === 'math') return 'N0';

  if (zone === 'coil') {
    if (component.id.includes('memory')) return 'M0.0';
    return 'Q0.0';
  }

  if (component.category === 'logic') return component.id.includes('memory') ? 'M0.0' : 'I0.0';
  if (component.category === 'output' || component.category === 'motor') return 'Q0.0';
  return 'I0.0';
}

export function createEditorBlock(component: SimulatorComponent, zone: EditorInsertionZone): EditorBlock {
  const role = inferRole(component, zone);
  const contactMode = role === 'contact' ? inferContactMode(component) ?? 'NO' : undefined;
  const coilMode = role === 'coil' ? inferCoilMode(component) ?? 'NORMAL' : undefined;
  const timerMode = role === 'timer' ? inferTimerMode(component) ?? 'TON' : undefined;
  const counterMode = role === 'counter' ? inferCounterMode(component) ?? 'CTU' : undefined;
  const compareMode = component.category === 'compare' ? component.id.replace('cmp-', '').toUpperCase() as EditorCompareMode : undefined;
  const mathMode = component.category === 'math' ? component.id.replace('math-', '').toUpperCase() as EditorMathMode : undefined;

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
    compareMode,
    mathMode,
    sourceA: compareMode || mathMode ? 'N0' : undefined,
    sourceB: compareMode || (mathMode && mathMode !== 'MOV') ? '0' : undefined,
    destination: mathMode ? 'N1' : undefined,
    downSource: counterMode === 'CTUD' ? 'I0.1' : undefined,
    resetSource: role === 'counter' ? 'M0.0' : undefined,
    presetMs: role === 'timer' ? 3000 : undefined,
    preset: role === 'counter' ? 5 : undefined,
    category: component.category,
  };
}
