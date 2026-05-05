import { getTrainingProjectById } from '../projects/projectCatalog';
import { getClpAchievements } from './clpAchievements';
import { clpGuidedPractices, getGuidedPracticeForLesson } from './clpGuidedPractice';
import { clpLearningModules, getAllClpLessons, getClpLessonById } from './clpLessonCatalog';
import { clpLessonQuizzes, getQuizForLesson } from './clpLessonQuizzes';
import {
  getAllModuleProgressSummaries,
  getCurrentLesson,
  getLessonProgress,
  getOverallLearningProgress,
} from './clpLearningProgress';

type EducationRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, condition: boolean, details?: string): EducationRegressionResult {
  return { name, passed: condition, details: condition ? undefined : details };
}

function runLessonCatalogCoverageRegression(): EducationRegressionResult {
  const expectedModules = ['history', 'how-it-works', 'ladder-thinking', 'instructions', 'applications', 'diagnostics'];
  const moduleIds = clpLearningModules.map((module) => module.id);
  const allModulesExist = expectedModules.every((moduleId) => moduleIds.includes(moduleId));
  const allModulesHaveLessons = clpLearningModules.every((module) => module.lessons.length >= 3);
  const allLessonsHaveTeachingBlocks = getAllClpLessons().every((lesson) =>
    lesson.concept.length > 20 &&
    lesson.whyItMatters.length > 20 &&
    lesson.practice.length > 20 &&
    lesson.masteryCheck.length > 20,
  );

  return assertResult(
    'catalogo educativo cobre trilhas e blocos didaticos principais',
    allModulesExist && allModulesHaveLessons && allLessonsHaveTeachingBlocks,
    `modules=${moduleIds.join(',')}, lessons=${getAllClpLessons().length}`,
  );
}

function runQuizRegression(): EducationRegressionResult {
  const lessonsWithQuiz = clpLessonQuizzes.map((quiz) => quiz.lessonId);
  const everyQuizHasLesson = clpLessonQuizzes.every((quiz) => Boolean(getClpLessonById(quiz.lessonId)));
  const everyQuizHasOneCorrectAnswer = clpLessonQuizzes.every((quiz) => quiz.options.filter((option) => option.isCorrect).length === 1);
  const everyQuizHasExplanation = clpLessonQuizzes.every((quiz) => quiz.options.every((option) => option.explanation.length > 20));
  const importantLessonsCovered = ['seal-in-circuit', 'scan-cycle', 'force-safety'].every((lessonId) => Boolean(getQuizForLesson(lessonId)));

  return assertResult(
    'quizzes educativos possuem aula, resposta unica e explicacoes',
    everyQuizHasLesson && everyQuizHasOneCorrectAnswer && everyQuizHasExplanation && importantLessonsCovered,
    `quizzes=${lessonsWithQuiz.join(',')}`,
  );
}

function runProgressRegression(): EducationRegressionResult {
  const overall = getOverallLearningProgress();
  const summaries = getAllModuleProgressSummaries();
  const currentLesson = getCurrentLesson();
  const currentProgress = getLessonProgress(currentLesson.id);
  const progressInRange = overall >= 0 && overall <= 100 && summaries.every((summary) => summary.progress >= 0 && summary.progress <= 100);
  const summariesMatchModules = summaries.length === clpLearningModules.length;
  const currentLessonIsTracked = currentProgress.status === 'in_progress' || currentProgress.status === 'available' || currentProgress.status === 'completed';

  return assertResult(
    'progresso educativo calcula resumo geral, modulos e licao atual',
    progressInRange && summariesMatchModules && currentLessonIsTracked,
    `overall=${overall}, modules=${summaries.length}, current=${currentLesson.id}:${currentProgress.status}`,
  );
}

function runAchievementsRegression(): EducationRegressionResult {
  const achievements = getClpAchievements();
  const hasUnlocked = achievements.some((achievement) => achievement.status === 'unlocked');
  const hasLocked = achievements.some((achievement) => achievement.status === 'locked');
  const allProgressInRange = achievements.every((achievement) => achievement.progress >= 0 && achievement.progress <= 100);
  const allHaveDescriptions = achievements.every((achievement) => achievement.title.length > 3 && achievement.description.length > 20);

  return assertResult(
    'conquistas educativas calculam bloqueio, liberacao e progresso',
    achievements.length >= 5 && hasUnlocked && hasLocked && allProgressInRange && allHaveDescriptions,
    `achievements=${achievements.map((achievement) => `${achievement.id}:${achievement.status}:${achievement.progress}`).join(',')}`,
  );
}

function runGuidedPracticeRegression(): EducationRegressionResult {
  const allPracticesHaveLessons = clpGuidedPractices.every((practice) => Boolean(getClpLessonById(practice.lessonId)));
  const allPracticesHaveSteps = clpGuidedPractices.every((practice) => practice.steps.length >= 3);
  const allStepsHaveObservation = clpGuidedPractices.every((practice) =>
    practice.steps.every((step) => step.instruction.length > 20 && step.expectedObservation.length > 20),
  );
  const keyPracticesExist = ['seal-in-circuit', 'interlock', 'timers-ton-tof', 'force-safety'].every((lessonId) =>
    Boolean(getGuidedPracticeForLesson(lessonId)),
  );

  return assertResult(
    'praticas guiadas conectam licoes a passos observaveis',
    allPracticesHaveLessons && allPracticesHaveSteps && allStepsHaveObservation && keyPracticesExist,
    `practices=${clpGuidedPractices.map((practice) => practice.lessonId).join(',')}`,
  );
}

function runEducationProjectLinkRegression(): EducationRegressionResult {
  const lessonsWithMissingProjects = getAllClpLessons()
    .filter((lesson) => lesson.exampleProjectId && !getTrainingProjectById(lesson.exampleProjectId))
    .map((lesson) => `${lesson.id}:${lesson.exampleProjectId}`);

  const practicesWithMissingProjects = clpGuidedPractices
    .filter((practice) => practice.projectId && !getTrainingProjectById(practice.projectId))
    .map((practice) => `${practice.lessonId}:${practice.projectId}`);

  return assertResult(
    'links entre educacao e biblioteca de projetos apontam para projetos existentes',
    lessonsWithMissingProjects.length === 0 && practicesWithMissingProjects.length === 0,
    `missingLessons=${lessonsWithMissingProjects.join(',')}; missingPractices=${practicesWithMissingProjects.join(',')}`,
  );
}

export function runEducationRegressionSuite(): EducationRegressionResult[] {
  return [
    runLessonCatalogCoverageRegression(),
    runQuizRegression(),
    runProgressRegression(),
    runAchievementsRegression(),
    runGuidedPracticeRegression(),
    runEducationProjectLinkRegression(),
  ];
}
