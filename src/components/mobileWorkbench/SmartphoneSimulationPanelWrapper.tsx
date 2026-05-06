import { ComponentProps, memo, useMemo, useState } from 'react';
import { MobilePlcExperience } from '../MobilePlcExperience';
import { MobileWorkbenchScreen } from './MobileWorkbenchScreen';
import { PlcProfileId } from '../../plcProfiles/plcProfiles';
import { createInitialEditorState, evaluateEditorProject } from '../../engine/editorEvaluator';
import {
  createEditorBlock,
  createInitialEditorProject,
  EditorBlock,
  EditorCoilMode,
  EditorContactMode,
  EditorCounterMode,
  EditorProjectState,
  EditorTimerMode,
} from '../../engine/editorTypes';
import { createInitialRuntimeState } from '../../engine/runtimeTypes';
import { PlcState } from '../../engine/projectTypes';
import { simulatorComponents } from '../../data/componentLibrary';
import { EditorRunMode } from '../EditorModeToggle';

type MobileExperienceProps = ComponentProps<typeof MobilePlcExperience>;

type SmartphoneSimulationPanelProps = Partial<MobileExperienceProps> & {
  selectedProfile?: PlcProfileId;
  onSelectProfile?: (profile: PlcProfileId) => void;
};

function blocksForRung(rung: EditorProjectState['rungs'][number]): EditorBlock[] {
  return [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ];
}

function mapFallbackBlocks(
  project: EditorProjectState,
  mapper: (block: EditorBlock) => EditorBlock,
): EditorProjectState {
  return {
    ...project,
    rungs: project.rungs.map((rung) => ({
      ...rung,
      seriesBlocks: rung.seriesBlocks.map(mapper),
      parallelBlocks: rung.parallelBlocks.map(mapper),
      parallelBranches: (rung.parallelBranches ?? []).map((branch) => ({
        ...branch,
        blocks: branch.blocks.map(mapper),
      })),
      coilBlock: rung.coilBlock ? mapper(rung.coilBlock) : rung.coilBlock,
    })),
  };
}

function ensureFirstRung(project: EditorProjectState): EditorProjectState {
  if (project.rungs.length > 0) return project;
  return {
    ...project,
    selectedRungId: 'rung-1',
    selectedZone: 'series',
    selectedSeriesIndex: 0,
    rungs: [
      {
        id: 'rung-1',
        label: 'Linha 1 — Primeira lógica',
        seriesBlocks: [],
        parallelBlocks: [],
        parallelBranches: [],
        coilBlock: null,
      },
    ],
  };
}

