import { clpLearningModules, type ClpLearningModule, type ClpLesson } from './clpLessonCatalog';

export type LessonProgressStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type LessonProgress = {
  lessonId: ClpLesson['id'];
  status: LessonProgressStatus;
  progress: number;
  bestScore?: number;
  lastOpenedAt?: string;
};

export type ModuleProgressSummary = {
  moduleId: ClpLearningModule['id'];
  title: string;
  lessonCount: number;
  completedCount: number;
  availableCount: number;
  progress: number;
};

export const demoLessonProgress: LessonProgress[] = [
  { lessonId: 'before-clp', status: 'completed', progress: 100, bestScore: 100 },
  { lessonId: 'why-plc-was-created', status: 'completed', progress: 100, bestScore: 80 },
  { lessonId: 'plc-evolution', status: 'available', progress: 20 },
  { lessonId: 'plc-parts', status: 'available', progress: 0 },
  { lessonId: 'scan-cycle', status: 'in_progress', progress: 45, bestScore: 60 },
  { lessonId: 'no-nc-coil', status: 'completed', progress: 100, bestScore: 100 },
  { lessonId: 'seal-in-circuit', status: 'in_progress', progress: 58, bestScore: 80, lastOpenedAt: '2026-05-04' },
  { lessonId: 'interlock', status: 'available', progress: 0 },
];

export function getLessonProgress(lessonId: ClpLesson['id'], progressList: LessonProgress[] = demoLessonProgress): LessonProgress {
  return progressList.find((item) => item.lessonId === lessonId) ?? { lessonId, status: 'locked', progress: 0 };
}

export function getLessonStatusLabel(status: LessonProgressStatus): string {
  if (status === 'completed') return 'Concluída';
  if (status === 'in_progress') return 'Em progresso';
  if (status === 'available') return 'Liberada';
  return 'Bloqueada';
}

export function summarizeModuleProgress(
  module: ClpLearningModule,
  progressList: LessonProgress[] = demoLessonProgress,
): ModuleProgressSummary {
  const progressRows = module.lessons.map((lesson) => getLessonProgress(lesson.id, progressList));
  const completedCount = progressRows.filter((row) => row.status === 'completed').length;
  const availableCount = progressRows.filter((row) => row.status !== 'locked').length;
  const progress = Math.round(
    progressRows.reduce((sum, row) => sum + row.progress, 0) / Math.max(1, module.lessons.length),
  );

  return {
    moduleId: module.id,
    title: module.title,
    lessonCount: module.lessons.length,
    completedCount,
    availableCount,
    progress,
  };
}

export function getAllModuleProgressSummaries(progressList: LessonProgress[] = demoLessonProgress): ModuleProgressSummary[] {
  return clpLearningModules.map((module) => summarizeModuleProgress(module, progressList));
}

export function getOverallLearningProgress(progressList: LessonProgress[] = demoLessonProgress): number {
  const allLessons = clpLearningModules.flatMap((module) => module.lessons);
  const totalProgress = allLessons.reduce((sum, lesson) => sum + getLessonProgress(lesson.id, progressList).progress, 0);
  return Math.round(totalProgress / Math.max(1, allLessons.length));
}

export function getCurrentLesson(progressList: LessonProgress[] = demoLessonProgress): ClpLesson {
  const allLessons = clpLearningModules.flatMap((module) => module.lessons);
  const inProgress = allLessons.find((lesson) => getLessonProgress(lesson.id, progressList).status === 'in_progress');
  return inProgress ?? allLessons[0];
}
