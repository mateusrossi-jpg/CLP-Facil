import { trainingProjects } from './projectCatalog';
import { createProjectNavigationIntent } from './projectNavigationIntent';

type ProjectNavigationIntentRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): ProjectNavigationIntentRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runProjectNavigationIntentRegressionSuite(): ProjectNavigationIntentRegressionResult[] {
  const selo = trainingProjects.find((project) => project.id === 'selo') ?? trainingProjects[0];
  const studyIntent = createProjectNavigationIntent(selo, 'study', 'learn');
  const simulateIntent = createProjectNavigationIntent(selo, 'simulate', 'simulate');

  const studyIsValid =
    studyIntent.source === 'project_workspace' &&
    studyIntent.projectId === selo.id &&
    studyIntent.projectTitle === selo.title &&
    studyIntent.action === 'study' &&
    studyIntent.targetRoute === 'learn';

  const simulateIsValid =
    simulateIntent.source === 'project_workspace' &&
    simulateIntent.projectId === selo.id &&
    simulateIntent.projectTitle === selo.title &&
    simulateIntent.action === 'simulate' &&
    simulateIntent.targetRoute === 'simulate';

  const everyIntentKeepsProjectIdentity = trainingProjects.every((project) => {
    const intent = createProjectNavigationIntent(project, 'study', 'learn');
    return intent.projectId === project.id && intent.projectTitle === project.title;
  });

  return [
    assertResult(
      'intencao de estudo preserva projeto e navega para aprender',
      studyIsValid,
      `study=${JSON.stringify(studyIntent)}`,
    ),
    assertResult(
      'intencao de simulacao preserva projeto e navega para simular',
      simulateIsValid,
      `simulate=${JSON.stringify(simulateIntent)}`,
    ),
    assertResult(
      'intencoes preservam identidade de todos os projetos',
      everyIntentKeepsProjectIdentity,
      `projects=${trainingProjects.map((project) => project.id).join(',')}`,
    ),
  ];
}
