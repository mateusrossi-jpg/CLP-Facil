import type { BottomNavKey } from '../components/navigationTypes';
import type { ProjectQuickActionKind } from './projectQuickActions';

export type ProjectWorkspaceTab = 'summary' | 'technical' | 'code';

export type ProjectQuickActionNavigationTarget = {
  tab: ProjectWorkspaceTab;
  route?: BottomNavKey;
};

export function getProjectQuickActionNavigation(kind: ProjectQuickActionKind): ProjectQuickActionNavigationTarget {
  if (kind === 'study') {
    return { tab: 'summary', route: 'learn' };
  }
  if (kind === 'simulate') {
    return { tab: 'summary', route: 'simulate' };
  }
  if (kind === 'code') {
    return { tab: 'code' };
  }
  if (kind === 'technical' || kind === 'bench') {
    return { tab: 'technical' };
  }
  return { tab: 'summary' };
}
