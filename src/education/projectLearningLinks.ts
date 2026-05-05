import { clpGuidedPractices } from './clpGuidedPractice';
import { getAllClpLessons, type ClpLesson } from './clpLessonCatalog';
import type { TrainingProject } from '../projects/projectCatalog';

export type ProjectLearningLinkSummary = {
  projectId: TrainingProject['id'];
  linkedLessons: ClpLesson[];
  linkedPracticeCount: number;
  teachingScore: number;
};

export function getLessonsLinkedToProject(projectId: TrainingProject['id']): ClpLesson[] {
  return getAllClpLessons().filter((lesson) => lesson.exampleProjectId === projectId);
}

export function getGuidedPracticesLinkedToProject(projectId: TrainingProject['id']) {
  return clpGuidedPractices.filter((practice) => practice.projectId === projectId);
}

export function getProjectLearningLinkSummary(projectId: TrainingProject['id']): ProjectLearningLinkSummary {
  const linkedLessons = getLessonsLinkedToProject(projectId);
  const linkedPracticeCount = getGuidedPracticesLinkedToProject(projectId).length;
  const teachingScore = Math.min(100, linkedLessons.length * 25 + linkedPracticeCount * 25);

  return {
    projectId,
    linkedLessons,
    linkedPracticeCount,
    teachingScore,
  };
}
