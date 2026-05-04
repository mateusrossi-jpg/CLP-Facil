import { changeTestProtocols, changeTestStages, stagesForChangeSize } from './changeTestingSchedule';
import { duolingoStyleLearningPath, totalLearningPathLessons } from '../education/learningPathPlan';

type ChangeTestingRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): ChangeTestingRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runScheduleCoverageRegression(): ChangeTestingRegressionResult {
  const stageIds = changeTestStages.map((stage) => stage.id);
  const hasQuality = stageIds.includes('automated_gate');
  const hasMobile = stageIds.includes('mobile_review');
  const hasEducation = stageIds.includes('human_education_review');
  const hasReleaseNote = stageIds.includes('release_note');
  const releaseStages = stagesForChangeSize('release');

  return assertResult(
    'cronograma de testes cobre qualidade, mobile, educacao e fechamento',
    hasQuality && hasMobile && hasEducation && hasReleaseNote && releaseStages.length >= 6,
    `stages=${stageIds.join(',')}, release=${releaseStages.length}`,
  );
}

function runProtocolCoverageRegression(): ChangeTestingRegressionResult {
  const types = changeTestProtocols.map((protocol) => protocol.changeType).join(' | ');
  const hasSimulator = /Simulador/.test(types);
  const hasHardware = /Hardware/.test(types);
  const hasEducation = /Educação/.test(types);
  const hasVisual = /Visual/.test(types);

  return assertResult(
    'protocolos de teste cobrem mudancas grandes do app',
    hasSimulator && hasHardware && hasEducation && hasVisual,
    types,
  );
}

function runLearningPathRegression(): ChangeTestingRegressionResult {
  const moduleIds = duolingoStyleLearningPath.map((module) => module.id);
  const hasFundamentals = moduleIds.includes('fundamentals');
  const hasMotors = moduleIds.includes('motors');
  const hasHardware = moduleIds.includes('hardware_lab');
  const lessonCount = totalLearningPathLessons();
  const everyLessonExplainsWhy = duolingoStyleLearningPath.every((module) => module.lessons.every((lesson) => lesson.whyItMatters.length > 0 && lesson.masteryCheck.length > 0));

  return assertResult(
    'trilha educativa estilo Duolingo possui modulos e explicacao do porque',
    hasFundamentals && hasMotors && hasHardware && lessonCount >= 10 && everyLessonExplainsWhy,
    `modules=${moduleIds.join(',')}, lessons=${lessonCount}`,
  );
}

export function runChangeTestingScheduleRegressionSuite(): ChangeTestingRegressionResult[] {
  return [
    runScheduleCoverageRegression(),
    runProtocolCoverageRegression(),
    runLearningPathRegression(),
  ];
}
