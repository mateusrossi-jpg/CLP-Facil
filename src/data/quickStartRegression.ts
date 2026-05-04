import { educationalEditorExamples } from './editorExampleProjects';
import { moduleProgress, overallLearningProgress, professionalLearningPath } from '../learning/professionalLearningPath';

type QuickStartRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): QuickStartRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runQuickStartExamplesRegression(): QuickStartRegressionResult {
  const exampleText = educationalEditorExamples.map((example) => `${example.id} ${example.title} ${example.description}`).join('\n');
  const hasBeginner = /selo|partida/i.test(exampleText);
  const hasMotor = /motor|revers|estrela|triângulo|triangulo/i.test(exampleText);
  const hasProcess = /bomba|esteira|pump|conveyor|nível|nivel/i.test(exampleText);

  return assertResult(
    'quick start possui exemplos para fluxo de divulgacao',
    hasBeginner && hasMotor && hasProcess,
    `beginner=${hasBeginner}, motor=${hasMotor}, process=${hasProcess}`,
  );
}

function runProfessionalLearningPathRegression(): QuickStartRegressionResult {
  const hasStarter = professionalLearningPath.some((module) => module.id === 'starter_ladder');
  const hasMotorCommands = professionalLearningPath.some((module) => module.id === 'motor_commands');
  const hasDiagnostics = professionalLearningPath.some((module) => module.id === 'safety_diagnostics');
  const everyLessonIsGuided = professionalLearningPath.every((module) => module.lessons.every((lesson) =>
    lesson.concept.length > 0 &&
    lesson.whyItMatters.length > 0 &&
    lesson.practice.length > 0 &&
    lesson.masteryCheck.length > 0,
  ));
  const totalLessons = professionalLearningPath.reduce((sum, module) => sum + module.lessons.length, 0);

  return assertResult(
    'trilha educativa possui conceito importancia pratica e dominio',
    hasStarter && hasMotorCommands && hasDiagnostics && everyLessonIsGuided && totalLessons >= 8,
    `starter=${hasStarter}, motor=${hasMotorCommands}, diagnostics=${hasDiagnostics}, guided=${everyLessonIsGuided}, lessons=${totalLessons}`,
  );
}

function runLearningProgressRegression(): QuickStartRegressionResult {
  const firstModule = professionalLearningPath[0];
  const progress = { [`${firstModule.id}:0`]: true };
  const module = moduleProgress(firstModule, progress);
  const overall = overallLearningProgress(progress);

  return assertResult(
    'progresso da trilha contabiliza modulos e total geral',
    module.completed === 1 && module.total === firstModule.lessons.length && overall.completed === 1 && overall.total >= module.total,
    `module=${module.completed}/${module.total}, overall=${overall.completed}/${overall.total}`,
  );
}

export function runQuickStartRegressionSuite(): QuickStartRegressionResult[] {
  return [
    runQuickStartExamplesRegression(),
    runProfessionalLearningPathRegression(),
    runLearningProgressRegression(),
  ];
}
