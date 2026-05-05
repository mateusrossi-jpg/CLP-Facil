import { clpLearningModules } from './clpLessonCatalog';
import { demoLessonProgress, getLessonProgress, type LessonProgress } from './clpLearningProgress';

export type AchievementStatus = 'locked' | 'unlocked';

export type ClpAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: AchievementStatus;
  progress: number;
};

function countCompletedLessons(progressList: LessonProgress[]): number {
  return progressList.filter((item) => item.status === 'completed').length;
}

function hasCompletedLesson(lessonId: string, progressList: LessonProgress[]): boolean {
  return getLessonProgress(lessonId, progressList).status === 'completed';
}

function hasBestScoreAtLeast(lessonId: string, score: number, progressList: LessonProgress[]): boolean {
  return (getLessonProgress(lessonId, progressList).bestScore ?? 0) >= score;
}

function percentage(value: number, total: number): number {
  return Math.round((Math.min(value, total) / Math.max(1, total)) * 100);
}

export function getClpAchievements(progressList: LessonProgress[] = demoLessonProgress): ClpAchievement[] {
  const totalLessons = clpLearningModules.flatMap((module) => module.lessons).length;
  const completedLessons = countCompletedLessons(progressList);
  const completedHistoryLessons = clpLearningModules
    .find((module) => module.id === 'history')
    ?.lessons.filter((lesson) => hasCompletedLesson(lesson.id, progressList)).length ?? 0;
  const historyLessonCount = clpLearningModules.find((module) => module.id === 'history')?.lessons.length ?? 1;

  const achievements: ClpAchievement[] = [
    {
      id: 'first-run',
      title: 'Primeiro RUN',
      description: 'Começou a trilha e concluiu a primeira lição introdutória.',
      icon: '▶',
      status: hasCompletedLesson('before-clp', progressList) ? 'unlocked' : 'locked',
      progress: hasCompletedLesson('before-clp', progressList) ? 100 : 0,
    },
    {
      id: 'history-starter',
      title: 'Base histórica',
      description: 'Entendeu por que o CLP surgiu e como ele substituiu comandos cabeados.',
      icon: 'H',
      status: completedHistoryLessons >= 2 ? 'unlocked' : 'locked',
      progress: percentage(completedHistoryLessons, historyLessonCount),
    },
    {
      id: 'seal-master',
      title: 'Selo dominado',
      description: 'Dominou a lógica de retenção com contato auxiliar.',
      icon: 'S',
      status: hasBestScoreAtLeast('seal-in-circuit', 80, progressList) ? 'unlocked' : 'locked',
      progress: Math.min(100, getLessonProgress('seal-in-circuit', progressList).bestScore ?? 0),
    },
    {
      id: 'scan-reader',
      title: 'Leitor de scan',
      description: 'Começou a interpretar ciclo de scan, linha ativa e diagnóstico.',
      icon: '⟳',
      status: getLessonProgress('scan-cycle', progressList).progress >= 40 ? 'unlocked' : 'locked',
      progress: getLessonProgress('scan-cycle', progressList).progress,
    },
    {
      id: 'ladder-foundation',
      title: 'Fundamentos Ladder',
      description: 'Avançou nos conceitos de NA, NF, bobina, selo e intertravamento.',
      icon: 'L',
      status: completedLessons >= 4 ? 'unlocked' : 'locked',
      progress: percentage(completedLessons, 4),
    },
    {
      id: 'full-track',
      title: 'Trilha completa',
      description: 'Concluiu todas as lições educativas cadastradas.',
      icon: '★',
      status: completedLessons >= totalLessons ? 'unlocked' : 'locked',
      progress: percentage(completedLessons, totalLessons),
    },
  ];

  return achievements;
}
