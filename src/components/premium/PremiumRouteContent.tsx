import { memo } from 'react';
import type { ProjectNavigationIntent } from '../../projects/projectNavigationIntent';
import type { BottomNavKey } from '../navigationTypes';
import { ReferenceHubPanel } from '../ReferenceHubPanel';
import { SimulationModeRouter } from '../SimulationModeRouter';
import { PremiumEditorExportScreen } from './PremiumEditorExportScreen';
import { PremiumHomeScreen } from './PremiumHomeScreen';
import { PremiumLearningScreen } from './PremiumLearningScreen';
import { PremiumProjectsScreen } from './PremiumProjectsScreen';
import { PremiumTagsDiagnosticsScreen } from './PremiumTagsDiagnosticsScreen';

type PremiumRouteContentProps = {
  active: BottomNavKey;
  projectIntent?: ProjectNavigationIntent;
  onNavigate?: (route: BottomNavKey, intent?: ProjectNavigationIntent) => void;
};

export const PremiumRouteContent = memo(function PremiumRouteContent({ active, projectIntent, onNavigate }: PremiumRouteContentProps) {
  if (active === 'home') return <PremiumHomeScreen />;
  if (active === 'learn') return <PremiumLearningScreen projectIntent={projectIntent} />;
  if (active === 'simulate') return <SimulationModeRouter projectIntent={projectIntent} />;
  if (active === 'projects') return <PremiumProjectsScreen onNavigate={onNavigate} />;
  if (active === 'pro') return <PremiumEditorExportScreen />;
  if (active === 'reference') {
    return (
      <>
        <ReferenceHubPanel />
        <PremiumTagsDiagnosticsScreen />
      </>
    );
  }
  return null;
});
