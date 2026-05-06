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
          <Text style={styles.workbenchEyebrow}>Simulador Ladder</Text>
          <Text style={styles.workbenchTitle}>I/O + Programa + Scan</Text>
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
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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
    color: '#334155',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  workbenchTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  workbenchMode: {
    color: '#FFFFFF',
    backgroundColor: '#16A34A',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '900',
  },
  workbenchModeEdit: {
    backgroundColor: '#2563EB',
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
