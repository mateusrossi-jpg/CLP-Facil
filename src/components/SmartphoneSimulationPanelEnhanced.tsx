import { ComponentProps, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PlcBenchTestPlanCard } from './PlcBenchTestPlanCard';
import { PlcCommissioningChecklistCard } from './PlcCommissioningChecklistCard';
import { PlcCpuStatusCard } from './PlcCpuStatusCard';
import { PlcEdgePulseMonitorCard } from './PlcEdgePulseMonitorCard';
import { PlcForceTableCard } from './PlcForceTableCard';
import { PlcIoWiringMapCard } from './PlcIoWiringMapCard';
import { PlcLearningCoachCard } from './PlcLearningCoachCard';
import { PlcMemoryMapCard } from './PlcMemoryMapCard';
import { PlcProcessImageCard } from './PlcProcessImageCard';
import { PlcRungPowerFlowCard } from './PlcRungPowerFlowCard';
import { PlcSafetyInterlockCard } from './PlcSafetyInterlockCard';
import { PlcScanCycleCard } from './PlcScanCycleCard';
import { PlcScanHistoryCard } from './PlcScanHistoryCard';
import { PlcSimulationOverviewCard } from './PlcSimulationOverviewCard';
import { PlcSimulationSection } from './PlcSimulationSection';
import { PlcSimulationTestReportCard } from './PlcSimulationTestReportCard';
import { PlcTeacherRubricCard } from './PlcTeacherRubricCard';
import { PlcTimerCounterMonitorCard } from './PlcTimerCounterMonitorCard';
import { PlcWatchTableCard } from './PlcWatchTableCard';
import { ScanTraceDiagnosticCard } from './ScanTraceDiagnosticCard';
import { SmartphoneSimulationPanel as SmartphoneSimulationPanelFixed } from './SmartphoneSimulationPanelFixed';
import { MobilePlcWorkspace } from './MobilePlcWorkspace';
import { PlcMission } from '../lessons/missionTypes';
import { EditorCoilMode, EditorContactMode, EditorCounterMode, EditorTimerMode } from '../engine/editorTypes';
import { spacing } from '../theme/spacing';

type FixedPanelProps = ComponentProps<typeof SmartphoneSimulationPanelFixed>;
type OptionalRuntimeProps = 'autoScan' | 'onRunScan' | 'onToggleAutoScan' | 'onSetValue';

type SmartphoneSimulationPanelEnhancedProps = Omit<FixedPanelProps, OptionalRuntimeProps> & Partial<Pick<FixedPanelProps, OptionalRuntimeProps>> & {
  autoScan?: boolean;
  showAdvancedDiagnostics?: boolean;
  mission?: PlcMission | null;
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
  onSetValue?: (variable: string, value: boolean | number) => void;
  onSelectBlockId?: (blockId: string) => void;
  onChangeBlockVariable?: (variable: string) => void;
  onChangeBlockName?: (name: string) => void;
  onChangeContactMode?: (mode: EditorContactMode) => void;
  onChangeCoilMode?: (mode: EditorCoilMode) => void;
  onChangeTimerMode?: (mode: EditorTimerMode) => void;
  onChangeCounterMode?: (mode: EditorCounterMode) => void;
  onChangePresetMs?: (presetMs: number) => void;
  onChangePreset?: (preset: number) => void;
  onAddContact?: () => void;
  onAddCoil?: () => void;
  onAddTimer?: () => void;
  onAddBranch?: () => void;
  onAdvanceMission?: () => void;
};

