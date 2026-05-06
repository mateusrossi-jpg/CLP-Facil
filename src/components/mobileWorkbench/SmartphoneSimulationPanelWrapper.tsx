import { ComponentProps, memo, useMemo, useState } from 'react';
import { MobilePlcExperience } from '../MobilePlcExperience';
import { MobileWorkbenchScreen } from './MobileWorkbenchScreen';
import { PlcProfileId } from '../../plcProfiles/plcProfiles';
import { createInitialEditorState, evaluateEditorProject } from '../../engine/editorEvaluator';
import { createInitialEditorProject } from '../../engine/editorTypes';
import { createInitialRuntimeState } from '../../engine/runtimeTypes';
import { EditorRunMode } from '../EditorModeToggle';

type MobileExperienceProps = ComponentProps<typeof MobilePlcExperience>;

type SmartphoneSimulationPanelProps = Partial<MobileExperienceProps> & {
  selectedProfile?: PlcProfileId;
  onSelectProfile?: (profile: PlcProfileId) => void;
};

/**
 * Web/Codespace safe entry point for the simulator.
 *
 * App.tsx is the real owner of editorProject/plcState/evaluation, but the mobile
 * workbench must still render a visible PLC Simulator panel when Expo Web mounts
 * the smartphone route before every prop is hydrated. These fallbacks prevent the
 * previous blank screen/wrapper-no-op behavior while preserving the desktop
 * PlcWorkbench path and all real callbacks when App.tsx provides them.
 */
export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanel(props: SmartphoneSimulationPanelProps) {
  const { selectedProfile: _selectedProfile, onSelectProfile: _onSelectProfile, ...incomingProps } = props;
  const [fallbackProject] = useState(() => createInitialEditorProject());
  const [fallbackState] = useState(() => createInitialEditorState());
  const [fallbackRuntime] = useState(() => createInitialRuntimeState());
  const [fallbackScanNumber, setFallbackScanNumber] = useState(0);
  const [fallbackMode, setFallbackMode] = useState<EditorRunMode>('simulate');
  const [fallbackAutoScan, setFallbackAutoScan] = useState(false);

  const resolvedProject = incomingProps.editorProject ?? fallbackProject;
  const resolvedState = incomingProps.plcState ?? fallbackState;
  const resolvedEvaluation = useMemo(
    () => incomingProps.evaluation ?? evaluateEditorProject(resolvedProject, resolvedState, fallbackScanNumber, fallbackRuntime),
    [fallbackRuntime, fallbackScanNumber, incomingProps.evaluation, resolvedProject, resolvedState],
  );

  const screenProps: MobileExperienceProps = {
    ...incomingProps,
    editorProject: resolvedProject,
    plcState: resolvedState,
    evaluation: resolvedEvaluation,
    mode: incomingProps.mode ?? fallbackMode,
    autoScan: incomingProps.autoScan ?? fallbackAutoScan,
    onChangeMode: incomingProps.onChangeMode ?? setFallbackMode,
    onToggleAutoScan: incomingProps.onToggleAutoScan ?? (() => setFallbackAutoScan((current) => !current)),
    onRunScan: incomingProps.onRunScan ?? (() => setFallbackScanNumber((current) => current + 1)),
  };

  return <MobileWorkbenchScreen {...screenProps} />;
});
