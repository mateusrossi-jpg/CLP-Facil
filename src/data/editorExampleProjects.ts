import { EditorProjectState, EditorVariable } from '../engine/editorTypes';

export type EditorExampleProject = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  project: EditorProjectState;
};

function contact(id: string, name: string, variable: string, contactMode: 'NO' | 'NC' = 'NO') {
  return {
    id,
    componentId: contactMode === 'NC' ? 'contact-nc' : 'contact-no',
    name,
    description: contactMode === 'NC' ? 'Contato normalmente fechado.' : 'Contato normalmente aberto.',
    isPro: false,
    zone: 'series' as const,
    variable,
    role: 'contact' as const,
    contactMode,
    category: 'logic' as const,
  };
}

function coil(id: string, name: string, variable: string) {
  return {
    id,
    componentId: 'coil-q',
    name,
    description: 'Bobina de saída.',
    isPro: false,
    zone: 'coil' as const,
    variable,
    role: 'coil' as const,
    coilMode: 'NORMAL' as const,
    category: 'output' as const,
  };
}

function setCoil(id: string, name: string, variable: string) {
  return {
    ...coil(id, name, variable),
    componentId: 'coil-set',
    description: 'Bobina SET.',
    coilMode: 'SET' as const,
  };
}

function resetCoil(id: string, name: string, variable: string) {
  return {
    ...coil(id, name, variable),
    componentId: 'coil-reset',
    description: 'Bobina RESET.',
    coilMode: 'RESET' as const,
  };
}

function timer(id: string, name: string, variable: string, presetMs: number, timerMode: 'TON' | 'TOF' | 'TP' = 'TON') {
  return {
    id,
    componentId: timerMode === 'TOF' ? 'timer-tof' : timerMode === 'TP' ? 'timer-tp' : 'timer-ton',
    name,
    description: `Temporizador ${timerMode}.`,
    isPro: false,
    zone: 'coil' as const,
    variable,
    role: 'timer' as const,
    timerMode,
    presetMs,
    category: 'timer' as const,
  };
}

function counter(id: string, name: string, variable: string, preset: number, resetSource?: string) {
  return {
    id,
    componentId: 'counter-ctu',
    name,
    description: 'Contador crescente.',
    isPro: false,
    zone: 'coil' as const,
    variable,
    role: 'counter' as const,
    counterMode: 'CTU' as const,
    preset,
    resetSource,
    category: 'counter' as const,
  };
}

function isNumericLiteral(value: string | undefined) {
  return Boolean(value && value.trim() !== '' && Number.isFinite(Number(value.trim().replace(',', '.'))));
}

function variableForAddress(address: string): EditorVariable {
  const normalized = address.trim().toUpperCase();
  const prefix = normalized.charAt(0);
  const dataType = prefix === 'T'
    ? 'timer'
    : prefix === 'C'
      ? 'counter'
      : prefix === 'N'
        ? 'number'
        : 'boolean';
  const scope = prefix === 'I'
    ? 'input'
    : prefix === 'Q' || prefix === 'O'
      ? 'output'
      : 'memory';

  return {
    id: normalized,
    address: normalized,
    name: normalized,
    scope,
    dataType,
  };
}

function withDeclaredVariables(project: EditorProjectState): EditorProjectState {
  const variables = new Map<string, EditorVariable>();
  for (const variable of project.projectVariables ?? []) {
    variables.set(variable.id.trim().toUpperCase(), {
      ...variable,
      id: variable.id.trim().toUpperCase(),
      address: variable.address.trim().toUpperCase(),
    });
  }

  for (const rung of project.rungs) {
    const blocks = [
      ...rung.seriesBlocks,
      ...rung.parallelBlocks,
      ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
      ...(rung.coilBlock ? [rung.coilBlock] : []),
    ];

    for (const block of blocks) {
      for (const value of [block.variable, block.sourceA, block.sourceB, block.destination, block.downSource, block.resetSource]) {
        if (!value || isNumericLiteral(value)) continue;
        const address = value.trim().toUpperCase();
        if (!variables.has(address)) variables.set(address, variableForAddress(address));
      }
    }
  }

  return {
    ...project,
    projectVariables: Array.from(variables.values()),
  };
}

