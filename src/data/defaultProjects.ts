import { LadderProject } from '../engine/projectTypes';

export const directStartWithSealProject: LadderProject = {
  id: 'direct-start-seal',
  name: 'Partida direta com selo',
  description: 'Comando clássico de motor com botão Liga, Desliga, emergência, sobrecarga e contato auxiliar de selo.',
  variables: [
    { id: 'I0', label: 'Liga', type: 'input', momentary: true, defaultValue: false, description: 'Botão NA momentâneo' },
    { id: 'I1', label: 'Desliga', type: 'input', momentary: true, defaultValue: true, description: 'Botão NF' },
    { id: 'I2', label: 'Emergência', type: 'input', momentary: false, defaultValue: true, description: 'Contato NF de emergência' },
    { id: 'I3', label: 'Sobrecarga', type: 'input', momentary: false, defaultValue: true, description: 'Contato NF de proteção' },
    { id: 'Q0', label: 'K1', type: 'output', defaultValue: false, description: 'Contator principal' },
    { id: 'MTR1', label: 'Motor', type: 'actuator', defaultValue: false, description: 'Motor acionado pelo contator K1' },
  ],
  rungs: [
    {
      id: 'rung-1',
      label: 'Comando do contator K1',
      seriesContacts: [
        { id: 'c-stop', variableId: 'I1', type: 'NO', label: 'Desliga NF' },
        { id: 'c-emergency', variableId: 'I2', type: 'NO', label: 'Emergência NF' },
        { id: 'c-overload', variableId: 'I3', type: 'NO', label: 'Sobrecarga NF' },
      ],
      parallelBranches: [
        { id: 'branch-start', contacts: [{ id: 'c-start', variableId: 'I0', type: 'NO', label: 'Liga NA' }] },
        { id: 'branch-seal', contacts: [{ id: 'c-seal', variableId: 'Q0', type: 'NO', label: 'Selo K1' }] },
      ],
      coilVariableId: 'Q0',
    },
  ],
  actuatorLinks: {
    MTR1: 'Q0',
  },
};

export const defaultProjects = [directStartWithSealProject];
