import { ComponentProps, memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MobileBlockQuickEditor } from '../MobileBlockQuickEditor';
import { MobilePlcExperience } from '../MobilePlcExperience';
import { MobileAdvancedDetails } from './MobileAdvancedDetails';
import { MobileWorkbenchHeader } from './MobileWorkbenchHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type MobileWorkbenchScreenProps = ComponentProps<typeof MobilePlcExperience>;

function hasAnyBlock(project: MobileWorkbenchScreenProps['editorProject']) {
  return project.rungs.some((rung) => rung.seriesBlocks.length > 0 || rung.parallelBlocks.length > 0 || (rung.parallelBranches ?? []).some((branch) => branch.blocks.length > 0) || Boolean(rung.coilBlock));
}

export const MobileWorkbenchScreen = memo(function MobileWorkbenchScreen(props: MobileWorkbenchScreenProps) {
  const hasRungs = props.editorProject.rungs.length > 0;
  const hasBlocks = hasAnyBlock(props.editorProject);
  const missionTitle = props.mission?.title ?? 'Bancada Ladder';

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

      {!hasRungs ? (
        <View style={styles.fallbackCard}>
          <Text style={styles.fallbackTitle}>Simulação pronta para começar</Text>
          <Text style={styles.fallbackText}>Nenhuma rung foi criada ainda. Adicione a primeira rung para visualizar Ladder e saída Q no mesmo painel.</Text>
          <Text onPress={props.onAddRung} style={styles.cta}>+ Adicionar rung</Text>
        </View>
      ) : null}

      <MobilePlcExperience {...props} />

      {hasRungs && !hasBlocks ? (
        <View style={styles.fallbackCard}>
          <Text style={styles.fallbackTitle}>Rung sem blocos</Text>
          <Text style={styles.fallbackText}>Adicione Contato, Bobina, Timer ou Contador para montar a primeira lógica executável.</Text>
          <View style={styles.ctaRow}>
            <Text onPress={props.onAddContact} style={styles.cta}>+ Contato</Text>
            <Text onPress={props.onAddCoil} style={styles.cta}>+ Bobina</Text>
            <Text onPress={props.onAddTimer} style={styles.cta}>+ Timer</Text>
            <Text onPress={props.onAddCounter} style={styles.cta}>+ Contador</Text>
          </View>
        </View>
      ) : null}

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
  fallbackCard: { borderWidth: 1, borderColor: colors.amber, backgroundColor: colors.amberSoft, borderRadius: 14, padding: spacing.md, gap: spacing.xs },
  fallbackTitle: { color: colors.amber, fontWeight: '900' },
  fallbackText: { color: colors.textMuted, fontSize: 12 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  cta: { color: colors.cyan, fontSize: 12, fontWeight: '900' },
});
