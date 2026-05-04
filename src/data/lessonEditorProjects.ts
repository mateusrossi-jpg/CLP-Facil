import { createInitialEditorProject, EditorBlock, EditorContactMode, EditorProjectState, EditorVariable } from '../engine/editorTypes';
import {
  compressorPressureExample,
  conveyorBatchCounterExample,
  directStartExample,
  pumpLevelControlExample,
  reversingStarDeltaExample,
  reversingStarDeltaTofExample,
  reversingMotorExample,
  sequentialMotorsExample,
  sealStartExample,
  starDeltaExample,
  trafficLightSequenceExample,
  tofDelayExample,
  tonDelayExample,
} from './editorExampleProjects';

let blockCounter = 0;

function nextBlockId(prefix: string) {
  blockCounter += 1;
  return `${prefix}-${blockCounter}`;
}

function contact(name: string, variable: string, contactMode: EditorContactMode = 'NO'): EditorBlock {
  return {
    id: nextBlockId('contact'),
    componentId: contactMode === 'NC' ? 'contact-nc' : 'contact-no',
    name,
    description: contactMode === 'NC' ? 'Contato normalmente fechado.' : 'Contato normalmente aberto.',
    isPro: false,
    zone: 'series',
    variable,
    role: 'contact',
    contactMode,
    category: 'logic',
  };
}

function coil(name: string, variable: string): EditorBlock {
  return {
    id: nextBlockId('coil'),
    componentId: 'coil-q',
    name,
    description: 'Bobina de saída.',
    isPro: false,
    zone: 'coil',
    variable,
    role: 'coil',
    coilMode: 'NORMAL',
    category: 'output',
  };
}

function setCoil(name: string, variable: string): EditorBlock {
  return {
    ...coil(name, variable),
    componentId: 'coil-set',
    coilMode: 'SET',
    description: 'Bobina SET.',
  };
}

function resetCoil(name: string, variable: string): EditorBlock {
  return {
    ...coil(name, variable),
    componentId: 'coil-reset',
    coilMode: 'RESET',
    description: 'Bobina RESET.',
  };
}

function cloneProject(project: EditorProjectState): EditorProjectState {
  return withDeclaredVariables(JSON.parse(JSON.stringify(project)) as EditorProjectState);
}

