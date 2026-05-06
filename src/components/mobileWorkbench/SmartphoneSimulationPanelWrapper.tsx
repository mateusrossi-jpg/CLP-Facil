import { ComponentProps, memo } from 'react';
import { MobileWorkbenchScreen } from './MobileWorkbenchScreen';

type Props = ComponentProps<typeof MobileWorkbenchScreen>;

export const SmartphoneSimulationPanelWrapper = memo(function SmartphoneSimulationPanelWrapper(props: Props) {
  return <MobileWorkbenchScreen {...props} />;
});
