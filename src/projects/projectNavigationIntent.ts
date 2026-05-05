import type { BottomNavKey } from '../components/navigationTypes';
import type { ProjectQuickActionKind } from './projectQuickActions';
import type { TrainingProject } from './projectCatalog';

export type ProjectNavigationIntent = {
  source: 'project_workspace';
  projectId: TrainingProject['id'];
  projectTitle: string;
  action: ProjectQuickActionKind;
  targetRoute: BottomNavKey;
};

export function createProjectNavigationIntent(
  project: TrainingProject,
  action: ProjectQuickActionKind,
  targetRoute: BottomNavKey,
): ProjectNavigationIntent {
  return {
    source: 'project_workspace',
    projectId: project.id,
    projectTitle: project.title,
    action,
    targetRoute,
  };
}
