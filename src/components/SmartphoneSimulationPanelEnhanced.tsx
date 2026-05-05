import { ComponentProps, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PlcCpuStatusCard } from './PlcCpuStatusCard';
import { PlcEdgePulseMonitorCard } from './PlcEdgePulseMonitorCard';
import { PlcForceTableCard } from './PlcForceTableCard';
import { PlcMemoryMapCard } from './PlcMemoryMapCard';
import { PlcProcessImageCard } from './PlcProcessImageCard';
import { PlcRungPowerFlowCard } from './PlcRungPowerFlowCard';
import { PlcSafetyInterlockCard } from './PlcSafetyInterlockCard';
import { PlcScanCycleCard } from './PlcScanCycleCard';
import { PlcScanHistoryCard } from './PlcScanHistoryCard';
import { PlcTimerCounterMonitorCard } from './PlcTimerCounterMonitorCard';
import { PlcWatchTableCard } from './PlcWatchTableCard';
import { ScanTraceDiagnosticCard } from './ScanTraceDiagnosticCard';
import { SmartphoneSimulationPanel as SmartphoneSimulationPanelFixed } from './SmartphoneSimulationPanelFixed';
import { spacing } from '../theme/spacing';

type SmartphoneSimulationPanelEnhancedProps = ComponentProps<typeof SmartphoneSimulationPanelFixed>;

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanelEnhanced(props: SmartphoneSimulationPanelEnhancedProps) {
  const scanNumber = props.evaluation.scanNumber || 0;
  const lastScanMs = props.evaluation.runtime?.scanStepMs ?? 100;

  return (
    <View style={styles.stack}>
      <PlcCpuStatusCard
        isRunning
        isAutoScan={props.autoScan}
        scanCount={scanNumber}
        lastScanMs={lastScanMs}
        runtime={props.evaluation.runtime}
      />
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
      <PlcWatchTableCard
        project={props.editorProject}
        state={props.plcState}
        runtime={props.evaluation.runtime}
      />
      <PlcMemoryMapCard project={props.editorProject} />
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
      <PlcEdgePulseMonitorCard
        project={props.editorProject}
        state={props.plcState}
        runtime={props.evaluation.runtime}
      />
      <ScanTraceDiagnosticCard
        project={props.editorProject}
        state={props.plcState}
        runtime={props.evaluation.runtime}
        focusedRungId={props.editorProject.selectedRungId}
      />
      <SmartphoneSimulationPanelFixed {...props} />
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
});
