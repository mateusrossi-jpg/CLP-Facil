export type ComponentCategory = 'input' | 'logic' | 'output' | 'timer' | 'counter' | 'motor';

export type SimulatorComponent = {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  isPro: boolean;
  status: 'available' | 'visual-only' | 'planned';
};

export const simulatorComponents: SimulatorComponent[] = [
  {
    id: 'button-no',
    name: 'Botão NA',
    category: 'input',
    description: 'Botão normalmente aberto para comandos de liga e permissões.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'button-nc',
    name: 'Botão NF',
    category: 'input',
    description: 'Botão normalmente fechado para comandos de desliga e proteções.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'selector-switch',
    name: 'Chave seletora',
    category: 'input',
    description: 'Entrada retentiva simples para simular liga/desliga manual.',
    isPro: false,
    status: 'visual-only',
  },
  {
    id: 'emergency-nc',
    name: 'Emergência NF',
    category: 'input',
    description: 'Contato NF para cortar a lógica do comando no simulador educativo.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'contact-no',
    name: 'Contato NA',
    category: 'logic',
    description: 'Contato normalmente aberto associado a uma entrada, saída ou memória.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'contact-nc',
    name: 'Contato NF',
    category: 'logic',
    description: 'Contato normalmente fechado associado a uma entrada, saída ou memória.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'coil-q',
    name: 'Bobina Q',
    category: 'output',
    description: 'Bobina de saída para acionar contatores, lâmpadas ou atuadores.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'memory-m',
    name: 'Memória M',
    category: 'logic',
    description: 'Memória auxiliar para criar lógicas internas.',
    isPro: false,
    status: 'visual-only',
  },
  {
    id: 'pilot-light',
    name: 'Lâmpada piloto',
    category: 'output',
    description: 'Indicador visual de saída ligada ou estado do circuito.',
    isPro: false,
    status: 'visual-only',
  },
  {
    id: 'contactor',
    name: 'Contator K',
    category: 'output',
    description: 'Representa acionamento de cargas e motores no simulador.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'motor-simple',
    name: 'Motor simples',
    category: 'motor',
    description: 'Atuador visual ligado por uma saída ou contator.',
    isPro: false,
    status: 'available',
  },
  {
    id: 'timer-ton',
    name: 'TON',
    category: 'timer',
    description: 'Temporizador com atraso na energização.',
    isPro: true,
    status: 'visual-only',
  },
  {
    id: 'timer-tof',
    name: 'TOF',
    category: 'timer',
    description: 'Temporizador com atraso no desligamento.',
    isPro: true,
    status: 'visual-only',
  },
  {
    id: 'timer-tp',
    name: 'TP / Pulso',
    category: 'timer',
    description: 'Temporizador de pulso para acionamentos temporários.',
    isPro: true,
    status: 'planned',
  },
  {
    id: 'counter-ctu',
    name: 'CTU',
    category: 'counter',
    description: 'Contador crescente para pulsos, peças e eventos.',
    isPro: true,
    status: 'visual-only',
  },
  {
    id: 'counter-ctd',
    name: 'CTD',
    category: 'counter',
    description: 'Contador decrescente para aplicações didáticas.',
    isPro: true,
    status: 'planned',
  },
  {
    id: 'star-delta',
    name: 'Estrela-triângulo',
    category: 'motor',
    description: 'Bloco didático para partida estrela-triângulo completa.',
    isPro: true,
    status: 'planned',
  },
  {
    id: 'motor-reversing',
    name: 'Reversão de motor',
    category: 'motor',
    description: 'Bloco avançado com intertravamento entre avanço e reverso.',
    isPro: true,
    status: 'planned',
  },
];
