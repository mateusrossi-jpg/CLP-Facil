import { memo } from 'react';
import { BottomNavKey } from '../BottomNavigation';
import { ReferenceHubPanel } from '../ReferenceHubPanel';
import { SimulationModeRouter } from '../SimulationModeRouter';
import { PremiumEditorExportScreen } from './PremiumEditorExportScreen';
import { PremiumHomeScreen } from './PremiumHomeScreen';
import { PremiumLearningScreen } from './PremiumLearningScreen';
import { PremiumProjectsScreen } from './PremiumProjectsScreen';
import { PremiumTagsDiagnosticsScreen } from './PremiumTagsDiagnosticsScreen';

type PremiumRouteContentProps = {
  active: BottomNavKey;
};

export const PremiumRouteContent = memo(function PremiumRouteContent({ active }: PremiumRouteContentProps) {
  if (active === 'home') return <PremiumHomeScreen />;
  if (active === 'learn') return <PremiumLearningScreen />;
  if (active === 'simulate') return <SimulationModeRouter />;
  if (active === 'projects') return <PremiumProjectsScreen />;
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
