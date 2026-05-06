import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AdPlaceholder } from './src/components/AdPlaceholder';
import { AppCard } from './src/components/AppCard';
import { AppHeader } from './src/components/AppHeader';
import { BottomNavigation, BottomNavKey } from './src/components/BottomNavigation';
import { initialAccountSession, isValidAccountEmail, signInWithEmailBetaMock, signInWithGoogleBetaMock } from './src/commerce/accountAccess';
import { initialAdsAccess, shouldShowAds } from './src/commerce/adsAccess';
import { EASY_CLP_PRO_PRODUCT_ID, initialProAccess, proFeatureGroups, ProAccessState, purchaseProBetaMock, restoreProBetaMock } from './src/commerce/proAccess';
import { EditorRunMode } from './src/components/EditorModeToggle';
import { ExplanationPanel } from './src/components/ExplanationPanel';
import { HomeHero } from './src/components/HomeHero';
import { InputButton } from './src/components/InputButton';
import { LadderDiagram } from './src/components/LadderDiagram';
import { LessonCard } from './src/components/LessonCard';
import { LaunchQuickStartPanel } from './src/components/LaunchQuickStartPanel';
import { LearningPathPanel } from './src/components/LearningPathPanel';
import { LessonDetail } from './src/components/LessonDetail';
import { MotorIndicator } from './src/components/MotorIndicator';
import { OutputIndicator } from './src/components/OutputIndicator';
import { PlcWorkbench } from './src/components/PlcWorkbench';
import { PlcMissionPathPanel } from './src/components/PlcMissionPathPanel';
import { PlcProfilePanel } from './src/components/PlcProfilePanel';
import { CommunicationProtocolsPanel } from './src/components/CommunicationProtocolsPanel';
import { ReferenceHubPanel } from './src/components/ReferenceHubPanel';
import { HardwareExportPanel } from './src/components/HardwareExportPanel';
import { SelectedBlockEditor } from './src/components/SelectedBlockEditor';
import { SimulatorDialectPanel } from './src/components/SimulatorDialectPanel';
import { SmartphoneSimulationPanel } from './src/components/SmartphoneSimulationPanel';
import { directStartWithSealProject } from './src/data/defaultProjects';
import { EditorExampleProject, educationalEditorExamples } from './src/data/editorExampleProjects';
import { createLessonEditorProject } from './src/data/lessonEditorProjects';
import { SimulatorComponent, simulatorComponents } from './src/data/componentLibrary';
import { Lesson, learningModules, lessons } from './src/data/learningContent';
import { getGuidedPracticeSteps, GuidedPracticeStep } from './src/education/guidedPractice';
import { createEditorBlock, createInitialEditorProject, EditorBlock, EditorCoilMode, EditorCompareMode, EditorContactMode, EditorCounterMode, EditorMathMode, EditorParallelBranch, EditorProjectState, EditorInsertionZone, EditorTimerMode, EditorVariableDataType } from './src/engine/editorTypes';
import { createInitialEditorState, evaluateEditorProject, setEditorInput } from './src/engine/editorEvaluator';
import { canInsertComponentInZone, explainInsertionRule } from './src/engine/editorRules';
import { createInitialRuntimeState } from './src/engine/runtimeTypes';
import { createInitialState, evaluateProject, setInput } from './src/engine/ladderEvaluator';
import { PlcState } from './src/engine/projectTypes';
import { PlcMission } from './src/lessons/missionTypes';
import { plcMissionTracks } from './src/lessons/plcMissions';
import { evaluateMissionAttempt } from './src/lessons/missionValidation';
import { colors } from './src/theme/colors';
import { PlcProfileId } from './src/plcProfiles/plcProfiles';
import { spacing } from './src/theme/spacing';

type Mode = 'home' | 'learn' | 'lesson' | 'simulate' | 'reference' | 'projects' | 'hardware' | 'pro';