export const directStartExample: EditorExampleProject = {
  id: 'direct-start-model',
  title: 'Modelo — partida direta',
  description: 'Start I0.0 e Stop I0.1 acionam o motor Q0.0 em uma linha simples.',
  difficulty: 'Básico',
  project: {
    selectedRungId: 'direct-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'direct-rung-1',
        label: 'Linha 1 — Partida direta',
        seriesBlocks: [
          contact('direct-start', 'Start', 'I0.0'),
          contact('direct-stop', 'Stop', 'I0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('direct-motor', 'Motor', 'Q0.0'),
      },
    ],
  },
};

export const sealStartExample: EditorExampleProject = {
  id: 'seal-start-model',
  title: 'Modelo — partida com selo',
  description: 'Start liga, contato auxiliar Q0.0 mantém o motor e Stop quebra o selo.',
  difficulty: 'Básico',
  project: {
    selectedRungId: 'seal-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'seal-rung-1',
        label: 'Linha 1 — Partida com selo',
        seriesBlocks: [
          contact('seal-start', 'Start', 'I0.0'),
          contact('seal-stop', 'Stop', 'I0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'seal-branch',
            seriesIndex: 0,
            blocks: [contact('seal-q0-contact', 'Selo Q0.0', 'Q0.0')],
          },
        ],
        coilBlock: coil('seal-motor', 'Motor', 'Q0.0'),
      },
    ],
  },
};

export const reversingMotorExample: EditorExampleProject = {
  id: 'reversing-motor-model',
  title: 'Modelo — reversão de motor',
  description: 'Avanço e reverso com selo e intertravamento elétrico por contatos NF opostos.',
  difficulty: 'Intermediário',
  project: {
    selectedRungId: 'rev-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'rev-rung-1',
        label: 'Linha 1 — K1 avanço',
        seriesBlocks: [
          contact('rev-forward-start', 'Avanço', 'I0.0'),
          contact('rev-stop-forward', 'Stop', 'I0.2', 'NC'),
          contact('rev-k2-interlock', 'K2 reverso desligado', 'Q0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'rev-forward-seal',
            seriesIndex: 0,
            blocks: [contact('rev-k1-seal', 'Selo K1', 'Q0.0')],
          },
        ],
        coilBlock: coil('rev-k1-coil', 'K1 Avanço', 'Q0.0'),
      },
      {
        id: 'rev-rung-2',
        label: 'Linha 2 — K2 reverso',
        seriesBlocks: [
          contact('rev-reverse-start', 'Reverso', 'I0.1'),
          contact('rev-stop-reverse', 'Stop', 'I0.2', 'NC'),
          contact('rev-k1-interlock', 'K1 avanço desligado', 'Q0.0', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'rev-reverse-seal',
            seriesIndex: 0,
            blocks: [contact('rev-k2-seal', 'Selo K2', 'Q0.1')],
          },
        ],
        coilBlock: coil('rev-k2-coil', 'K2 Reverso', 'Q0.1'),
      },
    ],
  },
};

