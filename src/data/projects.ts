import { LadderProject } from '../engine/projectTypes';

export const projects: LadderProject[] = [
  {
    id: 'direct-start',
    name: 'Partida Direta',
    description: 'Partida direta didática com Stop, Start, selo e saída de contator.',
    variables: [
      { id: 'I0', label: 'STOP', type: 'input', description: 'Botoeira de parada NF', defaultValue: true },
      { id: 'I1', label: 'START', type: 'input', description: 'Botoeira de partida NA', momentary: true },
      { id: 'Q0', label: 'K1', type: 'output', description: 'Contator do motor' },
    ],
    rungs: [
      {
        id: 'r1',
        label: 'Partida direta com selo',
        seriesContacts: [
          {
            id: 'c1',
            label: 'STOP',
            variableId: 'I0',
            type: 'NC'
          },
          {
            id: 'c2',
            label: 'START',
            variableId: 'I1',
            type: 'NO'
          }
        ],
        parallelBranches: [
          {
            id: 'b1',
            contacts: [
              {
                id: 'c3',
                label: 'K1 (selo)',
                variableId: 'Q0',
                type: 'NO'
              }
            ]
          }
        ],
        coilVariableId: 'Q0'
      }
    ],
    actuatorLinks: {
      Q0: 'motor-main'
    }
  }
];
