import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { createPlcProfileProjectView, PlcProfileId, PlcProfileRungView, plcProfiles } from '../plcProfiles/plcProfiles';
import { createSmartphoneProgramSummary } from '../simulation/smartphoneProgramView';
import { getSmartphoneViewScale, SmartphoneViewScaleId } from '../simulation/smartphoneViewScale';
import { SmartphoneViewScaleControl } from './SmartphoneViewScaleControl';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ProgramView = 'list' | 'flow';

type SmartphoneProgramPanelProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  selectedProfile: PlcProfileId;
  onSelectProfile: (profile: PlcProfileId) => void;
};

function normalizeVariable(value: string | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function isNumericLiteral(value: string | undefined): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.trim().replace(',', '.')));
}

function blockValue(plcState: PlcState, operand: string | undefined): boolean {
  const variable = normalizeVariable(operand);
  if (!variable || isNumericLiteral(variable)) return false;
  const value = plcState[variable];
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

function selectedRungMetrics(rung?: PlcProfileRungView): { conditionCount: number; parallelBranchCount: number } {
  if (!rung) return { conditionCount: 0, parallelBranchCount: 0 };
  return {
    conditionCount: rung.series.length + rung.parallelBranches.reduce((sum, branch) => sum + branch.length, 0),
    parallelBranchCount: rung.parallelBranches.length,
  };
}

export const SmartphoneProgramPanel = memo(function SmartphoneProgramPanel({
  editorProject,
  plcState,
  evaluation,
  selectedProfile,
  onSelectProfile,
}: SmartphoneProgramPanelProps) {
  const [programView, setProgramView] = useState<ProgramView>('list');
  const [viewScale, setViewScale] = useState<SmartphoneViewScaleId>('fit');
  const [focusedRungId, setFocusedRungId] = useState<string | null>(null);
  const selectedRungId = editorProject.selectedRungId ?? editorProject.rungs[0]?.id;
  const profileView = useMemo(() => createPlcProfileProjectView(editorProject, selectedProfile), [editorProject, selectedProfile]);
  const programSummary = useMemo(
    () => createSmartphoneProgramSummary(profileView, evaluation.rungResults, selectedRungId, focusedRungId, programView),
    [evaluation.rungResults, focusedRungId, profileView, programView, selectedRungId],
  );
  const focusedRung = profileView.rungs.find((rung) => rung.rungId === (focusedRungId ?? selectedRungId)) ?? profileView.rungs[0];
  const metrics = selectedRungMetrics(focusedRung);
  const scale = getSmartphoneViewScale(viewScale);

  return (
    <View style={styles.card}>
      <View style={styles.headerBox}>
        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Dialeto</Text>
            <Text style={styles.metaValue}>{programSummary.dialectShortName}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Ativas</Text>
            <Text style={styles.metaValue}>{programSummary.activeCount}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Visual</Text>
            <Text style={styles.metaValue}>{scale.label}</Text>
          </View>
        </View>
        <Text style={styles.disclaimer}>{programSummary.disclaimer}</Text>
      </View>

      <SmartphoneViewScaleControl
        value={viewScale}
        conditionCount={metrics.conditionCount}
        parallelBranchCount={metrics.parallelBranchCount}
        onChange={setViewScale}
      />

      <View style={styles.selectorRow}>
        {plcProfiles.map((profile) => {
          const selected = profile.id === selectedProfile;
          return (
            <Pressable key={profile.id} onPress={() => onSelectProfile(profile.id)} style={[styles.selectorButton, selected && styles.selectorButtonActive]}>
              <Text style={[styles.selectorText, selected && styles.selectorTextActive]}>{profile.shortName}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.selectorRow}>
        {(['list', 'flow'] as ProgramView[]).map((view) => {
          const selected = programView === view;
          return (
            <Pressable key={view} onPress={() => setProgramView(view)} style={[styles.selectorButton, selected && styles.selectorButtonActive]}>
              <Text style={[styles.selectorText, selected && styles.selectorTextActive]}>{view === 'list' ? 'Lista' : 'Fluxo'}</Text>
            </Pressable>
          );
        })}
      </View>

      {programView === 'list' ? (
        <View style={styles.lineList}>
          {programSummary.lines.map((line) => (
            <Pressable
              key={line.rungId}
              onPress={() => setFocusedRungId(line.rungId)}
              style={[styles.lineCard, line.active && styles.lineCardActive, line.focused && styles.lineCardFocused]}
            >
              <View style={[styles.lineMarker, line.active && styles.lineMarkerActive]} />
              <View style={styles.lineTextBox}>
                <Text style={[styles.lineText, line.active && styles.lineTextActive]}>{line.text}</Text>
                <Text style={styles.explanation}>{line.explanation}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.lineList}>
          {profileView.rungs.map((rung, index) => {
            const line = programSummary.lines.find((item) => item.rungId === rung.rungId);
            const outputOn = blockValue(plcState, rung.output?.operand);
            return (
              <Pressable
                key={rung.rungId}
                onPress={() => setFocusedRungId(rung.rungId)}
                style={[styles.flowCard, Boolean(evaluation.rungResults[rung.rungId]) && styles.flowCardActive]}
              >
                <View style={styles.flowHeader}>
                  <View style={styles.flowHeaderText}>
                    <Text style={styles.flowLabel}>Linha {index + 1}</Text>
                    <Text style={styles.flowTitle} numberOfLines={1}>{rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
                  </View>
                  <Text style={[styles.flowState, evaluation.rungResults[rung.rungId] && styles.flowStateOn]}>{evaluation.rungResults[rung.rungId] ? 'TRUE' : 'FALSE'}</Text>
                </View>

                <View style={[styles.outputSummary, outputOn && styles.outputSummaryOn]}>
                  <View style={styles.outputTextBox}>
                    <Text style={styles.outputLabel}>Carga/saída fixa</Text>
                    <Text style={[styles.outputValue, outputOn && styles.outputValueOn]} numberOfLines={1}>{rung.output ? `${rung.output.instruction}(${rung.output.operand})` : 'Sem saída definida'}</Text>
                  </View>
                  <Text style={[styles.outputState, outputOn && styles.outputStateOn]}>{outputOn ? 'ON' : 'OFF'}</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={[styles.flowScroll, { minWidth: scale.minPathWidth }]}>
                  <View style={styles.flowPath}>
                    {rung.series.map((block) => {
                      const active = blockValue(plcState, block.operand);
                      return (
                        <View key={block.blockId} style={[styles.blockCard, { width: scale.blockWidth }, active && styles.blockCardActive]}>
                          <Text style={[styles.blockInstruction, active && styles.blockInstructionActive]}>{block.instruction}</Text>
                          <Text style={styles.blockOperand} numberOfLines={1}>{block.operand}</Text>
                          <Text style={styles.blockDescription} numberOfLines={1}>{block.label || block.description}</Text>
                        </View>
                      );
                    })}
                    {rung.output ? (
                      <View style={[styles.blockCard, styles.blockOutput, { width: scale.blockWidth }, outputOn && styles.blockCardActive]}>
                        <Text style={[styles.blockInstruction, outputOn && styles.blockInstructionActive]}>{rung.output.instruction}</Text>
                        <Text style={styles.blockOperand} numberOfLines={1}>{rung.output.operand}</Text>
                        <Text style={styles.blockDescription} numberOfLines={1}>Saída</Text>
                      </View>
                    ) : null}
                  </View>
                </ScrollView>

                <Text style={styles.explanation}>{line?.explanation ?? 'Linha sem explicação disponível.'}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  headerBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaCard: {
    flex: 1,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.black,
  },
  metaLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  selectorButton: {
    flexGrow: 1,
    minWidth: 72,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  selectorButtonActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  selectorText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  selectorTextActive: {
    color: colors.amber,
  },
  lineList: {
    gap: spacing.xs,
  },
  lineCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.black,
  },
  lineCardActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  lineCardFocused: {
    borderColor: colors.amber,
    borderWidth: 2,
  },
  lineMarker: {
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  lineMarkerActive: {
    backgroundColor: colors.green,
  },
  lineTextBox: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  lineText: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15,
  },
  lineTextActive: {
    color: colors.text,
  },
  explanation: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  flowCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  flowCardActive: {
    borderColor: colors.green,
  },
  flowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'center',
  },
  flowHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  flowLabel: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  flowTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  flowState: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '900',
  },
  flowStateOn: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.goldSoft,
  },
  outputSummaryOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  outputTextBox: {
    flex: 1,
    minWidth: 0,
  },
  outputLabel: {
    color: colors.amber,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  outputValue: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  outputValueOn: {
    color: colors.green,
  },
  outputState: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
  },
  outputStateOn: {
    color: colors.green,
  },
  flowScroll: {
    paddingVertical: spacing.xs,
  },
  flowPath: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  blockCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.black,
  },
  blockCardActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  blockOutput: {
    borderColor: colors.amber,
  },
  blockInstruction: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  blockInstructionActive: {
    color: colors.green,
  },
  blockOperand: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  blockDescription: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
