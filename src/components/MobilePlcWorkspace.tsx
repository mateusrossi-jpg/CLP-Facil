import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorBlock, EditorCoilMode, EditorContactMode, EditorCounterMode, EditorProjectState, EditorTimerMode } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { PlcMission } from '../lessons/missionTypes';
import { evaluateMissionAttempt } from '../lessons/missionValidation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { MobileIoDock } from './MobileIoDock';
import { MobileRungViewer } from './MobileRungViewer';
import { MobileSimulationControls } from './MobileSimulationControls';

type MobilePlcWorkspaceProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  autoScan?: boolean;
  mission?: PlcMission;
  missionTitle?: string;
  onSetValue?: (variable: string, value: boolean | number) => void;
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
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

function cycleStatus(evaluation: EditorEvaluationResult): string {
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  if (diagnostics > 0) return `${diagnostics} alerta(s)`;
  return `${evaluation.runtime?.scanStepMs ?? 100} ms`;
}

function activeOutputCount(state: PlcState): number {
  return Object.entries(state).filter(([address, value]) => {
    const normalized = address.trim().toUpperCase();
    const active = typeof value === 'number' ? value !== 0 : Boolean(value);
    return (normalized.startsWith('Q') || normalized.startsWith('O')) && active;
  }).length;
}

function blockMode(block: EditorBlock): string {
  return block.contactMode ?? block.coilMode ?? block.timerMode ?? block.counterMode ?? block.role;
}

function projectBlocks(project: EditorProjectState): EditorBlock[] {
  return project.rungs.flatMap((rung) => [
    ...rung.seriesBlocks,
    ...rung.parallelBlocks,
    ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
    ...(rung.coilBlock ? [rung.coilBlock] : []),
  ]);
}

function normalizeVariableInput(value: string): string {
  return value.toUpperCase().replace(/\s/g, '');
}

