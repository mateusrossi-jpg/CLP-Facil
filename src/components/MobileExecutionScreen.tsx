import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { createInitialEditorProject, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { createInitialRuntimeState } from '../engine/runtimeTypes';
import { createPlcProfileProjectView, PlcProfileId } from '../plcProfiles/plcProfiles';
import { createProfessionalTagRows, ProfessionalTagRow } from '../simulation/professionalClpView';
import { createSmartphoneProgramSummary } from '../simulation/smartphoneProgramView';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type IoTab = 'inputs' | 'outputs' | 'memories' | 'timers' | 'counters';
type ProgramMode = 'list' | 'flow' | 'compact_rung';

type MobileExecutionScreenProps = {
  editorProject?: EditorProjectState;
  plcState?: PlcState;
  evaluation?: EditorEvaluationResult;
  selectedProfile?: PlcProfileId;
  isRunning?: boolean;
  isAutoScan?: boolean;
  scanCount?: number;
  lastScanMs?: number;
};

type IoSection = {
  key: IoTab;
  label: string;
  rows: ProfessionalTagRow[];
};

function makeFallbackState(project: EditorProjectState): PlcState {
  const state: PlcState = {};
  for (const variable of project.projectVariables ?? []) {
    state[(variable.address || variable.id).toUpperCase()] = variable.dataType === 'number' ? 0 : false;
  }
  return state;
}

function fallbackEvaluation(project: EditorProjectState, state: PlcState): EditorEvaluationResult {
  return {
    state,
    rungResults: Object.fromEntries(project.rungs.map((rung) => [rung.id, false])),
    diagnostics: [],
    runtime: createInitialRuntimeState(),
    scanNumber: 0,
    explanation: 'Simulação mobile pronta para execução.',
  };
}

function normalizeStateValue(value: boolean | number): boolean {
  if (typeof value === 'number') return value !== 0;
  return value;
}

function splitIoSections(rows: ProfessionalTagRow[]): IoSection[] {
  return [
    { key: 'inputs', label: 'Entradas', rows: rows.filter((row) => row.scope === 'input') },
    { key: 'outputs', label: 'Saídas', rows: rows.filter((row) => row.scope === 'output') },
    { key: 'memories', label: 'Memórias', rows: rows.filter((row) => row.scope === 'memory' && row.type === 'boolean') },
    { key: 'timers', label: 'Timers', rows: rows.filter((row) => row.type === 'timer') },
    { key: 'counters', label: 'Contadores', rows: rows.filter((row) => row.type === 'counter') },
  ];
}

function activeCount(rows: ProfessionalTagRow[]): number {
  return rows.filter((row) => normalizeStateValue(row.value)).length;
}

function compactInstructionText(text: string): string {
  return text
    .replace(/\s*→\s*/g, '  |  ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const MobileExecutionScreen = memo(function MobileExecutionScreen({
  editorProject,
  plcState,
  evaluation,
  selectedProfile = 'easy_clp',
  isRunning = true,
  isAutoScan = true,
  scanCount = 124,
  lastScanMs = 12,
}: MobileExecutionScreenProps) {
  const fallbackProject = useMemo(() => createInitialEditorProject(), []);
  const project = editorProject ?? fallbackProject;
  const state = plcState ?? makeFallbackState(project);
  const result = evaluation ?? fallbackEvaluation(project, state);
  const [activeIoTab, setActiveIoTab] = useState<IoTab>('inputs');
  const [programMode, setProgramMode] = useState<ProgramMode>('compact_rung');
  const [focusedRungId, setFocusedRungId] = useState<string | null>(null);

  const profileView = useMemo(() => createPlcProfileProjectView(project, selectedProfile), [project, selectedProfile]);
  const tagRows = useMemo(() => createProfessionalTagRows(project, state), [project, state]);
  const ioSections = useMemo(() => splitIoSections(tagRows), [tagRows]);
  const selectedSection = ioSections.find((section) => section.key === activeIoTab) ?? ioSections[0];
  const selectedRungId = focusedRungId ?? project.selectedRungId ?? project.rungs[0]?.id ?? null;
  const programSummary = useMemo(
    () => createSmartphoneProgramSummary(profileView, result.rungResults, project.selectedRungId ?? project.rungs[0]?.id, focusedRungId, programMode === 'flow' ? 'flow' : 'list'),
    [focusedRungId, profileView, programMode, project.rungs, project.selectedRungId, result.rungResults],
  );
  const activeLine = programSummary.lines.find((line) => line.active) ?? programSummary.lines[0];
  const activeOutput = tagRows.find((row) => row.scope === 'output' && normalizeStateValue(row.value));

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.brandBox}>
          <Text style={styles.logoMark}>⌁</Text>
          <Text style={styles.brand}>Easy-PLC</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={[styles.statusChip, isRunning && styles.runChip]}>{isRunning ? 'RUN' : 'STOP'}</Text>
          <Text style={[styles.statusChip, isAutoScan && styles.autoChip]}>{isAutoScan ? 'AUTO' : 'MANUAL'}</Text>
          <Text style={styles.statusChip}>SCAN {scanCount}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ioTabRow}>
        {ioSections.map((section) => {
          const selected = activeIoTab === section.key;
          return (
            <Pressable key={section.key} onPress={() => setActiveIoTab(section.key)} style={[styles.ioTab, selected && styles.ioTabActive]}>
              <Text style={[styles.ioTabLabel, selected && styles.ioTabLabelActive]}>{section.label}</Text>
              <Text style={styles.ioTabMeta}>{activeCount(section.rows)}/{section.rows.length} ativas</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.ioPanel}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{selectedSection.label}</Text>
          <Text style={styles.sectionMeta}>{activeCount(selectedSection.rows)}/{selectedSection.rows.length} ativas</Text>
        </View>
        <View style={styles.ioGrid}>
          {selectedSection.rows.slice(0, 8).map((row) => {
            const active = normalizeStateValue(row.value);
            return (
              <View key={`${selectedSection.key}-${row.tag}`} style={[styles.ioRow, active && styles.ioRowActive]}>
                <View style={styles.ioTextBox}>
                  <Text style={[styles.ioTag, active && styles.ioTagActive]}>{row.tag}</Text>
                  <Text style={styles.ioDescription} numberOfLines={1}>{row.description}</Text>
                </View>
                <View style={styles.ioStateBox}>
                  <View style={[styles.stateDot, active && styles.stateDotActive]} />
                  <Text style={[styles.ioState, active && styles.ioStateActive]}>{active ? 'ON' : 'OFF'}</Text>
                </View>
              </View>
            );
          })}
          {selectedSection.rows.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma tag disponível nesta seção.</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.quickGrid}>
        {ioSections.slice(2).map((section) => (
          <Pressable key={`quick-${section.key}`} onPress={() => setActiveIoTab(section.key)} style={styles.quickCard}>
            <View style={styles.quickHeader}>
              <Text style={styles.quickTitle}>{section.label}</Text>
              <Text style={styles.quickMeta}>{activeCount(section.rows)}/{section.rows.length}</Text>
            </View>
            {section.rows.slice(0, 3).map((row) => {
              const active = normalizeStateValue(row.value);
              return (
                <View key={`quick-${section.key}-${row.tag}`} style={styles.quickRow}>
                  <Text style={[styles.quickTag, active && styles.quickTagActive]}>{row.tag}</Text>
                  <Text style={styles.quickValue}>{typeof row.value === 'number' ? row.value : active ? 'ON' : 'OFF'}</Text>
                </View>
              );
            })}
          </Pressable>
        ))}
      </View>

      <View style={styles.modeSelector}>
        {([
          ['list', 'Lista'],
          ['flow', 'Fluxo'],
          ['compact_rung', 'Rung compacto'],
        ] as [ProgramMode, string][]).map(([mode, label]) => {
          const selected = programMode === mode;
          return (
            <Pressable key={mode} onPress={() => setProgramMode(mode)} style={[styles.modeButton, selected && styles.modeButtonActive]}>
              <Text style={[styles.modeText, selected && styles.modeTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.programPanel}>
        {programMode === 'list' ? (
          <View style={styles.lineStack}>
            {programSummary.lines.map((line, index) => (
              <Pressable key={line.rungId} onPress={() => setFocusedRungId(line.rungId)} style={[styles.listLine, line.active && styles.listLineActive]}>
                <Text style={styles.lineNumber}>{index + 1}</Text>
                <View style={styles.lineBody}>
                  <Text style={[styles.lineText, line.active && styles.lineTextActive]} numberOfLines={1}>{compactInstructionText(line.text)}</Text>
                  <Text style={styles.lineExplanation} numberOfLines={1}>{line.explanation}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : programMode === 'flow' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.flowContent}>
            {profileView.rungs.map((rung, index) => {
              const active = Boolean(result.rungResults[rung.rungId]);
              return (
                <Pressable key={rung.rungId} onPress={() => setFocusedRungId(rung.rungId)} style={[styles.flowCard, active && styles.flowCardActive]}>
                  <Text style={styles.lineNumber}>Linha {index + 1}</Text>
                  <Text style={[styles.flowText, active && styles.lineTextActive]} numberOfLines={2}>{rung.textLine}</Text>
                  <Text style={styles.lineExplanation} numberOfLines={2}>{programSummary.lines.find((line) => line.rungId === rung.rungId)?.explanation}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.lineStack}>
            {profileView.rungs.map((rung, index) => {
              const active = Boolean(result.rungResults[rung.rungId]);
              const line = programSummary.lines.find((item) => item.rungId === rung.rungId);
              return (
                <Pressable key={rung.rungId} onPress={() => setFocusedRungId(rung.rungId)} style={[styles.compactRung, active && styles.compactRungActive, selectedRungId === rung.rungId && styles.compactRungFocused]}>
                  <Text style={styles.compactNumber}>{index + 1}</Text>
                  <View style={styles.compactLogicBox}>
                    <Text style={[styles.compactLogic, active && styles.lineTextActive]} numberOfLines={1}>{compactInstructionText(rung.textLine)}</Text>
                  </View>
                  <View style={styles.compactOutputBox}>
                    <Text style={[styles.compactOutput, active && styles.compactOutputOn]} numberOfLines={1}>{rung.output?.operand ?? '—'}</Text>
                    <Text style={styles.compactOutputLabel} numberOfLines={1}>{line?.explanation ?? 'Linha Ladder'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.footerPanel}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Linha ativa</Text>
          <Text style={styles.footerValue}>{activeLine ? programSummary.lines.indexOf(activeLine) + 1 : '—'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Saída</Text>
          <Text style={styles.footerValue}>{activeOutput ? `${activeOutput.tag} ON` : '—'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Último scan</Text>
          <Text style={styles.footerValue}>{lastScanMs} ms</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 22,
    padding: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoMark: {
    color: colors.cyan,
    fontSize: 22,
    fontWeight: '900',
  },
  brand: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'flex-end',
  },
  statusChip: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: colors.surface,
  },
  runChip: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  autoChip: {
    color: colors.cyan,
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  ioTabRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  ioTab: {
    width: 102,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  ioTabActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  ioTabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  ioTabLabelActive: {
    color: colors.cyan,
  },
  ioTabMeta: {
    color: colors.textDim,
    fontSize: 9,
    marginTop: 2,
  },
  ioPanel: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sectionMeta: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  ioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ioRow: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 0,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  ioRowActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  ioTextBox: {
    flex: 1,
    minWidth: 0,
  },
  ioTag: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  ioTagActive: {
    color: colors.green,
  },
  ioDescription: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  ioStateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.textDim,
  },
  stateDotActive: {
    backgroundColor: colors.green,
  },
  ioState: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  ioStateActive: {
    color: colors.green,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quickCard: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  quickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  quickTitle: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  quickMeta: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 4,
  },
  quickTag: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
  },
  quickTagActive: {
    color: colors.green,
  },
  quickValue: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  modeSelector: {
    flexDirection: 'row',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRightColor: colors.border,
    borderRightWidth: 1,
  },
  modeButtonActive: {
    backgroundColor: colors.cyanSoft,
    borderColor: colors.cyan,
  },
  modeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  modeTextActive: {
    color: colors.cyan,
  },
  programPanel: {
    gap: spacing.xs,
  },
  lineStack: {
    gap: spacing.xs,
  },
  listLine: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  listLineActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  lineNumber: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  lineBody: {
    flex: 1,
    minWidth: 0,
  },
  lineText: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
  },
  lineTextActive: {
    color: colors.green,
  },
  lineExplanation: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  flowContent: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  flowCard: {
    width: 230,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  flowCardActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  flowText: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
  },
  compactRung: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    minHeight: 50,
  },
  compactRungActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  compactRungFocused: {
    borderColor: colors.amber,
  },
  compactNumber: {
    width: 32,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: spacing.sm,
  },
  compactLogicBox: {
    flex: 1.4,
    minWidth: 0,
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  compactLogic: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '900',
  },
  compactOutputBox: {
    flex: 0.9,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  compactOutput: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
  },
  compactOutputOn: {
    color: colors.green,
  },
  compactOutputLabel: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  footerPanel: {
    flexDirection: 'row',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  footerItem: {
    flex: 1,
    padding: spacing.sm,
    borderRightColor: colors.border,
    borderRightWidth: 1,
  },
  footerLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  footerValue: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
