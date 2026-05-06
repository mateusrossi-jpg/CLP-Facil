import { ComponentProps, memo } from 'react';
import { MobilePlcExperience } from '../MobilePlcExperience';
import { MobileWorkbenchScreen } from './MobileWorkbenchScreen';
import { PlcProfileId } from '../../plcProfiles/plcProfiles';

type SmartphoneSimulationPanelProps = ComponentProps<typeof MobilePlcExperience> & {
  selectedProfile?: PlcProfileId;
  onSelectProfile?: (profile: PlcProfileId) => void;
};

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanel(props: SmartphoneSimulationPanelProps) {
  const { selectedProfile: _selectedProfile, onSelectProfile: _onSelectProfile, ...screenProps } = props;
  return <MobileWorkbenchScreen {...screenProps} />;
});
