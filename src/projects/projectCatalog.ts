export type ProjectDifficulty = 'basic' | 'intermediate' | 'advanced';
export type ProjectCategory = 'motors' | 'commands' | 'process' | 'automation' | 'diagnostics';

export type ProjectInstruction = 'XIC' | 'XIO' | 'OTE' | 'OTL' | 'OTU' | 'ONS' | 'OSF' | 'TON' | 'TOF' | 'CTU' | 'CTD' | 'SET' | 'RESET';

export type TrainingProject = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  rungs: number;
  timers: number;
  counters: number;
  favorite: boolean;
  estimatedMinutes: number;
  instructions: ProjectInstruction[];
  tags: string[];
  learningGoals: string[];
  ioSummary: {
    inputs: number;
    outputs: number;
    memories: number;
    timers: number;
    counters: number;
  };
};

export const trainingProjects: TrainingProject[] = [
  {
    id: 'partida-direta',
    title: 'Partida direta',
    description: 'Acionamento simples de motor com contato NA, parada e bobina do contator.',
    category: 'motors',
    difficulty: 'basic',
    rungs: 1,
    timers: 0,
    counters: 0,
    favorite: true,
    estimatedMinutes: 8,
    instructions: ['XIC', 'XIO', 'OTE'],
    tags: ['motor', 'contator', 'base'],
    learningGoals: ['Identificar contato NA', 'Entender contato NF de parada', 'Relacionar bobina à saída física'],
    ioSummary: { inputs: 2, outputs: 1, memories: 0, timers: 0, counters: 0 },
  },
  {
    id: 'selo',
    title: 'Selo',
    description: 'Comando de retenção com partida, parada e contato auxiliar da própria saída.',
    category: 'commands',
    difficulty: 'basic',
    rungs: 2,
    timers: 0,
    counters: 0,
    favorite: true,
    estimatedMinutes: 12,
    instructions: ['XIC', 'XIO', 'OTE'],
    tags: ['selo', 'retenção', 'motor'],
    learningGoals: ['Entender retenção lógica', 'Simular botão momentâneo', 'Interpretar saída sustentada'],
    ioSummary: { inputs: 2, outputs: 1, memories: 1, timers: 0, counters: 0 },
  },
  {
    id: 'reversao',
    title: 'Reversão',
    description: 'Intertravamento entre contatores K1 e K2 para inverter o sentido de giro.',
    category: 'motors',
    difficulty: 'intermediate',
    rungs: 4,
    timers: 0,
    counters: 0,
    favorite: false,
    estimatedMinutes: 18,
    instructions: ['XIC', 'XIO', 'OTE'],
    tags: ['motor', 'reversão', 'intertravamento'],
    learningGoals: ['Bloquear comandos conflitantes', 'Ler intertravamento elétrico/lógico', 'Prevenir acionamento simultâneo'],
    ioSummary: { inputs: 3, outputs: 2, memories: 2, timers: 0, counters: 0 },
  },
  {
    id: 'estrela-triangulo',
    title: 'Estrela-triângulo',
    description: 'Sequência temporizada para partida reduzida com transição segura entre contatores.',
    category: 'motors',
    difficulty: 'advanced',
    rungs: 7,
    timers: 2,
    counters: 0,
    favorite: false,
    estimatedMinutes: 28,
    instructions: ['XIC', 'XIO', 'OTE', 'TON'],
    tags: ['motor', 'partida reduzida', 'temporização'],
    learningGoals: ['Sequenciar contatores', 'Aplicar temporizador TON', 'Evitar estrela e triângulo simultâneos'],
    ioSummary: { inputs: 3, outputs: 3, memories: 2, timers: 2, counters: 0 },
  },
  {
    id: 'semaforo',
    title: 'Semáforo',
    description: 'Sequência didática com temporizadores encadeados e estados visuais.',
    category: 'process',
    difficulty: 'intermediate',
    rungs: 6,
    timers: 3,
    counters: 0,
    favorite: true,
    estimatedMinutes: 20,
    instructions: ['XIC', 'XIO', 'OTE', 'TON'],
    tags: ['sequência', 'timer', 'didático'],
    learningGoals: ['Criar sequência temporal', 'Ler estados por etapa', 'Diagnosticar transição de timers'],
    ioSummary: { inputs: 1, outputs: 3, memories: 3, timers: 3, counters: 0 },
  },
  {
    id: 'bomba-alternada',
    title: 'Bomba alternada',
    description: 'Alternância entre bombas com memória, proteção e equilíbrio de desgaste.',
    category: 'process',
    difficulty: 'advanced',
    rungs: 8,
    timers: 1,
    counters: 1,
    favorite: false,
    estimatedMinutes: 32,
    instructions: ['XIC', 'XIO', 'OTE', 'OTL', 'OTU', 'TON', 'CTU'],
    tags: ['bomba', 'alternância', 'processo'],
    learningGoals: ['Alternar saídas', 'Usar memória de escolha', 'Aplicar proteção e contagem'],
    ioSummary: { inputs: 4, outputs: 2, memories: 3, timers: 1, counters: 1 },
  },
  {
    id: 'esteira',
    title: 'Esteira',
    description: 'Controle de esteira com sensor de peças, contagem e parada por lote.',
    category: 'process',
    difficulty: 'intermediate',
    rungs: 5,
    timers: 1,
    counters: 1,
    favorite: false,
    estimatedMinutes: 22,
    instructions: ['XIC', 'XIO', 'OTE', 'TON', 'CTU'],
    tags: ['esteira', 'contador', 'produção'],
    learningGoals: ['Contar eventos de sensor', 'Parar por quantidade', 'Diferenciar nível de pulso'],
    ioSummary: { inputs: 3, outputs: 1, memories: 2, timers: 1, counters: 1 },
  },
  {
    id: 'portao-automatico',
    title: 'Portão automático',
    description: 'Abertura e fechamento com fim de curso, intertravamento e temporização.',
    category: 'automation',
    difficulty: 'intermediate',
    rungs: 6,
    timers: 2,
    counters: 0,
    favorite: true,
    estimatedMinutes: 24,
    instructions: ['XIC', 'XIO', 'OTE', 'TON'],
    tags: ['portão', 'fim de curso', 'automação'],
    learningGoals: ['Usar fins de curso', 'Evitar comandos opostos', 'Aplicar tempo de segurança'],
    ioSummary: { inputs: 4, outputs: 2, memories: 2, timers: 2, counters: 0 },
  },
  {
    id: 'reservatorio',
    title: 'Reservatório',
    description: 'Controle de nível com bomba, sensor inferior, sensor superior e proteção contra seco.',
    category: 'process',
    difficulty: 'intermediate',
    rungs: 5,
    timers: 1,
    counters: 0,
    favorite: false,
    estimatedMinutes: 20,
    instructions: ['XIC', 'XIO', 'OTE', 'TON'],
    tags: ['nível', 'bomba', 'sensor'],
    learningGoals: ['Interpretar sensor de nível', 'Evitar funcionamento a seco', 'Aplicar lógica de enchimento'],
    ioSummary: { inputs: 3, outputs: 1, memories: 1, timers: 1, counters: 0 },
  },
];

export function getTrainingProjectById(id: string): TrainingProject | undefined {
  return trainingProjects.find((project) => project.id === id);
}

export function getFeaturedTrainingProject(): TrainingProject {
  return getTrainingProjectById('selo') ?? trainingProjects[0];
}

export function getProjectDifficultyLabel(difficulty: ProjectDifficulty): 'Básico' | 'Intermediário' | 'Avançado' {
  if (difficulty === 'basic') return 'Básico';
  if (difficulty === 'intermediate') return 'Intermediário';
  return 'Avançado';
}

export function getProjectCategoryLabel(category: ProjectCategory): string {
  if (category === 'motors') return 'Motores';
  if (category === 'commands') return 'Comandos';
  if (category === 'process') return 'Processos';
  if (category === 'automation') return 'Automação';
  return 'Diagnóstico';
}
