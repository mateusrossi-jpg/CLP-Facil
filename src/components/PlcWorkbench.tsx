import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { ComponentCategory, simulatorComponents, SimulatorComponent } from '../data/componentLibrary';
import { EditorEvaluationResult } from '../engine/editorEvaluator';
import { EditorBlock, EditorInsertionZone, EditorParallelBranch, EditorProjectState, EditorVariableDataType } from '../engine/editorTypes';
import { EditorRunMode } from './EditorModeToggle';
import { PlcState } from '../engine/projectTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type WorkbenchCategory = ComponentCategory | 'protection';
type MobileWorkbenchTab = 'program' | 'view' | 'io' | 'field';

const categoryTabs: { key: WorkbenchCategory; label: string }[] = [
  { key: 'input', label: 'Comando' },
  { key: 'logic', label: 'Contatos' },
  { key: 'output', label: 'Saídas' },
  { key: 'timer', label: 'Temporizadores' },
  { key: 'counter', label: 'Contadores' },
  { key: 'compare', label: 'Comparadores' },
  { key: 'math', label: 'Matemática' },
  { key: 'motor', label: 'Motores' },
];

const variables = [
  { id: 'I0', address: 'I0.0', name: 'Start', type: 'input' },
  { id: 'I1', address: 'I0.1', name: 'Stop', type: 'input' },
  { id: 'I2', address: 'I0.2', name: 'Emergência', type: 'input' },
  { id: 'I3', address: 'I0.3', name: 'Sobrecarga', type: 'input' },
  { id: 'Q0', address: 'Q0.0', name: 'Motor', type: 'output' },
  { id: 'Q1', address: 'Q0.1', name: 'Saída 2', type: 'output' },
  { id: 'M0', address: 'M0.0', name: 'Memória', type: 'memory' },
  { id: 'T0', address: 'T1', name: 'Timer', type: 'memory' },
  { id: 'C0', address: 'C1', name: 'Contador', type: 'memory' },
];

const MIN_CANVAS_ZOOM = 0.68;
const MAX_CANVAS_ZOOM = 1.45;

type CanvasTouch = {
  pageX: number;
  pageY: number;
};

function clampCanvasZoom(value: number) {
  return Math.min(MAX_CANVAS_ZOOM, Math.max(MIN_CANVAS_ZOOM, value));
}

function distanceBetweenTouches(touches: readonly CanvasTouch[]) {
  if (touches.length < 2) return 0;
  const [first, second] = touches;
  return Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY);
}

function inferVariableType(variable: string) {
  const normalized = variable.toUpperCase();
  if (normalized.startsWith('I')) return 'input';
  if (normalized.startsWith('Q') || normalized.startsWith('O')) return 'output';
  return 'memory';
}

function isNumericLiteral(value: string | undefined) {
  return Boolean(value && value.trim() !== '' && Number.isFinite(Number(value.trim().replace(',', '.'))));
}

function isNumericVariable(variable: string) {
  const normalized = variable.toUpperCase();
  return normalized.startsWith('N') || normalized.startsWith('T') || normalized.startsWith('C');
}

function labelForVariable(variable: string, fallbackName?: string) {
  if (fallbackName) return fallbackName;
  const type = inferVariableType(variable);
  if (type === 'input') return 'Entrada';
  if (type === 'output') return 'Saída';
  if (variable.toUpperCase().startsWith('T')) return 'Timer';
  if (variable.toUpperCase().startsWith('C')) return 'Contador';
  return 'Memória';
}

type PlcWorkbenchProps = {
  editor: EditorProjectState;
  state: PlcState;
  evaluation: EditorEvaluationResult;
  mode: EditorRunMode;
  autoScan: boolean;
  locked: boolean;
  message?: string | null;
  onSelectZone: (zone: EditorInsertionZone, seriesIndex?: number) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectComponent: (component: SimulatorComponent, zone?: EditorInsertionZone, seriesIndex?: number) => void;
  onToggleInput: (inputId: string) => void;
  onSetValue: (variable: string, value: boolean | number) => void;
  onRunScan: () => void;
  onToggleAutoScan: () => void;
  onCheckCircuit: () => void;
  onChangeMode: (mode: EditorRunMode) => void;
  onSelectRung: (rungId: string) => void;
  onAddRung: () => void;
  onRemoveRung: () => void;
  onAddVariable: (name: string, dataType: EditorVariableDataType) => void;
  onRemoveVariable: (variableId: string) => void;
};

function contactSymbol(block: EditorBlock) {
  if (block.compareMode) return `[${block.compareMode}]`;
  if (block.contactMode === 'RISING') return '--|↑|--';
  if (block.contactMode === 'FALLING') return '--|↓|--';
  return block.contactMode === 'NC' ? '--|/|--' : '--| |--';
}

function coilSymbol(block: EditorBlock) {
  if (block.role === 'timer') return `[${block.timerMode ?? 'TON'}]`;
  if (block.role === 'counter') return `[${block.counterMode ?? 'CTU'}]`;
  if (block.mathMode) return `[${block.mathMode}]`;
  if (block.coilMode && block.coilMode !== 'NORMAL') return `(${block.coilMode})`;
  return '--( )--';
}

function blockAddress(block: EditorBlock) {
  if (block.role === 'timer') return `${block.variable} ${block.timerMode ?? 'TON'}`;
  if (block.role === 'counter') return `${block.variable} ${block.counterMode ?? 'CTU'}`;
  if (block.compareMode) return `${block.sourceA ?? 'A'} ${block.compareMode} ${block.sourceB ?? 'B'}`;
  if (block.mathMode) return `${block.destination ?? block.variable}`;
  return block.variable;
}

function timerTimingActive(block: EditorBlock, evaluation: EditorEvaluationResult) {
  const timer = evaluation.runtime.timers[block.id];
  if (!timer) return false;
  const mode = block.timerMode ?? 'TON';
  if (mode === 'TON') return timer.previousIn && !timer.q;
  if (mode === 'TOF') return !timer.previousIn && timer.q;
  return timer.q;
}

function componentSymbol(component: SimulatorComponent) {
  if (component.category === 'timer') return '[TON]';
  if (component.category === 'counter') return `[${component.id.replace('counter-', '').toUpperCase()}]`;
  if (component.category === 'compare') return component.id.replace('cmp-', '').toUpperCase();
  if (component.category === 'math') return component.id.replace('math-', '').toUpperCase();
  if (component.category === 'output' || component.category === 'motor') return '--( )--';
  if (component.id.includes('ons')) return '--|↑|--';
  if (component.id.includes('osf')) return '--|↓|--';
  if (component.id.includes('nc')) return '--|/|--';
  return '--| |--';
}

function readNumericValue(source: string | undefined, state: PlcState) {
  const raw = (source ?? '0').trim().toUpperCase();
  const literal = Number(raw.replace(',', '.'));
  if (Number.isFinite(literal)) return literal;
  const value = state[raw];
  if (typeof value === 'number') return value;
  return value ? 1 : 0;
}

function compareBlockActive(block: EditorBlock, state: PlcState) {
  const left = readNumericValue(block.sourceA, state);
  const right = readNumericValue(block.sourceB, state);
  switch (block.compareMode) {
    case 'NEQ':
      return left !== right;
    case 'GRT':
      return left > right;
    case 'LES':
      return left < right;
    case 'GEQ':
      return left >= right;
    case 'LEQ':
      return left <= right;
    case 'EQU':
    default:
      return left === right;
  }
}

function blockOnlineActive(block: EditorBlock, state: PlcState, rungActive = false) {
  if (block.compareMode) return compareBlockActive(block, state);
  if (block.role === 'contact') {
    const value = Boolean(state[block.variable.trim().toUpperCase()]);
    return block.contactMode === 'NC' ? !value : value;
  }
  if (block.mathMode) return rungActive;
  return Boolean(state[block.variable.trim().toUpperCase()]);
}

const CircuitBlock = memo(function CircuitBlock({
  block,
  active,
  selected,
  locked,
  evaluation,
  onPress,
}: {
  block: EditorBlock;
  active: boolean;
  selected: boolean;
  locked: boolean;
  evaluation: EditorEvaluationResult;
  onPress: () => void;
}) {
  const outputLike = block.role === 'coil';
  const functionLike = block.role === 'timer' || block.role === 'counter';
  const timerRuntime = block.role === 'timer' ? evaluation.runtime.timers[block.id] : undefined;
  const counterRuntime = block.role === 'counter' ? evaluation.runtime.counters[block.id] : undefined;
  const timing = block.role === 'timer' ? timerTimingActive(block, evaluation) : false;

  return (
    <View style={styles.blockAssembly}>
      <View style={[styles.blockLead, active && styles.wireOn]} />
      <Pressable
        onPress={() => !locked && onPress()}
        style={({ pressed }) => [
          styles.circuitBlock,
          outputLike && styles.outputBlock,
          functionLike && styles.functionBlock,
          active && styles.circuitBlockActive,
          selected && styles.circuitBlockSelected,
          pressed && !locked && styles.pressed,
        ]}
      >
        <Text style={[styles.blockAddress, active && styles.activeText]}>{blockAddress(block)}</Text>
        <Text style={[styles.blockSymbol, functionLike && styles.functionBlockSymbol, active && styles.activeText]}>
          {outputLike || functionLike ? coilSymbol(block) : contactSymbol(block)}
        </Text>
        {block.role === 'timer' ? (
          <View style={styles.blockRuntimeGrid}>
            <Text style={[styles.blockRuntimeField, timerRuntime?.previousIn && styles.blockRuntimeFieldOn]}>EN</Text>
            <Text style={[styles.blockRuntimeField, timing && styles.blockRuntimeFieldOn]}>TT</Text>
            <Text style={[styles.blockRuntimeField, timerRuntime?.q && styles.blockRuntimeFieldOn]}>Q</Text>
            <Text style={styles.blockRuntimeField}>ACC {timerRuntime?.elapsedMs ?? 0}ms</Text>
            <Text style={styles.blockRuntimeField}>PRE {block.presetMs ?? 0}ms</Text>
          </View>
        ) : null}
        {block.role === 'counter' ? (
          <View style={styles.blockRuntimeGrid}>
            <Text style={[styles.blockRuntimeField, counterRuntime?.previousCu && styles.blockRuntimeFieldOn]}>CU</Text>
            <Text style={[styles.blockRuntimeField, counterRuntime?.previousCd && styles.blockRuntimeFieldOn]}>CD</Text>
            <Text style={[styles.blockRuntimeField, counterRuntime?.previousReset && styles.blockRuntimeFieldOn]}>RES</Text>
            <Text style={[styles.blockRuntimeField, counterRuntime?.q && styles.blockRuntimeFieldOn]}>Q</Text>
            <Text style={styles.blockRuntimeField}>ACC {counterRuntime?.currentValue ?? 0}</Text>
            <Text style={styles.blockRuntimeField}>PRE {block.preset ?? 0}</Text>
          </View>
        ) : null}
        <Text style={styles.blockName} numberOfLines={1}>{block.name}</Text>
      </Pressable>
      <View style={[styles.blockLead, active && styles.wireOn]} />
    </View>
  );
});

