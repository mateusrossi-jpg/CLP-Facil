import { ComponentProps, memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
import { EditorCoilMode, EditorCompareMode, EditorContactMode, EditorCounterMode, EditorMathMode, EditorTimerMode } from '../engine/editorTypes';
import { EditorRunMode } from './EditorModeToggle';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type FixedPanelProps = ComponentProps<typeof SmartphoneSimulationPanelFixed>;
type OptionalRuntimeProps = 'autoScan' | 'onRunScan' | 'onToggleAutoScan' | 'onSetValue';

type SmartphoneSimulationPanelEnhancedProps = Omit<FixedPanelProps, OptionalRuntimeProps> & Partial<Pick<FixedPanelProps, OptionalRuntimeProps>> & {
  autoScan?: boolean;
  showAdvancedDiagnostics?: boolean;
  embeddedDiagnosticsOnly?: boolean;
  mission?: PlcMission | null;
  mode?: EditorRunMode;
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
  onSetValue?: (variable: string, value: boolean | number) => void;
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
};

const noop = () => undefined;

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanelEnhanced(props: SmartphoneSimulationPanelEnhancedProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pipExpanded, setPipExpanded] = useState(false);
  const { width, height } = useWindowDimensions();
  const scanNumber = props.evaluation.scanNumber || 0;
  const lastScanMs = props.evaluation.runtime?.scanStepMs ?? 100;
  const autoScan = Boolean(props.autoScan);
  const onRunScan = props.onRunScan ?? noop;
  const onToggleAutoScan = props.onToggleAutoScan ?? noop;
  const onSetValue = props.onSetValue ?? noop;
  const activeMission = props.mission ?? undefined;
  const diagnosticsOnly = Boolean(props.embeddedDiagnosticsOnly);
  const showAdvancedDiagnostics = Boolean(props.showAdvancedDiagnostics || advancedOpen);
  const pipWidth = Math.min(width - spacing.md * 2, pipExpanded ? 720 : 430);
  const pipMaxHeight = Math.max(360, Math.min(height * (pipExpanded ? 0.82 : 0.58), 720));
  const fixedPanelProps: FixedPanelProps = {
    ...props,
    autoScan,
    onRunScan,
    onToggleAutoScan,
    onSetValue,
  };

  return (
    <View style={styles.stack}>
      {!diagnosticsOnly ? (
        <MobilePlcWorkspace
          editorProject={props.editorProject}
          plcState={props.plcState}
          evaluation={props.evaluation}
          autoScan={autoScan}
          mode={props.mode}
          mission={activeMission}
          missionTitle={activeMission?.title ?? 'Bancada Ladder'}
          onSetValue={onSetValue}
          onRunScan={onRunScan}
          onToggleAutoScan={onToggleAutoScan}
          onChangeMode={props.onChangeMode}
          onSelectRungId={props.onSelectRungId}
          onSelectBlockId={props.onSelectBlockId}
          onChangeBlockVariable={props.onChangeBlockVariable}
          onChangeBlockName={props.onChangeBlockName}
          onChangeContactMode={props.onChangeContactMode}
          onChangeCoilMode={props.onChangeCoilMode}
          onChangeTimerMode={props.onChangeTimerMode}
          onChangeCounterMode={props.onChangeCounterMode}
          onChangeCompareMode={props.onChangeCompareMode}
          onChangeMathMode={props.onChangeMathMode}
          onChangeSourceA={props.onChangeSourceA}
          onChangeSourceB={props.onChangeSourceB}
          onChangeDestination={props.onChangeDestination}
          onChangeDownSource={props.onChangeDownSource}
          onChangeResetSource={props.onChangeResetSource}
          onChangePresetMs={props.onChangePresetMs}
          onChangePreset={props.onChangePreset}
          onAddContact={props.onAddContact}
          onAddCoil={props.onAddCoil}
          onAddTimer={props.onAddTimer}
          onAddCounter={props.onAddCounter}
          onAddBranch={props.onAddBranch}
          onAddRung={props.onAddRung}
          onRemoveRung={props.onRemoveRung}
          onRemoveBlock={props.onRemoveBlock}
          onAdvanceMission={props.onAdvanceMission}
        />
      ) : null}

      {!diagnosticsOnly ? (
        <Pressable onPress={() => setAdvancedOpen((current) => !current)} style={({ pressed }) => [styles.analysisButton, advancedOpen && styles.analysisButtonOn, pressed && styles.pressed]}>
          <View style={styles.analysisCopy}>
            <Text style={[styles.analysisTitle, advancedOpen && styles.analysisTitleOn]}>{advancedOpen ? 'PiP de analises aberto' : 'Analises em PiP'}</Text>
            <Text style={styles.analysisText}>CPU, scan, memória, force, segurança, relatório, rubrica e trace sem ocupar a tela principal.</Text>
          </View>
          <Text style={[styles.analysisPill, advancedOpen && styles.analysisPillOn]}>{advancedOpen ? 'Fechar' : 'Abrir PiP'}</Text>
        </Pressable>
      ) : null}

      {showAdvancedDiagnostics ? (
        <View style={[styles.analysisPip, { width: pipWidth, maxHeight: pipMaxHeight }]}>
          <View style={styles.pipHeader}></View>
          <ScrollView style={styles.pipScroll} contentContainerStyle={styles.pipContent} showsVerticalScrollIndicator>
            <PlcSimulationSection title="Painel compacto" subtitle="Controles principais" tone="green" defaultOpen>
              <SmartphoneSimulationPanelFixed {...fixedPanelProps} />
            </PlcSimulationSection>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
    position: 'relative',
  },
  analysisButton: {
    minHeight: 58,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  analysisButtonOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  analysisCopy: {
    flex: 1,
    minWidth: 0,
  },
  analysisTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  analysisTitleOn: {
    color: colors.cyan,
  },
  analysisText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  analysisPill: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '900',
  },
  analysisPillOn: {
    color: colors.background,
    backgroundColor: colors.cyan,
  },
  analysisPip: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    zIndex: 40,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  pipHeader: {
    minHeight: 1,
  },
  pipScroll: {
    backgroundColor: colors.background,
  },
  pipContent: {
    gap: spacing.sm,
    padding: spacing.sm,
    paddingBottom: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
});
