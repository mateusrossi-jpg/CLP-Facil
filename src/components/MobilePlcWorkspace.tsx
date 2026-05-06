import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorBlock, EditorCoilMode, EditorCompareMode, EditorContactMode, EditorCounterMode, EditorMathMode, EditorProjectState, EditorTimerMode } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';
import { PlcMission } from '../lessons/missionTypes';
import { evaluateMissionAttempt } from '../lessons/missionValidation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { collectMobileIoPoints, isMobileIoActive, mobileIoValueLabel } from '../simulation/mobileIoPoints';
import { MobileIoDock } from './MobileIoDock';
import { MobileRungViewer } from './MobileRungViewer';
import { MobileSimulationControls } from './MobileSimulationControls';
import { MobileHardwareExportPanel } from './mobileWorkbench/MobileHardwareExportPanel';
import { EditorRunMode } from './EditorModeToggle';

type MobilePlcWorkspaceProps = {
  editorProject: EditorProjectState;
  plcState: PlcState;
  evaluation: EditorEvaluationResult;
  autoScan?: boolean;
  mode?: EditorRunMode;
  mission?: PlcMission;
  missionTitle?: string;
  onSetValue?: (variable: string, value: boolean | number) => void;
  onRunScan?: () => void;
  onToggleAutoScan?: () => void;
  onChangeMode?: (mode: EditorRunMode) => void;
  onSelectRungId?: (rungId: string) => void;
  onSelectBlockId?: (blockId: string) => void;
  onChangeBlockVariable?: (variable: string) => void;
  onChangeBlockName?: (name: string) => void;
  onChangeContactMode?: (mode: EditorContactMode) => void;
  onChangeCoilMode?: (mode: EditorCoilMode) => void;
  onChangeTimerMode?: (mode: EditorTimerMode) => void;
  onChangeCounterMode?: (mode: EditorCounterMode) => void;
  onChangeCompareMode?: (mode: EditorCompareMode) => void;
  onChangeMathMode?: (mode: EditorMathMode) => void;
  onChangeSourceA?: (value: string) => void;
  onChangeSourceB?: (value: string) => void;
  onChangeDestination?: (value: string) => void;
  onChangeDownSource?: (value: string) => void;
  onChangeResetSource?: (value: string) => void;
  onChangePresetMs?: (presetMs: number) => void;
  onChangePreset?: (preset: number) => void;
  onAddContact?: () => void;
  onAddCoil?: () => void;
  onAddTimer?: () => void;
  onAddCounter?: () => void;
  onAddBranch?: () => void;
  onAddRung?: () => void;
  onRemoveRung?: () => void;
  onRemoveBlock?: () => void;
  onAdvanceMission?: () => void;
};

const noop = () => undefined;

type EditorToolId = 'contact' | 'coil' | 'timer' | 'counter' | 'branch';
type DragBounds = { x: number; y: number; width: number; height: number };
type DragPoint = { x: number; y: number };
type DragState = { toolId: EditorToolId; x: number; y: number; overDrop: boolean };

const editorTools: { id: EditorToolId; label: string; symbol: string; hint: string }[] = [
  { id: 'contact', label: 'Contato', symbol: '--| |--', hint: 'soltar na serie' },
  { id: 'coil', label: 'Bobina', symbol: '--( )--', hint: 'soltar como saida' },
  { id: 'timer', label: 'Timer', symbol: '[TON]', hint: 'soltar como saida' },
  { id: 'counter', label: 'Contador', symbol: '[CTU]', hint: 'soltar como saida' },
  { id: 'branch', label: 'Branch', symbol: 'BR', hint: 'soltar em paralelo' },
];

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

function findBlockRungIndex(project: EditorProjectState, blockId: string): number {
  return project.rungs.findIndex((rung) => {
    const blocks = [
      ...rung.seriesBlocks,
      ...rung.parallelBlocks,
      ...(rung.parallelBranches ?? []).flatMap((branch) => branch.blocks),
      ...(rung.coilBlock ? [rung.coilBlock] : []),
    ];
    return blocks.some((block) => block.id === blockId);
  });
}

function normalizeVariableInput(value: string): string {
  return value.toUpperCase().replace(/\s/g, '');
}

function eventPoint(event: GestureResponderEvent): DragPoint {
  const nativeEvent = event.nativeEvent;
  return { x: nativeEvent.pageX, y: nativeEvent.pageY };
}

function pointInsideBounds(point: DragPoint, bounds: DragBounds | null): boolean {
  if (!bounds) return false;
  return point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;
}

