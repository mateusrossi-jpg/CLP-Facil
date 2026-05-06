import { ComponentProps, memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MobileBlockQuickEditor } from '../MobileBlockQuickEditor';
import { MobilePlcExperience } from '../MobilePlcExperience';
import { MobileAdvancedDetails } from './MobileAdvancedDetails';
import { MobileEnergyFlow } from './MobileEnergyFlow';
import { MobileIdeToolDock } from './MobileIdeToolDock';
import { MobileLiveBlockStrip } from './MobileLiveBlockStrip';
import { MobilePowerLadderPreview } from './MobilePowerLadderPreview';
import { MobileRuntimeHud } from './MobileRuntimeHud';
import { MobileWorkbenchHeader } from './MobileWorkbenchHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type MobileWorkbenchScreenProps = ComponentProps<typeof MobilePlcExperience>;

function hasAnyBlock(project: MobileWorkbenchScreenProps['editorProject']) {
  return project.rungs.some((rung) => rung.seriesBlocks.length > 0 || rung.parallelBlocks.length > 0 || (rung.parallelBranches ?? []).some((branch) => branch.blocks.length > 0) || Boolean(rung.coilBlock));
}

function MobileEmptyLogicState({
  hasRungs,
  onAddRung,
  onAddContact,
  onAddCoil,
  onAddTimer,
  onAddCounter,
}: {
  hasRungs: boolean;
  onAddRung?: () => void;
  onAddContact?: () => void;
  onAddCoil?: () => void;
  onAddTimer?: () => void;
  onAddCounter?: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyEyebrow}>Primeira lógica</Text>
      <Text style={styles.emptyTitle}>Nenhuma lógica criada ainda</Text>
      <Text style={styles.emptyText}>Monte a primeira lógica e rode Scan. O fluxo aparece no mesmo lugar: entradas I/O → Ladder → saída Q.</Text>
      <View style={styles.ctaRow}>
        <Text onPress={onAddRung} style={styles.primaryCta}>+ Adicionar rung</Text>
        <Text onPress={onAddContact} style={[styles.cta, !hasRungs && styles.ctaDisabled]}>+ Adicionar Contato</Text>
        <Text onPress={onAddCoil} style={[styles.cta, !hasRungs && styles.ctaDisabled]}>+ Bobina</Text>
        <Text onPress={onAddTimer} style={[styles.cta, !hasRungs && styles.ctaDisabled]}>+ Timer</Text>
        <Text onPress={onAddCounter} style={[styles.cta, !hasRungs && styles.ctaDisabled]}>+ Contador</Text>
      </View>
    </View>
  );
}

export const MobileWorkbenchScreen = memo(function MobileWorkbenchScreen(props: MobileWorkbenchScreenProps) {
  const hasRungs = props.editorProject.rungs.length > 0;
  const hasBlocks = hasAnyBlock(props.editorProject);
  const showEmptyState = !hasRungs || !hasBlocks;
  const missionTitle = props.mission?.title ?? 'PLC Simulator';

  return (
    <View style={styles.stack}>
      <MobileWorkbenchHeader
        title={missionTitle}
        mode={props.mode}
        autoScan={props.autoScan}
        onChangeMode={props.onChangeMode}
        onToggleAutoScan={props.onToggleAutoScan}
        onRunScan={props.onRunScan}
      />

      <MobileRuntimeHud
        editorProject={props.editorProject}
        plcState={props.plcState}
        evaluation={props.evaluation}
        mode={props.mode}
        autoScan={props.autoScan}
      />

      <MobileEnergyFlow
        editorProject={props.editorProject}
        plcState={props.plcState}
        evaluation={props.evaluation}
      />

      {!showEmptyState ? (
        <>
          <MobilePowerLadderPreview
            editorProject={props.editorProject}
            plcState={props.plcState}
            evaluation={props.evaluation}
          />

          <MobileLiveBlockStrip
            editorProject={props.editorProject}
            plcState={props.plcState}
            evaluation={props.evaluation}
          />
        </>
      ) : null}

      {showEmptyState ? (
        <MobileEmptyLogicState
          hasRungs={hasRungs}
          onAddRung={props.onAddRung}
          onAddContact={props.onAddContact}
          onAddCoil={props.onAddCoil}
          onAddTimer={props.onAddTimer}
          onAddCounter={props.onAddCounter}
        />
      ) : null}

      <MobilePlcExperience {...props} />

      <MobileIdeToolDock
        mode={props.mode}
        onAddContact={props.onAddContact}
        onAddCoil={props.onAddCoil}
        onAddTimer={props.onAddTimer}
        onAddCounter={props.onAddCounter}
        onAddBranch={props.onAddParallelBranch}
        onRemoveBlock={props.onDeleteBlock}
        onRemoveRung={props.onDeleteRung}
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

      <MobileAdvancedDetails diagnosticsCount={props.evaluation.diagnostics.length} />
    </View>
  );
});

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.xs,
  },
  emptyEyebrow: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  primaryCta: {
    color: colors.background,
    backgroundColor: colors.cyan,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '900',
  },
  cta: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '900',
  },
  ctaDisabled: {
    opacity: 0.45,
  },
});