export const MobilePlcWorkspace = memo(function MobilePlcWorkspace({
  editorProject,
  plcState,
  evaluation,
  autoScan = false,
  mission,
  missionTitle = 'Bancada guiada',
  onSetValue = noop,
  onRunScan = noop,
  onToggleAutoScan = noop,
  onSelectBlockId,
  onChangeBlockVariable,
  onChangeBlockName,
  onChangeContactMode,
  onChangeCoilMode,
  onChangeTimerMode,
  onChangeCounterMode,
  onChangePresetMs,
  onChangePreset,
  onAddContact,
  onAddCoil,
  onAddTimer,
  onAddBranch,
  onAdvanceMission,
}: MobilePlcWorkspaceProps) {
  const [rungIndex, setRungIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const selectedBlock = useMemo(
    () => projectBlocks(editorProject).find((block) => block.id === selectedBlockId) ?? null,
    [editorProject, selectedBlockId],
  );
  const activeOutputs = useMemo(() => activeOutputCount(plcState), [plcState]);
  const missionAttempt = useMemo(
    () => mission ? evaluateMissionAttempt(mission, plcState, evaluation) : null,
    [evaluation, mission, plcState],
  );
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const missionPassed = Boolean(missionAttempt?.passed);
  const shouldShowMissionStory = Boolean(mission && !missionPassed && missionAttempt?.feedback && missionAttempt.feedback !== mission.story);
  const visibleMissionComponents = mission?.availableComponents.slice(0, 5) ?? [];

  return (
    <View style={styles.workspace}>
      <View style={styles.topBar}>
        <View style={styles.topCopy}>
          <Text style={styles.eyebrow}>Missao</Text>
          <Text style={styles.title}>{missionTitle}</Text>
        </View>
        <View style={styles.statusCluster}>
          <View style={[styles.statusPill, activeOutputs > 0 && styles.runPill]}>
            <Text style={[styles.statusText, activeOutputs > 0 && styles.runText]}>{activeOutputs > 0 ? 'RUN' : 'STOP'}</Text>
          </View>
          <View style={[styles.statusPill, autoScan && styles.autoPill]}>
            <Text style={[styles.statusText, autoScan && styles.autoText]}>{autoScan ? 'Auto' : 'Manual'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.scanRow}>
        <Text style={styles.scanText}>Scan #{evaluation.scanNumber || 0}</Text>
        <Text style={[styles.scanText, diagnostics > 0 && styles.warningText]}>{cycleStatus(evaluation)}</Text>
      </View>

      {mission ? (
        <View style={[styles.missionBox, missionPassed && styles.missionBoxDone]}>
          <View style={styles.missionHeader}>
            <View style={styles.missionCopy}>
              <Text style={styles.missionLabel}>Objetivo</Text>
              <Text style={styles.missionObjective}>{mission.objective}</Text>
            </View>
            <View style={[styles.missionProgressPill, missionPassed && styles.missionProgressPillDone]}>
              <Text style={[styles.missionProgressText, missionPassed && styles.missionProgressTextDone]}>
                {missionAttempt?.passedRules ?? 0}/{missionAttempt?.totalRules ?? mission.validation.length}
              </Text>
            </View>
          </View>
          <Text style={[styles.missionFeedback, missionPassed && styles.missionFeedbackDone]}>
            {missionAttempt?.feedback ?? mission.story}
          </Text>
          {showHint ? (
            <>
              {shouldShowMissionStory && mission ? (
                <Text style={styles.missionStory}>{mission.story}</Text>
              ) : null}
              {visibleMissionComponents.length > 0 ? (
                <View style={styles.componentBox}>
                  <Text style={styles.componentLabel}>Componentes</Text>
                  <View style={styles.componentRail}>
                    {visibleMissionComponents.map((component) => (
                      <Text key={component} style={styles.componentChip}>{component}</Text>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
          {!showHint ? (
            <Pressable onPress={() => setShowHint(true)} style={({ pressed }) => [styles.inlineDetailsButton, pressed && styles.pressed]}>
              <Text style={styles.inlineDetailsText}>Ver explicacao</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setShowHint(false)} style={({ pressed }) => [styles.inlineDetailsButton, pressed && styles.pressed]}>
              <Text style={styles.inlineDetailsText}>Ocultar resumo</Text>
            </Pressable>
          )}
          {missionPassed && onAdvanceMission ? (
            <Pressable onPress={onAdvanceMission} style={({ pressed }) => [styles.nextMissionButton, pressed && styles.pressed]}>
              <Text style={styles.nextMissionText}>Proxima missão</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <MobileIoDock editorProject={editorProject} plcState={plcState} onSetValue={onSetValue} />

      <MobileRungViewer
        editorProject={editorProject}
        plcState={plcState}
        evaluation={evaluation}
        rungIndex={rungIndex}
        onSelectRungIndex={setRungIndex}
        onSelectBlock={(block) => {
          setSelectedBlockId(block.id);
          onSelectBlockId?.(block.id);
        }}
      />

      {showHint && !mission ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>{diagnostics > 0 ? 'Revise antes de avancar' : 'Dica rapida'}</Text>
          <Text style={styles.hintText}>{diagnostics > 0 ? evaluation.diagnostics[0]?.message : evaluation.explanation || 'Acione uma entrada, execute Scan e observe se o rung conduz ate a saida.'}</Text>
        </View>
      ) : null}

      {editing ? (
        <View style={styles.editorSheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetCopy}>
              <Text style={styles.eyebrow}>Editor simples</Text>
              <Text style={styles.sheetTitle}>{selectedBlock ? selectedBlock.name : 'Escolha um componente'}</Text>
            </View>
            <Pressable
              onPress={() => setEditing(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>
          {selectedBlock ? (
            <View style={styles.editorFields}>
              <View style={styles.fieldGrid}>
                <Text style={styles.fieldText}>Tipo: {selectedBlock.role}</Text>
                <Text style={styles.fieldText}>Modo: {blockMode(selectedBlock)}</Text>
              </View>

              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                value={selectedBlock.name}
                onChangeText={(value) => onChangeBlockName?.(value)}
                placeholder="Nome do componente"
                placeholderTextColor={colors.textDim}
                style={styles.editorInput}
              />

              <Text style={styles.inputLabel}>Endereco / tag</Text>
              <TextInput
                value={selectedBlock.variable || selectedBlock.destination || ''}
                onChangeText={(value) => onChangeBlockVariable?.(normalizeVariableInput(value))}
                placeholder="I0.0, Q0.0, M0.0, T0 ou C0"
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.editorInput}
              />

              {selectedBlock.role === 'contact' ? (
                <>
                  <Text style={styles.inputLabel}>Contato</Text>
                  <View style={styles.paletteRow}>
                    {([
                      ['NO', 'NA'],
                      ['NC', 'NF'],
                      ['RISING', 'Pulso ↑'],
                      ['FALLING', 'Pulso ↓'],
                    ] as [EditorContactMode, string][]).map(([mode, label]) => (
                      <Pressable
                        key={mode}
                        onPress={() => onChangeContactMode?.(mode)}
                        style={[styles.paletteChip, selectedBlock.contactMode === mode && styles.paletteChipOn]}
                      >
                        <Text style={[styles.paletteText, selectedBlock.contactMode === mode && styles.paletteTextOn]}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {selectedBlock.role === 'coil' ? (
                <>
                  <Text style={styles.inputLabel}>Bobina</Text>
                  <View style={styles.paletteRow}>
                    {(['NORMAL', 'SET', 'RESET', 'PULSE'] as EditorCoilMode[]).map((mode) => (
                      <Pressable key={mode} onPress={() => onChangeCoilMode?.(mode)} style={[styles.paletteChip, selectedBlock.coilMode === mode && styles.paletteChipOn]}>
                        <Text style={[styles.paletteText, selectedBlock.coilMode === mode && styles.paletteTextOn]}>{mode}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {selectedBlock.role === 'timer' ? (
                <>
                  <Text style={styles.inputLabel}>Temporizador</Text>
                  <View style={styles.paletteRow}>
                    {(['TON', 'TOF', 'TP'] as EditorTimerMode[]).map((mode) => (
                      <Pressable key={mode} onPress={() => onChangeTimerMode?.(mode)} style={[styles.paletteChip, selectedBlock.timerMode === mode && styles.paletteChipOn]}>
                        <Text style={[styles.paletteText, selectedBlock.timerMode === mode && styles.paletteTextOn]}>{mode}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={String(selectedBlock.presetMs ?? '')}
                    onChangeText={(value) => onChangePresetMs?.(Number(value.replace(/\D/g, '')) || 0)}
                    placeholder="Preset em ms"
                    placeholderTextColor={colors.textDim}
                    keyboardType="numeric"
                    style={styles.editorInput}
                  />
                </>
              ) : null}

              {selectedBlock.role === 'counter' ? (
                <>
                  <Text style={styles.inputLabel}>Contador</Text>
                  <View style={styles.paletteRow}>
                    {(['CTU', 'CTD', 'CTUD'] as EditorCounterMode[]).map((mode) => (
                      <Pressable key={mode} onPress={() => onChangeCounterMode?.(mode)} style={[styles.paletteChip, selectedBlock.counterMode === mode && styles.paletteChipOn]}>
                        <Text style={[styles.paletteText, selectedBlock.counterMode === mode && styles.paletteTextOn]}>{mode}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={String(selectedBlock.preset ?? '')}
                    onChangeText={(value) => onChangePreset?.(Number(value.replace(/\D/g, '')) || 0)}
                    placeholder="Preset de contagem"
                    placeholderTextColor={colors.textDim}
                    keyboardType="numeric"
                    style={styles.editorInput}
                  />
                </>
              ) : null}
            </View>
          ) : (
            <Text style={styles.hintText}>Toque em contato, bobina, timer ou contador para editar.</Text>
          )}
          <View style={styles.paletteRow}>
            {[
              { label: '+ Contato', action: onAddContact },
              { label: '+ Bobina', action: onAddCoil },
              { label: '+ Timer', action: onAddTimer },
              { label: '+ Branch', action: onAddBranch },
            ].map((item) => (
              <Pressable
                key={item.label}
                disabled={!item.action}
                onPress={item.action}
                style={({ pressed }) => [styles.paletteChip, item.action && styles.paletteChipAction, !item.action && styles.disabledChip, pressed && item.action && styles.pressed]}
              >
                <Text style={[styles.paletteText, item.action && styles.paletteTextAction]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <MobileSimulationControls
        autoScan={autoScan}
        editing={editing}
        onRunScan={onRunScan}
        onToggleAutoScan={onToggleAutoScan}
        onToggleEdit={() => setEditing((current) => !current)}
        onToggleHint={() => setShowHint((current) => !current)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  workspace: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  topCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  statusCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 4,
  },
  statusPill: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  runPill: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  autoPill: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  runText: {
    color: colors.green,
  },
  autoText: {
    color: colors.cyan,
  },
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  scanText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  warningText: {
    color: colors.amber,
  },
  missionBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  missionBoxDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  missionCopy: {
    flex: 1,
    minWidth: 0,
  },
  missionLabel: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  missionObjective: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  missionProgressPill: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surfaceElevated,
  },
  missionProgressPillDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  missionProgressText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  missionProgressTextDone: {
    color: colors.green,
  },
  missionFeedback: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  missionFeedbackDone: {
    color: colors.text,
  },
  missionStory: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  componentRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  componentBox: {
    gap: 4,
  },
  componentLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  componentChip: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  inlineDetailsButton: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  inlineDetailsText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  nextMissionButton: {
    minHeight: 38,
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  nextMissionText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  hintBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.amberSoft,
    padding: spacing.sm,
    gap: 3,
  },
  hintTitle: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  hintText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  editorSheet: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sheetCopy: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 2,
  },
  closeButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  editorFields: {
    gap: spacing.xs,
  },
  fieldText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  editorInput: {
    minHeight: 42,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  paletteChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  paletteChipOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  paletteChipAction: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  disabledChip: {
    opacity: 0.55,
  },
  paletteText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  paletteTextOn: {
    color: colors.cyan,
  },
  paletteTextAction: {
    color: colors.cyan,
  },
  pressed: {
    opacity: 0.72,
  },
});
