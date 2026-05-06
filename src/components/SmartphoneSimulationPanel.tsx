import { ComponentProps, memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MobilePlcExperience } from './MobilePlcExperience';
import { SmartphoneSimulationPanel as SmartphoneSimulationPanelEnhanced } from './SmartphoneSimulationPanelEnhanced';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type SmartphoneSimulationPanelProps = ComponentProps<typeof SmartphoneSimulationPanelEnhanced>;

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanel(props: SmartphoneSimulationPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(props.showAdvancedDiagnostics));
  const activeMission = props.mission ?? undefined;

  return (
    <View style={styles.stack}>
      <View style={styles.workbenchHeader}>
        <View style={styles.workbenchCopy}>
          <Text style={styles.workbenchEyebrow}>Bancada de trabalho</Text>
          <Text style={styles.workbenchTitle}>Editor e simulador no mesmo lugar</Text>
          <Text style={styles.workbenchText}>Monte a rung, toque nas entradas, rode Scan e ajuste os blocos sem trocar de aba.</Text>
        </View>
        <Text style={styles.workbenchMode}>{props.mode === 'edit' ? 'EDITAR' : 'SIMULAR'}</Text>
      </View>

      <MobilePlcExperience
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

      <Pressable
        onPress={() => setAdvancedOpen((current) => !current)}
        style={({ pressed }) => [styles.advancedButton, advancedOpen && styles.advancedButtonOpen, pressed && styles.pressed]}
      >
        <View style={styles.advancedCopy}>
          <Text style={[styles.advancedTitle, advancedOpen && styles.advancedTitleOpen]}>
            {advancedOpen ? 'Ocultar detalhes' : 'Detalhes avançados'}
          </Text>
          <Text style={styles.advancedText}>CPU, scan, memória, force, relatório e diagnóstico ficam recolhidos fora da bancada principal.</Text>
        </View>
        <Text style={[styles.advancedPill, advancedOpen && styles.advancedPillOpen]}>{advancedOpen ? 'Fechar' : 'Abrir'}</Text>
      </Pressable>

      {advancedOpen ? (
        <SmartphoneSimulationPanelEnhanced {...props} showAdvancedDiagnostics embeddedDiagnosticsOnly />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  workbenchHeader: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
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
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  workbenchTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  workbenchText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  workbenchMode: {
    color: colors.background,
    backgroundColor: colors.cyan,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '900',
  },
  advancedButton: {
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
  advancedButtonOpen: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  advancedCopy: {
    flex: 1,
    minWidth: 0,
  },
  advancedTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  advancedTitleOpen: {
    color: colors.cyan,
  },
  advancedText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  advancedPill: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '900',
  },
  advancedPillOpen: {
    color: colors.background,
    backgroundColor: colors.cyan,
  },
  pressed: {
    opacity: 0.72,
  },
});