function readBlockValue(block: EditorBlock, state: PlcState): string {
  const address = normalizeVariableInput(block.destination || block.variable || block.sourceA || '');
  if (!address) return 'sem tag';
  const value = state[address];
  if (typeof value === 'number') return `${address} = ${value}`;
  return `${address} ${value ? 'ON' : 'OFF'}`;
}

function readMissionPoint(state: PlcState, address: string | undefined): boolean {
  const normalized = normalizeVariableInput(address ?? '');
  if (!normalized) return false;
  const compact = normalized.replace('.0', '');
  const dotted = normalized.includes('.') ? normalized : `${normalized}.0`;
  const value = state[normalized] ?? state[compact] ?? state[dotted];
  return typeof value === 'number' ? value !== 0 : Boolean(value);
}

function missionAddressLabel(address: string | undefined, fallback: string): string {
  const normalized = normalizeVariableInput(address ?? '');
  return normalized || fallback;
}

function missionCoachStep(
  mission: PlcMission | undefined,
  state: PlcState,
  evaluation: EditorEvaluationResult,
  passed: boolean,
  editMode: boolean,
): { label: string; title: string; text: string } | null {
  if (!mission) return null;
  if (passed) {
    return {
      label: 'Concluído',
      title: 'Você validou a missão',
      text: 'Revise a explicação final e avance quando estiver confortável com o comportamento.',
    };
  }
  if (editMode) {
    return {
      label: 'Agora',
      title: 'Monte ou ajuste a lógica',
      text: 'Toque em um bloco para editar. Use Contato, Bobina, Timer ou Branch apenas quando a missão pedir.',
    };
  }

  const firstRule = mission.validation[0];
  if (!firstRule) {
    return {
      label: 'Agora',
      title: 'Teste a missão',
      text: 'Acione uma entrada, rode Scan e observe se o rung explica o resultado.',
    };
  }

  if (firstRule.type === 'output_on_when_input_on') {
    if (!readMissionPoint(state, firstRule.input)) {
      return { label: 'Agora', title: `Toque em ${missionAddressLabel(firstRule.input, 'a entrada')}`, text: 'A entrada precisa ficar ON para o contato conduzir.' };
    }
    if ((evaluation.scanNumber ?? 0) === 0) {
      return { label: 'Depois', title: 'Rode um Scan', text: 'O CLP só atualiza a saída depois de ler entradas e resolver a lógica.' };
    }
    return { label: 'Observe', title: `Confira ${missionAddressLabel(firstRule.output, 'a saída')}`, text: 'Veja se a saída ficou ON e se o rung mostra caminho energizado.' };
  }

  if (firstRule.type === 'stop_blocks_output') {
    if (!readMissionPoint(state, firstRule.stopInput)) {
      return { label: 'Agora', title: `Acione ${missionAddressLabel(firstRule.stopInput, 'o Stop')}`, text: 'O Stop deve cortar o caminho de energia lógica.' };
    }
    return { label: 'Observe', title: `Confirme ${missionAddressLabel(firstRule.output, 'a saída')} OFF`, text: 'Se a saída continuar ON, revise o selo ou algum paralelo indevido.' };
  }

  if (firstRule.type === 'scan_concept') {
    if ((evaluation.scanNumber ?? 0) === 0) {
      return { label: 'Agora', title: 'Rode o primeiro Scan', text: 'Acompanhe entrada, rung e saída mudando na mesma tela.' };
    }
    return { label: 'Observe', title: 'Leia o ciclo do CLP', text: 'Entrada lida, programa resolvido e saída atualizada formam um scan.' };
  }

  return {
    label: 'Agora',
    title: 'Faça um teste simples',
    text: 'Mude uma entrada, rode Scan e compare o resultado com o objetivo da missão.',
  };
}

