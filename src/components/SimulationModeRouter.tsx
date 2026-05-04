import { memo, ReactNode, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { createInitialEditorProject, EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { PlcProfileId } from '../plcProfiles/plcProfiles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { MobileExecutionScreen } from './MobileExecutionScreen';
import { MobileSimulationEntryCard } from './MobileSimulationEntryCard';

type SimulationMode = 'choice' | 'mobile' | 'classic';

type SimulationModeRouterProps = {
  editorProject?: EditorProjectState;
  plcState?: PlcState;
  evaluation?: EditorEvaluationResult;
  selectedProfile?: PlcProfileId;
  isRunning?: boolean;
  isAutoScan?: boolean;
  scanCount?: number;
  lastScanMs?: number;
  classicContent?: ReactNode;
};

function makeFallbackState(project: EditorProjectState): PlcState {
  const state: PlcState = {};
  for (const variable of project.projectVariables ?? []) {
    state[(variable.address || variable.id).toUpperCase()] = variable.dataType === 'number' ? 0 : false;
  }
  return state;
}

function fallbackEvaluation(project: EditorProjectState): EditorEvaluationResult {
  return {
    nextState: {},
    rungResults: Object.fromEntries(project.rungs.map((rung) => [rung.id, false])),
    timers: {},
    counters: {},
    edgeMemory: {},
    errors: [],
    warnings: [],
  };
}

export const SimulationModeRouter = memo(function SimulationModeRouter({
  editorProject,
  plcState,
  evaluation,
  selectedProfile = 'easy_clp',
  isRunning = true,
  isAutoScan = true,
  scanCount = 124,
  lastScanMs = 12,
  classicContent,
}: SimulationModeRouterProps) {
  const { width } = useWindowDimensions();
  const compactDevice = width < 760;
  const [mode, setMode] = useState<SimulationMode>(compactDevice ? 'choice' : 'classic');
  const fallbackProject = useMemo(() => createInitialEditorProject(), []);
  const project = editorProject ?? fallbackProject;
  const state = plcState ?? makeFallbackState(project);
  const result = evaluation ?? fallbackEvaluation(project);

  if (mode === 'mobile') {
    return (
      <MobileExecutionScreen
        editorProject={project}
        plcState={state}
        evaluation={result}
        selectedProfile={selectedProfile}
        isRunning={isRunning}
        isAutoScan={isAutoScan}
        scanCount={scanCount}
        lastScanMs={lastScanMs}
      />
    );
  }

  if (mode === 'classic') {
    return (
      <View style={styles.stack}>
        {compactDevice ? (
          <View style={styles.mobileHint}>
            <Text style={styles.mobileHintTitle}>Modo clássico ativo</Text>
            <Text style={styles.mobileHintText}>No celular, a execução mobile é recomendada para melhor leitura de I/Os e rungs compactos.</Text>
            <Text onPress={() => setMode('mobile')} style={styles.mobileHintAction}>Abrir execução mobile</Text>
          </View>
        ) : null}
        {classicContent ?? (
          <View style={styles.emptyClassic}>
            <Text style={styles.emptyTitle}>Modo clássico</Text>
            <Text style={styles.emptyText}>O conteúdo clássico da simulação deve ser passado como classicContent.</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <MobileSimulationEntryCard
      onOpenMobileExecution={() => setMode('mobile')}
      onContinueClassic={() => setMode('classic')}
    />
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  mobileHint: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
    gap: 4,
  },
  mobileHintTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  mobileHintText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  mobileHintAction: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },
  emptyClassic: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
