import { trainingProjects } from '../projects/projectCatalog';
import {
  getGuidedPracticesLinkedToProject,
  getLessonsLinkedToProject,
  getProjectLearningLinkSummary,
} from './projectLearningLinks';

type ProjectLearningLinksRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectLearningLinksRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectLearningLinksRegressionSuite(): ProjectLearningLinksRegressionResult[] {
  const summaries = trainingProjects.map((project) => getProjectLearningLinkSummary(project.id));
  const everySummaryMatchesProject = summaries.every((summary) => trainingProjects.some((project) => project.id === summary.projectId));
  const everyTeachingScoreInRange = summaries.every((summary) => summary.teachingScore >= 0 && summary.teachingScore <= 100);
  const hasLinkedLearningProjects = summaries.some((summary) => summary.linkedLessons.length > 0 && summary.linkedPracticeCount > 0);
  const seloLessons = getLessonsLinkedToProject('selo');
  const seloPractices = getGuidedPracticesLinkedToProject('selo');

  return [
    assertResult(
      'resumos de aprendizagem por projeto apontam para projetos validos',
      everySummaryMatchesProject,
      `summaries=${summaries.map((summary) => summary.projectId).join(',')}`,
    ),
    assertResult(
      'score didatico dos projetos permanece entre 0 e 100',
      everyTeachingScoreInRange,
      `scores=${summaries.map((summary) => `${summary.projectId}:${summary.teachingScore}`).join(',')}`,
    ),
    assertResult(
      'biblioteca possui projetos ligados a licoes e praticas guiadas',
      hasLinkedLearningProjects,
      `linked=${summaries.filter((summary) => summary.linkedLessons.length > 0 || summary.linkedPracticeCount > 0).map((summary) => summary.projectId).join(',')}`,
    ),
    assertResult(
      'projeto selo permanece ligado ao modo aprender',
      seloLessons.length >= 1 && seloPractices.length >= 1,
      `seloLessons=${seloLessons.length}; seloPractices=${seloPractices.length}`,
    ),
  ];
}