function componentById(componentId: string) {
  return simulatorComponents.find((component) => component.id === componentId) ?? simulatorComponents[0];
}

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
  const [fallbackProject, setFallbackProject] = useState(() => ensureFirstRung(createInitialEditorProject()));
  const [fallbackState, setFallbackState] = useState<PlcState>(() => createInitialEditorState());
  const [fallbackRuntime, setFallbackRuntime] = useState(() => createInitialRuntimeState());
  const [fallbackScanNumber, setFallbackScanNumber] = useState(0);
  const [fallbackMode, setFallbackMode] = useState<EditorRunMode>('simulate');
  const [fallbackAutoScan, setFallbackAutoScan] = useState(false);

  const resolvedProject = incomingProps.editorProject ?? fallbackProject;
  const resolvedState = incomingProps.plcState ?? fallbackState;
  const resolvedEvaluation = useMemo(
    () => incomingProps.evaluation ?? evaluateEditorProject(resolvedProject, resolvedState, fallbackScanNumber, fallbackRuntime),
    [fallbackRuntime, fallbackScanNumber, incomingProps.evaluation, resolvedProject, resolvedState],
  );

  function fallbackAddRung() {
    setFallbackProject((current) => {
      const safeProject = ensureFirstRung(current);
      const nextIndex = safeProject.rungs.length + 1;
      const rungId = `rung-${nextIndex}`;
      return {
        ...safeProject,
        selectedRungId: rungId,
        selectedBlockId: null,
        selectedZone: 'series',
        selectedSeriesIndex: 0,
        rungs: [
          ...safeProject.rungs,
          {
            id: rungId,
            label: `Linha ${nextIndex} — Nova lógica`,
            seriesBlocks: [],
            parallelBlocks: [],
            parallelBranches: [],
            coilBlock: null,
          },
        ],
      };
    });
  }

  function fallbackSelectRungById(rungId: string) {
    setFallbackProject((current) => ({ ...current, selectedRungId: rungId, selectedBlockId: null }));
  }

  function fallbackSelectBlockById(blockId: string) {
    setFallbackProject((current) => ({ ...current, selectedBlockId: blockId }));
  }

  function fallbackInsert(componentId: string, zone: 'series' | 'coil') {
    setFallbackProject((current) => {
      const safeProject = ensureFirstRung(current);
      const selectedRungId = safeProject.selectedRungId ?? safeProject.rungs[0]?.id;
      const component = componentById(componentId);
      const block = createEditorBlock(component, zone);
      const rungs = safeProject.rungs.map((rung) => {
        if (rung.id !== selectedRungId) return rung;
        if (zone === 'coil') return { ...rung, coilBlock: block };
        return { ...rung, seriesBlocks: [...rung.seriesBlocks, block] };
      });
      return {
        ...safeProject,
        selectedBlockId: block.id,
        selectedZone: zone,
        rungs,
      };
    });
  }

  function fallbackUpdateSelectedBlock(mapper: (block: EditorBlock) => EditorBlock) {
    setFallbackProject((current) => {
      const selectedBlockId = current.selectedBlockId;
      if (!selectedBlockId) return current;
      return mapFallbackBlocks(current, (block) => block.id === selectedBlockId ? mapper(block) : block);
    });
  }

  function fallbackRunScan() {
    const nextScan = fallbackScanNumber + 1;
    const result = evaluateEditorProject(fallbackProject, fallbackState, nextScan, fallbackRuntime);
    setFallbackScanNumber(nextScan);
    setFallbackState(result.state);
    setFallbackRuntime(result.runtime);
  }

  const usingFallbackProject = !incomingProps.editorProject;
  const usingFallbackState = !incomingProps.plcState;

  const screenProps: MobileExperienceProps = {
    ...incomingProps,
    editorProject: resolvedProject,
    plcState: resolvedState,
    evaluation: resolvedEvaluation,
    mode: incomingProps.mode ?? fallbackMode,
    autoScan: incomingProps.autoScan ?? fallbackAutoScan,
    onChangeMode: incomingProps.onChangeMode ?? setFallbackMode,
    onToggleAutoScan: incomingProps.onToggleAutoScan ?? (() => setFallbackAutoScan((current) => !current)),
    onRunScan: incomingProps.onRunScan ?? fallbackRunScan,
    onSetValue: incomingProps.onSetValue ?? (usingFallbackState ? ((variable, value) => setFallbackState((current) => ({ ...current, [variable.trim().toUpperCase()]: value }))) : undefined),
    onAddRung: incomingProps.onAddRung ?? (usingFallbackProject ? fallbackAddRung : undefined),
    onSelectRungId: incomingProps.onSelectRungId ?? (usingFallbackProject ? fallbackSelectRungById : undefined),
    onSelectBlockId: incomingProps.onSelectBlockId ?? (usingFallbackProject ? fallbackSelectBlockById : undefined),
    onAddContact: incomingProps.onAddContact ?? (usingFallbackProject ? (() => fallbackInsert('contact-no', 'series')) : undefined),
    onAddCoil: incomingProps.onAddCoil ?? (usingFallbackProject ? (() => fallbackInsert('coil-q', 'coil')) : undefined),
    onAddTimer: incomingProps.onAddTimer ?? (usingFallbackProject ? (() => fallbackInsert('timer-ton', 'coil')) : undefined),
    onAddCounter: incomingProps.onAddCounter ?? (usingFallbackProject ? (() => fallbackInsert('counter-ctu', 'coil')) : undefined),
    onChangeBlockVariable: incomingProps.onChangeBlockVariable ?? (usingFallbackProject ? ((variable) => fallbackUpdateSelectedBlock((block) => ({ ...block, variable: variable.trim().toUpperCase() }))) : undefined),
    onChangeBlockName: incomingProps.onChangeBlockName ?? (usingFallbackProject ? ((name) => fallbackUpdateSelectedBlock((block) => ({ ...block, name: name.trim() || block.name }))) : undefined),
    onChangeContactMode: incomingProps.onChangeContactMode ?? (usingFallbackProject ? ((contactMode: EditorContactMode) => fallbackUpdateSelectedBlock((block) => ({ ...block, contactMode }))) : undefined),
    onChangeCoilMode: incomingProps.onChangeCoilMode ?? (usingFallbackProject ? ((coilMode: EditorCoilMode) => fallbackUpdateSelectedBlock((block) => ({ ...block, coilMode }))) : undefined),
    onChangeTimerMode: incomingProps.onChangeTimerMode ?? (usingFallbackProject ? ((timerMode: EditorTimerMode) => fallbackUpdateSelectedBlock((block) => ({ ...block, timerMode }))) : undefined),
    onChangeCounterMode: incomingProps.onChangeCounterMode ?? (usingFallbackProject ? ((counterMode: EditorCounterMode) => fallbackUpdateSelectedBlock((block) => ({ ...block, counterMode }))) : undefined),
    onChangePresetMs: incomingProps.onChangePresetMs ?? (usingFallbackProject ? ((presetMs) => fallbackUpdateSelectedBlock((block) => ({ ...block, presetMs }))) : undefined),
    onChangePreset: incomingProps.onChangePreset ?? (usingFallbackProject ? ((preset) => fallbackUpdateSelectedBlock((block) => ({ ...block, preset }))) : undefined),
  };

  return <MobileWorkbenchScreen {...screenProps} />;
});
