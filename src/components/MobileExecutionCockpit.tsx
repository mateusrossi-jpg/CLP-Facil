import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { createInitialEditorProject, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { createInitialRuntimeState } from '../engine/runtimeTypes';
import { createPlcProfileProjectView, PlcProfileId, PlcProfileRungView } from '../plcProfiles/plcProfiles';
import { createProfessionalTagRows, ProfessionalTagRow } from '../simulation/professionalClpView';
import { activeCount, IoSection, IoTab, isActiveValue, splitIoSections, valueLabel } from '../simulation/mobileExecutionWorkspace';
import { clearFocusedRungPreferences, loadFocusedRungPreferences, saveFocusedRungPreferences } from '../simulation/mobileFocusedRungStorage';
import { clearProgramModePreferences, loadProgramModePreferences, saveProgramModePreferences } from '../simulation/mobileProgramModeStorage';
import { compactText, outputText, rungTitle, visibleProgramLines } from '../simulation/mobileProgramWorkspace';
import { clearMobileRungZoomState } from '../simulation/mobileRungZoomStorage';
import { clampProgramMode, mobileSessionContextLabel, MobileFocusedRungPreferences, MobileProgramMode, MobileProgramModePreferences, persistFocusedRungForProject, persistProgramModeForProject, programModeLabel, recommendProgramMode, resolveFocusedRungId, restoreFocusedRungForProject, restoreProgramModeForProject, shouldShowProgramModeRecommendation } from '../simulation/mobileSimulationState';
import { createSmartphoneProgramSummary } from '../simulation/smartphoneProgramView';

type MobileExecutionCockpitProps = {
  editorProject?: EditorProjectState;
  plcState?: PlcState;
  evaluation?: EditorEvaluationResult;
  selectedProfile?: PlcProfileId;
  isRunning?: boolean;
  isAutoScan?: boolean;
  scanCount?: number;
  lastScanMs?: number;
};

const ui = {
  bg: '#020817',
  shell: '#050B16',
  card: '#07111F',
  card2: '#0B1220',
  card3: '#111827',
  line: '#1E293B',
  lineStrong: '#334155',
  text: '#F8FAFC',
  muted: '#94A3B8',
  dim: '#64748B',
  cyan: '#22D3EE',
  cyanSoft: 'rgba(34, 211, 238, 0.12)',
  cyanLine: 'rgba(34, 211, 238, 0.42)',
  green: '#22C55E',
  greenSoft: 'rgba(34, 197, 94, 0.14)',
  amber: '#F59E0B',
  amberSoft: 'rgba(245, 158, 11, 0.14)',
  red: '#FB7185',
};

function makeFallbackState(project: EditorProjectState): PlcState {
  const state: PlcState = {};
  for (const variable of project.projectVariables ?? []) {
    const address = (variable.address || variable.id).toUpperCase();
    state[address] = variable.dataType === 'number' ? 0 : false;
  }
  const firstInput = Object.keys(state).find((key) => key.startsWith('I')) ?? 'I0.0';
  const firstOutput = Object.keys(state).find((key) => key.startsWith('Q') || key.startsWith('O')) ?? 'Q0.0';
  state[firstInput] = true;
  state[firstOutput] = true;
  state.M0 = true;
  state.T1 = 120;
  state.C1 = 3;
  return state;
}

function fallbackEvaluation(project: EditorProjectState, state: PlcState): EditorEvaluationResult {
  const firstRung = project.rungs[0]?.id;
  return {
    state,
    rungResults: Object.fromEntries(project.rungs.map((rung) => [rung.id, rung.id === firstRung])),
    diagnostics: [],
    runtime: createInitialRuntimeState(),
    scanNumber: 0,
    explanation: 'Execução mobile pronta para simulação.',
  };
}

function UnifiedSignalRow({ row, tone }: { row: ProfessionalTagRow; tone: 'input' | 'output' }): JSX.Element {
  const active = isActiveValue(row.value);
  const isOutput = tone === 'output';
  return (
    <View style={[styles.unifiedSignalRow, active && (isOutput ? styles.unifiedOutputActive : styles.unifiedInputActive)]}>
      <View style={[styles.unifiedLed, active && (isOutput ? styles.unifiedLedOutputOn : styles.unifiedLedInputOn)]} />
      <View style={styles.unifiedSignalCopy}>
        <Text style={[styles.unifiedSignalTag, active && (isOutput ? styles.unifiedOutputText : styles.unifiedInputText)]}>{row.tag}</Text>
        <Text style={styles.unifiedSignalDesc} numberOfLines={1}>{row.description}</Text>
      </View>
      <Text style={[styles.unifiedSignalValue, active && (isOutput ? styles.unifiedOutputText : styles.unifiedInputText)]}>{valueLabel(row)}</Text>
    </View>
  );
}

export const MobileExecutionCockpit = memo(function MobileExecutionCockpit({
  editorProject,
  plcState,
  evaluation,
  selectedProfile = 'easy_clp',
  isRunning = true,
  isAutoScan = true,
  scanCount = 124,
  lastScanMs = 12,
}: MobileExecutionCockpitProps) {
  const fallbackProject = useMemo(() => createInitialEditorProject(), []);
  const project = editorProject ?? fallbackProject;
  const state = plcState ?? makeFallbackState(project);
  const result = evaluation ?? fallbackEvaluation(project, state);
  const [activeIoTab, setActiveIoTab] = useState<IoTab>('overview');
  const [programMode, setProgramMode] = useState<MobileProgramMode>('compact_rung');
  const [modeByProject, setModeByProject] = useState<MobileProgramModePreferences>(() => loadProgramModePreferences());
  const [focusedRungId, setFocusedRungId] = useState<string | null>(null);
  const [focusedRungByProject, setFocusedRungByProject] = useState<MobileFocusedRungPreferences>(() => loadFocusedRungPreferences());
  const [recommendationDismissed, setRecommendationDismissed] = useState(false);

  const profileView = useMemo(() => createPlcProfileProjectView(project, selectedProfile), [project, selectedProfile]);
  const tagRows = useMemo(() => createProfessionalTagRows(project, state), [project, state]);
  const ioSections = useMemo(() => splitIoSections(tagRows), [tagRows]);
  const selectedSection = ioSections.find((section) => section.key === activeIoTab) ?? ioSections[0];
  const inputRows = ioSections.find((section) => section.key === 'inputs')?.rows ?? [];
  const outputRows = ioSections.find((section) => section.key === 'outputs')?.rows ?? [];
  const memoryRows = ioSections.find((section) => section.key === 'memories')?.rows ?? [];
  const timerRows = ioSections.find((section) => section.key === 'timers')?.rows ?? [];
  const counterRows = ioSections.find((section) => section.key === 'counters')?.rows ?? [];
  const selectedRungId = resolveFocusedRungId(project, focusedRungId);
  const selectedRung = profileView.rungs.find((rung) => rung.rungId === selectedRungId) ?? profileView.rungs[0];
  const recommendedMode = recommendProgramMode(project.rungs.length);
  const showModeRecommendation = shouldShowProgramModeRecommendation(programMode, recommendedMode, recommendationDismissed);

  useEffect(() => {
    setRecommendationDismissed(false);
  }, [recommendedMode, project.rungs.length]);

  useEffect(() => {
    setProgramMode(restoreProgramModeForProject(modeByProject, project, recommendedMode));
  }, [modeByProject, project, recommendedMode]);

  useEffect(() => {
    setFocusedRungId(restoreFocusedRungForProject(focusedRungByProject, project));
  }, [focusedRungByProject, project]);

  useEffect(() => {
    saveProgramModePreferences(modeByProject);
  }, [modeByProject]);

  useEffect(() => {
    saveFocusedRungPreferences(focusedRungByProject);
  }, [focusedRungByProject]);

  function setAndPersistProgramMode(mode: MobileProgramMode) {
    setProgramMode(mode);
    setModeByProject((current) => persistProgramModeForProject(current, project, mode));
  }

  function setAndPersistFocusedRung(rungId: string) {
    setFocusedRungId(rungId);
    setFocusedRungByProject((current) => persistFocusedRungForProject(current, project, rungId));
  }
  const summary = useMemo(
    () => createSmartphoneProgramSummary(profileView, result.rungResults, project.selectedRungId ?? project.rungs[0]?.id, focusedRungId, programMode === 'flow' ? 'flow' : 'list'),
    [focusedRungId, profileView, programMode, project.rungs, project.selectedRungId, result.rungResults],
  );
  const activeLine = summary.lines.find((line) => line.active) ?? summary.lines[0];
  const activeOutput = tagRows.find((row) => row.scope === 'output' && isActiveValue(row.value));
  const rowsToShow = selectedSection?.rows?.length ? selectedSection.rows : tagRows;
  const selectedActive = selectedRung ? Boolean(result.rungResults[selectedRung.rungId]) : false;

  return (
    <View style={styles.phoneShell}>
      <View style={styles.headerCard}>
        <View style={styles.brandLine}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>E</Text>
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brand}>Easy-PLC</Text>
            <Text style={styles.subtitle}>Simulação em execução</Text>
          </View>
          <View style={styles.scanCard}>
            <Text style={styles.scanLabel}>SCAN</Text>
            <Text style={styles.scanValue}>{scanCount}</Text>
          </View>
        </View>

        <View style={styles.statusLine}>
          <Text style={[styles.statusChip, isRunning ? styles.runChip : styles.stopChip]}>{isRunning ? 'RUN' : 'STOP'}</Text>
          <Text style={[styles.statusChip, isAutoScan && styles.autoChip]}>{isAutoScan ? 'AUTO' : 'MANUAL'}</Text>
          <Text style={styles.statusChip}>{lastScanMs} ms</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ioNav}>
        {ioSections.map((section) => {
          const selected = section.key === activeIoTab;
          return (
            <Pressable key={section.key} onPress={() => setActiveIoTab(section.key)} style={[styles.ioChip, selected && styles.ioChipActive]}>
              <Text style={[styles.ioChipCode, selected && styles.ioChipCodeActive]}>{section.shortLabel}</Text>
              <Text style={[styles.ioChipTitle, selected && styles.ioChipTitleActive]}>{section.label}</Text>
              <Text style={styles.ioChipMeta}>{activeCount(section.rows)}/{section.rows.length}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.monitorCard}>
        <View style={styles.cardTitleLine}>
          <View>
            <Text style={styles.kicker}>Monitor de I/O</Text>
            <Text style={styles.cardTitle}>{activeIoTab === 'overview' ? 'Entradas + Saídas' : selectedSection?.label ?? 'I/O'}</Text>
          </View>
          <Text style={styles.liveBadge}>{activeCount(selectedSection?.rows ?? [])} ativas</Text>
        </View>

        {tagRows.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>Sem sinais de I/O ainda</Text>
            <Text style={styles.emptyStateText}>Adicione TAGs de entrada e saída para visualizar scan e diagnóstico.</Text>
          </View>
        ) : activeIoTab === 'overview' ? (
          <View style={styles.unifiedIoStack}>
            <View style={styles.unifiedSummaryGrid}>
              <View style={styles.unifiedSummaryTile}>
                <Text style={styles.unifiedSummaryLabel}>Entradas</Text>
                <Text style={styles.unifiedSummaryValue}>{activeCount(inputRows)}/{inputRows.length}</Text>
              </View>
              <View style={styles.unifiedSummaryTile}>
                <Text style={styles.unifiedSummaryLabel}>Saídas</Text>
                <Text style={[styles.unifiedSummaryValue, styles.unifiedOutputText]}>{activeCount(outputRows)}/{outputRows.length}</Text>
              </View>
              <View style={styles.unifiedSummaryTile}>
                <Text style={styles.unifiedSummaryLabel}>Memórias</Text>
                <Text style={styles.unifiedSummaryValue}>{activeCount(memoryRows)}/{memoryRows.length}</Text>
              </View>
              <View style={styles.unifiedSummaryTile}>
                <Text style={styles.unifiedSummaryLabel}>T/C</Text>
                <Text style={styles.unifiedSummaryValue}>{activeCount([...timerRows, ...counterRows])}/{timerRows.length + counterRows.length}</Text>
              </View>
            </View>

            <View style={styles.unifiedColumnCard}>
              <View style={styles.unifiedSectionHeader}>
                <Text style={styles.unifiedSectionTitle}>Entradas selecionáveis</Text>
                <Text style={styles.unifiedSectionMeta}>{activeCount(inputRows)} ON</Text>
              </View>
              {inputRows.slice(0, 5).map((row) => <UnifiedSignalRow key={`input-${row.tag}`} row={row} tone="input" />)}
            </View>

            <View style={styles.unifiedColumnCard}>
              <View style={styles.unifiedSectionHeader}>
                <Text style={[styles.unifiedSectionTitle, styles.unifiedOutputText]}>Saídas ativas</Text>
                <Text style={[styles.unifiedSectionMeta, styles.unifiedOutputText]}>{activeCount(outputRows)} ON</Text>
              </View>
              {outputRows.slice(0, 5).map((row) => <UnifiedSignalRow key={`output-${row.tag}`} row={row} tone="output" />)}
            </View>

            <View style={styles.educationHintBox}>
              <Text style={styles.educationHintTitle}>Leitura educativa</Text>
              <Text style={styles.educationHintText}>Observe entradas e saídas no mesmo scan para entender causa e efeito sem trocar de aba.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.signalGrid}>
            {rowsToShow.slice(0, 6).map((row) => {
              const active = isActiveValue(row.value);
              return (
                <View key={`${activeIoTab}-${row.tag}`} style={[styles.signalTile, active && styles.signalTileActive]}>
                  <View style={styles.signalHead}>
                    <Text style={[styles.signalTag, active && styles.signalTagActive]}>{row.tag}</Text>
                    <View style={[styles.led, active && styles.ledOn]} />
                  </View>
                  <Text style={styles.signalDesc} numberOfLines={1}>{row.description}</Text>
                  <Text style={[styles.signalValue, active && styles.signalValueActive]}>{valueLabel(row)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.modeSwitcher}>
        {([
          ['list', 'Lista'],
          ['flow', 'Fluxo'],
          ['compact_rung', 'Rung compacto'],
        ] as [MobileProgramMode, string][]).map(([mode, label]) => {
          const selected = programMode === mode;
          return (
            <Pressable key={mode} onPress={() => setAndPersistProgramMode(clampProgramMode(mode))} style={[styles.modeButton, selected && styles.modeButtonActive]}>
              <Text style={[styles.modeText, selected && styles.modeTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      {showModeRecommendation ? (
        <View style={styles.modeRecommendation}>
          <Pressable onPress={() => setAndPersistProgramMode(recommendedMode)}>
            <Text style={styles.modeRecommendationText}>Projeto com {project.rungs.length} rungs: usar "{programModeLabel(recommendedMode)}" melhora leitura mobile.</Text>
          </Pressable>
          <Pressable onPress={() => setRecommendationDismissed(true)} style={styles.modeRecommendationDismiss}>
            <Text style={styles.modeRecommendationDismissText}>Agora não</Text>
          </Pressable>
        </View>
      ) : null}
      <Pressable
        onPress={() => {
          setModeByProject({});
          setFocusedRungByProject({});
          setRecommendationDismissed(false);
          clearProgramModePreferences();
          clearFocusedRungPreferences();
          clearMobileRungZoomState();
        }}
        style={styles.resetPrefsButton}
      >
        <Text style={styles.resetPrefsText}>Limpar modo, foco e zoom</Text>
      </Pressable>
      <Text style={styles.sessionContextText}>Contexto salvo: {mobileSessionContextLabel(programMode, focusedRungId)}</Text>

      <View style={styles.programCard}>
        {project.rungs.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>Programa vazio</Text>
            <Text style={styles.emptyStateText}>Adicione a primeira rung para iniciar a lógica Ladder no simulador.</Text>
          </View>
        ) : null}
        <View style={styles.cardTitleLine}>
          <View style={styles.programTitleBox}>
            <Text style={styles.kicker}>Programa</Text>
            <Text style={styles.programTitle} numberOfLines={1}>{rungTitle(selectedRung)}</Text>
          </View>
          <Text style={[styles.truthBadge, selectedActive && styles.truthBadgeOn]}>{selectedActive ? 'TRUE' : 'FALSE'}</Text>
        </View>

        {programMode === 'compact_rung' ? (
          <View style={[styles.rungCompact, selectedActive && styles.rungCompactActive]}>
            <View style={styles.leftRail} />
            <View style={styles.rungLogic}>
              <Text style={styles.rungModeLabel}>Rung compacto</Text>
              <Text style={[styles.rungCode, selectedActive && styles.rungCodeOn]} numberOfLines={2}>
                {selectedRung ? compactText(selectedRung.textLine) : 'NA I0.0 • Selo Q0.0 • Coil Q0.0'}
              </Text>
              <Text style={styles.rungExplain} numberOfLines={1}>{activeLine?.explanation ?? 'Partida com selo do motor.'}</Text>
            </View>
            <View style={[styles.outputPanel, selectedActive && styles.outputPanelOn]}>
              <Text style={styles.outputLabel}>Saída</Text>
              <Text style={[styles.outputMain, selectedActive && styles.outputMainOn]} numberOfLines={1}>{outputText(selectedRung)}</Text>
              <Text style={[styles.outputState, selectedActive && styles.outputStateOn]}>{selectedActive ? 'ON' : 'OFF'}</Text>
            </View>
          </View>
        ) : programMode === 'list' ? (
          <ScrollView style={styles.listScroll} contentContainerStyle={styles.listStack} showsVerticalScrollIndicator>
            {visibleProgramLines(summary.lines).map((line, index) => (
              <Pressable key={line.rungId} onPress={() => setAndPersistFocusedRung(line.rungId)} style={[styles.listRow, line.active && styles.listRowActive]}>
                <Text style={styles.listIndex}>{index + 1}</Text>
                <View style={styles.listTextBox}>
                  <Text style={[styles.listCode, line.active && styles.listCodeActive]} numberOfLines={1}>{compactText(line.text)}</Text>
                  <Text style={styles.listDescription} numberOfLines={1}>{line.explanation}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.flowTrack}>
            {profileView.rungs.map((rung, index) => {
              const active = Boolean(result.rungResults[rung.rungId]);
              return (
                <Pressable key={rung.rungId} onPress={() => setAndPersistFocusedRung(rung.rungId)} style={[styles.flowCard, active && styles.flowCardActive]}>
                  <Text style={styles.flowIndex}>Linha {index + 1}</Text>
                  <Text style={[styles.flowCode, active && styles.flowCodeActive]} numberOfLines={3}>{compactText(rung.textLine)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.footerDock}>
        <View style={styles.footerCell}>
          <Text style={styles.footerLabel}>Linha ativa</Text>
          <Text style={styles.footerValue}>{activeLine ? summary.lines.indexOf(activeLine) + 1 : '—'}</Text>
        </View>
        <View style={styles.footerCellMain}>
          <Text style={styles.footerLabel}>Saída</Text>
          <Text style={styles.footerValue}>{activeOutput ? `${activeOutput.tag} ON` : selectedRung?.output?.operand ?? '—'}</Text>
        </View>
        <View style={styles.footerCell}>
          <Text style={styles.footerLabel}>Último scan</Text>
          <Text style={styles.footerValue}>{lastScanMs} ms</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  phoneShell: { backgroundColor: ui.bg, borderColor: ui.lineStrong, borderWidth: 1, borderRadius: 30, padding: 14, gap: 12, shadowColor: '#000000', shadowOpacity: 0.35, shadowRadius: 26, shadowOffset: { width: 0, height: 18 }, elevation: 8 },
  headerCard: { backgroundColor: ui.card2, borderColor: ui.line, borderWidth: 1, borderRadius: 23, padding: 14, gap: 12 },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: ui.cyanSoft, borderColor: ui.cyanLine, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: ui.cyan, fontSize: 20, fontWeight: '900' },
  brandCopy: { flex: 1, minWidth: 0 },
  brand: { color: ui.text, fontSize: 22, fontWeight: '900', lineHeight: 27 },
  subtitle: { color: ui.cyan, fontSize: 12, fontWeight: '800', marginTop: 1 },
  scanCard: { minWidth: 74, borderColor: ui.cyanLine, borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: ui.cyanSoft, alignItems: 'center' },
  scanLabel: { color: ui.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  scanValue: { color: ui.text, fontSize: 17, fontWeight: '900', marginTop: 1 },
  statusLine: { flexDirection: 'row', gap: 8 },
  statusChip: { flex: 1, color: ui.muted, borderColor: ui.line, borderWidth: 1, borderRadius: 999, paddingVertical: 7, textAlign: 'center', backgroundColor: ui.card, fontSize: 11, fontWeight: '900' },
  runChip: { color: ui.green, borderColor: ui.green, backgroundColor: ui.greenSoft },
  stopChip: { color: ui.red, borderColor: ui.red },
  autoChip: { color: ui.cyan, borderColor: ui.cyan, backgroundColor: ui.cyanSoft },
  ioNav: { gap: 8, paddingHorizontal: 2 },
  ioChip: { width: 98, borderColor: ui.line, borderWidth: 1, borderRadius: 17, padding: 10, backgroundColor: ui.card },
  ioChipActive: { borderColor: ui.cyan, backgroundColor: ui.cyanSoft },
  ioChipCode: { color: ui.dim, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  ioChipCodeActive: { color: ui.cyan },
  ioChipTitle: { color: ui.text, fontSize: 12, fontWeight: '900', marginTop: 2 },
  ioChipTitleActive: { color: ui.text },
  ioChipMeta: { color: ui.muted, fontSize: 10, fontWeight: '700', marginTop: 2 },
  monitorCard: { backgroundColor: ui.card, borderColor: ui.line, borderWidth: 1, borderRadius: 23, padding: 13, gap: 10 },
  cardTitleLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  kicker: { color: ui.dim, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { color: ui.text, fontSize: 17, fontWeight: '900', marginTop: 2 },
  liveBadge: { color: ui.green, borderColor: ui.green, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: ui.greenSoft, fontSize: 10, fontWeight: '900' },
  unifiedIoStack: { gap: 9 },
  unifiedSummaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unifiedSummaryTile: { flexGrow: 1, flexBasis: 118, borderColor: ui.line, borderWidth: 1, borderRadius: 15, padding: 10, backgroundColor: ui.card2 },
  unifiedSummaryLabel: { color: ui.muted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  unifiedSummaryValue: { color: ui.green, fontSize: 17, fontWeight: '900', marginTop: 3 },
  unifiedColumnCard: { borderColor: ui.line, borderWidth: 1, borderRadius: 17, padding: 10, backgroundColor: ui.card2, gap: 7 },
  unifiedSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  unifiedSectionTitle: { color: ui.green, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 },
  unifiedSectionMeta: { color: ui.green, fontSize: 10, fontWeight: '900' },
  unifiedSignalRow: { flexDirection: 'row', alignItems: 'center', gap: 9, borderColor: ui.line, borderWidth: 1, borderRadius: 15, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: ui.card },
  unifiedInputActive: { borderColor: ui.green, backgroundColor: ui.greenSoft },
  unifiedOutputActive: { borderColor: ui.amber, backgroundColor: ui.amberSoft },
  unifiedLed: { width: 14, height: 14, borderRadius: 999, borderColor: ui.lineStrong, borderWidth: 2, backgroundColor: 'transparent' },
  unifiedLedInputOn: { borderColor: ui.green, backgroundColor: ui.green },
  unifiedLedOutputOn: { borderColor: ui.amber, backgroundColor: ui.amber },
  unifiedSignalCopy: { flex: 1, minWidth: 0 },
  unifiedSignalTag: { color: ui.text, fontFamily: 'monospace', fontSize: 13, fontWeight: '900' },
  unifiedSignalDesc: { color: ui.muted, fontSize: 11, lineHeight: 15, fontWeight: '700' },
  unifiedSignalValue: { color: ui.dim, fontSize: 12, fontWeight: '900' },
  unifiedInputText: { color: ui.green },
  unifiedOutputText: { color: ui.amber },
  educationHintBox: { borderColor: ui.cyan, borderWidth: 1, borderRadius: 15, padding: 10, backgroundColor: ui.cyanSoft, gap: 3 },
  educationHintTitle: { color: ui.cyan, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  educationHintText: { color: ui.text, fontSize: 11, lineHeight: 16, fontWeight: '800' },
  signalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  signalTile: { flexGrow: 1, flexBasis: 128, minWidth: 0, backgroundColor: ui.card2, borderColor: ui.line, borderWidth: 1, borderRadius: 15, padding: 10, gap: 4 },
  signalTileActive: { backgroundColor: ui.greenSoft, borderColor: ui.green },
  signalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  signalTag: { color: ui.muted, fontFamily: 'monospace', fontSize: 13, fontWeight: '900' },
  signalTagActive: { color: ui.green },
  led: { width: 9, height: 9, borderRadius: 999, backgroundColor: ui.dim },
  ledOn: { backgroundColor: ui.green },
  signalDesc: { color: ui.muted, fontSize: 10, lineHeight: 14 },
  signalValue: { color: ui.dim, fontSize: 11, fontWeight: '900' },
  signalValueActive: { color: ui.green },
  modeSwitcher: { flexDirection: 'row', backgroundColor: ui.card, borderColor: ui.line, borderWidth: 1, borderRadius: 18, padding: 4, gap: 4 },
  modeButton: { flex: 1, borderRadius: 14, paddingVertical: 9, alignItems: 'center' },
  modeButtonActive: { backgroundColor: ui.cyanSoft, borderColor: ui.cyan, borderWidth: 1 },
  modeText: { color: ui.muted, fontSize: 11, fontWeight: '900' },
  modeTextActive: { color: ui.cyan },
  modeRecommendation: { borderColor: ui.cyanLine, borderWidth: 1, borderRadius: 14, backgroundColor: ui.cyanSoft, paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  modeRecommendationText: { color: ui.text, fontSize: 11, fontWeight: '700', lineHeight: 15 },
  modeRecommendationDismiss: { alignSelf: 'flex-end', borderColor: ui.cyanLine, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: ui.card2 },
  modeRecommendationDismissText: { color: ui.muted, fontSize: 10, fontWeight: '800' },
  resetPrefsButton: { alignSelf: 'flex-end', borderColor: ui.line, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: ui.card2 },
  resetPrefsText: { color: ui.dim, fontSize: 10, fontWeight: '800' },
  sessionContextText: { color: ui.dim, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  emptyStateCard: { borderColor: ui.lineStrong, borderWidth: 1, borderRadius: 14, padding: 12, backgroundColor: ui.card2, gap: 4 },
  emptyStateTitle: { color: ui.text, fontSize: 12, fontWeight: '900' },
  emptyStateText: { color: ui.muted, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  programCard: { backgroundColor: ui.card, borderColor: ui.line, borderWidth: 1, borderRadius: 23, padding: 13, gap: 12 },
  programTitleBox: { flex: 1, minWidth: 0 },
  programTitle: { color: ui.text, fontSize: 15, fontWeight: '900', marginTop: 2 },
  truthBadge: { color: ui.muted, borderColor: ui.line, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: ui.card2, fontSize: 10, fontWeight: '900' },
  truthBadgeOn: { color: ui.green, borderColor: ui.green, backgroundColor: ui.greenSoft },
  rungCompact: { flexDirection: 'row', alignItems: 'stretch', minHeight: 104, backgroundColor: ui.card2, borderColor: ui.lineStrong, borderWidth: 1, borderRadius: 19, overflow: 'hidden' },
  rungCompactActive: { backgroundColor: '#071A14', borderColor: ui.green },
  leftRail: { width: 7, backgroundColor: ui.cyan },
  rungLogic: { flex: 1, minWidth: 0, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 11, gap: 4 },
  rungModeLabel: { color: ui.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  rungCode: { color: ui.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 18, fontWeight: '900' },
  rungCodeOn: { color: ui.green },
  rungExplain: { color: ui.muted, fontSize: 11, lineHeight: 15, fontWeight: '700' },
  outputPanel: { width: 98, backgroundColor: ui.amberSoft, borderLeftColor: ui.line, borderLeftWidth: 1, justifyContent: 'center', padding: 10, gap: 3 },
  outputPanelOn: { backgroundColor: ui.greenSoft },
  outputLabel: { color: ui.amber, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  outputMain: { color: ui.text, fontFamily: 'monospace', fontSize: 11, fontWeight: '900' },
  outputMainOn: { color: ui.green },
  outputState: { color: ui.amber, fontSize: 15, fontWeight: '900' },
  outputStateOn: { color: ui.green },
  listScroll: { maxHeight: 258 },
  listStack: { gap: 8, paddingRight: 2 },
  listRow: { flexDirection: 'row', gap: 10, backgroundColor: ui.card2, borderColor: ui.line, borderWidth: 1, borderRadius: 14, padding: 10 },
  listRowActive: { backgroundColor: ui.greenSoft, borderColor: ui.green },
  listIndex: { width: 24, color: ui.cyan, fontSize: 12, fontWeight: '900' },
  listTextBox: { flex: 1, minWidth: 0 },
  listCode: { color: ui.text, fontFamily: 'monospace', fontSize: 11, fontWeight: '900' },
  listCodeActive: { color: ui.green },
  listDescription: { color: ui.muted, fontSize: 10, lineHeight: 14, marginTop: 2 },
  flowTrack: { gap: 9, paddingBottom: 2 },
  flowCard: { width: 218, backgroundColor: ui.card2, borderColor: ui.line, borderWidth: 1, borderRadius: 16, padding: 12, gap: 6 },
  flowCardActive: { backgroundColor: ui.greenSoft, borderColor: ui.green },
  flowIndex: { color: ui.cyan, fontSize: 10, fontWeight: '900' },
  flowCode: { color: ui.text, fontFamily: 'monospace', fontSize: 12, lineHeight: 17, fontWeight: '900' },
  flowCodeActive: { color: ui.green },
  footerDock: { flexDirection: 'row', backgroundColor: ui.card2, borderColor: ui.line, borderWidth: 1, borderRadius: 19, overflow: 'hidden' },
  footerCell: { flex: 1, padding: 11 },
  footerCellMain: { flex: 1.35, padding: 11, borderLeftColor: ui.line, borderLeftWidth: 1, borderRightColor: ui.line, borderRightWidth: 1 },
  footerLabel: { color: ui.dim, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  footerValue: { color: ui.text, fontSize: 12, fontWeight: '900', marginTop: 3 },
});