const DropZone = memo(function DropZone({
  label,
  selected,
  locked,
  onPress,
}: {
  label: string;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => !locked && onPress()}
      style={({ pressed }) => [styles.dropZone, selected && styles.dropZoneSelected, pressed && !locked && styles.pressed]}
    >
      <Text style={[styles.dropZoneText, selected && styles.dropZoneTextSelected]}>{label}</Text>
    </Pressable>
  );
});

const SignalRow = memo(function SignalRow({
  id,
  address,
  name,
  value,
  interactive,
  numeric,
  locked,
  onPress,
  onSetValue,
  onRemove,
}: {
  id: string;
  address: string;
  name: string;
  value: boolean | number;
  interactive: boolean;
  numeric?: boolean;
  locked: boolean;
  onPress: () => void;
  onSetValue?: (value: number) => void;
  onRemove?: () => void;
}) {
  const boolValue = Boolean(value);
  if (numeric) {
    return (
      <View style={styles.numericSignalRow}>
        <View style={styles.numericSignalHeader}>
          <View style={styles.numericSignalText}>
            <Text style={styles.signalName} numberOfLines={1}>{address}</Text>
            <Text style={styles.signalId} numberOfLines={1}>{name}</Text>
          </View>
          <Text style={styles.numericSignalBadge}>NUM</Text>
          {onRemove ? (
            <Pressable onPress={onRemove} style={({ pressed }) => [styles.variableRemoveButton, pressed && styles.pressed]}>
              <Text style={styles.variableRemoveText}>×</Text>
            </Pressable>
          ) : null}
        </View>
        <TextInput
          value={String(typeof value === 'number' ? value : 0)}
          onChangeText={(text) => onSetValue?.(Number(text.replace(',', '.')) || 0)}
          keyboardType="numeric"
          style={styles.numericStateInput}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => interactive && locked && onPress()}
      style={({ pressed }) => [styles.signalRow, boolValue && styles.signalRowOn, pressed && interactive && locked && styles.pressed]}
    >
      <View style={[styles.signalLamp, boolValue && styles.signalLampOn]} />
      <View style={styles.signalText}>
        <Text style={styles.signalName} numberOfLines={1}>{address}</Text>
        <Text style={styles.signalId} numberOfLines={1}>{name} / {id}</Text>
      </View>
      <Text style={[styles.signalState, boolValue && styles.signalStateOn]}>{boolValue ? 'ON' : 'OFF'}</Text>
      {onRemove ? (
        <Pressable onPress={onRemove} style={({ pressed }) => [styles.variableRemoveButton, pressed && styles.pressed]}>
          <Text style={styles.variableRemoveText}>×</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
});

const FunctionVariableCard = memo(function FunctionVariableCard({
  block,
  evaluation,
}: {
  block: EditorBlock;
  evaluation: EditorEvaluationResult;
}) {
  if (block.role === 'timer') {
    const timer = evaluation.runtime.timers[block.id] ?? { elapsedMs: 0, q: false, previousIn: false };
    const mode = block.timerMode ?? 'TON';
    const timing = mode === 'TON'
      ? timer.previousIn && !timer.q
      : mode === 'TOF'
        ? !timer.previousIn && timer.q
        : timer.q;

    return (
      <View style={styles.functionCard}>
        <View style={styles.functionHeader}>
          <Text style={styles.functionTitle}>{block.variable}</Text>
          <Text style={styles.functionBadge}>{mode}</Text>
        </View>
        <Text style={styles.functionName}>{block.name}</Text>
        <View style={styles.functionGrid}>
          <Text style={[styles.functionField, timer.previousIn && styles.functionFieldOn]}>EN {timer.previousIn ? 'ON' : 'OFF'}</Text>
          <Text style={[styles.functionField, timing && styles.functionFieldOn]}>TT {timing ? 'ON' : 'OFF'}</Text>
          <Text style={[styles.functionField, timer.q && styles.functionFieldOn]}>Q {timer.q ? 'ON' : 'OFF'}</Text>
          <Text style={styles.functionField}>ACC {timer.elapsedMs}</Text>
          <Text style={styles.functionField}>PRE {block.presetMs ?? 0}</Text>
        </View>
      </View>
    );
  }

  if (block.role === 'counter') {
    const counter = evaluation.runtime.counters[block.id] ?? { currentValue: 0, q: false, previousCu: false, previousCd: false, previousReset: false };
    const mode = block.counterMode ?? 'CTU';

    return (
      <View style={styles.functionCard}>
        <View style={styles.functionHeader}>
          <Text style={styles.functionTitle}>{block.variable}</Text>
          <Text style={styles.functionBadge}>{mode}</Text>
        </View>
        <Text style={styles.functionName}>{block.name}</Text>
        <View style={styles.functionGrid}>
          <Text style={[styles.functionField, counter.previousCu && styles.functionFieldOn]}>CU {counter.previousCu ? 'ON' : 'OFF'}</Text>
          <Text style={[styles.functionField, counter.previousCd && styles.functionFieldOn]}>CD {counter.previousCd ? 'ON' : 'OFF'}</Text>
          <Text style={[styles.functionField, counter.previousReset && styles.functionFieldOn]}>RES {counter.previousReset ? 'ON' : 'OFF'}</Text>
          <Text style={[styles.functionField, counter.q && styles.functionFieldOn]}>Q {counter.q ? 'ON' : 'OFF'}</Text>
          <Text style={styles.functionField}>ACC {counter.currentValue}</Text>
          <Text style={styles.functionField}>PRE {block.preset ?? 0}</Text>
        </View>
      </View>
    );
  }

  return null;
});

const DeclaredFunctionVariableCard = memo(function DeclaredFunctionVariableCard({
  variable,
  onRemove,
}: {
  variable: { id: string; address: string; name: string; dataType?: EditorVariableDataType };
  onRemove?: () => void;
}) {
  const badge = variable.dataType === 'timer' ? 'TIMER' : 'COUNTER';
  return (
    <View style={styles.functionCard}>
      <View style={styles.functionHeader}>
        <Text style={styles.functionTitle}>{variable.address}</Text>
        <View style={styles.functionHeaderActions}>
          <Text style={styles.functionBadge}>{badge}</Text>
          {onRemove ? (
            <Pressable onPress={onRemove} style={({ pressed }) => [styles.variableRemoveButton, pressed && styles.pressed]}>
              <Text style={styles.variableRemoveText}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <Text style={styles.functionName}>{variable.name}</Text>
      <View style={styles.functionGrid}>
        {variable.dataType === 'timer' ? (
          <>
            <Text style={styles.functionField}>EN OFF</Text>
            <Text style={styles.functionField}>TT OFF</Text>
            <Text style={styles.functionField}>Q OFF</Text>
            <Text style={styles.functionField}>ACC 0</Text>
            <Text style={styles.functionField}>PRE 0</Text>
          </>
        ) : (
          <>
            <Text style={styles.functionField}>CU OFF</Text>
            <Text style={styles.functionField}>CD OFF</Text>
            <Text style={styles.functionField}>RES OFF</Text>
            <Text style={styles.functionField}>Q OFF</Text>
            <Text style={styles.functionField}>ACC 0</Text>
            <Text style={styles.functionField}>PRE 0</Text>
          </>
        )}
      </View>
    </View>
  );
});

export function PlcWorkbench({
  editor,
  state,
  evaluation,
  mode,
  autoScan,
  locked,
  message,
  onSelectZone,
  onSelectBlock,
  onSelectComponent,
  onToggleInput,
  onSetValue,
  onRunScan,
  onToggleAutoScan,
  onCheckCircuit,
  onChangeMode,
  onSelectRung,
  onAddRung,
  onRemoveRung,
  onAddVariable,
  onRemoveVariable,
}: PlcWorkbenchProps) {
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<WorkbenchCategory>('input');
  const [pendingComponent, setPendingComponent] = useState<SimulatorComponent | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileWorkbenchTab>('program');
  const [visualMode, setVisualMode] = useState<'list' | 'flow'>('list');
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableType, setNewVariableType] = useState<EditorVariableDataType>('boolean');
  const [canvasZoom, setCanvasZoom] = useState(1);
  const pinchStartDistance = useRef(0);
  const pinchStartZoom = useRef(1);
  const isMobile = width < 980;
  const rung = editor.rungs.find((item) => item.id === editor.selectedRungId) ?? editor.rungs[0];
  const selectedZone = editor.selectedZone;
  const selectedSeriesIndex = editor.selectedSeriesIndex ?? 0;
  const components = useMemo(() => simulatorComponents.filter((component) => component.category === category), [category]);
  const timers = Object.entries(evaluation.runtime.timers);
  const counters = Object.entries(evaluation.runtime.counters);
  const usedByBlocks = new Set<string>();
  for (const item of editor.rungs) {
    const blocks = [
      ...item.seriesBlocks,
      ...item.parallelBlocks,
      ...parallelBranchesFor(item).flatMap((branch) => branch.blocks),
      ...(item.coilBlock ? [item.coilBlock] : []),
    ];
    for (const block of blocks) {
      [
        block.variable,
        block.sourceA,
        block.sourceB,
        block.destination,
        block.downSource,
        block.resetSource,
      ].filter((value): value is string => Boolean(value && !isNumericLiteral(value)))
        .forEach((value) => usedByBlocks.add(value.trim().toUpperCase()));
    }
  }
  const usedVariableMap = new Map<string, { id: string; address: string; name: string; type: string; dataType?: EditorVariableDataType }>();
  for (const variable of editor.projectVariables ?? []) {
    usedVariableMap.set(variable.id, {
      id: variable.id,
      address: variable.address,
      name: variable.name,
      type: variable.scope,
      dataType: variable.dataType,
    });
  }
  for (const item of editor.rungs) {
    const blocks = [
      ...item.seriesBlocks,
      ...item.parallelBlocks,
      ...parallelBranchesFor(item).flatMap((branch) => branch.blocks),
      ...(item.coilBlock ? [item.coilBlock] : []),
    ];
    for (const block of blocks) {
      const candidates = [
        block.variable,
        block.sourceA,
        block.sourceB,
        block.destination,
        block.downSource,
        block.resetSource,
      ].filter((value): value is string => Boolean(value && !isNumericLiteral(value)));

      for (const candidate of candidates) {
        const variable = candidate.trim().toUpperCase();
        if (!variable || usedVariableMap.has(variable)) continue;
        const known = variables.find((knownVariable) => knownVariable.id === variable || knownVariable.address === variable);
        usedVariableMap.set(variable, {
          id: variable,
          address: known?.address ?? variable,
          name: known?.name ?? labelForVariable(variable, block.name),
          type: known?.type ?? inferVariableType(variable),
          dataType: isNumericVariable(variable) ? 'number' : undefined,
        });
      }
    }
  }
  const visibleVariables = Array.from(usedVariableMap.values());
  const visibleInputs = visibleVariables.filter((item) => item.type === 'input');
  const visibleOutputs = visibleVariables.filter((item) => item.type !== 'input');
  const functionBlocks = editor.rungs
    .map((item) => item.coilBlock)
    .filter((block): block is EditorBlock => Boolean(block && (block.role === 'timer' || block.role === 'counter')));
  const functionVariableIds = new Set([
    ...functionBlocks.map((block) => block.variable.trim().toUpperCase()),
    ...visibleOutputs.filter((item) => item.dataType === 'timer' || item.dataType === 'counter').map((item) => item.id),
  ]);
  const simpleVisibleOutputs = visibleOutputs.filter((item) => !functionVariableIds.has(item.id));
  const declaredFunctionVariables = visibleOutputs.filter((item) =>
    (item.dataType === 'timer' || item.dataType === 'counter') &&
    !functionBlocks.some((block) => block.variable.trim().toUpperCase() === item.id),
  );
  const motorVariable = editor.rungs.find((item) => item.coilBlock)?.coilBlock?.variable.trim().toUpperCase() ?? 'Q0.0';
  const motorOn = Boolean(state[motorVariable]);

  useEffect(() => {
    if (!isMobile) return;
    if (locked) setMobileTab('view');
  }, [isMobile, locked]);

  const mainY = 96;
  const mainBlockTop = 59;
  const seriesStartX = 64;
  const seriesStepX = 150;
  const branchBlockOffsetY = 37;
  const branchStepY = 104;
  const branchBaseY = 188;
  function parallelBranchesFor(targetRung: typeof rung): EditorParallelBranch[] {
    if (targetRung.parallelBranches) return targetRung.parallelBranches;
    return targetRung.parallelBlocks.map((block, index) => ({
      id: `${targetRung.id}-legacy-branch-${block.id}`,
      seriesIndex: block.parallelIndex ?? index,
      blocks: [block],
    }));
  }

  function createParallelLayout(targetRung: typeof rung) {
    return parallelBranchesFor(targetRung).map((branch, laneIndex) => {
      const maxSegmentIndex = Math.max(targetRung.seriesBlocks.length - 1, 0);
      const segmentIndex = Math.min(Math.max(branch.seriesIndex, 0), maxSegmentIndex);
      const branchStartX = seriesStartX + segmentIndex * seriesStepX;
      const branchSpan = Math.max(branch.blocks.length, 1);
      const branchEndIndex = Math.min(segmentIndex + branchSpan, Math.max(targetRung.seriesBlocks.length, 1));
      const branchReturnX = seriesStartX + branchEndIndex * seriesStepX;
      return {
        branch,
        laneIndex,
        segmentIndex,
        branchStartX,
        branchReturnX,
        branchYPosition: branchBaseY + laneIndex * branchStepY,
      };
    });
  }

  function canvasHeightFor(targetRung: typeof rung) {
    const lastBranchY = branchBaseY + Math.max(parallelBranchesFor(targetRung).length - 1, 0) * branchStepY;
    return Math.max(320, lastBranchY + 98);
  }

  function canvasWidthFor(targetRung: typeof rung) {
    const seriesWidth = seriesStartX + Math.max(targetRung.seriesBlocks.length, 1) * seriesStepX + 430;
    const branchWidth = Math.max(
      ...parallelBranchesFor(targetRung).map((branch) => {
        const branchStart = seriesStartX + Math.max(branch.seriesIndex, 0) * seriesStepX;
        return branchStart + Math.max(branch.blocks.length, 1) * seriesStepX + 430;
      }),
      0,
    );
    return Math.max(isMobile ? 1040 : 880, seriesWidth, branchWidth);
  }

  function rungComplexityHint(targetRung: typeof rung) {
    const branches = parallelBranchesFor(targetRung);
    const contactCount = targetRung.seriesBlocks.length + branches.reduce((total, branch) => total + branch.blocks.length, 0);
    if (branches.length >= 4) {
      return 'Rung com muitos paralelos. Em CLP, fica mais limpo quebrar em outra linha usando memoria auxiliar M.';
    }
    if (contactCount >= 8) {
      return 'Rung longo. Para leitura em campo, considere dividir a logica em rungs menores.';
    }
    if (branches.length >= 3) {
      return 'Limite pratico: 2 ou 3 ramos paralelos ainda ficam legiveis no celular.';
    }
    return null;
  }

  function startCanvasPinch(event: GestureResponderEvent) {
    const touches = event.nativeEvent.touches;
    if (touches.length < 2) return;
    pinchStartDistance.current = distanceBetweenTouches(touches);
    pinchStartZoom.current = canvasZoom;
  }

  function moveCanvasPinch(event: GestureResponderEvent) {
    const touches = event.nativeEvent.touches;
    if (touches.length < 2 || pinchStartDistance.current <= 0) return;
    const nextDistance = distanceBetweenTouches(touches);
    setCanvasZoom(clampCanvasZoom(pinchStartZoom.current * (nextDistance / pinchStartDistance.current)));
  }

  function endCanvasPinch(event: GestureResponderEvent) {
    if (event.nativeEvent.touches.length >= 2) return;
    pinchStartDistance.current = 0;
  }

  function changeCanvasZoom(delta: number) {
    setCanvasZoom((current) => clampCanvasZoom(Number((current + delta).toFixed(2))));
  }

  function renderRungCanvas(targetRung: typeof rung, rungIndex: number) {
    const selectedRung = targetRung.id === editor.selectedRungId;
    const rungActive = Boolean(evaluation.rungResults[targetRung.id]);
    const canvasHeight = canvasHeightFor(targetRung);
    const canvasWidth = canvasWidthFor(targetRung);
    const parallelLayout = createParallelLayout(targetRung);
    const complexityHint = rungComplexityHint(targetRung);
    const seriesInsertionPoints = targetRung.seriesBlocks.length === 0
      ? [{ key: 'series-start', afterIndex: -1, left: seriesStartX - 10 }]
      : [
          { key: 'series-before-first', afterIndex: -1, left: seriesStartX - 36 },
          ...targetRung.seriesBlocks.map((block, index) => ({
            key: `series-after-${block.id}`,
            afterIndex: index,
            left: seriesStartX + index * seriesStepX + 126,
          })),
        ];

    return (
      <Pressable
        key={targetRung.id}
        onPress={() => !locked && onSelectRung(targetRung.id)}
        style={({ pressed }) => [
          styles.canvasCard,
          isMobile && styles.mobileCanvasCard,
          selectedRung && styles.canvasCardSelected,
          pressed && !locked && styles.pressed,
        ]}
      >
        <View style={[styles.canvasHeader, isMobile && styles.mobileCanvasHeader]}>
          <View>
            <Text style={styles.canvasTitle}>Linha {rungIndex + 1}</Text>
            <Text style={styles.canvasSubtitle}>{targetRung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
          </View>
          <Text style={[styles.rungStatus, rungActive && styles.rungStatusOn]}>{rungActive ? 'ENERGIZADA' : selectedRung ? 'EDITANDO' : 'ABERTA'}</Text>
        </View>
        {complexityHint ? (
          <View style={styles.rungHintBox}>
            <Text style={styles.rungHintLabel}>Boa pratica Ladder</Text>
            <Text style={styles.rungHintText}>{complexityHint}</Text>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.canvasScroller}>
          <View style={[styles.zoomFrame, { width: canvasWidth * canvasZoom, height: canvasHeight * canvasZoom }]}>
          <View
            onTouchStart={startCanvasPinch}
            onTouchMove={moveCanvasPinch}
            onTouchEnd={endCanvasPinch}
            onTouchCancel={endCanvasPinch}
            style={[
              styles.circuitCanvas,
              {
                width: canvasWidth,
                height: canvasHeight,
                transform: [{ scale: canvasZoom }],
                transformOrigin: 'top left',
              },
            ]}
          >
            <View style={styles.leftRail} />
            <View style={styles.rightRail} />
            <View style={[styles.mainLine, rungActive && styles.wireOn]} />
            <View style={styles.leftNode} />
            <View style={styles.rightNode} />
            {!locked && selectedRung && pendingComponent ? (
              <>
                {seriesInsertionPoints.map((point) => {
                  const active = selectedZone === 'series' && selectedSeriesIndex === point.afterIndex;
                  return (
                    <Pressable
                      key={point.key}
                      hitSlop={10}
                      onPress={() => {
                        if (pendingComponent) {
                          onSelectComponent(pendingComponent, 'series', point.afterIndex);
                          setPendingComponent(null);
                          return;
                        }
                        onSelectZone('series', point.afterIndex);
                      }}
                      style={[
                        styles.connectionPoint,
                        styles.seriesConnectionPoint,
                        { left: point.left },
                        active && styles.connectionPointActive,
                      ]}
                    >
                      <Text style={[styles.connectionPointText, active && styles.connectionPointTextActive]}>+</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  hitSlop={10}
                  onPress={() => {
                    if (pendingComponent) {
                      onSelectComponent(pendingComponent, 'coil', selectedSeriesIndex);
                      setPendingComponent(null);
                      return;
                    }
                    onSelectZone('coil');
                  }}
                  style={[styles.connectionPoint, styles.coilConnectionPoint, selectedZone === 'coil' && styles.connectionPointActive]}
                >
                  <Text style={[styles.connectionPointText, selectedZone === 'coil' && styles.connectionPointTextActive]}>+</Text>
                </Pressable>
              </>
            ) : null}

            {parallelLayout.map(({ branch, branchStartX, branchReturnX, branchYPosition }) => (
              <View key={`branch-wire-${branch.id}`}>
                <View style={[styles.branchLeftNode, { left: branchStartX - 4 }]} />
                <View style={[styles.branchRightNode, { left: branchReturnX - 4 }]} />
                <View style={[styles.branchLeftDrop, { left: branchStartX, height: branchYPosition - mainY }]} />
                <View style={[styles.branchRightDrop, { left: branchReturnX, height: branchYPosition - mainY }]} />
                <View style={[styles.branchLine, { left: branchStartX, top: branchYPosition, width: branchReturnX - branchStartX }]} />
                <View style={[styles.branchBottomLeftNode, { left: branchStartX - 4, top: branchYPosition - 4 }]} />
                <View style={[styles.branchBottomRightNode, { left: branchReturnX - 4, top: branchYPosition - 4 }]} />
              </View>
            ))}

            {targetRung.seriesBlocks.map((block, index) => (
              <View key={block.id} style={[styles.absoluteBlock, { left: seriesStartX + index * seriesStepX, top: mainBlockTop }]}>
                <CircuitBlock
                  block={block}
                  active={blockOnlineActive(block, state, rungActive)}
                  selected={editor.selectedBlockId === block.id}
                  locked={locked || !selectedRung}
                  evaluation={evaluation}
                  onPress={() => {
                    if (pendingComponent && selectedZone === 'parallel') {
                      onSelectComponent(pendingComponent, 'parallel', index);
                      setPendingComponent(null);
                      return;
                    }
                    onSelectBlock(block.id);
                  }}
                />
              </View>
            ))}

            {parallelLayout.map(({ branch, branchStartX, branchYPosition }) => (
              <View key={branch.id}>
                {branch.blocks.map((block, blockIndex) => (
                  <View key={block.id} style={[styles.absoluteBlock, { left: branchStartX + blockIndex * seriesStepX, top: branchYPosition - branchBlockOffsetY }]}>
                    <CircuitBlock
                      block={block}
                      active={blockOnlineActive(block, state, rungActive)}
                      selected={editor.selectedBlockId === block.id}
                      locked={locked || !selectedRung}
                      evaluation={evaluation}
                      onPress={() => onSelectBlock(block.id)}
                    />
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.absoluteCoil}>
              {targetRung.coilBlock ? (
                <CircuitBlock
                  block={targetRung.coilBlock}
                  active={blockOnlineActive(targetRung.coilBlock, state, rungActive)}
                  selected={editor.selectedBlockId === targetRung.coilBlock.id}
                  locked={locked || !selectedRung}
                  evaluation={evaluation}
                  onPress={() => onSelectBlock(targetRung.coilBlock?.id ?? '')}
                />
              ) : (
                !locked && selectedRung ? <DropZone label="+ saída / função" selected={selectedZone === 'coil'} locked={locked} onPress={() => onSelectZone('coil')} /> : null
              )}
            </View>
          </View>
          </View>
        </ScrollView>
      </Pressable>
    );
  }

  function insertPendingComponent(zone: EditorInsertionZone) {
    if (!pendingComponent || locked) return;
    const seriesIndex = selectedSeriesIndex;
    onSelectComponent(pendingComponent, zone, seriesIndex);
    setPendingComponent(null);
  }

  function selectPaletteComponent(component: SimulatorComponent) {
    if (locked) return;
    setPendingComponent(component);
  }

  function renderMobileSimulationDock() {
    if (!isMobile || mobileTab === 'io') return null;
    return (
      <View style={styles.mobileRunDock}>
        <View style={styles.mobileRunDockHeader}>
          <View>
            <Text style={styles.scanTitle}>Ciclo de scan</Text>
            <Text style={styles.scanMeta}>SCAN {evaluation.scanNumber}</Text>
          </View>
          <Text style={[styles.scanState, locked && styles.scanStateRun]}>{locked ? 'RUN' : 'EDIT'}</Text>
        </View>
        <View style={styles.mobileRunActions}>
          <Pressable onPress={() => onChangeMode('edit')} style={({ pressed }) => [styles.mobileRunButton, mode === 'edit' && styles.modeButtonActive, pressed && styles.pressed]}>
            <Text style={[styles.modeButtonText, mode === 'edit' && styles.modeButtonTextActive]}>Editar</Text>
          </Pressable>
          <Pressable onPress={() => onChangeMode('simulate')} style={({ pressed }) => [styles.mobileRunButton, mode === 'simulate' && styles.modeButtonActiveRun, pressed && styles.pressed]}>
            <Text style={[styles.modeButtonText, mode === 'simulate' && styles.modeButtonTextRun]}>Simular</Text>
          </Pressable>
          <Pressable onPress={onRunScan} style={({ pressed }) => [styles.mobileRunButton, styles.mobileRunPrimary, !locked && styles.disabled, pressed && locked && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Scan</Text>
          </Pressable>
          <Pressable onPress={onToggleAutoScan} style={({ pressed }) => [styles.mobileRunButton, styles.mobileRunAuto, autoScan && styles.autoScanButtonOn, !locked && styles.disabled, pressed && locked && styles.pressed]}>
            <Text style={[styles.autoScanText, autoScan && styles.autoScanTextOn]}>{autoScan ? 'Auto ON' : 'Auto'}</Text>
          </Pressable>
          <Pressable onPress={() => onChangeMode('edit')} style={({ pressed }) => [styles.mobileRunButton, styles.mobileRunStop, !locked && styles.disabled, pressed && locked && styles.pressed]}>
            <Text style={styles.stopButtonText}>Parar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderMobileInputStrip() {
    if (!isMobile || mobileTab !== 'program' || !locked || visibleInputs.length === 0) return null;
    return (
      <View style={styles.mobileInputStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileInputStripRail}>
          {visibleInputs.map((item) => {
            const active = Boolean(state[item.id]);
            return (
              <Pressable
                key={`mobile-input-${item.id}`}
                onPress={() => onToggleInput(item.id)}
                style={({ pressed }) => [styles.mobileInputChip, active && styles.mobileInputChipOn, pressed && styles.pressed]}
              >
                <View style={[styles.mobileInputLamp, active && styles.mobileInputLampOn]} />
                <View>
                  <Text style={styles.mobileInputAddress}>{item.address}</Text>
                  <Text style={styles.mobileInputName} numberOfLines={1}>{item.name}</Text>
                </View>
                <Text style={[styles.mobileInputState, active && styles.mobileInputStateOn]}>{active ? 'ON' : 'OFF'}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  function renderMobileVisualization() {
    if (!isMobile || mobileTab !== 'view') return null;

    function renderBlockChip(block: EditorBlock, key: string, rungActive = false) {
      const active = blockOnlineActive(block, state, rungActive);
      return (
        <View key={key} style={[styles.flowChip, active && styles.flowChipOn]}>
          <Text style={[styles.flowChipAddress, active && styles.flowChipAddressOn]} numberOfLines={1}>{blockAddress(block)}</Text>
          <Text style={styles.flowChipSymbol}>{block.role === 'coil' || block.role === 'timer' || block.role === 'counter' ? coilSymbol(block) : contactSymbol(block)}</Text>
        </View>
      );
    }

    return (
      <View style={styles.visualPanel}>
        <View style={styles.visualHeader}>
          <View>
            <Text style={styles.visualTitle}>Visualização RUN</Text>
            <Text style={styles.visualSubtitle}>Acione entradas e acompanhe a automação inteira.</Text>
          </View>
          <Text style={[styles.scanState, locked && styles.scanStateRun]}>{locked ? `SCAN ${evaluation.scanNumber}` : 'EDIT'}</Text>
        </View>

        <Text style={styles.visualSectionTitle}>Entradas</Text>
        <View style={styles.visualGrid}>
          {visibleInputs.map((item) => {
            const active = Boolean(state[item.id]);
            return (
              <Pressable
                key={`visual-input-${item.id}`}
                onPress={() => locked && onToggleInput(item.id)}
                style={({ pressed }) => [styles.visualTile, active && styles.visualTileOn, pressed && locked && styles.pressed]}
              >
                <View style={[styles.visualLamp, active && styles.visualLampOn]} />
                <View style={styles.visualTileText}>
                  <Text style={styles.visualAddress}>{item.address}</Text>
                  <Text style={styles.visualName} numberOfLines={1}>{item.name}</Text>
                </View>
                <Text style={[styles.visualState, active && styles.visualStateOn]}>{active ? 'ON' : 'OFF'}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.visualSectionTitle}>Saídas e memórias</Text>
        <View style={styles.visualGrid}>
          {simpleVisibleOutputs.map((item) => {
            const value = state[item.id] ?? false;
            const numeric = isNumericVariable(item.id);
            const active = Boolean(value);
            return (
              <View key={`visual-output-${item.id}`} style={[styles.visualTile, active && !numeric && styles.visualTileOn]}>
                <View style={[styles.visualLamp, active && !numeric && styles.visualLampOn]} />
                <View style={styles.visualTileText}>
                  <Text style={styles.visualAddress}>{item.address}</Text>
                  <Text style={styles.visualName} numberOfLines={1}>{item.name}</Text>
                </View>
                <Text style={[styles.visualState, active && !numeric && styles.visualStateOn]}>{numeric ? String(typeof value === 'number' ? value : 0) : active ? 'ON' : 'OFF'}</Text>
              </View>
            );
          })}
        </View>

        {functionBlocks.length > 0 ? (
          <>
            <Text style={styles.visualSectionTitle}>Temporizadores e contadores</Text>
            <View style={styles.visualFunctionGrid}>
              {functionBlocks.map((block) => (
                <FunctionVariableCard key={`visual-function-${block.id}`} block={block} evaluation={evaluation} />
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.visualSectionTitle}>Linhas do programa</Text>
        <View style={styles.visualModeSwitch}>
          <Pressable onPress={() => setVisualMode('list')} style={[styles.visualModeButton, visualMode === 'list' && styles.visualModeButtonActive]}>
            <Text style={[styles.visualModeText, visualMode === 'list' && styles.visualModeTextActive]}>Lista</Text>
          </Pressable>
          <Pressable onPress={() => setVisualMode('flow')} style={[styles.visualModeButton, visualMode === 'flow' && styles.visualModeButtonActive]}>
            <Text style={[styles.visualModeText, visualMode === 'flow' && styles.visualModeTextActive]}>Fluxo</Text>
          </Pressable>
        </View>

        {visualMode === 'list' ? (
          <View style={styles.rungMonitorList}>
            {editor.rungs.map((item, index) => {
              const active = Boolean(evaluation.rungResults[item.id]);
              const coil = item.coilBlock;
              return (
                <Pressable
                  key={`visual-rung-${item.id}`}
                  onPress={() => onSelectRung(item.id)}
                  style={({ pressed }) => [styles.rungMonitorRow, active && styles.rungMonitorRowOn, pressed && styles.pressed]}
                >
                  <Text style={[styles.rungMonitorIndex, active && styles.rungMonitorIndexOn]}>{index + 1}</Text>
                  <View style={styles.rungMonitorText}>
                    <Text style={styles.rungMonitorTitle} numberOfLines={1}>{item.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
                    <Text style={styles.rungMonitorMeta} numberOfLines={1}>{coil ? `${coil.variable} · ${coil.name}` : 'sem saída/função'}</Text>
                  </View>
                  <Text style={[styles.rungMonitorState, active && styles.rungMonitorStateOn]}>{active ? 'ON' : 'OFF'}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.flowList}>
            {editor.rungs.map((item, index) => {
              const active = Boolean(evaluation.rungResults[item.id]);
              const branches = parallelBranchesFor(item);
              return (
                <Pressable key={`flow-rung-${item.id}`} onPress={() => onSelectRung(item.id)} style={({ pressed }) => [styles.flowCard, active && styles.flowCardOn, pressed && styles.pressed]}>
                  <View style={styles.flowCardHeader}>
                    <Text style={[styles.flowIndex, active && styles.flowIndexOn]}>Linha {index + 1}</Text>
                    <Text style={[styles.rungMonitorState, active && styles.rungMonitorStateOn]}>{active ? 'ENERGIZADA' : 'ABERTA'}</Text>
                  </View>
                  <Text style={styles.flowTitle} numberOfLines={1}>{item.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flowRail}>
                    {item.seriesBlocks.map((block, blockIndex) => renderBlockChip(block, `${item.id}-series-${block.id}-${blockIndex}`, active))}
                    {branches.length > 0 ? (
                      <View style={styles.flowParallelGroup}>
                        <Text style={styles.flowParallelLabel}>Paralelo</Text>
                        {branches.map((branch, branchIndex) => (
                          <View key={`${item.id}-branch-${branch.id}`} style={styles.flowBranch}>
                            <Text style={styles.flowBranchIndex}>{branchIndex + 1}</Text>
                            {branch.blocks.map((block, blockIndex) => renderBlockChip(block, `${item.id}-branch-${branch.id}-${block.id}-${blockIndex}`, active))}
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {item.coilBlock ? renderBlockChip(item.coilBlock, `${item.id}-coil`, active) : null}
                  </ScrollView>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Diagnostico</Text>
          <Text style={styles.messageText}>{message ?? evaluation.explanation}</Text>
        </View>
      </View>
    );
  }

  function addDeclaredVariable() {
    if (locked) return;
    onAddVariable(newVariableName, newVariableType);
    setNewVariableName('');
  }

  function renderVariableCreator(compact = false) {
    if (locked) return null;
    const typeOptions: { key: EditorVariableDataType; label: string }[] = [
      { key: 'boolean', label: 'Bool' },
      { key: 'number', label: 'Num' },
      { key: 'timer', label: 'Timer tag' },
      { key: 'counter', label: 'Counter tag' },
    ];

    return (
      <View style={[styles.variableCreator, compact && styles.variableCreatorCompact]}>
        <TextInput
          value={newVariableName}
          onChangeText={setNewVariableName}
          placeholder="tag ou nome: M0.0, N0, T0, C0"
          placeholderTextColor={colors.textDim}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.variableCreatorInput}
        />
        <View style={styles.variableTypeRow}>
          {typeOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setNewVariableType(option.key)}
              style={[styles.variableTypeButton, newVariableType === option.key && styles.variableTypeButtonActive]}
            >
              <Text style={[styles.variableTypeText, newVariableType === option.key && styles.variableTypeTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={addDeclaredVariable} style={({ pressed }) => [styles.variableAddButton, pressed && styles.pressed]}>
          <Text style={styles.variableAddText}>Adicionar tag</Text>
        </Pressable>
      </View>
    );
  }

  function removeHandlerFor(variableId: string) {
    if (locked || usedByBlocks.has(variableId)) return undefined;
    return () => onRemoveVariable(variableId);
  }

  const selectedParallelBranch = parallelBranchesFor(rung).find((branch) =>
    branch.blocks.some((block) => block.id === editor.selectedBlockId),
  );

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bancada de Simulacao</Text>
          <Text style={styles.subtitle}>Monte no modo Editar. Simule acionando entradas e rodando scans.</Text>
        </View>
        <View style={[styles.modePill, locked && styles.modePillRun]}>
          <Text style={[styles.modePillText, locked && styles.modePillRunText]}>{locked ? 'SIMULANDO' : 'EDITANDO'}</Text>
        </View>
      </View>

      <View style={[styles.workbench, isMobile && styles.mobileWorkbench]}>
        <View style={[styles.sidePanel, isMobile && styles.mobileHidden]}>
          <View style={styles.ioHeader}>
            <Text style={styles.ioTitle}>Tabela de Tags/I/O</Text>
            <Text style={styles.ioSubtitle}>Tags do projeto, não instruções Ladder</Text>
          </View>
          {renderVariableCreator()}

          <Text style={styles.panelTitle}>Entradas</Text>
          {visibleInputs.length === 0 ? <Text style={styles.emptyIoText}>Nenhuma entrada usada ainda.</Text> : null}
          {visibleInputs.map((item) => (
            <SignalRow
              key={item.id}
              id={item.id}
              address={item.address}
              name={item.name}
              value={state[item.id] ?? false}
              interactive
              numeric={isNumericVariable(item.id)}
              locked={locked}
              onPress={() => onToggleInput(item.id)}
              onSetValue={(value) => onSetValue(item.id, value)}
              onRemove={removeHandlerFor(item.id)}
            />
          ))}

          <Text style={styles.panelTitle}>Saídas</Text>
          {simpleVisibleOutputs.length === 0 && functionBlocks.length === 0 && declaredFunctionVariables.length === 0 ? <Text style={styles.emptyIoText}>Nenhuma saída ou memória usada ainda.</Text> : null}
          {simpleVisibleOutputs.map((item) => (
            <SignalRow
              key={item.id}
              id={item.id}
              address={item.address}
              name={item.name}
              value={state[item.id] ?? false}
              interactive={false}
              numeric={isNumericVariable(item.id)}
              locked={locked}
              onPress={() => undefined}
              onSetValue={(value) => onSetValue(item.id, value)}
              onRemove={removeHandlerFor(item.id)}
            />
          ))}
          {functionBlocks.map((block) => (
            <FunctionVariableCard key={`function-${block.id}`} block={block} evaluation={evaluation} />
          ))}
          {declaredFunctionVariables.map((variable) => (
            <DeclaredFunctionVariableCard key={`declared-function-${variable.id}`} variable={variable} onRemove={removeHandlerFor(variable.id)} />
          ))}

          <View style={styles.scanPanel}>
            <View>
              <Text style={styles.scanTitle}>Ciclo de scan</Text>
              <Text style={styles.scanMeta}>SCAN {evaluation.scanNumber}</Text>
            </View>
            <Text style={[styles.scanState, locked && styles.scanStateRun]}>{locked ? 'RUN' : 'EDIT'}</Text>
          </View>

          <View style={styles.simControls}>
            <Pressable onPress={() => onChangeMode('edit')} style={({ pressed }) => [styles.modeButton, mode === 'edit' && styles.modeButtonActive, pressed && styles.pressed]}>
              <Text style={[styles.modeButtonText, mode === 'edit' && styles.modeButtonTextActive]}>Editar</Text>
            </Pressable>
            <Pressable onPress={() => onChangeMode('simulate')} style={({ pressed }) => [styles.modeButton, mode === 'simulate' && styles.modeButtonActiveRun, pressed && styles.pressed]}>
              <Text style={[styles.modeButtonText, mode === 'simulate' && styles.modeButtonTextRun]}>Simular</Text>
            </Pressable>
          </View>

          <Pressable onPress={onRunScan} style={({ pressed }) => [styles.primaryButton, !locked && styles.disabled, pressed && locked && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Rodar scan</Text>
          </Pressable>
          <Pressable onPress={onToggleAutoScan} style={({ pressed }) => [styles.autoScanButton, autoScan && styles.autoScanButtonOn, !locked && styles.disabled, pressed && locked && styles.pressed]}>
            <Text style={[styles.autoScanText, autoScan && styles.autoScanTextOn]}>{autoScan ? 'Auto scan ON' : 'Auto scan OFF'}</Text>
          </Pressable>
          <Pressable onPress={() => onChangeMode('edit')} style={({ pressed }) => [styles.stopButton, !locked && styles.disabled, pressed && locked && styles.pressed]}>
            <Text style={styles.stopButtonText}>Parar simulação</Text>
          </Pressable>
          <Pressable onPress={onCheckCircuit} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Verificar</Text>
          </Pressable>
        </View>

        <View style={[styles.mainPanel, isMobile && styles.mobileMainPanel]}>
          {isMobile ? (
            <View style={styles.mobileTabs}>
              {([
                ['program', 'Programa'],
                ['view', 'Visualizar'],
                ['io', 'I/O'],
                ['field', 'Bancada'],
              ] as [MobileWorkbenchTab, string][]).map(([tab, label]) => (
                <Pressable key={tab} onPress={() => setMobileTab(tab)} style={[styles.mobileTab, mobileTab === tab && styles.mobileTabActive]}>
                  <Text style={[styles.mobileTabText, mobileTab === tab && styles.mobileTabTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {isMobile && mobileTab === 'io' ? (
            <View style={styles.mobileIoPanel}>
              <View style={styles.ioHeader}>
                <Text style={styles.ioTitle}>Tabela de Tags/I/O</Text>
                <Text style={styles.ioSubtitle}>Tags declaradas ou usadas no Ladder.</Text>
              </View>
              {renderVariableCreator(true)}
              <Text style={styles.panelTitle}>Entradas</Text>
              {visibleInputs.length === 0 ? <Text style={styles.emptyIoText}>Nenhuma entrada usada ainda.</Text> : null}
              {visibleInputs.map((item) => (
                <SignalRow
                  key={item.id}
                  id={item.id}
                  address={item.address}
                  name={item.name}
                  value={state[item.id] ?? false}
                  interactive
                  numeric={isNumericVariable(item.id)}
                  locked={locked}
                  onPress={() => onToggleInput(item.id)}
                  onSetValue={(value) => onSetValue(item.id, value)}
                  onRemove={removeHandlerFor(item.id)}
                />
              ))}
              <Text style={styles.panelTitle}>Saídas</Text>
              {simpleVisibleOutputs.length === 0 && functionBlocks.length === 0 && declaredFunctionVariables.length === 0 ? <Text style={styles.emptyIoText}>Nenhuma saída ou memória usada ainda.</Text> : null}
              {simpleVisibleOutputs.map((item) => (
                <SignalRow
                  key={item.id}
                  id={item.id}
                  address={item.address}
                  name={item.name}
                  value={state[item.id] ?? false}
                  interactive={false}
                  numeric={isNumericVariable(item.id)}
                  locked={locked}
                  onPress={() => undefined}
                  onSetValue={(value) => onSetValue(item.id, value)}
                  onRemove={removeHandlerFor(item.id)}
                />
              ))}
              {functionBlocks.map((block) => (
                <FunctionVariableCard key={`mobile-function-${block.id}`} block={block} evaluation={evaluation} />
              ))}
              {declaredFunctionVariables.map((variable) => (
                <DeclaredFunctionVariableCard key={`mobile-declared-function-${variable.id}`} variable={variable} onRemove={removeHandlerFor(variable.id)} />
              ))}
              <View style={styles.scanPanel}>
                <View>
                  <Text style={styles.scanTitle}>Ciclo de scan</Text>
                  <Text style={styles.scanMeta}>SCAN {evaluation.scanNumber}</Text>
                </View>
                <Text style={[styles.scanState, locked && styles.scanStateRun]}>{locked ? 'RUN' : 'EDIT'}</Text>
              </View>
              <View style={styles.simControls}>
                <Pressable onPress={() => onChangeMode('edit')} style={({ pressed }) => [styles.modeButton, mode === 'edit' && styles.modeButtonActive, pressed && styles.pressed]}>
                  <Text style={[styles.modeButtonText, mode === 'edit' && styles.modeButtonTextActive]}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => onChangeMode('simulate')} style={({ pressed }) => [styles.modeButton, mode === 'simulate' && styles.modeButtonActiveRun, pressed && styles.pressed]}>
                  <Text style={[styles.modeButtonText, mode === 'simulate' && styles.modeButtonTextRun]}>Simular</Text>
                </Pressable>
              </View>
              <Pressable onPress={onRunScan} style={({ pressed }) => [styles.primaryButton, !locked && styles.disabled, pressed && locked && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Rodar scan</Text>
              </Pressable>
              <Pressable onPress={onToggleAutoScan} style={({ pressed }) => [styles.autoScanButton, autoScan && styles.autoScanButtonOn, !locked && styles.disabled, pressed && locked && styles.pressed]}>
                <Text style={[styles.autoScanText, autoScan && styles.autoScanTextOn]}>{autoScan ? 'Auto scan ON' : 'Auto scan OFF'}</Text>
              </Pressable>
              <Pressable onPress={() => onChangeMode('edit')} style={({ pressed }) => [styles.stopButton, !locked && styles.disabled, pressed && locked && styles.pressed]}>
                <Text style={styles.stopButtonText}>Parar simulação</Text>
              </Pressable>
              <Pressable onPress={onCheckCircuit} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryButtonText}>Verificar</Text>
              </Pressable>
            </View>
          ) : null}

          {renderMobileSimulationDock()}
          {renderMobileInputStrip()}
          {renderMobileVisualization()}

          <View style={[styles.componentPanel, isMobile && (mobileTab !== 'program' || locked) && styles.mobileHidden]}>
            <View style={styles.componentHeader}>
              <View style={styles.componentHeaderText}>
                <Text style={styles.componentPanelTitle}>Pinça de montagem</Text>
                <Text style={styles.componentPanelSubtitle}>Pegue uma instrução e solte no ponto + do Ladder</Text>
              </View>
              <View style={[styles.tweezerStatus, pendingComponent && styles.tweezerStatusLoaded]}>
                <Text style={[styles.tweezerStatusText, pendingComponent && styles.tweezerStatusTextLoaded]}>
                  {pendingComponent ? `Pinça: ${pendingComponent.name}` : 'Pinça livre'}
                </Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
              {categoryTabs.map((tab) => {
                const active = tab.key === category;
                return (
                  <Pressable key={tab.key} onPress={() => setCategory(tab.key)} style={({ pressed }) => [styles.categoryTab, active && styles.categoryTabActive, pressed && styles.pressed]}>
                    <Text style={[styles.categoryTabText, active && styles.categoryTabTextActive]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.componentRail}>
              {components.map((component) => {
                return (
                  <Pressable
                    key={component.id}
                    onPress={() => selectPaletteComponent(component)}
                    style={({ pressed }) => [
                      styles.componentTile,
                      pendingComponent?.id === component.id && styles.componentTileSelected,
                      locked && styles.disabled,
                      pressed && !locked && styles.pressed,
                    ]}
                  >
                    <Text style={styles.componentSymbol}>{componentSymbol(component)}</Text>
                    <Text style={styles.componentName} numberOfLines={1}>{component.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {pendingComponent ? (
              <View style={styles.insertQuestion}>
                <View style={styles.insertQuestionTextBox}>
                  <Text style={styles.insertQuestionTitle}>Soltar a pinça em qual conexão?</Text>
                  <Text style={styles.insertQuestionText}>
                    {pendingComponent.name}: toque em um ponto + na linha ou escolha abaixo.
                  </Text>
                </View>
                <Pressable onPress={() => insertPendingComponent('series')} style={({ pressed }) => [styles.insertChoice, pressed && styles.pressed]}>
                  <Text style={styles.insertChoiceTitle}>Em série</Text>
                  <Text style={styles.insertChoiceText}>continua no mesmo caminho</Text>
                </Pressable>
                <Pressable onPress={() => insertPendingComponent('parallel')} style={({ pressed }) => [styles.insertChoice, pressed && styles.pressed]}>
                  <Text style={styles.insertChoiceTitle}>{selectedParallelBranch ? 'No ramo selecionado' : 'Paralelo ao bloco'}</Text>
                  <Text style={styles.insertChoiceText}>{selectedParallelBranch ? 'continua em série no ramo' : 'contorna o contato escolhido'}</Text>
                </Pressable>
                <Pressable onPress={() => insertPendingComponent('coil')} style={({ pressed }) => [styles.insertChoice, pressed && styles.pressed]}>
                  <Text style={styles.insertChoiceTitle}>Saída / função</Text>
                  <Text style={styles.insertChoiceText}>bobina, timer ou contador no fim da linha</Text>
                </Pressable>
                <Pressable onPress={() => setPendingComponent(null)} style={({ pressed }) => [styles.insertCancel, pressed && styles.pressed]}>
                  <Text style={styles.insertCancelText}>Cancelar</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.zoneBar}>
              <Text style={styles.zoneLabel}>Modo da pinça</Text>
              {(['series', 'parallel', 'coil'] as EditorInsertionZone[]).map((zone) => (
                <Pressable key={zone} onPress={() => onSelectZone(zone)} style={[styles.zoneButton, selectedZone === zone && styles.zoneButtonActive]}>
                  <Text style={[styles.zoneButtonText, selectedZone === zone && styles.zoneButtonTextActive]}>
                    {zone === 'series' ? 'Série' : zone === 'parallel' ? 'Paralelo' : 'Saída / função'}
                  </Text>
                </Pressable>
              ))}
              <Text style={styles.zoneHint}>{pendingComponent ? 'toque no + do Ladder para soltar' : 'pegue uma instrução acima'}</Text>
            </View>
            <Text style={styles.quickActionHint}>Regra Ladder: série entra no caminho principal; paralelo cria um ramo fechado ao redor do bloco escolhido; bobinas, TON/TOF/TP, contadores e matemática fecham como saída/função.</Text>
          </View>

          <View style={[styles.ladderList, isMobile && mobileTab !== 'program' && styles.mobileHidden]}>
            <View style={[styles.ladderListHeader, isMobile && styles.mobileLadderListHeader]}>
              <View>
                <Text style={styles.ladderListTitle}>Programa Ladder</Text>
                <Text style={styles.ladderListSubtitle}>Use dois dedos para ampliar e arraste para navegar pelo rung.</Text>
              </View>
              <View style={styles.ladderHeaderTools}>
                <View style={styles.zoomControls}>
                  <Pressable onPress={() => changeCanvasZoom(-0.1)} style={({ pressed }) => [styles.zoomButton, pressed && styles.pressed]}>
                    <Text style={styles.zoomButtonText}>-</Text>
                  </Pressable>
                  <Pressable onPress={() => setCanvasZoom(1)} style={({ pressed }) => [styles.zoomValueButton, pressed && styles.pressed]}>
                    <Text style={styles.zoomValueText}>{Math.round(canvasZoom * 100)}%</Text>
                  </Pressable>
                  <Pressable onPress={() => changeCanvasZoom(0.1)} style={({ pressed }) => [styles.zoomButton, pressed && styles.pressed]}>
                    <Text style={styles.zoomButtonText}>+</Text>
                  </Pressable>
                </View>
                <View style={styles.ladderActions}>
                  <Pressable onPress={onAddRung} disabled={locked} style={({ pressed }) => [styles.addLineButton, locked && styles.disabled, pressed && !locked && styles.pressed]}>
                    <Text style={styles.addLineText}>Adicionar linha</Text>
                  </Pressable>
                  <Pressable onPress={onRemoveRung} disabled={locked || editor.rungs.length <= 1} style={({ pressed }) => [styles.removeLineButton, (locked || editor.rungs.length <= 1) && styles.disabled, pressed && !locked && editor.rungs.length > 1 && styles.pressed]}>
                    <Text style={styles.removeLineText}>Remover</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            {editor.rungs.map((item, index) => renderRungCanvas(item, index))}
          </View>

          <View style={[styles.fieldBench, isMobile && mobileTab !== 'field' && styles.mobileHidden]}>
            <View style={styles.fieldBenchHeader}>
              <View>
                <Text style={styles.fieldBenchTitle}>Bancada de campo</Text>
                <Text style={styles.fieldBenchSubtitle}>Dispositivos virtuais ligados aos endereços da tabela de I/O.</Text>
              </View>
              <Text style={[styles.fieldBenchStatus, motorOn && styles.fieldBenchStatusOn]}>{motorOn ? 'MOTOR ON' : 'MOTOR OFF'}</Text>
            </View>
            <View style={styles.feedbackRow}>
              <View style={styles.fieldGrid}>
                <Text style={styles.fieldSectionTitle}>Entradas virtuais</Text>
                {visibleInputs.length === 0 ? <Text style={styles.emptyIoText}>Nenhuma entrada no programa.</Text> : null}
                {visibleInputs.map((item) => {
                  const active = Boolean(state[item.id]);
                  return (
                    <Pressable
                      key={`field-input-${item.id}`}
                      onPress={() => locked && onToggleInput(item.id)}
                      style={({ pressed }) => [styles.fieldDevice, active && styles.fieldDeviceOn, pressed && locked && styles.pressed]}
                    >
                      <View style={[styles.fieldLamp, active && styles.fieldLampOn]} />
                      <View style={styles.fieldDeviceText}>
                        <Text style={styles.fieldDeviceAddress}>{item.address}</Text>
                        <Text style={styles.fieldDeviceName}>{item.name}</Text>
                      </View>
                      <Text style={[styles.fieldDeviceState, active && styles.fieldDeviceStateOn]}>{active ? 'ON' : 'OFF'}</Text>
                    </Pressable>
                  );
                })}

                <Text style={styles.fieldSectionTitle}>Saídas e memórias</Text>
                {simpleVisibleOutputs.length === 0 && functionBlocks.length === 0 && declaredFunctionVariables.length === 0 ? <Text style={styles.emptyIoText}>Nenhuma saída no programa.</Text> : null}
                {simpleVisibleOutputs.map((item) => {
                  const value = state[item.id] ?? false;
                  const numeric = isNumericVariable(item.id);
                  const active = Boolean(value);
                  return (
                    <View key={`field-output-${item.id}`} style={[styles.fieldDevice, active && !numeric && styles.fieldDeviceOn]}>
                      <View style={[styles.fieldLamp, active && !numeric && styles.fieldLampOn]} />
                      <View style={styles.fieldDeviceText}>
                        <Text style={styles.fieldDeviceAddress}>{item.address}</Text>
                        <Text style={styles.fieldDeviceName}>{item.name}</Text>
                      </View>
                      <Text style={[styles.fieldDeviceState, active && !numeric && styles.fieldDeviceStateOn]}>
                        {numeric ? String(typeof value === 'number' ? value : 0) : active ? 'ON' : 'OFF'}
                      </Text>
                    </View>
                  );
                })}
                {functionBlocks.length > 0 ? <Text style={styles.fieldSectionTitle}>Temporizadores e contadores</Text> : null}
                {functionBlocks.map((block) => (
                  <FunctionVariableCard key={`field-function-${block.id}`} block={block} evaluation={evaluation} />
                ))}
                {declaredFunctionVariables.map((variable) => (
                  <DeclaredFunctionVariableCard key={`field-declared-function-${variable.id}`} variable={variable} onRemove={removeHandlerFor(variable.id)} />
                ))}
              </View>
              <View style={styles.messageCard}>
                <Text style={styles.messageTitle}>Diagnostico</Text>
                <Text style={styles.messageText}>{message ?? evaluation.explanation}</Text>
                {timers.map(([id, timer]) => (
                  <Text key={id} style={styles.runtimeText}>{id}: ET {timer.elapsedMs}ms | Q {timer.q ? 'ON' : 'OFF'}</Text>
                ))}
                {counters.map(([id, counter]) => (
                  <Text key={id} style={styles.runtimeText}>{id}: CV {counter.currentValue} | Q {counter.q ? 'ON' : 'OFF'}</Text>
                ))}
                {evaluation.diagnostics.map((diagnostic) => (
                  <Text key={diagnostic.id} style={[styles.diagnosticText, diagnostic.severity === 'error' && styles.diagnosticError, diagnostic.severity === 'warning' && styles.diagnosticWarning]}>
                    {diagnostic.severity.toUpperCase()}: {diagnostic.message}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    minHeight: 62,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  modePill: {
    alignSelf: 'center',
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cyanSoft,
  },
  modePillRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  modePillText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  modePillRunText: {
    color: colors.green,
  },
  workbench: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  mobileWorkbench: {
    flexDirection: 'column',
    padding: spacing.sm,
  },
  mobileHidden: {
    display: 'none',
  },
  sidePanel: {
    width: 220,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  ioHeader: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.sm,
  },
  ioTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  ioSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  variableCreator: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  variableCreatorCompact: {
    marginBottom: spacing.md,
  },
  variableCreatorInput: {
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    fontSize: 12,
    fontWeight: '800',
  },
  variableTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  variableTypeButton: {
    flexGrow: 1,
    minWidth: 72,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  variableTypeButtonActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  variableTypeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  variableTypeTextActive: {
    color: colors.cyan,
  },
  variableAddButton: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: spacing.xs,
    backgroundColor: colors.cyanSoft,
  },
  variableAddText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
  },
  variableRemoveButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.red,
    borderWidth: 1,
    backgroundColor: colors.redSoft,
  },
  variableRemoveText: {
    color: colors.red,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  panelTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  signalRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  signalRowOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  numericSignalRow: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  numericSignalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  numericSignalText: {
    flex: 1,
    minWidth: 0,
  },
  numericSignalBadge: {
    color: colors.cyan,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    fontSize: 10,
    fontWeight: '900',
  },
  signalLamp: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderColor: colors.inactive,
    borderWidth: 2,
    backgroundColor: colors.backgroundSoft,
  },
  signalLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  signalText: {
    flex: 1,
  },
  signalName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  signalId: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 1,
  },
  signalState: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    minWidth: 36,
    textAlign: 'center',
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '900',
  },
  signalStateOn: {
    color: colors.green,
    borderColor: colors.green,
  },
  numericStateInput: {
    color: colors.cyan,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    width: '100%',
    minHeight: 30,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    fontWeight: '900',
    backgroundColor: colors.surface,
  },
  functionCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  functionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  functionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  functionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  functionBadge: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: '900',
  },
  functionName: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  functionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  functionField: {
    minWidth: 58,
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  functionFieldOn: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  emptyIoText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.cyan,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.greenSoft,
  },
  secondaryButtonText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '900',
  },
  autoScanButton: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.cyanSoft,
  },
  autoScanButtonOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  autoScanText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
  },
  autoScanTextOn: {
    color: colors.green,
  },
  scanPanel: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.background,
  },
  scanTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  scanMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  scanState: {
    color: colors.cyan,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    fontSize: 10,
    fontWeight: '900',
  },
  scanStateRun: {
    color: colors.green,
    borderColor: colors.green,
  },
  simControls: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modeButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  modeButtonActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  modeButtonActiveRun: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  modeButtonTextActive: {
    color: colors.cyan,
  },
  modeButtonTextRun: {
    color: colors.green,
  },
  stopButton: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.redSoft,
  },
  stopButtonText: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  mainPanel: {
    flex: 1,
    minWidth: 760,
  },
  mobileMainPanel: {
    minWidth: 0,
    width: '100%',
  },
  mobileTabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  mobileTab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  mobileTabActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  mobileTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  mobileTabTextActive: {
    color: colors.cyan,
  },
  mobileIoPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  visualPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  visualHeader: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  visualTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  visualSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  visualSectionTitle: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  visualGrid: {
    gap: spacing.xs,
  },
  visualTile: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  visualTileOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  visualLamp: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: colors.inactive,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  visualLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  visualTileText: {
    flex: 1,
    minWidth: 0,
  },
  visualAddress: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  visualName: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  visualState: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    minWidth: 44,
    textAlign: 'center',
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '900',
  },
  visualStateOn: {
    color: colors.green,
    borderColor: colors.green,
  },
  visualFunctionGrid: {
    gap: spacing.xs,
  },
  visualModeSwitch: {
    flexDirection: 'row',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.background,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  visualModeButton: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  visualModeButtonActive: {
    backgroundColor: colors.cyanSoft,
  },
  visualModeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  visualModeTextActive: {
    color: colors.cyan,
  },
  rungMonitorList: {
    gap: spacing.xs,
  },
  flowList: {
    gap: spacing.sm,
  },
  flowCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  flowCardOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  flowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  flowIndex: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  flowIndexOn: {
    color: colors.green,
  },
  flowTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  flowRail: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  flowChip: {
    minWidth: 88,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.xs,
    backgroundColor: colors.surface,
  },
  flowChipOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  flowChipAddress: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    maxWidth: 80,
  },
  flowChipAddressOn: {
    color: colors.green,
  },
  flowChipSymbol: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  flowParallelGroup: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  flowParallelLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  flowBranch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flowBranchIndex: {
    width: 18,
    height: 18,
    borderRadius: 9,
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    paddingTop: 1,
  },
  rungMonitorRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  rungMonitorRowOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  rungMonitorIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 12,
    fontWeight: '900',
  },
  rungMonitorIndexOn: {
    color: colors.green,
    borderColor: colors.green,
  },
  rungMonitorText: {
    flex: 1,
    minWidth: 0,
  },
  rungMonitorTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  rungMonitorMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  rungMonitorState: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  rungMonitorStateOn: {
    color: colors.green,
  },
  mobileRunDock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  mobileRunDockHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mobileRunActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  mobileRunButton: {
    minHeight: 38,
    minWidth: 82,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
  },
  mobileRunPrimary: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyan,
  },
  mobileRunAuto: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  mobileRunStop: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  mobileInputStrip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  mobileInputStripRail: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  mobileInputChip: {
    minWidth: 136,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  mobileInputChipOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  mobileInputLamp: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderColor: colors.inactive,
    borderWidth: 2,
    backgroundColor: colors.backgroundSoft,
  },
  mobileInputLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  mobileInputAddress: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  mobileInputName: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    maxWidth: 58,
    marginTop: 1,
  },
  mobileInputState: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    minWidth: 34,
    textAlign: 'center',
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '900',
  },
  mobileInputStateOn: {
    color: colors.green,
    borderColor: colors.green,
  },
  componentPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  componentHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  componentPanelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  componentPanelSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  categoryTabs: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  categoryTab: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  categoryTabActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  categoryTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  categoryTabTextActive: {
    color: colors.cyan,
  },
  componentRail: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  componentTile: {
    width: 118,
    minHeight: 82,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
  },
  componentTileSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  tweezerStatus: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  tweezerStatusLoaded: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  tweezerStatusText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  tweezerStatusTextLoaded: {
    color: colors.green,
  },
  componentSymbol: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  componentName: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  insertQuestion: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.background,
    flexWrap: 'wrap',
  },
  insertQuestionTextBox: {
    minWidth: 230,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  insertQuestionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  insertQuestionText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  insertChoice: {
    minWidth: 138,
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cyanSoft,
  },
  insertChoiceTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  insertChoiceText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  insertCancel: {
    minWidth: 88,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  insertCancelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  zoneBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  zoneLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  zoneHint: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
  },
  zoneButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  zoneButtonActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  zoneButtonText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  zoneButtonTextActive: {
    color: colors.cyan,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  quickAction: {
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.greenSoft,
  },
  quickActionText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
  },
  quickActionHint: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
  },
  connectionPoint: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface,
    zIndex: 20,
  },
  connectionPointActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  connectionPointText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  connectionPointTextActive: {
    color: colors.cyan,
  },
  seriesConnectionPoint: {
    top: 80,
  },
  parallelConnectionPoint: {
    left: 232,
    top: 171,
    borderColor: colors.cyan,
  },
  branchConnectionPoint: {
    zIndex: 21,
    borderColor: colors.cyan,
  },
  coilConnectionPoint: {
    right: 218,
    top: 80,
  },
  canvasCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mobileCanvasCard: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  canvasCardSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.surfaceElevated,
  },
  canvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  mobileCanvasHeader: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  canvasTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  canvasSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  rungHintBox: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.goldSoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  rungHintLabel: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rungHintText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
    marginTop: 1,
  },
  ladderList: {
    gap: spacing.sm,
  },
  ladderListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  mobileLadderListHeader: {
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  ladderHeaderTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  ladderListTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  ladderListSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  ladderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  zoomButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 20,
  },
  zoomValueButton: {
    minWidth: 56,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftColor: colors.border,
    borderRightColor: colors.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  zoomValueText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  addLineButton: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cyanSoft,
  },
  addLineText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  removeLineButton: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.redSoft,
  },
  removeLineText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
  },
  rungStatus: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
  },
  rungStatusOn: {
    color: colors.green,
  },
  circuitCanvas: {
    height: 290,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    position: 'relative',
  },
  zoomFrame: {
    overflow: 'hidden',
  },
  canvasScroller: {
    paddingBottom: spacing.xs,
  },
  leftRail: {
    position: 'absolute',
    left: 16,
    top: 18,
    bottom: 18,
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.inactive,
  },
  rightRail: {
    position: 'absolute',
    right: 16,
    top: 18,
    bottom: 18,
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.inactive,
  },
  mainLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 96,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.inactive,
  },
  leftNode: {
    position: 'absolute',
    left: 60,
    top: 92,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: colors.background,
    borderWidth: 2,
    backgroundColor: colors.inactive,
  },
  rightNode: {
    position: 'absolute',
    right: 158,
    top: 92,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: colors.background,
    borderWidth: 2,
    backgroundColor: colors.inactive,
  },
  branchLeftDrop: {
    position: 'absolute',
    top: 96,
    width: 3,
    height: 92,
    borderRadius: 2,
    backgroundColor: colors.inactive,
  },
  branchRightDrop: {
    position: 'absolute',
    top: 96,
    width: 3,
    height: 92,
    borderRadius: 2,
    backgroundColor: colors.inactive,
  },
  branchLine: {
    position: 'absolute',
    top: 188,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.inactive,
  },
  branchLeftNode: {
    position: 'absolute',
    left: 60,
    top: 92,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: colors.background,
    borderWidth: 2,
    backgroundColor: colors.inactive,
  },
  branchRightNode: {
    position: 'absolute',
    top: 92,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: colors.background,
    borderWidth: 2,
    backgroundColor: colors.inactive,
  },
  branchBottomLeftNode: {
    position: 'absolute',
    left: 60,
    top: 184,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: colors.background,
    borderWidth: 2,
    backgroundColor: colors.inactive,
  },
  branchBottomRightNode: {
    position: 'absolute',
    top: 184,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: colors.background,
    borderWidth: 2,
    backgroundColor: colors.inactive,
  },
  wireOn: {
    backgroundColor: colors.green,
  },
  absoluteBlock: {
    position: 'absolute',
    zIndex: 3,
  },
  absoluteCoil: {
    position: 'absolute',
    right: 54,
    top: 59,
    zIndex: 3,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  parallelLane: {
    minHeight: 110,
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingLeft: spacing.lg,
    position: 'relative',
  },
  parallelRail: {
    width: 2,
    backgroundColor: colors.inactive,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  parallelTrack: {
    minWidth: 360,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  branchWire: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: colors.inactive,
  },
  outputSection: {
    width: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: spacing.md,
  },
  outputWire: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: colors.inactive,
  },
  blockAssembly: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockLead: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.inactive,
  },
  circuitBlock: {
    width: 104,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
  },
  outputBlock: {
    borderRadius: 999,
    width: 132,
  },
  functionBlock: {
    width: 156,
    minHeight: 122,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    borderRadius: 8,
    padding: spacing.sm,
  },
  circuitBlockActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  circuitBlockSelected: {
    borderColor: colors.cyan,
  },
  blockAddress: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  blockSymbol: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  functionBlockSymbol: {
    fontSize: 16,
  },
  blockName: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  activeText: {
    color: colors.green,
  },
  blockRuntimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
    justifyContent: 'center',
  },
  blockRuntimeField: {
    minWidth: 42,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  blockRuntimeFieldOn: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  dropZone: {
    minWidth: 96,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: colors.backgroundSoft,
    paddingHorizontal: spacing.sm,
  },
  dropZoneSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  dropZoneText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  dropZoneTextSelected: {
    color: colors.cyan,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fieldBench: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  fieldBenchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fieldBenchTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  fieldBenchSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  fieldBenchStatus: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    fontSize: 11,
    fontWeight: '900',
  },
  fieldBenchStatusOn: {
    color: colors.green,
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  deviceCard: {
    width: 150,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  deviceTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  motorDisc: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderColor: colors.inactive,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.background,
  },
  motorDiscOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  motorText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '900',
  },
  motorTextOn: {
    color: colors.green,
  },
  fieldGrid: {
    flex: 1,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  fieldSectionTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  fieldDevice: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  fieldDeviceOn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  fieldLamp: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: colors.inactive,
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  fieldLampOn: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  fieldDeviceText: {
    flex: 1,
  },
  fieldDeviceAddress: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  fieldDeviceName: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  fieldDeviceState: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    minWidth: 44,
    textAlign: 'center',
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    fontSize: 11,
    fontWeight: '900',
  },
  fieldDeviceStateOn: {
    color: colors.green,
    borderColor: colors.green,
  },
  messageCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  messageTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  messageText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  runtimeText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  diagnosticText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  diagnosticWarning: {
    color: colors.amber,
  },
  diagnosticError: {
    color: colors.red,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});