export const starDeltaExample: EditorExampleProject = {
  id: 'star-delta-model',
  title: 'Modelo — estrela-triângulo',
  description: 'Aplicação real em Ladder: K1 principal, T1 transição, K2 estrela e K3 triângulo intertravados.',
  difficulty: 'Avançado',
  project: {
    selectedRungId: 'sd-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'sd-rung-1',
        label: 'Linha 1 — K1 principal',
        seriesBlocks: [
          contact('sd-start', 'Start', 'I0.0'),
          contact('sd-stop', 'Stop', 'I0.1', 'NC'),
          contact('sd-overload', 'Sobrecarga', 'I0.2', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'sd-k1-seal',
            seriesIndex: 0,
            blocks: [contact('sd-k1-seal-contact', 'Selo K1', 'Q0.0')],
          },
        ],
        coilBlock: coil('sd-k1-coil', 'K1 Principal', 'Q0.0'),
      },
      {
        id: 'sd-rung-2',
        label: 'Linha 2 — T1 transição',
        seriesBlocks: [contact('sd-k1-for-timer', 'K1 ligado', 'Q0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('sd-t1-ton', 'T1 Transição', 'T1', 5000),
      },
      {
        id: 'sd-rung-3',
        label: 'Linha 3 — K2 estrela',
        seriesBlocks: [
          contact('sd-k1-for-star', 'K1 ligado', 'Q0.0'),
          contact('sd-t1-not-done', 'T1 não finalizado', 'T1', 'NC'),
          contact('sd-k3-off', 'K3 triângulo desligado', 'Q0.2', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('sd-k2-coil', 'K2 Estrela', 'Q0.1'),
      },
      {
        id: 'sd-rung-4',
        label: 'Linha 4 — K3 triângulo',
        seriesBlocks: [
          contact('sd-k1-for-delta', 'K1 ligado', 'Q0.0'),
          contact('sd-t1-done', 'T1 finalizado', 'T1'),
          contact('sd-k2-off', 'K2 estrela desligado', 'Q0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('sd-k3-coil', 'K3 Triângulo', 'Q0.2'),
      },
    ],
  },
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
    selectedSeriesIndex: 0,
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
          isPro: false,
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
    selectedSeriesIndex: 0,
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
          isPro: false,
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
    selectedSeriesIndex: 0,
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
          isPro: false,
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

export const pumpLevelControlExample: EditorExampleProject = {
  id: 'pump-level-control-model',
  title: 'Modelo — controle de bomba por nível',
  description: 'Liga a bomba com nível baixo, memoriza pedido e desliga ao atingir nível alto.',
  difficulty: 'Intermediário',
  project: {
    selectedRungId: 'pump-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'pump-rung-1',
        label: 'Linha 1 — SET pedido de bomba',
        seriesBlocks: [
          contact('pump-low-level', 'Nível baixo', 'I0.0'),
          contact('pump-high-level-nc', 'Nível alto ainda não atingido', 'I0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: setCoil('pump-set-request', 'SET Pedido', 'M0.0'),
      },
      {
        id: 'pump-rung-2',
        label: 'Linha 2 — RESET pedido de bomba',
        seriesBlocks: [contact('pump-high-level', 'Nível alto', 'I0.1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: resetCoil('pump-reset-request', 'RESET Pedido', 'M0.0'),
      },
      {
        id: 'pump-rung-3',
        label: 'Linha 3 — Bomba com proteção',
        seriesBlocks: [
          contact('pump-request-active', 'Pedido ativo', 'M0.0'),
          contact('pump-overload-ok', 'Sobrecarga OK', 'I0.2', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('pump-output', 'Bomba', 'Q0.0'),
      },
    ],
  },
};

export const conveyorBatchCounterExample: EditorExampleProject = {
  id: 'conveyor-batch-counter-model',
  title: 'Modelo — esteira com lote por contador',
  description: 'Conta peças no sensor, para a esteira ao fechar o lote e permite reset de produção.',
  difficulty: 'Avançado',
  project: {
    selectedRungId: 'conv-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'conv-rung-1',
        label: 'Linha 1 — CTU peças C0',
        seriesBlocks: [contact('conv-part-sensor', 'Sensor de peça', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: counter('conv-c0-counter', 'CTU Peças', 'C0', 5, 'I0.1'),
      },
      {
        id: 'conv-rung-2',
        label: 'Linha 2 — Lote completo',
        seriesBlocks: [contact('conv-c0-done', 'C0 atingiu preset', 'C0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('conv-batch-done', 'Lote completo', 'Q0.0'),
      },
      {
        id: 'conv-rung-3',
        label: 'Linha 3 — Esteira liberada',
        seriesBlocks: [
          contact('conv-start', 'Start esteira', 'I0.2'),
          contact('conv-c0-not-done', 'Lote não completo', 'C0', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('conv-motor', 'Motor da esteira', 'Q0.1'),
      },
    ],
  },
};

export const reversingStarDeltaExample: EditorExampleProject = {
  id: 'reversing-star-delta-model',
  title: 'Modelo — estrela-triângulo com reversão',
  description: 'Troca avanço/reverso por comando, com memórias de direção, intertravamento e TON separado para cada sentido.',
  difficulty: 'Avançado',
  project: {
    selectedRungId: 'rsd-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'rsd-rung-1',
        label: 'Linha 1 — SET pedido avanço',
        seriesBlocks: [
          contact('rsd-forward-cmd', 'Comando avanço', 'I0.0'),
          contact('rsd-stop-ok-fwd-set', 'Stop OK', 'I0.2', 'NC'),
          contact('rsd-overload-ok-fwd-set', 'Sobrecarga OK', 'I0.3', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: setCoil('rsd-set-forward', 'SET Avanço', 'M0.0'),
      },
      {
        id: 'rsd-rung-2',
        label: 'Linha 2 — RESET pedido reverso',
        seriesBlocks: [contact('rsd-forward-resets-rev', 'Comando avanço', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: resetCoil('rsd-reset-reverse', 'RESET Reverso', 'M0.1'),
      },
      {
        id: 'rsd-rung-3',
        label: 'Linha 3 — SET pedido reverso',
        seriesBlocks: [
          contact('rsd-reverse-cmd', 'Comando reverso', 'I0.1'),
          contact('rsd-stop-ok-rev-set', 'Stop OK', 'I0.2', 'NC'),
          contact('rsd-overload-ok-rev-set', 'Sobrecarga OK', 'I0.3', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: setCoil('rsd-set-reverse', 'SET Reverso', 'M0.1'),
      },
      {
        id: 'rsd-rung-4',
        label: 'Linha 4 — RESET pedido avanço',
        seriesBlocks: [contact('rsd-reverse-resets-fwd', 'Comando reverso', 'I0.1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: resetCoil('rsd-reset-forward', 'RESET Avanço', 'M0.0'),
      },
      {
        id: 'rsd-rung-5',
        label: 'Linha 5 — RESET geral avanço',
        seriesBlocks: [contact('rsd-stop-fwd-reset', 'Stop ou falha', 'I0.2')],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'rsd-overload-reset-fwd-branch',
            seriesIndex: 0,
            blocks: [contact('rsd-overload-fwd-reset', 'Sobrecarga', 'I0.3')],
          },
        ],
        coilBlock: resetCoil('rsd-reset-forward-general', 'RESET Avanço', 'M0.0'),
      },
      {
        id: 'rsd-rung-6',
        label: 'Linha 6 — RESET geral reverso',
        seriesBlocks: [contact('rsd-stop-rev-reset', 'Stop ou falha', 'I0.2')],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'rsd-overload-reset-rev-branch',
            seriesIndex: 0,
            blocks: [contact('rsd-overload-rev-reset', 'Sobrecarga', 'I0.3')],
          },
        ],
        coilBlock: resetCoil('rsd-reset-reverse-general', 'RESET Reverso', 'M0.1'),
      },
      {
        id: 'rsd-rung-7',
        label: 'Linha 7 — K1 avanço',
        seriesBlocks: [
          contact('rsd-forward-memory', 'Pedido avanço', 'M0.0'),
          contact('rsd-reverse-memory-off', 'Pedido reverso desligado', 'M0.1', 'NC'),
          contact('rsd-k2-off', 'K2 reverso desligado', 'Q0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('rsd-k1-forward', 'K1 Avanço', 'Q0.0'),
      },
      {
        id: 'rsd-rung-8',
        label: 'Linha 8 — K2 reverso',
        seriesBlocks: [
          contact('rsd-reverse-memory', 'Pedido reverso', 'M0.1'),
          contact('rsd-forward-memory-off', 'Pedido avanço desligado', 'M0.0', 'NC'),
          contact('rsd-k1-off', 'K1 avanço desligado', 'Q0.0', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('rsd-k2-reverse', 'K2 Reverso', 'Q0.1'),
      },
      {
        id: 'rsd-rung-9',
        label: 'Linha 9 — TON T1 avanço',
        seriesBlocks: [contact('rsd-k1-for-timer', 'K1 avanço ligado', 'Q0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('rsd-t1-forward', 'T1 Avanço', 'T1', 4000),
      },
      {
        id: 'rsd-rung-10',
        label: 'Linha 10 — TON T2 reverso',
        seriesBlocks: [contact('rsd-k2-for-timer', 'K2 reverso ligado', 'Q0.1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('rsd-t2-reverse', 'T2 Reverso', 'T2', 4000),
      },
      {
        id: 'rsd-rung-11',
        label: 'Linha 11 — K3 estrela',
        seriesBlocks: [
          contact('rsd-k1-star', 'K1 avanço', 'Q0.0'),
          contact('rsd-t1-not-done', 'T1 não finalizado', 'T1', 'NC'),
          contact('rsd-k4-off-for-star', 'K4 triângulo desligado', 'Q0.3', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'rsd-reverse-star-branch',
            seriesIndex: 0,
            blocks: [
              contact('rsd-k2-star', 'K2 reverso', 'Q0.1'),
              contact('rsd-t2-not-done', 'T2 não finalizado', 'T2', 'NC'),
            ],
          },
        ],
        coilBlock: coil('rsd-k3-star', 'K3 Estrela', 'Q0.2'),
      },
      {
        id: 'rsd-rung-12',
        label: 'Linha 12 — K4 triângulo',
        seriesBlocks: [
          contact('rsd-k1-delta', 'K1 avanço', 'Q0.0'),
          contact('rsd-t1-done', 'T1 finalizado', 'T1'),
          contact('rsd-k3-off-for-delta', 'K3 estrela desligado', 'Q0.2', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'rsd-reverse-delta-branch',
            seriesIndex: 0,
            blocks: [
              contact('rsd-k2-delta', 'K2 reverso', 'Q0.1'),
              contact('rsd-t2-done', 'T2 finalizado', 'T2'),
            ],
          },
        ],
        coilBlock: coil('rsd-k4-delta', 'K4 Triângulo', 'Q0.3'),
      },
    ],
  },
};

export const reversingStarDeltaTofExample: EditorExampleProject = (() => {
  const project = JSON.parse(JSON.stringify(reversingStarDeltaExample.project)) as EditorProjectState;

  project.selectedRungId = 'rsdt-rung-1';
  project.rungs = project.rungs.map((rung) => {
    if (rung.id === 'rsd-rung-7') {
      return {
        ...rung,
        id: 'rsdt-rung-7',
        label: 'Linha 7 — K1 avanço com pausa TOF',
        seriesBlocks: [
          ...rung.seriesBlocks,
          contact('rsdt-t4-reverse-deadtime-ok', 'Pausa reverso concluída', 'T4', 'NC'),
        ],
      };
    }

    if (rung.id === 'rsd-rung-8') {
      return {
        ...rung,
        id: 'rsdt-rung-8',
        label: 'Linha 8 — K2 reverso com pausa TOF',
        seriesBlocks: [
          ...rung.seriesBlocks,
          contact('rsdt-t3-forward-deadtime-ok', 'Pausa avanço concluída', 'T3', 'NC'),
        ],
      };
    }

    return {
      ...rung,
      id: rung.id.replace('rsd-', 'rsdt-'),
      label: rung.label.replace('Linha ', 'Linha '),
    };
  });

  project.rungs.splice(
    8,
    0,
    {
      id: 'rsdt-rung-9',
      label: 'Linha 9 — TOF T3 pausa avanço',
      seriesBlocks: [contact('rsdt-k1-deadtime-source', 'K1 avanço ligado', 'Q0.0')],
      parallelBlocks: [],
      parallelBranches: [],
      coilBlock: timer('rsdt-t3-forward-tof', 'TOF Pausa Avanço', 'T3', 2000, 'TOF'),
    },
    {
      id: 'rsdt-rung-10',
      label: 'Linha 10 — TOF T4 pausa reverso',
      seriesBlocks: [contact('rsdt-k2-deadtime-source', 'K2 reverso ligado', 'Q0.1')],
      parallelBlocks: [],
      parallelBranches: [],
      coilBlock: timer('rsdt-t4-reverse-tof', 'TOF Pausa Reverso', 'T4', 2000, 'TOF'),
    },
  );

  return {
    id: 'reversing-star-delta-tof-model',
    title: 'Modelo — reversão estrela-triângulo com TOF',
    description: 'Variação avançada com tempo morto por TOF antes de liberar o sentido oposto.',
    difficulty: 'Avançado',
    project,
  };
})();

export const sequentialMotorsExample: EditorExampleProject = {
  id: 'sequential-motors-model',
  title: 'Modelo — partida sequencial de motores',
  description: 'M1 parte primeiro, T0 libera M2 e T1 libera M3 em cascata.',
  difficulty: 'Avançado',
  project: {
    selectedRungId: 'seq-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'seq-rung-1',
        label: 'Linha 1 — SET ciclo',
        seriesBlocks: [
          contact('seq-start', 'Start ciclo', 'I0.0'),
          contact('seq-stop-ok', 'Stop OK', 'I0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: setCoil('seq-set-cycle', 'SET Ciclo', 'M0.0'),
      },
      {
        id: 'seq-rung-2',
        label: 'Linha 2 — RESET ciclo',
        seriesBlocks: [contact('seq-stop', 'Stop', 'I0.1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: resetCoil('seq-reset-cycle', 'RESET Ciclo', 'M0.0'),
      },
      {
        id: 'seq-rung-3',
        label: 'Linha 3 — Motor M1',
        seriesBlocks: [contact('seq-cycle-m1', 'Ciclo ativo', 'M0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('seq-m1', 'Motor M1', 'Q0.0'),
      },
      {
        id: 'seq-rung-4',
        label: 'Linha 4 — TON T0 libera M2',
        seriesBlocks: [contact('seq-m1-running', 'M1 ligado', 'Q0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('seq-t0', 'Atraso M2', 'T0', 3000),
      },
      {
        id: 'seq-rung-5',
        label: 'Linha 5 — Motor M2',
        seriesBlocks: [
          contact('seq-cycle-m2', 'Ciclo ativo', 'M0.0'),
          contact('seq-t0-done', 'T0 concluído', 'T0'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('seq-m2', 'Motor M2', 'Q0.1'),
      },
      {
        id: 'seq-rung-6',
        label: 'Linha 6 — TON T1 libera M3',
        seriesBlocks: [contact('seq-m2-running', 'M2 ligado', 'Q0.1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('seq-t1', 'Atraso M3', 'T1', 3000),
      },
      {
        id: 'seq-rung-7',
        label: 'Linha 7 — Motor M3',
        seriesBlocks: [
          contact('seq-cycle-m3', 'Ciclo ativo', 'M0.0'),
          contact('seq-t1-done', 'T1 concluído', 'T1'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('seq-m3', 'Motor M3', 'Q0.2'),
      },
    ],
  },
};

export const trafficLightSequenceExample: EditorExampleProject = {
  id: 'traffic-light-sequence-model',
  title: 'Modelo — semáforo didático por TON',
  description: 'Verde, amarelo e vermelho mudam por estágios temporizados em rungs separados.',
  difficulty: 'Intermediário',
  project: {
    selectedRungId: 'tl-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'tl-rung-1',
        label: 'Linha 1 — TON T0 fim verde',
        seriesBlocks: [contact('tl-enable-t0', 'Ciclo habilitado', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('tl-t0', 'Tempo verde', 'T0', 3000),
      },
      {
        id: 'tl-rung-2',
        label: 'Linha 2 — TON T1 fim amarelo',
        seriesBlocks: [contact('tl-t0-done', 'T0 concluído', 'T0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('tl-t1', 'Tempo amarelo', 'T1', 2000),
      },
      {
        id: 'tl-rung-3',
        label: 'Linha 3 — Verde',
        seriesBlocks: [
          contact('tl-enable-green', 'Ciclo habilitado', 'I0.0'),
          contact('tl-t0-not-done', 'T0 não concluído', 'T0', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('tl-green', 'Verde', 'Q0.0'),
      },
      {
        id: 'tl-rung-4',
        label: 'Linha 4 — Amarelo',
        seriesBlocks: [
          contact('tl-t0-yellow', 'T0 concluído', 'T0'),
          contact('tl-t1-not-done', 'T1 não concluído', 'T1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('tl-yellow', 'Amarelo', 'Q0.1'),
      },
      {
        id: 'tl-rung-5',
        label: 'Linha 5 — Vermelho',
        seriesBlocks: [contact('tl-t1-red', 'T1 concluído', 'T1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('tl-red', 'Vermelho', 'Q0.2'),
      },
    ],
  },
};

export const compressorPressureExample: EditorExampleProject = {
  id: 'compressor-pressure-model',
  title: 'Modelo — compressor por pressão',
  description: 'Pressostato baixo liga pedido, pressostato alto reseta e proteção derruba o compressor.',
  difficulty: 'Intermediário',
  project: {
    selectedRungId: 'cmp-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'cmp-rung-1',
        label: 'Linha 1 — SET pedido de compressor',
        seriesBlocks: [
          contact('cmp-low-pressure', 'Pressão baixa', 'I0.0'),
          contact('cmp-high-pressure-nc', 'Pressão alta ausente', 'I0.1', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: setCoil('cmp-set-request', 'SET Pedido', 'M0.0'),
      },
      {
        id: 'cmp-rung-2',
        label: 'Linha 2 — RESET pedido',
        seriesBlocks: [contact('cmp-high-pressure', 'Pressão alta', 'I0.1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: resetCoil('cmp-reset-request', 'RESET Pedido', 'M0.0'),
      },
      {
        id: 'cmp-rung-3',
        label: 'Linha 3 — TON T0 partida estabilizada',
        seriesBlocks: [contact('cmp-request-timer', 'Pedido ativo', 'M0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: timer('cmp-t0', 'Estabilização', 'T0', 2000),
      },
      {
        id: 'cmp-rung-4',
        label: 'Linha 4 — Compressor',
        seriesBlocks: [
          contact('cmp-request-output', 'Pedido ativo', 'M0.0'),
          contact('cmp-overload-ok', 'Proteção OK', 'I0.2', 'NC'),
        ],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('cmp-compressor', 'Compressor', 'Q0.0'),
      },
      {
        id: 'cmp-rung-5',
        label: 'Linha 5 — Sinal pronto',
        seriesBlocks: [contact('cmp-t0-ready', 'T0 concluído', 'T0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('cmp-ready', 'Pronto', 'Q0.1'),
      },
    ],
  },
};

export const educationalEditorExamples: EditorExampleProject[] = [
  directStartExample,
  sealStartExample,
  reversingMotorExample,
  starDeltaExample,
  reversingStarDeltaExample,
  reversingStarDeltaTofExample,
  sequentialMotorsExample,
  trafficLightSequenceExample,
  compressorPressureExample,
  pumpLevelControlExample,
  conveyorBatchCounterExample,
  tonDelayExample,
  tofDelayExample,
  ctuCounterExample,
].map((example) => ({
  ...example,
  project: withDeclaredVariables(example.project),
}));
