import { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SimulatorComponent } from '../data/componentLibrary';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import {
  EditorCoilMode,
  EditorCompareMode,
  EditorContactMode,
  EditorCounterMode,
  EditorInsertionZone,
  EditorMathMode,
  EditorProjectState,
  EditorTimerMode,
} from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { PlcMission } from '../lessons/missionTypes';
import { spacing } from '../theme/spacing';
import { EditorRunMode } from './EditorModeToggle';
import { MobilePlcWorkspace } from './MobilePlcWorkspace';
import { MobileWorkspaceMode, MobileWorkspaceModePanel } from './MobileWorkspaceModePanel';

type MobilePlcExperienceWorkspaceProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  autoScan?: boolean;
  mode?: EditorRunMode;
  mission?: PlcMission;
  missionTitle?: string;
  onSetValue?: (variable: string, value: boolean | number) => void;
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
  onChangeMode?: (mode: EditorRunMode) => void;
  onSelectRungId?: (rungId: string) => void;
  onSelectBlockId?: (blockId: string) => void;
  onChangeBlockVariable?: (variable: string) => void;
  onChangeBlockName?: (name: string) => void;
  onChangeContactMode?: (mode: EditorContactMode) => void;
  onChangeCoilMode?: (mode: EditorCoilMode) => void;
  onChangeTimerMode?: (mode: EditorTimerMode) => void;
  onChangeCounterMode?: (mode: EditorCounterMode) => void;
  onChangeCompareMode?: (mode: EditorCompareMode) => void;
  onChangeMathMode?: (mode: EditorMathMode) => void;
  onChangeSourceA?: (value: string) => void;
  onChangeSourceB?: (value: string) => void;
  onChangeDestination?: (value: string) => void;
  onChangeDownSource?: (value: string) => void;
  onChangeResetSource?: (value: string) => void;
  onChangePresetMs?: (presetMs: number) => void;
  onChangePreset?: (preset: number) => void;
  onAddContact?: () => void;
  onAddCoil?: () => void;
  onAddTimer?: () => void;
  onAddCounter?: () => void;
  onAddBranch?: () => void;
  onAddRung?: () => void;
  onRemoveRung?: () => void;
  onRemoveBlock?: () => void;
  onAdvanceMission?: () => void;
  onOpenMissions?: () => void;
  onSelectComponent?: (component: SimulatorComponent, zone?: EditorInsertionZone, seriesIndex?: number) => void;
};

function progressText(mission: PlcMission | undefined, evaluation: EditorEvaluationResult): string {
  if (!mission) return 'Escolha uma missão para seguir um roteiro passo a passo.';
  const scan = evaluation.scanNumber || 0;
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  if (diagnostics > 0) return `${diagnostics} alerta(s) para revisar antes de avançar.`;
  if (scan === 0) return 'Acione uma entrada e rode o primeiro Scan.';
  return `Scan #${scan}: observe entradas, rung e saídas na mesma tela.`;
}

export const MobilePlcExperienceWorkspace = memo(function MobilePlcExperienceWorkspace({
  editorProject,
  plcState,
  evaluation,
  autoScan,
  mode,
  mission,
  missionTitle,
  onOpenMissions,
  ...workspaceProps
}: MobilePlcExperienceWorkspaceProps) {
  const [experienceMode, setExperienceMode] = useState<MobileWorkspaceMode>(mission ? 'guided' : 'free');
  const effectiveMission = experienceMode === 'guided' ? mission : undefined;
  const effectiveMissionTitle = useMemo(() => {
    if (experienceMode === 'guided') return missionTitle || mission?.title || 'Aprendizado guiado';
    return 'Simulação livre';
  }, [experienceMode, mission?.title, missionTitle]);

  return (
    <View style={styles.stack}>
      <MobileWorkspaceModePanel
        mode={experienceMode}
        missionTitle={effectiveMissionTitle}
        missionProgress={progressText(effectiveMission, evaluation)}
        onChangeMode={setExperienceMode}
        onOpenMissions={onOpenMissions}
      />

      <MobilePlcWorkspace
        editorProject={editorProject}
        plcState={plcState}
        evaluation={evaluation}
        autoScan={autoScan}
        mode={mode}
        mission={effectiveMission}
        missionTitle={effectiveMissionTitle}
        {...workspaceProps}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
});
