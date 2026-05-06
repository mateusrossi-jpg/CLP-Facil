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
      <MobilePlcExperience
        editorProject={props.editorProject}
        plcState={props.plcState}
        evaluation={props.evaluation}
        autoScan={props.autoScan}
        mode={props.mode}
        mission={activeMission}
        missionTitle={activeMission?.title ?? 'Simulação livre'}
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
            {advancedOpen ? 'Ocultar avançado' : 'Avançado'}
          </Text>
          <Text style={styles.advancedText}>Diagnósticos, CPU, scan, memória, force, relatório e painel compacto antigo ficam aqui.</Text>
        </View>
        <Text style={[styles.advancedPill, advancedOpen && styles.advancedPillOpen]}>{advancedOpen ? 'Fechar' : 'Abrir'}</Text>
      </Pressable>

      {advancedOpen ? (
        <SmartphoneSimulationPanelEnhanced {...props} showAdvancedDiagnostics />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
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
