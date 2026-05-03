import { EditorProjectState } from '../engine/editorTypes';

export type EditorExampleProject = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  project: EditorProjectState;
};

export const tonDelayExample: EditorExampleProject = {
  id: 'ton-delay-example',
  title: 'TON — atraso para ligar',
  description: 'Ao acionar I0, o temporizador T0 acumula tempo. Quando atingir 3s, T0 liga e aciona Q0 na segunda linha.',
  difficulty: 'Intermediário',
  project: {
    selectedRungId: 'rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    rungs: [
      {
        id: 'rung-1',
        label: 'Linha 1 — TON T0',
        seriesBlocks: [
          {
            id: 'ton-i0-contact',
            componentId: 'contact-no',
            name: 'Contato NA',
            description: 'Contato de comando do temporizador.',
            isPro: false,
            zone: 'series',
            variable: 'I0',
            role: 'contact',
            contactMode: 'NO',
            category: 'logic',
          },
        ],
        parallelBlocks: [],
        coilBlock: {
          id: 'ton-t0-block',
          componentId: 'timer-ton',
          name: 'TON',
          description: 'Temporizador com atraso na energização.',
          isPro: true,
          zone: 'coil',
          variable: 'T0',
          role: 'timer',
          timerMode: 'TON',
          presetMs: 3000,
          category: 'timer',
        },
      },
      {
        id: 'rung-2',
        label: 'Linha 2 — Saída Q0 por T0',
        seriesBlocks: [
          {
            id: 'ton-t0-contact',
            componentId: 'contact-no',
            name: 'Contato NA',
            description: 'Contato associado à saída Q do temporizador T0.',
            isPro: false,
            zone: 'series',
            variable: 'T0',
            role: 'contact',
            contactMode: 'NO',
            category: 'logic',
          },
        ],
        parallelBlocks: [],
        coilBlock: {
          id: 'ton-q0-coil',
          componentId: 'coil-q',
          name: 'Bobina Q',
          description: 'Saída acionada após o TON terminar.',
          isPro: false,
          zone: 'coil',
          variable: 'Q0',
          role: 'coil',
          coilMode: 'NORMAL',
          category: 'output',
        },
      },
    ],
  },
};

export const tofDelayExample: EditorExampleProject = {
  id: 'tof-delay-example',
  title: 'TOF — atraso para desligar',
  description: 'Enquanto I0 está ligado, T0 fica ativo. Ao desligar I0, T0 mantém Q por 3s antes de desligar Q0.',
  difficulty: 'Intermediário',
  project: {
    selectedRungId: 'rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    rungs: [
      {
        id: 'rung-1',
        label: 'Linha 1 — TOF T0',
        seriesBlocks: [
          {
            id: 'tof-i0-contact',
            componentId: 'contact-no',
            name: 'Contato NA',
            description: 'Contato de comando do temporizador TOF.',
            isPro: false,
            zone: 'series',
            variable: 'I0',
            role: 'contact',
            contactMode: 'NO',
            category: 'logic',
          },
        ],
        parallelBlocks: [],
        coilBlock: {
          id: 'tof-t0-block',
          componentId: 'timer-tof',
          name: 'TOF',
          description: 'Temporizador com atraso no desligamento.',
          isPro: true,
          zone: 'coil',
          variable: 'T0',
          role: 'timer',
          timerMode: 'TOF',
          presetMs: 3000,
          category: 'timer',
        },
      },
      {
        id: 'rung-2',
        label: 'Linha 2 — Saída Q0 por T0',
        seriesBlocks: [
          {
            id: 'tof-t0-contact',
            componentId: 'contact-no',
            name: 'Contato NA',
            description: 'Contato associado à saída Q do temporizador T0.',
            isPro: false,
            zone: 'series',
            variable: 'T0',
            role: 'contact',
            contactMode: 'NO',
            category: 'logic',
          },
        ],
        parallelBlocks: [],
        coilBlock: {
          id: 'tof-q0-coil',
          componentId: 'coil-q',
          name: 'Bobina Q',
          description: 'Saída mantida por atraso após desligar I0.',
          isPro: false,
          zone: 'coil',
          variable: 'Q0',
          role: 'coil',
          coilMode: 'NORMAL',
          category: 'output',
        },
      },
    ],
  },
};

export const ctuCounterExample: EditorExampleProject = {
  id: 'ctu-counter-example',
  title: 'CTU — contador crescente',
  description: 'Cada borda de subida em I0 incrementa C0. Ao chegar em 3 pulsos, C0 liga e aciona Q0.',
  difficulty: 'Intermediário',
  project: {
    selectedRungId: 'rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    rungs: [
      {
        id: 'rung-1',
        label: 'Linha 1 — CTU C0',
        seriesBlocks: [
          {
            id: 'ctu-i0-contact',
            componentId: 'contact-no',
            name: 'Contato NA',
            description: 'Pulso de contagem do CTU.',
            isPro: false,
            zone: 'series',
            variable: 'I0',
            role: 'contact',
            contactMode: 'NO',
            category: 'logic',
          },
        ],
        parallelBlocks: [],
        coilBlock: {
          id: 'ctu-c0-block',
          componentId: 'counter-ctu',
          name: 'CTU',
          description: 'Contador crescente por borda de subida.',
          isPro: true,
          zone: 'coil',
          variable: 'C0',
          role: 'counter',
          counterMode: 'CTU',
          preset: 3,
          category: 'counter',
        },
      },
      {
        id: 'rung-2',
        label: 'Linha 2 — Saída Q0 por C0',
        seriesBlocks: [
          {
            id: 'ctu-c0-contact',
            componentId: 'contact-no',
            name: 'Contato NA',
            description: 'Contato associado ao done do contador C0.',
            isPro: false,
            zone: 'series',
            variable: 'C0',
            role: 'contact',
            contactMode: 'NO',
            category: 'logic',
          },
        ],
        parallelBlocks: [],
        coilBlock: {
          id: 'ctu-q0-coil',
          componentId: 'coil-q',
          name: 'Bobina Q',
          description: 'Saída acionada quando o contador atinge o preset.',
          isPro: false,
          zone: 'coil',
          variable: 'Q0',
          role: 'coil',
          coilMode: 'NORMAL',
          category: 'output',
        },
      },
    ],
  },
};

export const educationalEditorExamples = [tonDelayExample, tofDelayExample, ctuCounterExample];
