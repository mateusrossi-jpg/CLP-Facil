import { SimulatorComponent } from '../data/componentLibrary';

export type EditorInsertionZone = 'series' | 'parallel' | 'coil';

export type EditorBlock = {
  id: string;
  componentId: string;
  name: string;
  description: string;
  isPro: boolean;
  zone: EditorInsertionZone;
  variable: string;
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

export function createEditorBlock(component: SimulatorComponent, zone: EditorInsertionZone): EditorBlock {
  const defaultVariable = component.category === 'output' || component.category === 'motor' ? 'Q0' : component.category === 'logic' ? 'M0' : 'I0';

  return {
    id: `${component.id}-${Date.now()}`,
    componentId: component.id,
    name: component.name,
    description: component.description,
    isPro: component.isPro,
    zone,
    variable: defaultVariable,
  };
}
