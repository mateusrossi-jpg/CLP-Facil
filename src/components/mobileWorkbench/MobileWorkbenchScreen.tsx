import { ComponentProps, memo } from 'react';
import { MobilePlcExperience } from '../MobilePlcExperience';
import { MobileHardwareExportPanel } from './MobileHardwareExportPanel';
import { MobileRuntimeAnimationLayer } from './MobileRuntimeAnimationLayer';
import { MobileScenarioLab } from './MobileScenarioLab';

type Props = ComponentProps<typeof MobilePlcExperience>;

export const MobileWorkbenchScreen = memo(function MobileWorkbenchScreen(props: Props) {
  const hasLogic = props.editorProject.rungs.length > 0;
  return (
    <>
      <MobileRuntimeAnimationLayer
        mode={props.mode ?? 'simulate'}
        autoScan={Boolean(props.autoScan)}
        evaluation={props.evaluation}
        hasLogic={hasLogic}
      />
      <MobilePlcExperience {...props} />
      <MobileScenarioLab editorProject={props.editorProject} plcState={props.plcState} evaluation={props.evaluation} />
      <MobileHardwareExportPanel editorProject={props.editorProject} />
    </>
  );
});
