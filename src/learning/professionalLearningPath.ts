import { ProfessionalExampleId, professionalExampleCatalog } from '../data/professionalExampleCatalog';

export type LearningModuleId =
  | 'starter_ladder'
  | 'motor_commands'
  | 'timers_counters'
  | 'process_applications'
  | 'safety_diagnostics';

export type LearningLessonStep = {
  title: string;
  concept: string;
  whyItMatters: string;
  practice: string;
  masteryCheck: string;
};

export type LearningModule = {
  id: LearningModuleId;
  title: string;
  description: string;
  exampleIds: ProfessionalExampleId[];
  lessons: LearningLessonStep[];
};

function lessonFromExample(exampleId: ProfessionalExampleId): LearningLessonStep {
  const example = professionalExampleCatalog.find((item) => item.id === exampleId);
  if (!example) {
    return {
      title: exampleId,
      concept: 'Exemplo ainda não catalogado.',
      whyItMatters: 'Será detalhado em uma próxima revisão.',
      practice: 'Abrir o exemplo e observar o scan.',
      masteryCheck: 'Explicar a saída principal da lógica.',
    };
  }

  return {
    title: example.title,
    concept: example.expectedConcepts.join(', '),
    whyItMatters: example.whyItMatters,
    practice: example.practiceChecklist.join(' → '),
    masteryCheck: `Explique o papel das tags ${example.expectedTags.slice(0, 4).join(', ')} e identifique quando a saída principal deve ligar.`,
  };
}

function lessonsFromExamples(exampleIds: ProfessionalExampleId[]): LearningLessonStep[] {
  return exampleIds.map(lessonFromExample);
}

const starterExamples: ProfessionalExampleId[] = ['direct_start', 'seal_start'];
const motorExamples: ProfessionalExampleId[] = ['reversing_motor', 'star_delta'];
const timerCounterExamples: ProfessionalExampleId[] = ['traffic_light', 'conveyor_batch'];
const processExamples: ProfessionalExampleId[] = ['reservoir_control', 'alternating_pumps'];
const safetyExamples: ProfessionalExampleId[] = ['automatic_gate'];

export const professionalLearningPath: LearningModule[] = [
  {
    id: 'starter_ladder',
    title: 'Fundamentos de Ladder no celular',
    description: 'Comece com contato, bobina, scan, saída e leitura em Lista/Fluxo.',
    exampleIds: starterExamples,
    lessons: lessonsFromExamples(starterExamples),
  },
  {
    id: 'motor_commands',
    title: 'Comandos elétricos reais',
    description: 'Treine comandos de motor usados em bancada, oficina e aulas técnicas.',
    exampleIds: motorExamples,
    lessons: lessonsFromExamples(motorExamples),
  },
  {
    id: 'timers_counters',
    title: 'Temporizadores e contadores',
    description: 'Use TON, CTU e sequência para transformar lógica simples em automação.',
    exampleIds: timerCounterExamples,
    lessons: lessonsFromExamples(timerCounterExamples),
  },
  {
    id: 'process_applications',
    title: 'Aplicações de processo',
    description: 'Controle situações comuns como bomba, reservatório, esteira e alternância.',
    exampleIds: processExamples,
    lessons: lessonsFromExamples(processExamples),
  },
  {
    id: 'safety_diagnostics',
    title: 'Segurança, diagnóstico e bancada',
    description: 'Entenda intertravamento, fins de curso, Force didático e validação antes da exportação.',
    exampleIds: safetyExamples,
    lessons: [
      ...lessonsFromExamples(safetyExamples),
      {
        title: 'Force didático e diagnóstico',
        concept: 'Force ON, Force OFF, tag forçada e alerta de segurança.',
        whyItMatters: 'Force é útil em aula, mas em bancada real pode esconder falhas e acionar cargas inesperadas.',
        practice: 'Aplique Force ON e Force OFF em uma tag booleana, observe a tabela e remova o force antes de exportar.',
        masteryCheck: 'Diga por que Force deve ser destacado visualmente e por que não substitui segurança física.',
      },
    ],
  },
];

export type LearningProgress = Record<string, boolean>;

export function lessonProgressKey(moduleId: LearningModuleId, lessonIndex: number): string {
  return `${moduleId}:${lessonIndex}`;
}

export function moduleProgress(module: LearningModule, progress: LearningProgress): { completed: number; total: number; ratio: number } {
  const total = module.lessons.length;
  const completed = module.lessons.filter((_, index) => progress[lessonProgressKey(module.id, index)]).length;
  return {
    completed,
    total,
    ratio: total === 0 ? 0 : completed / total,
  };
}

export function overallLearningProgress(progress: LearningProgress): { completed: number; total: number; ratio: number } {
  const totals = professionalLearningPath.map((module) => moduleProgress(module, progress));
  const completed = totals.reduce((sum, item) => sum + item.completed, 0);
  const total = totals.reduce((sum, item) => item.total + sum, 0);
  return {
    completed,
    total,
    ratio: total === 0 ? 0 : completed / total,
  };
}
