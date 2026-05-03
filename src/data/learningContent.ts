export type LearningModuleId = 'fundamentals' | 'motors' | 'timers' | 'counters';

export type LearningModule = {
  id: LearningModuleId;
  title: string;
  description: string;
  status: 'available' | 'planned';
};

export type Lesson = {
  id: string;
  moduleId: LearningModuleId;
  title: string;
  shortDescription: string;
  objective: string;
  theory: string[];
  practicalExample: string;
  simulatorProjectId?: string;
  status: 'available' | 'planned';
};

export const learningModules: LearningModule[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentos',
    description: 'Base da lógica Ladder: contato NA, contato NF, bobina, AND, OR, selo e intertravamento.',
    status: 'available',
  },
  {
    id: 'motors',
    title: 'Motores',
    description: 'Partida direta, selo, emergência, sobrecarga, reversão e partida sequencial.',
    status: 'available',
  },
  {
    id: 'timers',
    title: 'Temporizadores',
    description: 'TON, TOF, pulso e partidas com atraso.',
    status: 'planned',
  },
  {
    id: 'counters',
    title: 'Contadores',
    description: 'Contagem de peças, reset, limite de produção e acionamento por contagem.',
    status: 'planned',
  },
];

export const lessons: Lesson[] = [
  {
    id: 'normally-open-contact',
    moduleId: 'fundamentals',
    title: 'Contato normalmente aberto',
    shortDescription: 'Entenda o contato NA e por que ele só conduz quando a entrada está ativa.',
    objective: 'Mostrar que o contato NA representa uma condição que precisa ser verdadeira para permitir passagem lógica.',
    theory: [
      'O contato normalmente aberto, ou NA, fica aberto quando a entrada está inativa.',
      'Quando o botão ou sensor é acionado, o contato fecha logicamente e permite energizar a saída.',
      'Em Ladder, esse contato é usado para comandos como Liga, sensores de presença e permissões positivas.',
    ],
    practicalExample: 'Pressionar um botão Liga para acender uma lâmpada piloto.',
    status: 'available',
  },
  {
    id: 'normally-closed-contact',
    moduleId: 'fundamentals',
    title: 'Contato normalmente fechado',
    shortDescription: 'Aprenda como o contato NF conduz em repouso e abre quando acionado.',
    objective: 'Mostrar por que contatos NF são usados em comandos de parada, emergência e proteções.',
    theory: [
      'O contato normalmente fechado, ou NF, conduz quando a entrada está em repouso.',
      'Ao acionar o botão ou proteção, o contato abre e interrompe a lógica.',
      'É comum usar NF para Desliga, emergência, sobrecarga e permissões de segurança lógica.',
    ],
    practicalExample: 'Pressionar Desliga para abrir a linha e desligar o contator.',
    status: 'available',
  },
  {
    id: 'seal-circuit',
    moduleId: 'fundamentals',
    title: 'Selo ou retenção',
    shortDescription: 'Veja como uma saída pode manter o próprio comando ativo depois do botão Liga ser solto.',
    objective: 'Ensinar a lógica de auto-retenção usada em comandos de motores e contatores.',
    theory: [
      'O selo usa um contato auxiliar da própria saída em paralelo com o botão Liga.',
      'Quando a saída liga, o contato auxiliar fecha e mantém a linha energizada.',
      'O selo deve ser cortado por um botão Desliga NF, emergência ou proteção.',
    ],
    practicalExample: 'Partida direta de motor com botão Liga, Desliga e contator K1.',
    simulatorProjectId: 'direct-start-seal',
    status: 'available',
  },
  {
    id: 'direct-start-with-seal',
    moduleId: 'motors',
    title: 'Partida direta com selo',
    shortDescription: 'Simule um motor comandado por Liga, Desliga, emergência, sobrecarga e contator K1.',
    objective: 'Unir contatos NA/NF, selo e proteção em um circuito clássico de motor.',
    theory: [
      'O botão Liga aciona momentaneamente a bobina do contator K1.',
      'O contato auxiliar de K1 faz o selo e mantém o motor ligado após soltar Liga.',
      'O botão Desliga, a emergência e a sobrecarga ficam em série e cortam o comando quando abrem.',
    ],
    practicalExample: 'A regra simulada é Q0 = (I0 OR Q0) AND I1 AND I2 AND I3.',
    simulatorProjectId: 'direct-start-seal',
    status: 'available',
  },
  {
    id: 'motor-reversing',
    moduleId: 'motors',
    title: 'Reversão com intertravamento',
    shortDescription: 'Evite avanço e reverso acionados ao mesmo tempo.',
    objective: 'Mostrar a importância do intertravamento lógico em comandos com dois contatores.',
    theory: [
      'Em uma reversão, dois contatores não devem ser acionados simultaneamente.',
      'O intertravamento usa contatos auxiliares para bloquear o comando oposto.',
      'Esse tema será simulado em uma próxima versão do app.',
    ],
    practicalExample: 'K1 avanço bloqueia K2 reverso, e K2 reverso bloqueia K1 avanço.',
    status: 'planned',
  },
];