function baseVariables() {
  return [
    { id: 'I0.0', address: 'I0.0', name: 'Start', scope: 'input' as const, dataType: 'boolean' as const },
    { id: 'I0.1', address: 'I0.1', name: 'Stop', scope: 'input' as const, dataType: 'boolean' as const },
    { id: 'I0.2', address: 'I0.2', name: 'Permissão', scope: 'input' as const, dataType: 'boolean' as const },
    { id: 'I0.3', address: 'I0.3', name: 'Sobrecarga', scope: 'input' as const, dataType: 'boolean' as const },
    { id: 'M0.0', address: 'M0.0', name: 'Memória', scope: 'memory' as const, dataType: 'boolean' as const },
    { id: 'N0', address: 'N0', name: 'Valor A', scope: 'memory' as const, dataType: 'number' as const },
    { id: 'N1', address: 'N1', name: 'Valor B', scope: 'memory' as const, dataType: 'number' as const },
    { id: 'N2', address: 'N2', name: 'Resultado', scope: 'memory' as const, dataType: 'number' as const },
    { id: 'T0', address: 'T0', name: 'Timer 0', scope: 'memory' as const, dataType: 'timer' as const },
    { id: 'C0', address: 'C0', name: 'Counter 0', scope: 'memory' as const, dataType: 'counter' as const },
    { id: 'Q0.0', address: 'Q0.0', name: 'Motor', scope: 'output' as const, dataType: 'boolean' as const },
  ];
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

function singleRungProject(label: string, seriesBlocks: EditorBlock[], parallelBlocks: EditorBlock[] = []): EditorProjectState {
  return withDeclaredVariables({
    selectedRungId: 'rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [],
    rungs: [
      {
        id: 'rung-1',
        label,
        seriesBlocks,
        parallelBlocks: parallelBlocks.map((block) => ({ ...block, zone: 'parallel' })),
        parallelBranches: parallelBlocks.length > 0 ? [
          {
            id: 'branch-1',
            seriesIndex: 0,
            blocks: parallelBlocks.map((block) => ({ ...block, zone: 'parallel' })),
          },
        ] : [],
        coilBlock: coil('Motor', 'Q0.0'),
      },
    ],
  });
}

function sealProject(options: { emergency?: boolean; overload?: boolean } = {}): EditorProjectState {
  const seriesBlocks = [
    contact('Start', 'I0.0'),
    contact('Stop', 'I0.1', 'NC'),
  ];
  if (options.emergency) seriesBlocks.push(contact('Emergência OK', 'I0.2', 'NC'));
  if (options.overload) seriesBlocks.push(contact('Sobrecarga OK', 'I0.3', 'NC'));

  return withDeclaredVariables({
    selectedRungId: 'seal-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [],
    rungs: [
      {
        id: 'seal-rung-1',
        label: 'Linha 1 - Partida com selo',
        seriesBlocks,
        parallelBlocks: [],
        parallelBranches: [
          {
            id: 'seal-branch',
            seriesIndex: 0,
            blocks: [contact('Selo Q0.0', 'Q0.0')],
          },
        ],
        coilBlock: coil('Motor', 'Q0.0'),
      },
    ],
  });
}

function edgeLessonProject(): EditorProjectState {
  return withDeclaredVariables({
    selectedRungId: 'edge-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [],
    rungs: [
      {
        id: 'edge-rung-1',
        label: 'Linha 1 - Pulso ONS',
        seriesBlocks: [contact('Borda de subida', 'I0.0', 'RISING')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('Pulso Q0.0', 'Q0.0'),
      },
    ],
  });
}

function setResetLessonProject(): EditorProjectState {
  return withDeclaredVariables({
    selectedRungId: 'sr-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [],
    rungs: [
      {
        id: 'sr-rung-1',
        label: 'Linha 1 - SET M0.0',
        seriesBlocks: [contact('Liga memória', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: setCoil('SET Memória', 'M0.0'),
      },
      {
        id: 'sr-rung-2',
        label: 'Linha 2 - RESET M0.0',
        seriesBlocks: [contact('Reseta memória', 'I0.1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: resetCoil('RESET Memória', 'M0.0'),
      },
      {
        id: 'sr-rung-3',
        label: 'Linha 3 - Saída por memória',
        seriesBlocks: [contact('Memória ligada', 'M0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('Saída', 'Q0.0'),
      },
    ],
  });
}

function compareLessonProject(): EditorProjectState {
  const compare = {
    ...contact('N0 igual a 10', 'N0'),
    componentId: 'cmp-equ',
    name: 'EQU N0 10',
    compareMode: 'EQU' as const,
    sourceA: 'N0',
    sourceB: '10',
    category: 'compare' as const,
  };

  return singleRungProject('Linha 1 - Comparador EQU', [compare]);
}

function mathLessonProject(): EditorProjectState {
  return withDeclaredVariables({
    selectedRungId: 'math-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [],
    rungs: [
      {
        id: 'math-rung-1',
        label: 'Linha 1 - ADD N0 + N1',
        seriesBlocks: [contact('Executa soma', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: 'math-add-n2',
          componentId: 'math-add',
          name: 'ADD',
          description: 'Soma N0 + N1 em N2.',
          isPro: false,
          zone: 'coil',
          variable: 'N2',
          role: 'coil',
          coilMode: 'NORMAL',
          mathMode: 'ADD',
          sourceA: 'N0',
          sourceB: 'N1',
          destination: 'N2',
          category: 'math',
        },
      },
      {
        id: 'math-rung-2',
        label: 'Linha 2 - N2 maior ou igual a 10',
        seriesBlocks: [{
          ...contact('N2 >= 10', 'N2'),
          componentId: 'cmp-geq',
          name: 'GEQ N2 10',
          compareMode: 'GEQ',
          sourceA: 'N2',
          sourceB: '10',
          category: 'compare',
        }],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('Limite atingido', 'Q0.0'),
      },
    ],
  });
}

function tpLessonProject(): EditorProjectState {
  const project = cloneProject(tonDelayExample.project);
  const timerRung = project.rungs[0];
  if (timerRung.coilBlock) {
    timerRung.coilBlock.id = 'tp-t0-block';
    timerRung.coilBlock.componentId = 'timer-tp';
    timerRung.coilBlock.name = 'TP';
    timerRung.coilBlock.description = 'Temporizador de pulso.';
    timerRung.coilBlock.timerMode = 'TP';
    timerRung.coilBlock.presetMs = 3000;
  }
  timerRung.label = 'Linha 1 - TP T0';
  return withDeclaredVariables(project);
}

function counterLessonProject(mode: 'CTU' | 'CTD'): EditorProjectState {
  const counterId = mode === 'CTU' ? 'ctu-c0-block' : 'ctd-c0-block';
  return withDeclaredVariables({
    selectedRungId: `${mode.toLowerCase()}-rung-1`,
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [],
    rungs: [
      {
        id: `${mode.toLowerCase()}-rung-1`,
        label: `Linha 1 - ${mode} C0`,
        seriesBlocks: [contact('Pulso de contagem', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: counterId,
          componentId: mode === 'CTU' ? 'counter-ctu' : 'counter-ctd',
          name: mode,
          description: mode === 'CTU' ? 'Contador crescente.' : 'Contador decrescente.',
          isPro: false,
          zone: 'coil',
          variable: 'C0',
          role: 'counter',
          counterMode: mode,
          resetSource: 'M0.0',
          preset: 3,
          category: 'counter',
        },
      },
      {
        id: `${mode.toLowerCase()}-rung-2`,
        label: 'Linha 2 - Saída por C0.Q',
        seriesBlocks: [contact('C0 atingiu condição', 'C0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('Motor', 'Q0.0'),
      },
    ],
  });
}

function ctudLessonProject(): EditorProjectState {
  return withDeclaredVariables({
    selectedRungId: 'ctud-rung-1',
    selectedBlockId: null,
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    projectVariables: [
      { id: 'I0.0', address: 'I0.0', name: 'Conta entrada', scope: 'input', dataType: 'boolean' },
      { id: 'I0.1', address: 'I0.1', name: 'Conta saída', scope: 'input', dataType: 'boolean' },
      { id: 'M0.0', address: 'M0.0', name: 'Reset contador', scope: 'memory', dataType: 'boolean' },
      { id: 'C1', address: 'C1', name: 'Contador CTUD', scope: 'memory', dataType: 'counter' },
      { id: 'Q0.0', address: 'Q0.0', name: 'Limite atingido', scope: 'output', dataType: 'boolean' },
    ],
    rungs: [
      {
        id: 'ctud-rung-1',
        label: 'Linha 1 - CTUD C1',
        seriesBlocks: [contact('Pulso CU', 'I0.0')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: {
          id: 'ctud-c1',
          componentId: 'counter-ctud',
          name: 'CTUD',
          description: 'Contador crescente/decrescente.',
          isPro: false,
          zone: 'coil',
          variable: 'C1',
          role: 'counter',
          counterMode: 'CTUD',
          downSource: 'I0.1',
          resetSource: 'M0.0',
          preset: 2,
          category: 'counter',
        },
      },
      {
        id: 'ctud-rung-2',
        label: 'Linha 2 - Saída por C1',
        seriesBlocks: [contact('C1 atingiu preset', 'C1')],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: coil('Limite atingido', 'Q0.0'),
      },
    ],
  });
}

export function createLessonEditorProject(lessonId: string): EditorProjectState {
  blockCounter = 0;

  if (lessonId === 'direct-start-simple' || lessonId === 'normally-open-contact' || lessonId === 'output-coil') {
    return cloneProject(directStartExample.project);
  }

  if (lessonId === 'normally-closed-contact') {
    return singleRungProject('Linha 1 - Contato NF', [contact('Stop Button', 'I0.1', 'NC')]);
  }

  if (lessonId === 'and-logic') {
    return singleRungProject('Linha 1 - AND em série', [
      contact('Start Button', 'I0.0'),
      contact('Permissão', 'I0.2'),
    ]);
  }

  if (lessonId === 'or-logic') {
    return singleRungProject('Linha 1 - OR em paralelo', [contact('Start Button', 'I0.0')], [contact('Memory 0', 'M0.0')]);
  }

  if (lessonId === 'logical-interlock' || lessonId === 'motor-reversing') {
    return cloneProject(reversingMotorExample.project);
  }

  if (lessonId === 'seal-circuit' || lessonId === 'direct-start-stop-button') {
    return sealProject();
  }

  if (lessonId === 'direct-start-with-seal') {
    return sealProject({ emergency: true, overload: true });
  }

  if (lessonId === 'direct-start-emergency') {
    return sealProject({ emergency: true });
  }

  if (lessonId === 'direct-start-overload') {
    return sealProject({ overload: true });
  }

  if (lessonId === 'ton-delay') {
    return cloneProject(tonDelayExample.project);
  }

  if (lessonId === 'tof-delay') {
    return cloneProject(tofDelayExample.project);
  }

  if (lessonId === 'ctu-counter') {
    return counterLessonProject('CTU');
  }

  if (lessonId === 'ctud-counter') {
    return ctudLessonProject();
  }

  if (lessonId === 'edge-contacts') {
    return edgeLessonProject();
  }

  if (lessonId === 'set-reset-coils') {
    return setResetLessonProject();
  }

  if (lessonId === 'compare-equ') {
    return compareLessonProject();
  }

  if (lessonId === 'math-add-mov') {
    return mathLessonProject();
  }

  if (lessonId === 'tp-pulse') {
    return tpLessonProject();
  }

  if (lessonId === 'ctd-counter') {
    return counterLessonProject('CTD');
  }

  if (lessonId === 'star-delta') {
    return cloneProject(starDeltaExample.project);
  }

  if (lessonId === 'reversing-star-delta') {
    return cloneProject(reversingStarDeltaExample.project);
  }

  if (lessonId === 'reversing-star-delta-tof') {
    return cloneProject(reversingStarDeltaTofExample.project);
  }

  if (lessonId === 'pump-level-control') {
    return cloneProject(pumpLevelControlExample.project);
  }

  if (lessonId === 'conveyor-batch-counter') {
    return cloneProject(conveyorBatchCounterExample.project);
  }

  if (lessonId === 'sequential-motors') {
    return cloneProject(sequentialMotorsExample.project);
  }

  if (lessonId === 'traffic-light-sequence') {
    return cloneProject(trafficLightSequenceExample.project);
  }

  if (lessonId === 'compressor-pressure') {
    return cloneProject(compressorPressureExample.project);
  }

  return createInitialEditorProject();
}