export default function App() {
  const { width } = useWindowDimensions();
  const project = directStartWithSealProject;
  const initial = useMemo(() => createInitialState(project), [project]);
  const desktopLayout = width >= 1280;
  const [mode, setMode] = useState<Mode>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [practiceLesson, setPracticeLesson] = useState<Lesson | null>(null);
  const [activePlcMission, setActivePlcMission] = useState<PlcMission | null>(null);
  const [completedMissionIds, setCompletedMissionIds] = useState<Record<string, boolean>>({});
  const [completedPracticeSteps, setCompletedPracticeSteps] = useState<Record<string, boolean>>({});
  const [selectedComponent, setSelectedComponent] = useState<SimulatorComponent | null>(null);
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorRunMode>('edit');
  const [editorProject, setEditorProject] = useState<EditorProjectState>(() => createInitialEditorProject());
  const [selectedPlcProfile, setSelectedPlcProfile] = useState<PlcProfileId>('easy_clp');
  const [editorState, setEditorState] = useState<PlcState>(() => createInitialEditorState());
  const [editorRuntime, setEditorRuntime] = useState(() => createInitialRuntimeState());
  const [editorScanNumber, setEditorScanNumber] = useState(0);
  const [autoScan, setAutoScan] = useState(false);
  const [proAccess, setProAccess] = useState<ProAccessState>(initialProAccess);
  const [accountSession, setAccountSession] = useState(initialAccountSession);
  const [accountEmailInput, setAccountEmailInput] = useState('');
  const [adsAccess] = useState(initialAdsAccess);
  const [commerceMessage, setCommerceMessage] = useState<string | null>(null);
  const [plcState, setPlcState] = useState<PlcState>(initial);
  const editorProjectRef = useRef(editorProject);
  const editorStateRef = useRef(editorState);
  const editorRuntimeRef = useRef(editorRuntime);
  const editorScanNumberRef = useRef(editorScanNumber);
  const evaluation = useMemo(() => evaluateProject(project, plcState), [project, plcState]);
  const editorEvaluation = useMemo(
    () => evaluateEditorProject(editorProject, editorState, editorScanNumber, editorRuntime),
    [editorProject, editorState, editorScanNumber, editorRuntime],
  );
  const editingLocked = editorMode === 'simulate';
  const compactSimulator = width < 980;
  const showAds = shouldShowAds(proAccess.isPro, adsAccess);
  const activeNav: BottomNavKey = mode === 'learn' || mode === 'lesson'
    ? 'learn'
    : mode === 'simulate'
      ? 'simulate'
      : mode === 'reference'
        ? 'reference'
        : mode === 'projects'
          ? 'projects'
        : mode === 'hardware'
          ? 'hardware'
        : mode === 'pro'
          ? 'pro'
          : 'home';
  const guidedSteps: GuidedPracticeStep[] = practiceLesson ? getGuidedPracticeSteps(practiceLesson.id, editorEvaluation) : [];
  const hydratedGuidedSteps = guidedSteps.map((step) => ({
    ...step,
    passed: step.passed || Boolean(completedPracticeSteps[step.id]),
  }));
  const guidedDone = hydratedGuidedSteps.length > 0 && hydratedGuidedSteps.every((step) => step.passed);
  const activeMissionAttempt = activePlcMission ? evaluateMissionAttempt(activePlcMission, editorEvaluation.state, editorEvaluation) : null;

  useEffect(() => {
    editorProjectRef.current = editorProject;
  }, [editorProject]);

  useEffect(() => {
    editorStateRef.current = editorState;
  }, [editorState]);

  useEffect(() => {
    editorRuntimeRef.current = editorRuntime;
  }, [editorRuntime]);

  useEffect(() => {
    editorScanNumberRef.current = editorScanNumber;
  }, [editorScanNumber]);

  useEffect(() => {
    if (!autoScan || editorMode !== 'simulate') return undefined;
    const interval = setInterval(() => {
      runEditorScanFromRefs();
    }, 100);
    return () => clearInterval(interval);
  }, [autoScan, editorMode]);

  useEffect(() => {
    if (!practiceLesson) return;
    const passedNow = getGuidedPracticeSteps(practiceLesson.id, editorEvaluation).filter((step) => step.passed);
    if (passedNow.length === 0) return;
    setCompletedPracticeSteps((current) => {
      let changed = false;
      const next = { ...current };
      for (const step of passedNow) {
        if (next[step.id]) continue;
        next[step.id] = true;
        changed = true;
      }
      return changed ? next : current;
    });
  }, [practiceLesson?.id, editorEvaluation]);

  useEffect(() => {
    if (!activePlcMission || !activeMissionAttempt?.passed) return;
    setCompletedMissionIds((current) => {
      if (current[activePlcMission.id]) return current;
      return { ...current, [activePlcMission.id]: true };
    });
  }, [activePlcMission?.id, activeMissionAttempt?.passed]);

  function parallelBranchesForRung(rung: EditorProjectState['rungs'][number]): EditorParallelBranch[] {
    if (rung.parallelBranches) return rung.parallelBranches;
    return rung.parallelBlocks.map((block, index) => ({
      id: `${rung.id}-legacy-branch-${block.id}`,
      seriesIndex: block.parallelIndex ?? index,
      blocks: [block],
    }));
  }

  function mapProjectBlocks(
    current: EditorProjectState,
    mapper: (block: EditorBlock) => EditorBlock,
  ): EditorProjectState {
    return {
      ...current,
      rungs: current.rungs.map((rung) => ({
        ...rung,
        seriesBlocks: rung.seriesBlocks.map(mapper),
        parallelBlocks: rung.parallelBranches ? rung.parallelBlocks : [],
        parallelBranches: parallelBranchesForRung(rung).map((branch) => ({
          ...branch,
          blocks: branch.blocks.map(mapper),
        })),
        coilBlock: rung.coilBlock ? mapper(rung.coilBlock) : rung.coilBlock,
      })),
    };
  }

  function handleBottomNav(key: BottomNavKey) {
    if (key === 'home') {
      setMode('home');
      setPracticeLesson(null);
      setActivePlcMission(null);
      setCompletedPracticeSteps({});
      return;
    }

    if (key === 'learn') {
      setMode('learn');
      return;
    }

    if (key === 'simulate') {
      setPracticeLesson(null);
      setActivePlcMission(null);
      setCompletedPracticeSteps({});
      setMode('simulate');
      return;
    }

    if (key === 'reference') {
      setMode('reference');
      return;
    }

    if (key === 'projects') {
      setMode('projects');
      return;
    }

    if (key === 'hardware') {
      setMode('hardware');
      return;
    }

    if (key === 'pro') {
      setMode('pro');
    }
  }

  function openLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setMode('lesson');
  }

  function openSimulator() {
    setPracticeLesson(null);
    setActivePlcMission(null);
    setCompletedPracticeSteps({});
    setMode('simulate');
  }

  function openPlcMission(mission: PlcMission) {
    setEditorProject(mission.initialProject ?? createInitialEditorProject());
    setEditorState(createInitialEditorState());
    setEditorRuntime(createInitialRuntimeState());
    setEditorScanNumber(0);
    setAutoScan(false);
    setSelectedComponent(null);
    setPracticeLesson(null);
    setActivePlcMission(mission);
    setCompletedPracticeSteps({});
    setEditorMode('simulate');
    setEditorMessage(`Missão "${mission.title}" carregada. Acione entradas, rode Scan e acompanhe o feedback.`);
    setMode('simulate');
  }

  function nextPlcMission(currentMission: PlcMission | null): PlcMission | null {
    if (!currentMission) return null;
    const allMissions = plcMissionTracks.flatMap((track) => track.missions);
    const currentIndex = allMissions.findIndex((mission) => mission.id === currentMission.id);
    if (currentIndex < 0) return null;
    return allMissions[currentIndex + 1] ?? null;
  }

  function openNextPlcMission() {
    const nextMission = nextPlcMission(activePlcMission);
    if (!nextMission) return;
    openPlcMission(nextMission);
  }

  function openLessonInSimulator(lesson: Lesson) {
    setEditorProject(createLessonEditorProject(lesson.id));
    setEditorState(createInitialEditorState());
    setEditorRuntime(createInitialRuntimeState());
    setEditorScanNumber(0);
    setAutoScan(false);
    setSelectedComponent(null);
    setPracticeLesson(lesson);
    setActivePlcMission(null);
    setCompletedPracticeSteps({});
    setEditorMode('edit');
    setEditorMessage(`Prática da lição "${lesson.title}" carregada. Revise o objetivo acima, entre em Simular e execute os passos.`);
    setMode('simulate');
  }

  function loadEducationalExample(example: EditorExampleProject) {
    if (editingLocked) return;
    openEducationalExample(example, false);
  }

  function openEducationalExample(example: EditorExampleProject, navigateToSimulator = true) {
    setEditorProject(example.project);
    setEditorState(createInitialEditorState());
    setEditorRuntime(createInitialRuntimeState());
    setEditorScanNumber(0);
    setAutoScan(false);
    setSelectedComponent(null);
    setPracticeLesson(null);
    setActivePlcMission(null);
    setCompletedPracticeSteps({});
    setEditorMode('edit');
    setEditorMessage(`${example.title} carregado. Alterne para Simular e acione as entradas indicadas na Tabela de I/O para testar.`);
    if (navigateToSimulator) setMode('simulate');
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
    setAutoScan(false);
  }

  function toggleSafetyInput(inputId: 'I2' | 'I3') {
    const current = Boolean(evaluation.state[inputId]);
    applyInput(inputId, !current);
  }

  async function buyPro() {
    const result = await purchaseProBetaMock(accountSession);
    setProAccess(result.access);
    setCommerceMessage(result.message);
  }

  async function restorePro() {
    const result = await restoreProBetaMock(accountSession);
    setProAccess(result.access);
    setCommerceMessage(result.message);
  }

  function signInAccount(provider: 'email' | 'google') {
    if (!isValidAccountEmail(accountEmailInput)) {
      setCommerceMessage('Informe um e-mail válido para vincular a licença Pro.');
      return;
    }

    const session = provider === 'google'
      ? signInWithGoogleBetaMock(accountEmailInput)
      : signInWithEmailBetaMock(accountEmailInput);
    setAccountSession(session);
    setCommerceMessage(provider === 'google'
      ? `Conta Google beta conectada: ${session.email}.`
      : `E-mail confirmado para beta: ${session.email}.`);
  }

  function commitEditorEvaluation(nextScan: number, result: ReturnType<typeof evaluateEditorProject>) {
    editorScanNumberRef.current = nextScan;
    editorStateRef.current = result.state;
    editorRuntimeRef.current = result.runtime;
    setEditorScanNumber(nextScan);
    setEditorState(result.state);
    setEditorRuntime(result.runtime);
  }

  function runEditorScanFromRefs() {
    const nextScan = editorScanNumberRef.current + 1;
    const result = evaluateEditorProject(
      editorProjectRef.current,
      editorStateRef.current,
      nextScan,
      editorRuntimeRef.current,
    );
    commitEditorEvaluation(nextScan, result);
  }

  function runEditorScan() {
    if (editorMode !== 'simulate') return;
    runEditorScanFromRefs();
  }

  function changeEditorMode(nextMode: EditorRunMode) {
    setEditorMode(nextMode);
    setAutoScan(nextMode === 'simulate');
  }

  function checkCircuit() {
    const activeRung = editorProject.rungs.find((rung) => rung.id === editorProject.selectedRungId) ?? editorProject.rungs[0];
    const startVariable = activeRung.seriesBlocks[0]?.variable ?? 'I0.0';
    const stopVariable = activeRung.seriesBlocks.find((block) => block.contactMode === 'NC')?.variable ?? 'I0.1';
    const outputVariable = activeRung.coilBlock?.variable ?? 'Q0.0';
    let state = createInitialEditorState();
    let runtime = createInitialRuntimeState();

    let result = evaluateEditorProject(editorProject, state, 1, runtime);
    state = result.state;
    runtime = result.runtime;

    result = setEditorInput(editorProject, state, startVariable, true, 2, runtime);
    state = result.state;
    runtime = result.runtime;
    const starts = Boolean(state[outputVariable]);

    result = setEditorInput(editorProject, state, startVariable, false, 3, runtime);
    state = result.state;
    runtime = result.runtime;
    const seals = Boolean(state[outputVariable]);

    result = setEditorInput(editorProject, state, stopVariable, true, 4, runtime);
    state = result.state;
    const stops = !Boolean(state[outputVariable]);

    if (starts && seals && stops) {
      setEditorMessage('Check aprovado: Start liga, o selo mantém o Motor e Stop desliga.');
      return;
    }

    setEditorMessage('Check falhou: o circuito precisa ligar com Start, manter pelo selo e desligar com Stop.');
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

  function setEditorValue(variable: string, value: boolean | number) {
    const address = variable.trim().toUpperCase();
    setEditorState((current) => ({
      ...current,
      [address]: value,
    }));
  }

  function nextVariableAddress(dataType: EditorVariableDataType, current: EditorProjectState): string {
    const used = new Set<string>();
    for (const variable of current.projectVariables ?? []) used.add(variable.id);
    for (const rung of current.rungs) {
      const blocks = [
        ...rung.seriesBlocks,
        ...rung.parallelBlocks,
        ...parallelBranchesForRung(rung).flatMap((branch) => branch.blocks),
        ...(rung.coilBlock ? [rung.coilBlock] : []),
      ];
      for (const block of blocks) {
        [block.variable, block.sourceA, block.sourceB, block.destination, block.downSource, block.resetSource]
          .filter((value): value is string => Boolean(value && Number.isNaN(Number(value))))
          .forEach((value) => used.add(value.trim().toUpperCase()));
      }
    }

    const prefix = dataType === 'number' ? 'N' : dataType === 'timer' ? 'T' : dataType === 'counter' ? 'C' : 'M';
    for (let index = 0; index < 999; index += 1) {
      const candidate = dataType === 'boolean' ? `${prefix}${index}.0` : `${prefix}${index}`;
      if (!used.has(candidate)) return candidate;
    }
    return dataType === 'boolean' ? 'M999.0' : `${prefix}999`;
  }

  function addEditorVariable(name: string, dataType: EditorVariableDataType) {
    if (editingLocked) return;
    setEditorProject((current) => {
      const rawName = name.trim().toUpperCase().replace(/\s/g, '');
      const rawIsAddress = /^[IQOMCTN]\d+(\.\d+)?$/.test(rawName);
      const rawMatchesType = dataType === 'timer'
        ? rawName.startsWith('T')
        : dataType === 'counter'
          ? rawName.startsWith('C')
          : dataType === 'number'
            ? rawName.startsWith('N')
            : rawIsAddress;
      const address = rawName && rawIsAddress && rawMatchesType
        ? rawName
        : nextVariableAddress(dataType, current);
      const displayName = rawName && rawName !== address ? rawName : address;
      const exists = (current.projectVariables ?? []).some((variable) => variable.id === address);
      if (exists) {
        setEditorMessage(`A variável ${address} já existe na Tabela de I/O.`);
        return current;
      }
      const scope = address.startsWith('I') ? 'input' : address.startsWith('Q') || address.startsWith('O') ? 'output' : 'memory';
      setEditorState((state) => ({
        ...state,
        [address]: dataType === 'number' ? 0 : false,
      }));
      setEditorMessage(`${dataType === 'boolean' ? 'Tag booleana' : dataType === 'number' ? 'Tag numérica' : dataType === 'timer' ? 'Timer tag' : 'Counter tag'} ${address} adicionada à Tabela de Tags/I/O.`);
      return {
        ...current,
        projectVariables: [
          ...(current.projectVariables ?? []),
          {
            id: address,
            address,
            name: displayName,
            scope,
            dataType,
          },
        ],
      };
    });
  }

  function removeEditorVariable(variableId: string) {
    if (editingLocked) return;
    const address = variableId.trim().toUpperCase();
    setEditorProject((current) => {
      const used = current.rungs.some((rung) => {
        const blocks = [
          ...rung.seriesBlocks,
          ...rung.parallelBlocks,
          ...parallelBranchesForRung(rung).flatMap((branch) => branch.blocks),
          ...(rung.coilBlock ? [rung.coilBlock] : []),
        ];
        return blocks.some((block) =>
          [block.variable, block.sourceA, block.sourceB, block.destination, block.downSource, block.resetSource]
            .some((value) => value?.trim().toUpperCase() === address),
        );
      });

      if (used) {
        setEditorMessage(`A variável ${address} está em uso no Ladder. Remova ou altere os blocos antes de excluir.`);
        return current;
      }

      setEditorState((state) => {
        const nextState = { ...state };
        delete nextState[address];
        return nextState;
      });
      setEditorMessage(`Variável ${address} removida da Tabela de I/O.`);
      return {
        ...current,
        projectVariables: (current.projectVariables ?? []).filter((variable) => variable.id !== address),
      };
    });
  }

  function selectEditorZone(zone: EditorInsertionZone, seriesIndex?: number) {
    if (editingLocked) return;
    setEditorProject((current) => ({
      ...current,
      selectedZone: zone,
      selectedSeriesIndex: typeof seriesIndex === 'number' ? seriesIndex : current.selectedSeriesIndex,
      selectedBlockId: null,
    }));
    setEditorMessage(null);
  }

  function selectEditorBlock(blockId: string, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
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
        selectedSeriesIndex: 0,
        rungs: [
          ...current.rungs,
          {
            id: rungId,
            label: `Linha ${nextIndex} — Novo comando`,
            seriesBlocks: [],
            parallelBlocks: [],
            parallelBranches: [],
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

  function findSimulatorComponent(componentId: string): SimulatorComponent {
    return simulatorComponents.find((component) => component.id === componentId) ?? simulatorComponents[0];
  }

  function addComponentToEditor(component: SimulatorComponent, requestedZone?: EditorInsertionZone, requestedSeriesIndex?: number, allowLocked = false) {
    setSelectedComponent(component);
    if (editingLocked && !allowLocked) return;

    const insertionZone = requestedZone ?? editorProject.selectedZone;

    if (!canInsertComponentInZone(component, insertionZone)) {
      setEditorMessage(explainInsertionRule(component, insertionZone));
      return;
    }

    setEditorProject((current) => {
      const block = {
        ...createEditorBlock(component, insertionZone),
        parallelIndex: insertionZone === 'parallel' ? requestedSeriesIndex ?? current.selectedSeriesIndex : undefined,
      };
      let nextSelectedSeriesIndex = current.selectedSeriesIndex;
      const nextRungs = current.rungs.map((rung) => {
        if (rung.id !== current.selectedRungId) return rung;

        if (insertionZone === 'series') {
          const selectedBlockIndex = rung.seriesBlocks.findIndex((item) => item.id === current.selectedBlockId);
          const requestedIndex = typeof requestedSeriesIndex === 'number'
            ? requestedSeriesIndex
            : typeof current.selectedSeriesIndex === 'number'
              ? current.selectedSeriesIndex
              : rung.seriesBlocks.length - 1;
          const insertAfterIndex = selectedBlockIndex >= 0 ? selectedBlockIndex : requestedIndex;
          const insertAt = Math.min(Math.max(insertAfterIndex + 1, 0), rung.seriesBlocks.length);
          const nextSeriesBlocks = [...rung.seriesBlocks];
          nextSeriesBlocks.splice(insertAt, 0, block);
          nextSelectedSeriesIndex = insertAt;
          return {
            ...rung,
            seriesBlocks: nextSeriesBlocks,
          };
        }

        if (insertionZone === 'parallel') {
          const branches = parallelBranchesForRung(rung);
          const selectedBranch = branches.find((branch) => branch.blocks.some((item) => item.id === current.selectedBlockId));

          if (selectedBranch) {
            return {
              ...rung,
              parallelBlocks: [],
              parallelBranches: branches.map((branch) => {
                if (branch.id !== selectedBranch.id) return branch;
                const selectedBranchBlockIndex = branch.blocks.findIndex((item) => item.id === current.selectedBlockId);
                const insertAfterIndex = selectedBranchBlockIndex >= 0 ? selectedBranchBlockIndex : branch.blocks.length - 1;
                const insertAt = Math.min(Math.max(insertAfterIndex + 1, 0), branch.blocks.length);
                const nextBranchBlocks = [...branch.blocks];
                nextBranchBlocks.splice(insertAt, 0, block);
                return { ...branch, blocks: nextBranchBlocks };
              }),
            };
          }

          return {
            ...rung,
            parallelBlocks: [],
            parallelBranches: [
              ...branches,
              {
                id: `branch-${Date.now()}`,
                seriesIndex: requestedSeriesIndex ?? current.selectedSeriesIndex,
                blocks: [block],
              },
            ],
          };
        }

        return { ...rung, coilBlock: block };
      });

      return {
        ...current,
        selectedBlockId: block.id,
        selectedZone: insertionZone,
        selectedSeriesIndex: nextSelectedSeriesIndex,
        rungs: nextRungs,
      };
    });
    setEditorMessage(`${component.name} inserido em ${insertionZone}.`);
  }

  function updateSelectedBlockVariable(variable: string, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    const normalizedVariable = variable.trim().toUpperCase();
    if (!normalizedVariable) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return mapProjectBlocks(current, (block) =>
        block.id === current.selectedBlockId ? { ...block, variable: normalizedVariable } : block,
      );
    });
  }

  function updateSelectedBlockText(field: 'name' | 'description', value: string, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return mapProjectBlocks(current, (block) =>
        block.id === current.selectedBlockId ? { ...block, [field]: value } : block,
      );
    });
  }

  function updateSelectedBlockContactMode(contactMode: EditorContactMode, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return mapProjectBlocks(current, (block) =>
        block.id === current.selectedBlockId ? { ...block, contactMode } : block,
      );
    });
  }

  function updateSelectedBlockCoilMode(coilMode: EditorCoilMode, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
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

  function updateSelectedBlockTimerMode(timerMode: EditorTimerMode, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? { ...rung.coilBlock, timerMode } : rung.coilBlock,
        })),
      };
    });
  }

  function updateSelectedBlockCounterMode(counterMode: EditorCounterMode, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? { ...rung.coilBlock, counterMode } : rung.coilBlock,
        })),
      };
    });
  }

  function updateSelectedBlockCompareMode(compareMode: EditorCompareMode, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return mapProjectBlocks(current, (block) =>
        block.id === current.selectedBlockId ? { ...block, compareMode } : block,
      );
    });
  }

  function updateSelectedBlockMathMode(mathMode: EditorMathMode, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return mapProjectBlocks(current, (block) =>
        block.id === current.selectedBlockId ? { ...block, mathMode } : block,
      );
    });
  }

  function updateSelectedBlockOperand(field: 'sourceA' | 'sourceB' | 'destination' | 'downSource' | 'resetSource', value: string, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    const normalized = value.trim().toUpperCase().replace(/\s/g, '');
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return mapProjectBlocks(current, (block) =>
        block.id === current.selectedBlockId ? { ...block, [field]: normalized } : block,
      );
    });
  }

  function updateSelectedBlockPresetMs(presetMs: number, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
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

  function updateSelectedBlockPreset(preset: number, allowLocked = false) {
    if (editingLocked && !allowLocked) return;
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

  function removeSelectedEditorBlock(allowLocked = false) {
    if (editingLocked && !allowLocked) return;
    setEditorProject((current) => {
      if (!current.selectedBlockId) return current;
      return {
        ...current,
        selectedBlockId: null,
        rungs: current.rungs.map((rung) => ({
          ...rung,
          seriesBlocks: rung.seriesBlocks.filter((block) => block.id !== current.selectedBlockId),
          parallelBlocks: rung.parallelBranches ? rung.parallelBlocks : [],
          parallelBranches: parallelBranchesForRung(rung)
            .map((branch) => ({
              ...branch,
              blocks: branch.blocks.filter((block) => block.id !== current.selectedBlockId),
            }))
            .filter((branch) => branch.blocks.length > 0),
          coilBlock: rung.coilBlock?.id === current.selectedBlockId ? null : rung.coilBlock,
        })),
      };
    });
    setEditorMessage(null);
  }

  const selectedEditorBlock = editorProject.rungs
    .flatMap((rung) => [
      ...rung.seriesBlocks,
      ...rung.parallelBlocks,
      ...parallelBranchesForRung(rung).flatMap((branch) => branch.blocks),
      ...(rung.coilBlock ? [rung.coilBlock] : []),
    ])
    .find((block) => block.id === editorProject.selectedBlockId) ?? null;
  const editorVariableSuggestions = editorProject.projectVariables ?? [];
  const availableLessons = lessons.filter((lesson) => lesson.status === 'available');

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={[styles.container, desktopLayout && styles.containerDesktop, compactSimulator && mode === 'simulate' && styles.containerCompact]}>
        {mode === 'home' ? (
          <>
            <HomeHero />
            <LaunchQuickStartPanel
              examples={educationalEditorExamples}
              onOpenExample={(example) => openEducationalExample(example, true)}
              onOpenLearn={() => setMode('learn')}
              onOpenReference={() => setMode('reference')}
              onOpenHardware={() => setMode('hardware')}
            />
            <LearningPathPanel />
            <AppCard
              title="Aprenda"
              description="Lições guiadas e exemplos passo a passo sobre comandos elétricos e lógica Ladder."
              badge="Livre"
              tone="cyan"
              icon={<Text style={styles.homeIcon}>Aula</Text>}
              onPress={() => setMode('learn')}
            />
            <AppCard
              title="Simular"
              description="Monte, edite e simule seus projetos Ladder com canvas visual, scans e diagnóstico."
              badge="Editor"
              tone="green"
              icon={<Text style={styles.homeIcon}>CLP</Text>}
              onPress={openSimulator}
            />
            <AppCard
              title="Pro"
              description="Ferramentas avançadas, diagnósticos, modelos completos e roteiro de evolução do laboratório."
              badge="Avançado"
              tone="amber"
              icon={<Text style={[styles.homeIcon, styles.homeIconAmber]}>Plus</Text>}
              onPress={() => handleBottomNav('pro')}
            />
            <View style={styles.featureStrip}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>▦</Text>
                <Text style={styles.featureTitle}>SCANS</Text>
                <Text style={styles.featureText}>+100ms</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>◴</Text>
                <Text style={styles.featureTitle}>TEMPORIZADORES</Text>
                <Text style={styles.featureText}>TON / TOF</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>#</Text>
                <Text style={styles.featureTitle}>CONTADORES</Text>
                <Text style={styles.featureText}>CTU / CTD</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>┤├</Text>
                <Text style={styles.featureTitle}>LADDER</Text>
                <Text style={styles.featureText}>Visual</Text>
              </View>
            </View>
            <Text style={styles.footer}>Easy-CLP: aprenda, simule e automatize. Do básico ao avançado, no seu celular.</Text>
          </>
        ) : null}

        {mode === 'learn' ? (
          <>
            <AppHeader title="Modo Aprender" subtitle="Escolha uma lição, entenda a teoria e depois pratique no simulador quando a lição permitir." />
            <AdPlaceholder placement="bannerLearning" visible={showAds} />
            <PlcMissionPathPanel
              tracks={plcMissionTracks}
              activeMissionId={activePlcMission?.id}
              completedMissionIds={completedMissionIds}
              onOpenMission={openPlcMission}
            />
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
            <LessonDetail lesson={selectedLesson} onOpenSimulator={() => openLessonInSimulator(selectedLesson)} />
            <AppCard title="Voltar para lições" description="Escolher outra lição." onPress={() => setMode('learn')} />
          </>
        ) : null}

        {mode === 'projects' ? (
          <>
            <AppHeader title="Projetos" subtitle="Modelos prontos para abrir no simulador, estudar a lógica e adaptar para novas práticas." />
            <AdPlaceholder placement="bannerProjects" visible={showAds} />
            <View style={styles.pagePanel}>
              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderText}>
                  <Text style={styles.panelTitle}>Biblioteca de automação</Text>
                  <Text style={styles.panelSubtitle}>Cada projeto carrega um Ladder completo com tags, linhas, paralelos e bobinas configuradas.</Text>
                </View>
                <Text style={styles.panelBadge}>Livre</Text>
              </View>
              <View style={styles.projectGrid}>
                {educationalEditorExamples.map((example) => (
                  <Pressable
                    key={example.id}
                    onPress={() => openEducationalExample(example)}
                    style={({ pressed }) => [styles.projectTile, pressed && styles.pressed]}
                  >
                    <View style={styles.projectTileHeader}>
                      <Text style={styles.projectTileTitle}>{example.title}</Text>
                      <Text style={styles.projectDifficulty}>{example.difficulty}</Text>
                    </View>
                    <Text style={styles.projectTileDescription}>{example.description}</Text>
                    <View style={styles.projectTileFooter}>
                      <Text style={styles.projectMeta}>{example.project.rungs.length} linhas</Text>
                      <Text style={styles.openProjectText}>Abrir no simulador</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {mode === 'hardware' ? (
          <>
            <AppHeader title="Hardware" subtitle="Exportação e pinagem ficam separadas da simulação. Abra um projeto salvo/carregado e depois escolha placa, pinos e código." />
            <HardwareExportPanel editorProject={editorProject} />
          </>
        ) : null}

        {mode === 'pro' ? (
          <>
            <AppHeader title="Easy-CLP Pro" subtitle="Compra única para liberar a camada avançada. No beta, o fluxo abaixo usa um adaptador simulado." />
            <View style={[styles.pagePanel, styles.paywallPanel]}>
              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderText}>
                  <Text style={styles.panelTitle}>{proAccess.isPro ? 'Pro ativo' : 'Upgrade Pro vitalício'}</Text>
                  <Text style={styles.panelSubtitle}>
                    {proAccess.isPro
                      ? `Acesso liberado para ${proAccess.accountEmail ?? 'conta beta'} por ${proAccess.source === 'beta_account_mock' ? 'modo beta' : 'Google Play'}.`
                      : 'Freemium com compra única vinculada ao e-mail/Google, não apenas ao dispositivo.'}
                  </Text>
                </View>
                <Text style={[styles.panelBadge, proAccess.isPro ? styles.panelBadgeProActive : styles.panelBadgeAmber]}>
                  {proAccess.isPro ? 'Ativo' : 'Compra única'}
                </Text>
              </View>
              <View style={styles.purchaseMetaBox}>
                <Text style={styles.purchaseMetaLabel}>Produto da loja</Text>
                <Text style={styles.purchaseMetaValue}>{EASY_CLP_PRO_PRODUCT_ID}</Text>
              </View>
              <View style={styles.accountBox}>
                <Text style={styles.purchaseMetaLabel}>Conta da licença</Text>
                <Text style={styles.purchaseMetaValue}>
                  {accountSession.isSignedIn ? `${accountSession.email} (${accountSession.provider === 'google' ? 'Google beta' : 'e-mail beta'})` : 'Nenhuma conta conectada'}
                </Text>
                <TextInput
                  value={accountEmailInput}
                  onChangeText={setAccountEmailInput}
                  placeholder="seuemail@gmail.com"
                  placeholderTextColor={colors.textDim}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.accountInput}
                />
                <View style={styles.accountActions}>
                  <Pressable onPress={() => signInAccount('email')} style={({ pressed }) => [styles.restoreAction, pressed && styles.pressed]}>
                    <Text style={styles.restoreActionText}>Confirmar e-mail</Text>
                  </Pressable>
                  <Pressable onPress={() => signInAccount('google')} style={({ pressed }) => [styles.googleAction, pressed && styles.pressed]}>
                    <Text style={styles.googleActionText}>Conectar Google</Text>
                  </Pressable>
                </View>
                <Text style={styles.accountHint}>Beta: simula identidade de conta. Na loja, este fluxo será substituído por Google Sign-In + confirmação do token de compra.</Text>
              </View>
              <View style={styles.purchaseMetaBox}>
                <Text style={styles.purchaseMetaLabel}>Anúncios no plano livre</Text>
                <Text style={styles.purchaseMetaValue}>{showAds ? 'Reservados via beta mock' : 'Removidos para usuário Pro'}</Text>
              </View>
              {proAccess.googlePurchaseToken ? (
                <View style={styles.purchaseMetaBox}>
                  <Text style={styles.purchaseMetaLabel}>Confirmação Google Play</Text>
                  <Text style={styles.purchaseMetaValue}>{proAccess.orderId} · token beta preparado</Text>
                </View>
              ) : null}
              <View style={styles.purchaseActions}>
                <Pressable onPress={buyPro} disabled={proAccess.isPro} style={({ pressed }) => [styles.primaryAction, proAccess.isPro && styles.disabled, pressed && !proAccess.isPro && styles.pressed]}>
                  <Text style={styles.primaryActionText}>{proAccess.isPro ? 'Pro liberado' : 'Simular compra Pro'}</Text>
                </Pressable>
                <Pressable onPress={restorePro} style={({ pressed }) => [styles.restoreAction, pressed && styles.pressed]}>
                  <Text style={styles.restoreActionText}>Restaurar compra</Text>
                </Pressable>
              </View>
              {commerceMessage ? <Text style={styles.commerceMessage}>{commerceMessage}</Text> : null}
            </View>
            <View style={styles.pagePanel}>
              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderText}>
                  <Text style={styles.panelTitle}>Recursos da camada Pro</Text>
                  <Text style={styles.panelSubtitle}>Catálogo preparado para o paywall. Durante o beta, seguimos testando a experiência sem cobrança real.</Text>
                </View>
                <Text style={[styles.panelBadge, styles.panelBadgeAmber]}>Pro</Text>
              </View>
              <View style={styles.capabilityGrid}>
                {proFeatureGroups.map(([title, description]) => (
                  <View key={title} style={styles.capabilityTile}>
                    <Text style={styles.capabilityTitle}>{title}</Text>
                    <Text style={styles.capabilityText}>{description}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.pagePanel}>
              <Text style={styles.panelTitle}>Próximos acabamentos</Text>
              <Text style={styles.panelSubtitle}>Salvar projetos, exportar, duplicar modelos, organizar turmas e remover anúncios entram como camada de produto, sem bloquear o laboratório atual.</Text>
              <Pressable onPress={() => setMode('projects')} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
                <Text style={styles.primaryActionText}>Ver modelos prontos</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {mode === 'simulate' ? (
          <>
            <View style={[styles.simulatorStage, compactSimulator && styles.simulatorStageCompact]}>
              <View style={[styles.simulatorTopBar, compactSimulator && styles.simulatorTopBarCompact]}>
                <View style={styles.simulatorTopText}>
                  <Text style={styles.simulatorEyebrow}>Easy-CLP</Text>
                  <Text style={styles.simulatorTitle}>{activePlcMission ? activePlcMission.title : practiceLesson ? practiceLesson.title : 'Bancada Ladder'}</Text>
                </View>
                <View style={styles.simulatorTopActions}>
                  {practiceLesson ? (
                    <Pressable onPress={() => setMode('lesson')} style={({ pressed }) => [styles.simulatorGhostButton, pressed && styles.pressed]}>
                      <Text style={styles.simulatorGhostText}>Aula</Text>
                    </Pressable>
                  ) : null}
                  <Pressable onPress={resetSimulation} style={({ pressed }) => [styles.simulatorGhostButton, pressed && styles.pressed]}>
                    <Text style={styles.simulatorGhostText}>Reset</Text>
                  </Pressable>
                  <Pressable onPress={() => setMode('projects')} style={({ pressed }) => [styles.simulatorExitButton, pressed && styles.pressed]}>
                    <Text style={styles.simulatorExitText}>Sair</Text>
                  </Pressable>
                </View>
              </View>

              
            {!compactSimulator ? (
              <SimulatorDialectPanel
              editorProject={editorProject}
              selectedProfile={selectedPlcProfile}
              onSelectProfile={setSelectedPlcProfile}
              compact={compactSimulator}
            />
            ) : null}
            {compactSimulator ? (
              <SmartphoneSimulationPanel
                editorProject={editorProject}
                plcState={editorEvaluation.state}
                evaluation={editorEvaluation}
                selectedProfile={selectedPlcProfile}
                onSelectProfile={setSelectedPlcProfile}
                mission={activePlcMission}
                mode={editorMode}
                autoScan={autoScan}
                onRunScan={runEditorScan}
                onToggleAutoScan={() => setAutoScan((current) => !current)}
                onSetValue={setEditorValue}
                onChangeMode={changeEditorMode}
                onSelectBlockId={(blockId) => selectEditorBlock(blockId, true)}
                onChangeBlockVariable={(variable) => updateSelectedBlockVariable(variable, true)}
                onChangeBlockName={(name) => updateSelectedBlockText('name', name, true)}
                onChangeContactMode={(mode) => updateSelectedBlockContactMode(mode, true)}
                onChangeCoilMode={(mode) => updateSelectedBlockCoilMode(mode, true)}
                onChangeTimerMode={(mode) => updateSelectedBlockTimerMode(mode, true)}
                onChangeCounterMode={(mode) => updateSelectedBlockCounterMode(mode, true)}
                onChangeCompareMode={(mode) => updateSelectedBlockCompareMode(mode, true)}
                onChangeMathMode={(mode) => updateSelectedBlockMathMode(mode, true)}
                onChangeSourceA={(value) => updateSelectedBlockOperand('sourceA', value, true)}
                onChangeSourceB={(value) => updateSelectedBlockOperand('sourceB', value, true)}
                onChangeDestination={(value) => updateSelectedBlockOperand('destination', value, true)}
                onChangeDownSource={(value) => updateSelectedBlockOperand('downSource', value, true)}
                onChangeResetSource={(value) => updateSelectedBlockOperand('resetSource', value, true)}
                onChangePresetMs={(presetMs) => updateSelectedBlockPresetMs(presetMs, true)}
                onChangePreset={(preset) => updateSelectedBlockPreset(preset, true)}
                onAddContact={() => addComponentToEditor(findSimulatorComponent('contact-no'), 'series', undefined, true)}
                onAddCoil={() => addComponentToEditor(findSimulatorComponent('coil-q'), 'coil', undefined, true)}
                onAddTimer={() => addComponentToEditor(findSimulatorComponent('timer-ton'), 'coil', undefined, true)}
                onAddBranch={() => addComponentToEditor(findSimulatorComponent('contact-no'), 'parallel', undefined, true)}
                onAddRung={addNewRung}
                onRemoveRung={removeSelectedRung}
                onRemoveBlock={() => removeSelectedEditorBlock(true)}
                onAdvanceMission={nextPlcMission(activePlcMission) ? openNextPlcMission : undefined}
              />
            ) : null}
            {!compactSimulator ? (
              <PlcWorkbench
                editor={editorProject}
                state={editorEvaluation.state}
                evaluation={editorEvaluation}
                mode={editorMode}
                autoScan={autoScan}
                locked={editingLocked}
                message={editorMessage}
                onSelectZone={selectEditorZone}
                onSelectBlock={selectEditorBlock}
                onSelectComponent={addComponentToEditor}
                onToggleInput={toggleEditorInput}
                onSetValue={setEditorValue}
                onRunScan={runEditorScan}
                onToggleAutoScan={() => editingLocked && setAutoScan((current) => !current)}
                onCheckCircuit={checkCircuit}
                onChangeMode={changeEditorMode}
                onSelectRung={selectEditorRung}
                onAddRung={addNewRung}
                onRemoveRung={removeSelectedRung}
                onAddVariable={addEditorVariable}
                onRemoveVariable={removeEditorVariable}
              />
            ) : null}
              {!compactSimulator && !editingLocked ? (
                <SelectedBlockEditor
                  block={selectedEditorBlock}
                  variables={editorVariableSuggestions}
                  onChangeVariable={updateSelectedBlockVariable}
                  onChangeName={(name) => updateSelectedBlockText('name', name)}
                  onChangeDescription={(description) => updateSelectedBlockText('description', description)}
                  onChangeContactMode={updateSelectedBlockContactMode}
                  onChangeCoilMode={updateSelectedBlockCoilMode}
                  onChangeTimerMode={updateSelectedBlockTimerMode}
                  onChangeCounterMode={updateSelectedBlockCounterMode}
                  onChangeCompareMode={updateSelectedBlockCompareMode}
                  onChangeMathMode={updateSelectedBlockMathMode}
                  onChangeSourceA={(value) => updateSelectedBlockOperand('sourceA', value)}
                  onChangeSourceB={(value) => updateSelectedBlockOperand('sourceB', value)}
                  onChangeDestination={(value) => updateSelectedBlockOperand('destination', value)}
                  onChangeDownSource={(value) => updateSelectedBlockOperand('downSource', value)}
                  onChangeResetSource={(value) => updateSelectedBlockOperand('resetSource', value)}
                  onChangePresetMs={updateSelectedBlockPresetMs}
                  onChangePreset={updateSelectedBlockPreset}
                  onRemove={removeSelectedEditorBlock}
                />
              ) : null}
            </View>
          </>
        ) : null}
        {mode !== 'simulate' ? <BottomNavigation active={activeNav} onChange={handleBottomNav} compact={false} /> : null}
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
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  containerDesktop: {
    maxWidth: 1440,
    paddingHorizontal: spacing.xxl,
  },
  containerCompact: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xl,
  },
  homeIcon: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  homeIconAmber: {
    color: colors.gold,
  },
  featureStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  featureItem: {
    flexBasis: '48%',
    flexGrow: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  featureIcon: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  featureText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  moduleBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
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
  pagePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  panelHeaderText: {
    flex: 1,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  panelSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  panelBadge: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelBadgeAmber: {
    color: colors.amber,
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  panelBadgeProActive: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  paywallPanel: {
    borderColor: colors.borderStrong,
  },
  purchaseMetaBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  accountBox: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  purchaseMetaLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  purchaseMetaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  purchaseActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
  },
  accountInput: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  accountActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  googleAction: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  googleActionText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '900',
  },
  accountHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  restoreAction: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  restoreActionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  commerceMessage: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  projectTile: {
    flexBasis: 260,
    flexGrow: 1,
    minHeight: 154,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  projectTileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  projectTileTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  projectDifficulty: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  projectTileDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  projectTileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  projectMeta: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '800',
  },
  openProjectText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  capabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  capabilityTile: {
    flexBasis: 230,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
  },
  capabilityTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  capabilityText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  primaryAction: {
    alignSelf: 'flex-start',
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  primaryActionText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '900',
  },
  simulatorStage: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  simulatorStageCompact: {
    minHeight: '100%',
    borderRadius: 0,
    borderWidth: 0,
    padding: 0,
    backgroundColor: colors.background,
    shadowOpacity: 0,
    elevation: 0,
  },
  simulatorTopBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  simulatorTopBarCompact: {
    borderRadius: 12,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  simulatorTopText: {
    flex: 1,
    minWidth: 0,
  },
  simulatorEyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  simulatorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  simulatorTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  simulatorGhostButton: {
    minHeight: 38,
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  simulatorGhostText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  simulatorExitButton: {
    minHeight: 38,
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.black,
  },
  simulatorExitText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
  simulatorModeBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  simulatorModeBannerCompact: {
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
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
  lessonPracticeBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  lessonPracticeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  lessonPracticeHeaderText: {
    flex: 1,
  },
  lessonBackButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cyanSoft,
  },
  lessonBackText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  lessonPracticePattern: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  lessonPracticePatternLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  lessonPracticePatternText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 19,
    marginTop: 2,
  },
  lessonPracticeSteps: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  lessonPracticeStep: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  lessonPracticeExpected: {
    color: colors.green,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  guidedPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  guidedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  guidedTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  guidedSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  guidedProgress: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    fontSize: 12,
    fontWeight: '900',
  },
  guidedProgressDone: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  guidedSteps: {
    gap: spacing.sm,
  },
  guidedStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
  },
  guidedStepRowDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  guidedStepState: {
    minWidth: 30,
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  guidedStepStateDone: {
    color: colors.green,
    borderColor: colors.green,
  },
  guidedStepTextBox: {
    flex: 1,
  },
  guidedStepLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  guidedStepLabelDone: {
    color: colors.green,
  },
  guidedStepHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  mobileExtrasToggle: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  mobileExtrasTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  mobileExtrasText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  mobileExtrasIcon: {
    color: colors.cyan,
    fontSize: 24,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
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
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
});
