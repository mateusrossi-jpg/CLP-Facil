import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AppCard } from './src/components/AppCard';
import { AppHeader } from './src/components/AppHeader';
import { ComponentLibrary } from './src/components/ComponentLibrary';
import { EditableLadderCanvas } from './src/components/EditableLadderCanvas';
import { EditorModeToggle, EditorRunMode } from './src/components/EditorModeToggle';
import { EditorSimulationPanel } from './src/components/EditorSimulationPanel';
import { EducationalExamplePicker } from './src/components/EducationalExamplePicker';
import { ExplanationPanel } from './src/components/ExplanationPanel';
import { InputButton } from './src/components/InputButton';
import { LadderDiagram } from './src/components/LadderDiagram';
import { LessonCard } from './src/components/LessonCard';
import { LessonDetail } from './src/components/LessonDetail';
import { MotorIndicator } from './src/components/MotorIndicator';
import { OutputIndicator } from './src/components/OutputIndicator';
import { ProjectCard } from './src/components/ProjectCard';
import { RungNavigator } from './src/components/RungNavigator';
import { SelectedBlockEditor } from './src/components/SelectedBlockEditor';
import { directStartWithSealProject } from './src/data/defaultProjects';
import { EditorExampleProject, educationalEditorExamples } from './src/data/editorExampleProjects';
import { SimulatorComponent } from './src/data/componentLibrary';
import { Lesson, learningModules, lessons } from './src/data/learningContent';
import { createEditorBlock, createInitialEditorProject, EditorCoilMode, EditorContactMode, EditorProjectState, EditorInsertionZone } from './src/engine/editorTypes';
import { createInitialEditorState, evaluateEditorProject, setEditorInput } from './src/engine/editorEvaluator';
import { canInsertComponentInZone, explainInsertionRule } from './src/engine/editorRules';
import { createInitialRuntimeState } from './src/engine/runtimeTypes';
import { createInitialState, evaluateProject, setInput } from './src/engine/ladderEvaluator';
import { PlcState } from './src/engine/projectTypes';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';

type Mode = 'home' | 'learn' | 'lesson' | 'simulate';

