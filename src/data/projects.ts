import { LadderProject } from '../engine/projectTypes';

export const projects: LadderProject[] = [
  {
    id: 'direct-start',
    name: 'Partida Direta',
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
    ]
  }
];
