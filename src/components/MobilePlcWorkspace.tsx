import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorBlock, EditorProjectState } from '../engine/editorTypes';
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
}: MobilePlcWorkspaceProps) {
  const [rungIndex, setRungIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<EditorBlock | null>(null);
  const activeOutputs = useMemo(() => activeOutputCount(plcState), [plcState]);
  const missionAttempt = useMemo(
    () => mission ? evaluateMissionAttempt(mission, plcState, evaluation) : null,
    [evaluation, mission, plcState],
  );
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const missionPassed = Boolean(missionAttempt?.passed);

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
          setSelectedBlock(block);
          if (!editing) setEditing(true);
        }}
      />

      {showHint ? (
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
            <Pressable onPress={() => setEditing(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>
          {selectedBlock ? (
            <View style={styles.fieldGrid}>
              <Text style={styles.fieldText}>Tipo: {selectedBlock.role}</Text>
              <Text style={styles.fieldText}>Modo: {blockMode(selectedBlock)}</Text>
              <Text style={styles.fieldText}>Endereco: {selectedBlock.variable || selectedBlock.destination || '-'}</Text>
              <Text style={styles.fieldText}>Nome: {selectedBlock.name}</Text>
              {selectedBlock.presetMs !== undefined ? <Text style={styles.fieldText}>Preset: {selectedBlock.presetMs} ms</Text> : null}
              {selectedBlock.preset !== undefined ? <Text style={styles.fieldText}>Preset: {selectedBlock.preset}</Text> : null}
            </View>
          ) : (
            <Text style={styles.hintText}>Toque em contato, bobina, timer ou contador para editar. A conexao de escrita sera ligada ao editor completo na proxima etapa.</Text>
          )}
          <View style={styles.paletteRow}>
            {['+ Contato', '+ Bobina', '+ Timer', '+ Branch'].map((item) => (
              <View key={item} style={styles.paletteChip}>
                <Text style={styles.paletteText}>{item}</Text>
              </View>
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
    gap: 4,
  },
  fieldText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  paletteChip: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.cyanSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  paletteText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
});