export const MobilePlcWorkspace = memo(function MobilePlcWorkspace({
  editorProject,
  plcState,
  evaluation,
  autoScan = false,
  mode,
  mission,
  missionTitle = 'Bancada guiada',
  onSetValue = noop,
  onRunScan = noop,
  onToggleAutoScan = noop,
  onChangeMode,
  onSelectRungId,
  onSelectBlockId,
  onChangeBlockVariable,
  onChangeBlockName,
  onChangeContactMode,
  onChangeCoilMode,
  onChangeTimerMode,
  onChangeCounterMode,
  onChangeCompareMode,
  onChangeMathMode,
  onChangeSourceA,
  onChangeSourceB,
  onChangeDestination,
  onChangeDownSource,
  onChangeResetSource,
  onChangePresetMs,
  onChangePreset,
  onAddContact,
  onAddCoil,
  onAddTimer,
  onAddCounter,
  onAddBranch,
  onAddRung,
  onRemoveRung,
  onRemoveBlock,
  onAdvanceMission,
}: MobilePlcWorkspaceProps) {
  const workspaceRef = useRef<View>(null);
  const rungDropRef = useRef<View>(null);
  const workspaceBoundsRef = useRef<DragBounds | null>(null);
  const rungDropBoundsRef = useRef<DragBounds | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const dragStartPointRef = useRef<DragPoint | null>(null);
  const suppressToolPressRef = useRef(false);
  const { width, height } = useWindowDimensions();
  const [localMode, setLocalMode] = useState<EditorRunMode>('simulate');
  const [rungIndex, setRungIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showFloatingIo, setShowFloatingIo] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<EditorToolId | null>(null);
  const [editorDeskMode, setEditorDeskMode] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const selectedBlock = useMemo(
    () => projectBlocks(editorProject).find((block) => block.id === selectedBlockId) ?? null,
    [editorProject, selectedBlockId],
  );
  const activeOutputs = useMemo(() => activeOutputCount(plcState), [plcState]);
  const floatingIoPoints = useMemo(() => collectMobileIoPoints(editorProject, plcState), [editorProject, plcState]);
  const floatingInputs = floatingIoPoints.filter((point) => point.kind === 'input');
  const floatingOutputs = floatingIoPoints.filter((point) => point.kind === 'output');
  const missionAttempt = useMemo(
    () => mission ? evaluateMissionAttempt(mission, plcState, evaluation) : null,
    [evaluation, mission, plcState],
  );
  const diagnostics = evaluation.diagnostics?.length ?? 0;
  const missionPassed = Boolean(missionAttempt?.passed);
  const shouldShowMissionStory = Boolean(mission && !missionPassed && missionAttempt?.feedback && missionAttempt.feedback !== mission.story);
  const visibleMissionComponents = mission?.availableComponents.slice(0, 5) ?? [];
  const activeMode = mode ?? localMode;
  const editMode = activeMode === 'edit';
  const simulationMode = activeMode === 'simulate';
  const deskLikeEditor = editMode && (editorDeskMode || width > height);
  const selectedTool = editorTools.find((tool) => tool.id === selectedToolId) ?? null;
  const draggingTool = editorTools.find((tool) => tool.id === dragState?.toolId) ?? null;
  const coachStep = missionCoachStep(mission, plcState, evaluation, missionPassed, editMode);

  useEffect(() => {
    const selectedRungIndex = editorProject.rungs.findIndex((rung) => rung.id === editorProject.selectedRungId);
    if (selectedRungIndex >= 0 && selectedRungIndex !== rungIndex) {
      setRungIndex(selectedRungIndex);
    }
  }, [editorProject.rungs, editorProject.selectedRungId, rungIndex]);

  function changeWorkspaceMode(nextMode: EditorRunMode) {
    setLocalMode(nextMode);
    onChangeMode?.(nextMode);
    if (nextMode === 'simulate') setEditing(false);
  }

  function toggleWorkspaceMode() {
    changeWorkspaceMode(editMode ? 'simulate' : 'edit');
  }

  function selectVisibleRung(index: number) {
    const safeIndex = Math.min(Math.max(index, 0), Math.max(editorProject.rungs.length - 1, 0));
    const rungId = editorProject.rungs[safeIndex]?.id;
    setRungIndex(safeIndex);
    if (rungId) onSelectRungId?.(rungId);
  }

  function actionForTool(toolId: EditorToolId): (() => void) | undefined {
    const actions: Record<EditorToolId, (() => void) | undefined> = {
      contact: onAddContact,
      coil: onAddCoil,
      timer: onAddTimer,
      counter: onAddCounter,
      branch: onAddBranch,
    };
    return actions[toolId];
  }

  function insertSelectedTool(toolId = selectedToolId) {
    if (!toolId) return;
    actionForTool(toolId)?.();
    setSelectedToolId(null);
    setToolboxOpen(false);
  }

  function measureDragTargets() {
    workspaceRef.current?.measureInWindow((x, y, measureWidth, measureHeight) => {
      workspaceBoundsRef.current = { x, y, width: measureWidth, height: measureHeight };
    });
    rungDropRef.current?.measureInWindow((x, y, measureWidth, measureHeight) => {
      rungDropBoundsRef.current = { x, y, width: measureWidth, height: measureHeight };
    });
  }

  function updateToolDrag(toolId: EditorToolId, event: GestureResponderEvent) {
    const point = eventPoint(event);
    const workspaceBounds = workspaceBoundsRef.current;
    const nextDragState: DragState = {
      toolId,
      x: workspaceBounds ? point.x - workspaceBounds.x - 56 : point.x - 56,
      y: workspaceBounds ? point.y - workspaceBounds.y - 36 : point.y - 36,
      overDrop: pointInsideBounds(point, rungDropBoundsRef.current),
    };
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  }

  function beginToolDrag(toolId: EditorToolId, event: GestureResponderEvent) {
    if (!actionForTool(toolId)) return;
    const point = eventPoint(event);
    suppressToolPressRef.current = false;
    dragStartPointRef.current = point;
    setToolboxOpen(true);
    setSelectedToolId(toolId);
    measureDragTargets();
    updateToolDrag(toolId, event);
  }

  function moveToolDrag(toolId: EditorToolId, event: GestureResponderEvent) {
    const startPoint = dragStartPointRef.current;
    const point = eventPoint(event);
    if (startPoint && Math.hypot(point.x - startPoint.x, point.y - startPoint.y) > 8) {
      suppressToolPressRef.current = true;
    }
    updateToolDrag(toolId, event);
  }

  function finishToolDrag() {
    const currentDrag = dragStateRef.current;
    if (currentDrag?.overDrop) {
      suppressToolPressRef.current = true;
      insertSelectedTool(currentDrag.toolId);
    } else if (currentDrag) {
      setSelectedToolId(currentDrag.toolId);
    }
    dragStateRef.current = null;
    dragStartPointRef.current = null;
    setDragState(null);
  }

  function cancelToolDrag() {
    dragStateRef.current = null;
    dragStartPointRef.current = null;
    setDragState(null);
  }

  return (
    <View ref={workspaceRef} onLayout={measureDragTargets} style={[styles.workspace, editMode && styles.workspaceCanvas, deskLikeEditor && styles.workspaceDesk]}>
      <View style={styles.topBar}>
        <View style={styles.topCopy}>
          <Text style={styles.eyebrow}>Missao</Text>
          <Text style={styles.title}>{missionTitle}</Text>
        </View>
        <View style={styles.statusCluster}>
          <View style={[styles.statusPill, activeOutputs > 0 && styles.runPill]}>
            <Text style={[styles.statusText, activeOutputs > 0 && styles.runText]}>{simulationMode ? activeOutputs > 0 ? 'RUN' : 'STOP' : 'EDIT'}</Text>
          </View>
          <View style={[styles.statusPill, autoScan && styles.autoPill]}>
            <Text style={[styles.statusText, autoScan && styles.autoText]}>{autoScan ? 'Auto' : 'Manual'}</Text>
          </View>
        </View>
      </View>

      {simulationMode ? <View style={styles.scanRow}>
        <Text style={styles.scanText}>Scan #{evaluation.scanNumber || 0}</Text>
        <Text style={[styles.scanText, diagnostics > 0 && styles.warningText]}>{cycleStatus(evaluation)}</Text>
      </View> : null}

      {mission && simulationMode ? (
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
          {coachStep ? (
            <View style={[styles.coachStepBox, missionPassed && styles.coachStepBoxDone]}>
              <Text style={[styles.coachStepLabel, missionPassed && styles.coachStepLabelDone]}>{coachStep.label}</Text>
              <Text style={styles.coachStepTitle}>{coachStep.title}</Text>
              <Text style={styles.coachStepText}>{coachStep.text}</Text>
            </View>
          ) : null}
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

      {simulationMode ? (
        <MobileIoDock editorProject={editorProject} plcState={plcState} onSetValue={onSetValue} />
      ) : null}

      <View
        ref={rungDropRef}
        onLayout={measureDragTargets}
        style={[styles.rungDropTarget, editMode && dragState && styles.rungDropTargetActive, editMode && dragState?.overDrop && styles.rungDropTargetOver]}
      >
        <MobileRungViewer
          editorProject={editorProject}
          plcState={plcState}
          evaluation={evaluation}
          rungIndex={rungIndex}
          canvasMode={editMode}
          selectedBlockId={selectedBlockId}
          onSelectRungIndex={selectVisibleRung}
          onSelectBlock={(block) => {
            const blockRungIndex = findBlockRungIndex(editorProject, block.id);
            if (blockRungIndex >= 0) selectVisibleRung(blockRungIndex);
            setSelectedBlockId(block.id);
            onSelectBlockId?.(block.id);
            if (editMode) {
              setEditing(true);
            } else {
              setShowHint(true);
            }
          }}
        />
        {editMode && dragState ? (
          <View pointerEvents="none" style={[styles.rungDropOverlay, dragState.overDrop && styles.rungDropOverlayOn]}>
            <Text style={[styles.rungDropOverlayText, dragState.overDrop && styles.rungDropOverlayTextOn]}>
              {dragState.overDrop ? `Solte para inserir na rung ${rungIndex + 1}` : 'Arraste a peça até esta área'}
            </Text>
          </View>
        ) : null}
      </View>

      {editMode ? (
        <View style={[styles.editorCanvasTray, toolboxOpen && styles.editorCanvasTrayOpen]}>
          <View style={styles.editorCanvasTrayHeader}>
            <Pressable onPress={() => setToolboxOpen((current) => !current)} style={({ pressed }) => [styles.editorRoundButton, toolboxOpen && styles.editorRoundButtonOn, pressed && styles.pressed]}>
              <Text style={[styles.editorRoundButtonText, toolboxOpen && styles.editorRoundButtonTextOn]}>{toolboxOpen ? 'Ocultar peças' : 'Peças'}</Text>
            </Pressable>
            <Pressable disabled={!onAddRung} onPress={onAddRung} style={({ pressed }) => [styles.editorIconButton, !onAddRung && styles.disabledChip, pressed && onAddRung && styles.pressed]}>
              <Text style={styles.editorIconButtonText}>+ Rung</Text>
            </Pressable>
            <Pressable disabled={!onRemoveRung || editorProject.rungs.length <= 1} onPress={onRemoveRung} style={({ pressed }) => [styles.editorIconDangerButton, (!onRemoveRung || editorProject.rungs.length <= 1) && styles.disabledChip, pressed && onRemoveRung && editorProject.rungs.length > 1 && styles.pressed]}>
              <Text style={styles.editorIconDangerText}>Remover</Text>
            </Pressable>
            <Pressable onPress={() => setEditorDeskMode((current) => !current)} style={({ pressed }) => [styles.editorRoundButton, deskLikeEditor && styles.editorRoundButtonOn, pressed && styles.pressed]}>
              <Text style={[styles.editorRoundButtonText, deskLikeEditor && styles.editorRoundButtonTextOn]}>{deskLikeEditor ? 'Mesa' : 'Tela'}</Text>
            </Pressable>
          </View>

          {toolboxOpen ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolRail}>
              {editorTools.map((tool) => {
                const disabled = !actionForTool(tool.id);
                const selected = selectedToolId === tool.id;
                return (
                  <Pressable
                    key={tool.id}
                    disabled={disabled}
                    onStartShouldSetResponder={() => !disabled}
                    onMoveShouldSetResponder={() => !disabled}
                    onResponderGrant={(event) => beginToolDrag(tool.id, event)}
                    onResponderMove={(event) => moveToolDrag(tool.id, event)}
                    onResponderRelease={finishToolDrag}
                    onResponderTerminate={cancelToolDrag}
                    onPress={() => {
                      if (suppressToolPressRef.current) {
                        suppressToolPressRef.current = false;
                        return;
                      }
                      setSelectedToolId(tool.id);
                    }}
                    onLongPress={() => insertSelectedTool(tool.id)}
                    style={({ pressed }) => [styles.toolTile, selected && styles.toolTileOn, dragState?.toolId === tool.id && styles.toolTileDragging, disabled && styles.disabledChip, pressed && !disabled && styles.pressed]}
                  >
                    <Text style={[styles.toolSymbol, selected && styles.toolSymbolOn]}>{tool.symbol}</Text>
                    <Text style={styles.toolLabel}>{tool.label}</Text>
                    <Text style={styles.toolHint}>{tool.hint}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      {editMode && selectedTool && !dragState ? (
        <Pressable onPress={() => insertSelectedTool()} style={({ pressed }) => [styles.dropZone, pressed && styles.pressed]}>
          <View style={styles.dropZoneIcon}>
            <Text style={styles.dropZoneIconText}>{selectedTool.symbol}</Text>
          </View>
          <View style={styles.dropZoneCopy}>
            <Text style={styles.dropZoneTitle}>Soltar {selectedTool.label} na rung {rungIndex + 1}</Text>
            <Text style={styles.dropZoneText}>Arraste para cima até o Ladder ou toque aqui para inserir. Depois toque no bloco criado para editar.</Text>
          </View>
        </Pressable>
      ) : null}

      <Pressable onPress={() => setShowFloatingIo((current) => !current)} style={({ pressed }) => [styles.floatingIoButton, showFloatingIo && styles.floatingIoButtonOn, pressed && styles.pressed]}>
        <Text style={[styles.floatingIoButtonText, showFloatingIo && styles.floatingIoButtonTextOn]}>I/O</Text>
      </Pressable>

      {showFloatingIo ? (
        <View style={styles.floatingIoPanel}>
          <View style={styles.floatingIoHeader}>
            <View style={styles.sheetCopy}>
              <Text style={styles.eyebrow}>I/O flutuante</Text>
              <Text style={styles.floatingIoTitle}>Acione entradas e confira saidas sem sair do programa.</Text>
            </View>
            <Pressable onPress={() => setShowFloatingIo(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Text style={styles.closeText}>Fechar</Text>
            </Pressable>
          </View>

          <View style={styles.floatingIoGroup}>
            <Text style={styles.floatingIoGroupTitle}>Entradas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.floatingIoRail}>
              {floatingInputs.length === 0 ? (
                <Text style={styles.emptyFloatingIo}>Nenhuma entrada I.</Text>
              ) : floatingInputs.map((input) => {
                const active = isMobileIoActive(input.value);
                const editable = typeof input.value !== 'number';
                return (
                  <Pressable
                    key={input.id}
                    disabled={!editable}
                    onPress={() => onSetValue(input.address, !active)}
                    style={({ pressed }) => [styles.floatingIoChip, active && styles.floatingIoChipOn, !editable && styles.disabledChip, pressed && editable && styles.pressed]}
                  >
                    <Text style={[styles.floatingIoAddress, active && styles.floatingIoAddressOn]}>{input.address}</Text>
                    <Text style={styles.floatingIoName} numberOfLines={1}>{input.name}</Text>
                    <Text style={[styles.floatingIoState, active && styles.floatingIoAddressOn]}>{mobileIoValueLabel(input.value)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.floatingIoGroup}>
            <Text style={styles.floatingIoGroupTitle}>Saidas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.floatingIoRail}>
              {floatingOutputs.length === 0 ? (
                <Text style={styles.emptyFloatingIo}>Nenhuma saida Q/O.</Text>
              ) : floatingOutputs.map((output) => {
                const active = isMobileIoActive(output.value);
                return (
                  <View key={output.id} style={[styles.floatingIoChip, styles.floatingOutputChip, active && styles.floatingIoChipOn]}>
                    <Text style={[styles.floatingIoAddress, active && styles.floatingIoAddressOn]}>{output.address}</Text>
                    <Text style={styles.floatingIoName} numberOfLines={1}>{output.name}</Text>
                    <Text style={[styles.floatingIoState, active && styles.floatingIoAddressOn]}>{mobileIoValueLabel(output.value)}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {showHint && !mission ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>{diagnostics > 0 ? 'Revise antes de avancar' : 'Dica rapida'}</Text>
          <Text style={styles.hintText}>{diagnostics > 0 ? evaluation.diagnostics[0]?.message : evaluation.explanation || 'Acione uma entrada, execute Scan e observe se o rung conduz ate a saida.'}</Text>
        </View>
      ) : null}

      {editing && selectedBlock ? (
        <View style={styles.editorSheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetCopy}>
              <Text style={styles.eyebrow}>Configurar bloco</Text>
              <Text style={styles.sheetTitle}>{selectedBlock.name}</Text>
            </View>
            <Pressable
              onPress={() => setEditing(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>OK</Text>
            </Pressable>
          </View>
          {selectedBlock ? (
            <View style={styles.editorFields}>
              <View style={styles.fieldGrid}>
                <Text style={styles.fieldText}>Instrucao: {selectedBlock.role}</Text>
                <Text style={styles.fieldText}>Modo: {blockMode(selectedBlock)}</Text>
                <Text style={styles.fieldText}>Estado: {readBlockValue(selectedBlock, plcState)}</Text>
              </View>

              <Text style={styles.inputLabel}>Tag do bloco</Text>
              <TextInput
                value={selectedBlock.variable || selectedBlock.destination || ''}
                onChangeText={(value) => onChangeBlockVariable?.(normalizeVariableInput(value))}
                placeholder="I0.0, Q0.0, M0.0, T0 ou C0"
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.editorInput}
              />

              <Text style={styles.inputLabel}>Nome visivel</Text>
              <TextInput
                value={selectedBlock.name}
                onChangeText={(value) => onChangeBlockName?.(value)}
                placeholder="Nome do componente"
                placeholderTextColor={colors.textDim}
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

              {selectedBlock.compareMode ? (
                <>
                  <Text style={styles.inputLabel}>Comparador</Text>
                  <View style={styles.paletteRow}>
                    {(['EQU', 'NEQ', 'GRT', 'LES', 'GEQ', 'LEQ'] as EditorCompareMode[]).map((mode) => (
                      <Pressable key={mode} onPress={() => onChangeCompareMode?.(mode)} style={[styles.paletteChip, selectedBlock.compareMode === mode && styles.paletteChipOn]}>
                        <Text style={[styles.paletteText, selectedBlock.compareMode === mode && styles.paletteTextOn]}>{mode}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.inlineEditorFields}>
                    <TextInput
                      value={selectedBlock.sourceA ?? ''}
                      onChangeText={(value) => onChangeSourceA?.(normalizeVariableInput(value))}
                      placeholder="A: N0 ou 10"
                      placeholderTextColor={colors.textDim}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={[styles.editorInput, styles.inlineEditorInput]}
                    />
                    <TextInput
                      value={selectedBlock.sourceB ?? ''}
                      onChangeText={(value) => onChangeSourceB?.(normalizeVariableInput(value))}
                      placeholder="B: N1 ou 20"
                      placeholderTextColor={colors.textDim}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={[styles.editorInput, styles.inlineEditorInput]}
                    />
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

              {selectedBlock.mathMode ? (
                <>
                  <Text style={styles.inputLabel}>Matematica</Text>
                  <View style={styles.paletteRow}>
                    {(['MOV', 'ADD', 'SUB', 'MUL', 'DIV'] as EditorMathMode[]).map((mode) => (
                      <Pressable key={mode} onPress={() => onChangeMathMode?.(mode)} style={[styles.paletteChip, selectedBlock.mathMode === mode && styles.paletteChipOn]}>
                        <Text style={[styles.paletteText, selectedBlock.mathMode === mode && styles.paletteTextOn]}>{mode}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.inlineEditorFields}>
                    <TextInput
                      value={selectedBlock.sourceA ?? ''}
                      onChangeText={(value) => onChangeSourceA?.(normalizeVariableInput(value))}
                      placeholder="A"
                      placeholderTextColor={colors.textDim}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={[styles.editorInput, styles.inlineEditorInput]}
                    />
                    <TextInput
                      value={selectedBlock.sourceB ?? ''}
                      onChangeText={(value) => onChangeSourceB?.(normalizeVariableInput(value))}
                      placeholder="B"
                      placeholderTextColor={colors.textDim}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={[styles.editorInput, styles.inlineEditorInput]}
                    />
                  </View>
                  <TextInput
                    value={selectedBlock.destination ?? ''}
                    onChangeText={(value) => onChangeDestination?.(normalizeVariableInput(value))}
                    placeholder="Destino: N1"
                    placeholderTextColor={colors.textDim}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={styles.editorInput}
                  />
                </>
              ) : null}

              {selectedBlock.role === 'timer' ? (
                <>
                  <Text style={styles.inputLabel}>Tipo de temporizador</Text>
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
                  <Text style={styles.inputLabel}>Tipo de contador</Text>
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
                  <View style={styles.inlineEditorFields}>
                    <TextInput
                      value={selectedBlock.downSource ?? ''}
                      onChangeText={(value) => onChangeDownSource?.(normalizeVariableInput(value))}
                      placeholder="Down: I0.1"
                      placeholderTextColor={colors.textDim}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={[styles.editorInput, styles.inlineEditorInput]}
                    />
                    <TextInput
                      value={selectedBlock.resetSource ?? ''}
                      onChangeText={(value) => onChangeResetSource?.(normalizeVariableInput(value))}
                      placeholder="Reset: M0.0"
                      placeholderTextColor={colors.textDim}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={[styles.editorInput, styles.inlineEditorInput]}
                    />
                  </View>
                </>
              ) : null}
            </View>
          ) : null}
          {selectedBlock && onRemoveBlock ? (
            <Pressable
              onPress={() => {
                onRemoveBlock();
                setSelectedBlockId(null);
                setEditing(false);
              }}
              style={({ pressed }) => [styles.removeBlockButton, pressed && styles.pressed]}
            >
              <Text style={styles.removeBlockText}>Remover bloco selecionado</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <MobileHardwareExportPanel editorProject={editorProject} />

      <MobileSimulationControls
        autoScan={autoScan}
        editing={editMode}
        mode={activeMode}
        onRunScan={onRunScan}
        onToggleAutoScan={onToggleAutoScan}
        onToggleEdit={toggleWorkspaceMode}
        onToggleHint={() => setShowHint((current) => !current)}
      />

      {dragState && draggingTool ? (
        <View pointerEvents="none" style={[styles.dragGhost, dragState.overDrop && styles.dragGhostOn, { left: dragState.x, top: dragState.y }]}>
          <Text style={[styles.dragGhostSymbol, dragState.overDrop && styles.dragGhostSymbolOn]}>{draggingTool.symbol}</Text>
          <Text style={styles.dragGhostLabel}>{draggingTool.label}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  workspace: {
    position: 'relative',
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  workspaceCanvas: {
    borderColor: colors.border,
    backgroundColor: colors.black,
  },
  workspaceDesk: {
    padding: spacing.sm,
    gap: spacing.xs,
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
  coachStepBox: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.cyanSoft,
    padding: spacing.sm,
    gap: 2,
  },
  coachStepBoxDone: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  coachStepLabel: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  coachStepLabelDone: {
    color: colors.green,
  },
  coachStepTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
  },
  coachStepText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
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
  editorDock: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.cyanSoft,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  editorDockDesk: {
    backgroundColor: colors.surface,
  },
  editorDockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  editorDockTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  editorCanvasTray: {
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceGlass,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  editorCanvasTrayOpen: {
    borderColor: colors.border,
  },
  editorCanvasTrayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editorRoundButton: {
    minHeight: 34,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  editorRoundButtonOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  editorRoundButtonText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  editorRoundButtonTextOn: {
    color: colors.cyan,
  },
  editorIconButton: {
    flex: 1,
    minHeight: 34,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.cyanSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  editorIconButtonText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  editorIconDangerButton: {
    flex: 1,
    minHeight: 34,
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  editorIconDangerText: {
    color: colors.red,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  editorDockActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  editorDockButton: {
    minHeight: 32,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  editorDockButtonOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.background,
  },
  editorDockButtonText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  editorDockButtonTextOn: {
    color: colors.cyan,
  },
  toolRail: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  toolTile: {
    width: 92,
    minHeight: 62,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  toolTileOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.background,
  },
  toolTileDragging: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  toolSymbol: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  toolSymbolOn: {
    color: colors.cyan,
  },
  toolLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
  },
  toolHint: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  dropZone: {
    minHeight: 46,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dropZoneOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  dropZoneIcon: {
    width: 48,
    height: 34,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneIconText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  dropZoneCopy: {
    flex: 1,
    minWidth: 0,
  },
  dropZoneTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  dropZoneText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  rungDropTarget: {
    position: 'relative',
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 18,
  },
  rungDropTargetActive: {
    borderColor: colors.cyan,
  },
  rungDropTargetOver: {
    borderColor: colors.green,
  },
  rungDropOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 20,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  rungDropOverlayOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  rungDropOverlayText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  rungDropOverlayTextOn: {
    color: colors.green,
  },
  dragGhost: {
    position: 'absolute',
    zIndex: 120,
    width: 112,
    minHeight: 72,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    opacity: 0.94,
  },
  dragGhostOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  dragGhostSymbol: {
    color: colors.cyan,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  dragGhostSymbolOn: {
    color: colors.green,
  },
  dragGhostLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },
  editorToolbox: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.cyanSoft,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  editorToolboxHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  editorToolboxTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  freePill: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  freePillText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  categoryRail: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  categoryChip: {
    minHeight: 34,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  categoryChipOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.background,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  categoryTextOn: {
    color: colors.cyan,
  },
  assemblyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  assemblyTile: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 92,
    minHeight: 72,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  assemblySymbol: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  assemblyLabel: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 5,
  },
  editorModeHint: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.background,
    padding: spacing.sm,
  },
  editorModeHintText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  rungActionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rungActionButton: {
    flex: 1,
    minHeight: 38,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  rungActionText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  rungRemoveButton: {
    flex: 1,
    minHeight: 38,
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  rungRemoveText: {
    color: colors.red,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  editorSheet: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.sm,
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
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.background,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  editorInput: {
    minHeight: 38,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
  },
  floatingIoButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: 84,
    zIndex: 30,
    minWidth: 44,
    minHeight: 34,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  floatingIoButtonOn: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  floatingIoButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  floatingIoButtonTextOn: {
    color: colors.cyan,
  },
  floatingIoPanel: {
    position: 'absolute',
    right: spacing.md,
    left: spacing.md,
    bottom: 128,
    zIndex: 40,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  floatingIoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  floatingIoTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  floatingIoGroup: {
    gap: spacing.xs,
  },
  floatingIoGroupTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  floatingIoRail: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  floatingIoChip: {
    minWidth: 92,
    minHeight: 56,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.background,
    padding: spacing.xs,
    justifyContent: 'center',
  },
  floatingOutputChip: {
    minWidth: 106,
  },
  floatingIoChipOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  floatingIoAddress: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '900',
  },
  floatingIoAddressOn: {
    color: colors.green,
  },
  floatingIoName: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  floatingIoState: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 3,
  },
  emptyFloatingIo: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    paddingVertical: spacing.sm,
  },
  inlineEditorFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  inlineEditorInput: {
    flex: 1,
    minWidth: 116,
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
  removeBlockButton: {
    minHeight: 40,
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  removeBlockText: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.72,
  },
});