const noop = () => undefined;

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanelEnhanced(props: SmartphoneSimulationPanelEnhancedProps) {
  const scanNumber = props.evaluation.scanNumber || 0;
  const lastScanMs = props.evaluation.runtime?.scanStepMs ?? 100;
  const autoScan = Boolean(props.autoScan);
  const onRunScan = props.onRunScan ?? noop;
  const onToggleAutoScan = props.onToggleAutoScan ?? noop;
  const onSetValue = props.onSetValue ?? noop;
  const activeMission = props.mission ?? undefined;
  const showAdvancedDiagnostics = Boolean(props.showAdvancedDiagnostics);
  const fixedPanelProps: FixedPanelProps = {
    ...props,
    autoScan,
    onRunScan,
    onToggleAutoScan,
    onSetValue,
  };

  return (
    <View style={styles.stack}>
      <MobilePlcWorkspace
        editorProject={props.editorProject}
        plcState={props.plcState}
        evaluation={props.evaluation}
        autoScan={autoScan}
        mission={activeMission}
        missionTitle={activeMission?.title ?? 'Bancada Ladder'}
        onSetValue={onSetValue}
        onRunScan={onRunScan}
        onToggleAutoScan={onToggleAutoScan}
        onSelectBlockId={props.onSelectBlockId}
        onChangeBlockVariable={props.onChangeBlockVariable}
        onChangeBlockName={props.onChangeBlockName}
        onChangeContactMode={props.onChangeContactMode}
        onChangeCoilMode={props.onChangeCoilMode}
        onChangeTimerMode={props.onChangeTimerMode}
        onChangeCounterMode={props.onChangeCounterMode}
        onChangePresetMs={props.onChangePresetMs}
        onChangePreset={props.onChangePreset}
        onAddContact={props.onAddContact}
        onAddCoil={props.onAddCoil}
        onAddTimer={props.onAddTimer}
        onAddBranch={props.onAddBranch}
        onAdvanceMission={props.onAdvanceMission}
      />

      {showAdvancedDiagnostics ? (
        <>
          <PlcSimulationSection
            title="CPU"
            subtitle="Resumo técnico, estado RUN/STOP, tempo de ciclo e watchdog"
            tone="green"
          >
            <View style={styles.innerStack}>
              <PlcSimulationOverviewCard
                project={props.editorProject}
                state={props.plcState}
                evaluation={props.evaluation}
                autoScan={autoScan}
                onRunScan={onRunScan}
                onToggleAutoScan={onToggleAutoScan}
              />
              <PlcCpuStatusCard
                isRunning
                isAutoScan={autoScan}
                scanCount={scanNumber}
                lastScanMs={lastScanMs}
                runtime={props.evaluation.runtime}
              />
            </View>
          </PlcSimulationSection>

      <PlcSimulationSection
        title="Scan"
        subtitle="Histórico, ciclo de varredura e imagem de processo"
        tone="cyan"
      >
        <View style={styles.innerStack}>
          <PlcScanHistoryCard
            project={props.editorProject}
            state={props.plcState}
            runtime={props.evaluation.runtime}
            scanNumber={scanNumber}
            lastScanMs={lastScanMs}
          />
          <PlcScanCycleCard
            project={props.editorProject}
            state={props.plcState}
            scanNumber={scanNumber}
            runtime={props.evaluation.runtime}
          />
          <PlcProcessImageCard
            project={props.editorProject}
            state={props.plcState}
            scanNumber={scanNumber}
            runtime={props.evaluation.runtime}
          />
        </View>
      </PlcSimulationSection>

      <PlcSimulationSection
        title="Ladder"
        subtitle="Fluxo de energia, timers, contadores e bordas"
        tone="amber"
      >
        <View style={styles.innerStack}>
          <PlcRungPowerFlowCard
            project={props.editorProject}
            state={props.plcState}
            runtime={props.evaluation.runtime}
            focusedRungId={props.editorProject.selectedRungId}
          />
          <PlcTimerCounterMonitorCard
            project={props.editorProject}
            runtime={props.evaluation.runtime}
          />
          <PlcEdgePulseMonitorCard
            project={props.editorProject}
            state={props.plcState}
            runtime={props.evaluation.runtime}
          />
        </View>
      </PlcSimulationSection>

      <PlcSimulationSection
        title="Memória"
        subtitle="Watch Table e mapa de endereços do programa"
        tone="purple"
      >
        <View style={styles.innerStack}>
          <PlcWatchTableCard
            project={props.editorProject}
            state={props.plcState}
            runtime={props.evaluation.runtime}
          />
          <PlcMemoryMapCard project={props.editorProject} />
          <PlcIoWiringMapCard project={props.editorProject} state={props.plcState} />
        </View>
      </PlcSimulationSection>

      <PlcSimulationSection
        title="Segurança"
        subtitle="Plano de bancada, comissionamento, intertravamentos e forces"
        tone="red"
      >
        <View style={styles.innerStack}>
          <PlcBenchTestPlanCard
            project={props.editorProject}
            state={props.plcState}
            evaluation={props.evaluation}
          />
          <PlcCommissioningChecklistCard
            project={props.editorProject}
            state={props.plcState}
            evaluation={props.evaluation}
          />
          <PlcSafetyInterlockCard
            project={props.editorProject}
            state={props.plcState}
            runtime={props.evaluation.runtime}
          />
          <PlcForceTableCard
            project={props.editorProject}
            state={props.plcState}
            onSetValue={props.onSetValue}
          />
        </View>
      </PlcSimulationSection>

      <PlcSimulationSection
        title="Diagnóstico"
        subtitle="Coach, relatório, rubrica, trace textual do scan e linha selecionada"
        tone="neutral"
      >
        <View style={styles.innerStack}>
          <PlcLearningCoachCard
            project={props.editorProject}
            state={props.plcState}
            evaluation={props.evaluation}
          />
          <PlcSimulationTestReportCard
            project={props.editorProject}
            state={props.plcState}
            evaluation={props.evaluation}
            autoScan={autoScan}
          />
          <PlcTeacherRubricCard
            project={props.editorProject}
            state={props.plcState}
            evaluation={props.evaluation}
          />
          <ScanTraceDiagnosticCard
            project={props.editorProject}
            state={props.plcState}
            runtime={props.evaluation.runtime}
            focusedRungId={props.editorProject.selectedRungId}
          />
        </View>
      </PlcSimulationSection>

      <PlcSimulationSection
        title="Painel compacto"
        subtitle="Controles principais de simulação no smartphone"
        tone="green"
        defaultOpen
      >
        <SmartphoneSimulationPanelFixed {...fixedPanelProps} />
      </PlcSimulationSection>
        </>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  innerStack: {
    gap: spacing.md,
  },
});
