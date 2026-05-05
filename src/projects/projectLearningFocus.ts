import { getGuidedPracticesLinkedToProject, getLessonsLinkedToProject } from '../education/projectLearningLinks';
import { getTrainingProjectById, type TrainingProject } from './projectCatalog';

export type ProjectLearningFocus = {
  project: TrainingProject;
  lessons: ReturnType<typeof getLessonsLinkedToProject>;
  practices: ReturnType<typeof getGuidedPracticesLinkedToProject>;
  lessonCount: number;
  practiceCount: number;
  hasLearningPath: boolean;
  focusHint: string;
};

export function getProjectLearningFocus(projectId: string): ProjectLearningFocus | undefined {
  const project = getTrainingProjectById(projectId);
  if (!project) return undefined;

  const lessons = getLessonsLinkedToProject(project.id);
  const practices = getGuidedPracticesLinkedToProject(project.id);
  const hasLearningPath = lessons.length > 0 || practices.length > 0;

  return {
    project,
    lessons,
    practices,
    lessonCount: lessons.length,
    practiceCount: practices.length,
    hasLearningPath,
    focusHint: hasLearningPath
      ? 'Estude o conceito, revise por que importa e avance para a prática guiada antes de simular.'
      : 'Este projeto ainda precisa de lições e práticas guiadas vinculadas.',
  };
}
