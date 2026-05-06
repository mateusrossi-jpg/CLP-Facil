import { ComponentProps, memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MobileBlockQuickEditor } from './MobileBlockQuickEditor';
import { SmartphoneSimulationPanelWrapper } from './mobileWorkbench/SmartphoneSimulationPanelWrapper';
import { SmartphoneSimulationPanel as SmartphoneSimulationPanelEnhanced } from './SmartphoneSimulationPanelEnhanced';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/theme';

type SmartphoneSimulationPanelProps = ComponentProps<typeof SmartphoneSimulationPanelEnhanced>;

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanel(props: SmartphoneSimulationPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(props.showAdvancedDiagnostics));
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
  const activeMission = props.mission ?? undefined;
  const runtimeMode = props.mode === 'edit' ? 'EDITOR' : props.autoScan ? 'AUTO' : 'SCAN';

  return (
    <View style={styles.stack}>
      <View style={styles.workbenchHeader}>
        <View style={styles.workbenchCopy}>
          <Text style={styles.workbenchEyebrow}>PLC Simulator</Text>
          <Text style={styles.workbenchTitle}>Programa Ladder + I/O + Scan</Text>
          <Text style={styles.workbenchText}>Use como simulador direto: toque nas entradas, clique nos blocos para editar tags e rode o scan na mesma bancada.</Text>
          <View style={styles.flowRow}>
            <Text style={styles.flowChip}>I/O</Text>
            <Text style={styles.flowArrow}>→</Text>
            <Text style={styles.flowChip}>Ladder</Text>
            <Text style={styles.flowArrow}>→</Text>
            <Text style={styles.flowChip}>Q</Text>
          </View>
        </View>
        <Text style={[styles.workbenchMode, props.mode === 'edit' && styles.workbenchModeEdit]}>{runtimeMode}</Text>
      </View>

      <SmartphoneSimulationPanelWrapper
        editorProject={props.editorProject}
        plcState={props.plcState}
        evaluation={props.evaluation}
        autoScan={props.autoScan}
        mode={props.mode}
        mission={activeMission}
        missionTitle={activeMission?.title ?? 'Bancada livre'}
        initialWorkspaceMode={activeMission ? 'guided' : 'free'}
        onSetValue={props.onSetValue}
        onRunScan={props.onRunScan}
        onToggleAutoScan={props.onToggleAutoScan}
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

      <MobileBlockQuickEditor
        project={props.editorProject}
        onUpdateVariable={props.onChangeBlockVariable}
        onUpdateName={props.onChangeBlockName}
        onUpdateContactMode={props.onChangeContactMode}
        onUpdateCoilMode={props.onChangeCoilMode}
        onUpdateTimerMode={props.onChangeTimerMode}
        onUpdateCounterMode={props.onChangeCounterMode}
        onUpdatePresetMs={props.onChangePresetMs}
        onUpdatePreset={props.onChangePreset}
      />

      <Pressable
        onPress={() => setAdvancedOpen((current) => !current)}
        style={({ pressed }) => [styles.advancedButton, advancedOpen && styles.advancedButtonOpen, pressed && styles.pressed]}
      >
        <View style={styles.advancedCopy}>
          <Text style={[styles.advancedTitle, advancedOpen && styles.advancedTitleOpen]}>
            {advancedOpen ? 'Ocultar detalhes' : 'Detalhes avançados'}
          </Text>
          <Text style={styles.advancedText}>CPU, memória, relatório e diagnóstico ficam recolhidos fora da bancada principal.</Text>
        </View>
        <Text style={[styles.advancedPill, advancedOpen && styles.advancedPillOpen]}>{advancedOpen ? 'Fechar' : 'Abrir'}</Text>
      </Pressable>

      {advancedOpen ? (
        <SmartphoneSimulationPanelEnhanced {...props} showAdvancedDiagnostics embeddedDiagnosticsOnly />
      ) : null}
    </View>
  );
});

function createStyles(c: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  workbenchHeader: {
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: c.surface,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  workbenchCopy: {
    flex: 1,
    minWidth: 0,
  },
  workbenchEyebrow: {
    color: c.cyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  workbenchTitle: {
    color: c.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },
  workbenchText: {
    color: c.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 5,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  flowChip: {
    color: c.cyan,
    borderColor: c.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '900',
    overflow: 'hidden',
  },
  flowArrow: {
    color: c.textDim,
    fontSize: 10,
    fontWeight: '900',
  },
  workbenchMode: {
    color: c.background,
    backgroundColor: c.green,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '900',
  },
  workbenchModeEdit: {
    backgroundColor: c.amber,
  },
  advancedButton: {
    minHeight: 54,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: c.surface,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  advancedButtonOpen: {
    borderColor: c.cyan,
    backgroundColor: c.cyanSoft,
  },
  advancedCopy: {
    flex: 1,
    minWidth: 0,
  },
  advancedTitle: {
    color: c.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  advancedTitleOpen: {
    color: c.cyan,
  },
  advancedText: {
    color: c.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  advancedPill: {
    color: c.cyan,
    borderColor: c.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '900',
  },
  advancedPillOpen: {
    color: c.background,
    backgroundColor: c.cyan,
  },
  pressed: {
    opacity: 0.72,
  },
  });
}
