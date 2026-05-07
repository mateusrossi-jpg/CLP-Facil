import { ComponentProps, memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { evaluateMissionAttempt } from '../lessons/missionValidation';
import { PlcMission } from '../lessons/missionTypes';
import { spacing } from '../theme/spacing';
import { MobilePlcWorkspace } from './MobilePlcWorkspace';
import { MobileWorkspaceMode, MobileWorkspaceModePanel } from './MobileWorkspaceModePanel';

type MobilePlcExperienceProps = ComponentProps<typeof MobilePlcWorkspace> & {
  initialWorkspaceMode?: MobileWorkspaceMode;
  onOpenMissions?: () => void;
};

export const MobilePlcExperience = memo(function MobilePlcExperience({
  initialWorkspaceMode,
  onOpenMissions,
  mission,
  missionTitle,
  plcState,
  evaluation,
  ...workspaceProps
}: MobilePlcExperienceProps) {
  const [workspaceMode, setWorkspaceMode] = useState<MobileWorkspaceMode>(initialWorkspaceMode ?? (mission ? 'guided' : 'free'));
  const activeMission = mission as PlcMission | undefined;

  const missionAttempt = useMemo(
    () => activeMission ? evaluateMissionAttempt(activeMission, plcState, evaluation) : null,
    [activeMission, evaluation, plcState],
  );

  const resolvedTitle = missionTitle || activeMission?.title || (workspaceMode === 'guided' ? 'Escolha uma missão' : 'Simulação livre');
  const missionProgress = activeMission
    ? missionAttempt?.passed
      ? 'Missão concluída. Revise a lógica ou avance para o próximo desafio.'
      : `${missionAttempt?.passedRules ?? 0}/${missionAttempt?.totalRules ?? activeMission.validation.length} regra(s) validadas.`
    : workspaceMode === 'guided'
      ? 'Escolha uma missão para o app guiar objetivo, teste e validação.'
      : 'Modo livre: experimente sem missão obrigatória.';

  return (
    <View style={styles.stack}>
      <MobileWorkspaceModePanel
        mode={workspaceMode}
        missionTitle={resolvedTitle}
        missionProgress={missionProgress}
        onChangeMode={setWorkspaceMode}
        onOpenMissions={onOpenMissions}
      />

      <MobilePlcWorkspace
        {...workspaceProps}
        mission={workspaceMode === 'guided' ? activeMission : undefined}
        missionTitle={workspaceMode === 'guided' ? resolvedTitle : 'Simulação livre'}
        plcState={plcState}
        evaluation={evaluation}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
});