export default function App() {
  const project = directStartWithSealProject;
  const initial = useMemo(() => createInitialState(project), [project]);
  const [mode, setMode] = useState<Mode>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<SimulatorComponent | null>(null);
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorRunMode>('edit');
  const [editorProject, setEditorProject] = useState<EditorProjectState>(() => createInitialEditorProject());
  const [editorState, setEditorState] = useState<PlcState>(() => createInitialEditorState());
  const [editorRuntime, setEditorRuntime] = useState(() => createInitialRuntimeState());
  const [editorScanNumber, setEditorScanNumber] = useState(0);
  const [plcState, setPlcState] = useState<PlcState>(initial);
  const evaluation = evaluateProject(project, plcState);
  const editorEvaluation = evaluateEditorProject(editorProject, editorState, editorScanNumber, editorRuntime);
  const editingLocked = editorMode === 'simulate';

  function openLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setMode('lesson');
  }

  function openSimulator() {
    setMode('simulate');
  }

  function loadEducationalExample(example: EditorExampleProject) {
    if (editingLocked) return;
    setEditorProject(example.project);
    setEditorState(createInitialEditorState());
    setEditorRuntime(createInitialRuntimeState());
    setEditorScanNumber(0);
    setSelectedComponent(null);
    setEditorMessage(`${example.title} carregado. Alterne para Simular e acione I0 para testar.`);
  }

  function applyInput(inputId: string, value: boolean) {
    const result = setInput(project, evaluation.state, inputId, value);
    setPlcState(result.state);
  }

  function resetSimulation() {
    setPlcState(createInitialState(project));
    setEditorState(createInitialEditorState());
    setEditorRuntime(createInitialRuntimeState());
    setEditorScanNumber(0);
  }

  function toggleSafetyInput(inputId: 'I2' | 'I3') {
    const current = Boolean(evaluation.state[inputId]);
    applyInput(inputId, !current);
  }

  function runEditorScan() {
    if (editorMode !== 'simulate') return;
    const nextScan = editorScanNumber + 1;
    const result = evaluateEditorProject(editorProject, editorEvaluation.state, nextScan, editorEvaluation.runtime);
    setEditorScanNumber(nextScan);
    setEditorState(result.state);
    setEditorRuntime(result.runtime);
  }

  function toggleEditorInput(inputId: string) {
    if (editorMode !== 'simulate') return;
    const nextScan = editorScanNumber + 1;
    const current = Boolean(editorEvaluation.state[inputId]);
    const result = setEditorInput(editorProject, editorEvaluation.state, inputId, !current, nextScan, editorEvaluation.runtime);
    setEditorScanNumber(nextScan);
    setEditorState(result.state);
    setEditorRuntime(result.runtime);
  }

  function selectEditorZone(zone: EditorInsertionZone) {
    if (editingLocked) return;
    setEditorProject((current) => ({ ...current, selectedZone: zone, selectedBlockId: null }));
    setEditorMessage(null);
  }

  function selectEditorBlock(blockId: string) {
    if (editingLocked) return;
    setEditorProject((current) => ({ ...current, selectedBlockId: blockId }));
    setEditorMessage(null);
  }

  function selectEditorRung(rungId: string) {
    if (editingLocked) return;
    setEditorProject((current) => ({ ...current, selectedRungId: rungId, selectedBlockId: null }));
    setEditorMessage(null);
  }

  function addNewRung() {
    if (editingLocked) return;
    setEditorProject((current) => {
      const nextIndex = current.rungs.length + 1;
      const rungId = `rung-${nextIndex}`;
      return {
        ...current,
        selectedRungId: rungId,
        selectedBlockId: null,
        selectedZone: 'series',
        rungs: [
          ...current.rungs,
          {
            id: rungId,
            label: `Linha ${nextIndex} — Novo comando`,
            seriesBlocks: [],
            parallelBlocks: [],
            coilBlock: null,
          },
        ],
      };
    });
    setEditorMessage(null);
  }

  function removeSelectedRung() {
    if (editingLocked) return;
    setEditorProject((current) => {
      if (current.rungs.length <= 1) return current;
      const filtered = current.rungs.filter((rung) => rung.id !== current.selectedRungId);
      const nextSelected = filtered[filtered.length - 1]?.id ?? filtered[0]?.id ?? 'rung-1';
      return {
        ...current,
        selectedRungId: nextSelected,
        selectedBlockId: null,
        rungs: filtered,
      };
    });
    setEditorMessage(null);
  }

  function addComponentToEditor(component: SimulatorComponent) {
    setSelectedComponent(component);
    if (editingLocked) return;

    if (!canInsertComponentInZone(component, editorProject.selectedZone)) {
      setEditorMessage(explainInsertionRule(component, editorProject.selectedZone));
      return;
    }

    if (component.isPro) {
      setEditorMessage('Este componente é Pro para uso em projetos próprios. Ele pode ser estudado no modo educacional.');
      return;
    }

    setEditorProject((current) => {
      const block = createEditorBlock(component, current.selectedZone);
      return {
        ...current,
        selectedBlockId: block.id,
        rungs: current.rungs.map((rung) => {
          if (rung.id !== current.selectedRungId) return rung;

          if (current.selectedZone === 'series') {
            return { ...rung, seriesBlocks: [...rung.seriesBlocks, block] };
          }

          if (current.selectedZone === 'parallel') {
            return { ...rung, parallelBlocks: [...rung.parallelBlocks, block] };
          }

          return { ...rung, coilBlock: block };
        }),
      };
    });
    setEditorMessage(`${component.name} inserido em ${editorProject.selectedZone}.`);
  }

  function updateSelectedBlockVariable(variable: string) {
    if (editingLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          seriesBlocks: rung.seriesBlocks.map((block) =>
            block.id === current.selectedBlockId ? { ...block, variable } : block,
          ),
          parallelBlocks: rung.parallelBlocks.map((block) =>
            block.id === current.selectedBlockId ? { ...block, variable } : block,
          ),
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? { ...rung.coilBlock, variable } : rung.coilBlock,
        })),
      };
    });
  }

  function updateSelectedBlockContactMode(contactMode: EditorContactMode) {
    if (editingLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          seriesBlocks: rung.seriesBlocks.map((block) =>
            block.id === current.selectedBlockId ? { ...block, contactMode } : block,
          ),
          parallelBlocks: rung.parallelBlocks.map((block) =>
            block.id === current.selectedBlockId ? { ...block, contactMode } : block,
          ),
        })),
      };
    });
  }

  function updateSelectedBlockCoilMode(coilMode: EditorCoilMode) {
    if (editingLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? { ...rung.coilBlock, coilMode } : rung.coilBlock,
        })),
      };
    });
  }

  function updateSelectedBlockPresetMs(presetMs: number) {
    if (editingLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? { ...rung.coilBlock, presetMs } : rung.coilBlock,
        })),
      };
    });
  }

  function updateSelectedBlockPreset(preset: number) {
    if (editingLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? { ...rung.coilBlock, preset } : rung.coilBlock,
        })),
      };
    });
  }

  function removeSelectedEditorBlock() {
    if (editingLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        selectedBlockId: null,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          seriesBlocks: rung.seriesBlocks.filter((block) => block.id !== current.selectedBlockId),
          parallelBlocks: rung.parallelBlocks.filter((block) => block.id !== current.selectedBlockId),
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? null : rung.coilBlock,
        })),
      };
    });
    setEditorMessage(null);
  }

  const selectedEditorBlock = editorProject.rungs
    .flatMap((rung) => [...rung.seriesBlocks, ...rung.parallelBlocks, ...(rung.coilBlock ? [rung.coilBlock] : [])])
    .find((block) => block.id === editorProject.selectedBlockId) ?? null;
  const availableLessons = lessons.filter((lesson) => lesson.status === 'available');

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {mode === 'home' ? (
          <>
            <AppHeader
              title="Simulador Ladder Educativo"
              subtitle="Aprenda comandos elétricos e lógica CLP no celular, com lições guiadas e um modo simulador para testar circuitos."
            />
            <AppCard
              title="Aprender"
              description="Lições guiadas com contato NA, contato NF, selo, intertravamento, motores, temporizadores e contadores."
              badge={`${availableLessons.length} lições`}
              onPress={() => setMode('learn')}
            />
            <AppCard
              title="Simular"
              description="Monte e teste lógicas Ladder por blocos. O primeiro projeto é uma partida direta com selo."
              badge="Simulador"
              onPress={openSimulator}
            />
            <AppCard
              title="Pro"
              description="Componentes avançados como TON, TOF, CTU, SET/RESET, reversão, estrela-triângulo e projetos próprios."
              badge="Pago"
              onPress={openSimulator}
            />
            <Text style={styles.footer}>Conteúdo educacional livre; simulador de projetos próprios e componentes avançados como caminho Pro.</Text>
          </>
        ) : null}

        {mode === 'learn' ? (
          <>
            <AppHeader title="Modo Aprender" subtitle="Escolha uma lição, entenda a teoria e depois pratique no simulador quando a lição permitir." />
            {learningModules.map((module) => {
              const moduleLessons = lessons.filter((lesson) => lesson.moduleId === module.id);
              return (
                <View key={module.id} style={styles.moduleBlock}>
                  <View style={styles.moduleHeader}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={[styles.moduleStatus, module.status === 'planned' && styles.moduleStatusPlanned]}>
                      {module.status === 'available' ? 'Livre' : 'Futuro'}
                    </Text>
                  </View>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                  {moduleLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} onPress={() => openLesson(lesson)} />
                  ))}
                </View>
              );
            })}
            <AppCard title="Voltar" description="Retornar para a tela inicial." onPress={() => setMode('home')} />
          </>
        ) : null}

        {mode === 'lesson' && selectedLesson ? (
          <>
            <AppHeader title="Modo Aprender" subtitle="Lição livre com ponte direta para prática no simulador." />
            <LessonDetail lesson={selectedLesson} onOpenSimulator={selectedLesson.simulatorProjectId ? openSimulator : undefined} />
            <AppCard title="Voltar para lições" description="Escolher outra lição." onPress={() => setMode('learn')} />
          </>
        ) : null}

        {mode === 'simulate' ? (
          <>
            <AppHeader title="Modo Simular" subtitle={project.description} />
            <View style={styles.simulatorModeBanner}>
              <Text style={styles.simulatorModeTitle}>Editor visual por blocos</Text>
              <Text style={styles.simulatorModeText}>Monte em Editar. Depois alterne para Simular para travar a edição e testar as entradas virtuais.</Text>
            </View>

            <Text style={styles.sectionTitle}>Projetos do simulador</Text>
            <ProjectCard project={project} badge="Exemplo livre" />
            <AppCard title="Criar projeto próprio" description="Criar, salvar e editar projetos próprios será parte do CLP Fácil Pro." badge="PRO" />

            <LadderDiagram project={project} state={evaluation.state} energizedRungs={evaluation.energizedRungs} />

            <Text style={styles.sectionTitle}>Entradas virtuais do exemplo livre</Text>
            <View style={styles.inputGrid}>
              <InputButton
                label="I0 Liga"
                description="NA momentâneo"
                active={Boolean(evaluation.state.I0)}
                onPressIn={() => applyInput('I0', true)}
                onPressOut={() => applyInput('I0', false)}
              />
              <InputButton
                label="I1 Desliga"
                description="NF momentâneo"
                active={!evaluation.state.I1}
                danger
                onPressIn={() => applyInput('I1', false)}
                onPressOut={() => applyInput('I1', true)}
              />
              <InputButton
                label="I2 Emergência"
                description="NF travado"
                active={!evaluation.state.I2}
                danger
                onPress={() => toggleSafetyInput('I2')}
              />
              <InputButton
                label="I3 Sobrecarga"
                description="NF travado"
                active={!evaluation.state.I3}
                danger
                onPress={() => toggleSafetyInput('I3')}
              />
            </View>

            <Text style={styles.sectionTitle}>Saídas e atuadores do exemplo</Text>
            <OutputIndicator label="Q0 / K1" description="Contator principal" active={Boolean(evaluation.state.Q0)} />
            <MotorIndicator active={Boolean(evaluation.state.MTR1)} />
            <ExplanationPanel text={evaluation.explanation} />

            <EditorModeToggle mode={editorMode} onChangeMode={setEditorMode} />
            {editingLocked ? <Text style={styles.lockedNotice}>Edição travada. Volte para Editar para adicionar, remover ou alterar blocos.</Text> : null}
            {editorMessage ? <Text style={styles.editorMessage}>{editorMessage}</Text> : null}

            <EducationalExamplePicker
              examples={educationalEditorExamples}
              locked={editingLocked}
              onLoadExample={loadEducationalExample}
            />
            <RungNavigator
              rungs={editorProject.rungs}
              selectedRungId={editorProject.selectedRungId}
              locked={editingLocked}
              onSelectRung={selectEditorRung}
              onAddRung={addNewRung}
              onRemoveRung={removeSelectedRung}
            />
            <EditableLadderCanvas
              editor={editorProject}
              locked={editingLocked}
              rungResults={editorEvaluation.rungResults}
              onSelectZone={selectEditorZone}
              onSelectBlock={selectEditorBlock}
            />
            {!editingLocked ? (
              <SelectedBlockEditor
                block={selectedEditorBlock}
                onChangeVariable={updateSelectedBlockVariable}
                onChangeContactMode={updateSelectedBlockContactMode}
                onChangeCoilMode={updateSelectedBlockCoilMode}
                onChangePresetMs={updateSelectedBlockPresetMs}
                onChangePreset={updateSelectedBlockPreset}
                onRemove={removeSelectedEditorBlock}
              />
            ) : null}
            <EditorSimulationPanel
              state={editorEvaluation.state}
              evaluation={editorEvaluation}
              onToggleInput={toggleEditorInput}
              onRunScan={runEditorScan}
            />
            {!editingLocked ? (
              <ComponentLibrary
                selectedComponentId={selectedComponent?.id}
                onSelectComponent={addComponentToEditor}
              />
            ) : null}
            <AppCard title="Resetar simulação" description="Voltar entradas e saídas para o estado inicial." onPress={resetSimulation} />
            <AppCard title="Voltar" description="Retornar para a tela inicial." onPress={() => setMode('home')} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  moduleBlock: {
    marginBottom: spacing.xl,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  moduleTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  moduleStatus: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  moduleStatusPlanned: {
    color: colors.amber,
  },
  moduleDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  simulatorModeBanner: {
    backgroundColor: colors.cyanSoft,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  simulatorModeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  simulatorModeText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  lockedNotice: {
    color: colors.amber,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  editorMessage: {
    color: colors.amber,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.lg,
  },
});
