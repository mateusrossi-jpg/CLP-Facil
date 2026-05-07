import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type Mode = 'EDITOR' | 'COMPONENTES' | 'SIMULAR';
type WorkspaceView = 'ladder' | 'list';
type BlockType = 'NO' | 'NC' | 'COIL' | 'TON' | 'TOF' | 'CTU' | 'CTD' | 'CMP' | 'MATH';
type Block = { id: string; type: BlockType; address: string; preset?: number; current?: number };
type Rung = { id: string; series: Block[]; parallel: Block[]; coil?: Block };
type Zone = { rungId: string; index: number; kind: 'series' | 'coil' | 'parallel' };
type Selection = { rungId: string; blockId: string; kind: 'series' | 'parallel' | 'coil' };
type QuickEditMode = 'tag' | 'preset';
type PlcState = Record<string, boolean>;

const inputs = ['I0.0', 'I0.1', 'I0.2', 'I0.3', 'I0.4', 'I0.5', 'I0.6'];
const outputs = ['Q0.0', 'Q0.1', 'Q0.2', 'Q0.3'];
const rungGap = 262;
const rungTop = 112;
const workspaceWidth = 920;
const minZoom = 0.72;
const maxZoom = 1.22;

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 9999)}`;
}

function initialRungs(): Rung[] {
  return [
    {
      id: 'rung-1',
      series: [
        { id: 'i00', type: 'NO', address: 'I0.0' },
        { id: 'i01', type: 'NC', address: 'I0.1' },
      ],
      parallel: [{ id: 'i02', type: 'NO', address: 'I0.2' }],
      coil: { id: 'q00', type: 'COIL', address: 'Q0.0' },
    },
    {
      id: 'rung-2',
      series: [
        { id: 'i03', type: 'NO', address: 'I0.3' },
        { id: 'i04', type: 'NO', address: 'I0.4' },
      ],
      parallel: [],
      coil: { id: 'q01', type: 'COIL', address: 'Q0.1' },
    },
  ];
}

function cloneRungs(rungs: Rung[]): Rung[] {
  return rungs.map((rung) => ({
    ...rung,
    series: rung.series.map((block) => ({ ...block })),
    parallel: rung.parallel.map((block) => ({ ...block })),
    coil: rung.coil ? { ...rung.coil } : undefined,
  }));
}

function isClosed(block: Block, state: PlcState) {
  if (block.type === 'NO') return Boolean(state[block.address]);
  if (block.type === 'NC') return !Boolean(state[block.address]);
  if (block.type === 'CMP') return Boolean(state[block.address]);
  if (block.type === 'MATH') return Boolean(state[block.address]);
  return Boolean(state[block.address]);
}

function evaluate(rungs: Rung[], state: PlcState) {
  const next = { ...state };
  const activeBlocks: Record<string, boolean> = {};
  const activeRungs: Record<string, boolean> = {};

  rungs.forEach((rung) => {
    const seriesPower = rung.series.every((block) => {
      const power = isClosed(block, next);
      activeBlocks[block.id] = power;
      return power;
    });
    const parallelPower = rung.parallel.length > 0
      ? rung.parallel.every((block) => {
        const power = isClosed(block, next);
        activeBlocks[block.id] = power;
        return power;
      })
      : false;
    const rungPower = seriesPower || parallelPower;
    activeRungs[rung.id] = rungPower;
    if (rung.coil) {
      activeBlocks[rung.coil.id] = rungPower;
      next[rung.coil.address] = blockOutputActive(rung.coil, rungPower);
    }
  });

  return { state: next, activeBlocks, activeRungs };
}

function isOutputTool(type: BlockType) {
  return type === 'COIL' || type === 'TON' || type === 'TOF' || type === 'CTU' || type === 'CTD';
}

function blockOutputActive(block: Block, rungPower: boolean) {
  if (block.type === 'TON') return (block.current ?? 0) >= (block.preset ?? 1);
  if (block.type === 'TOF') return rungPower || (block.current ?? 0) > 0;
  if (block.type === 'CTU') return (block.current ?? 0) >= (block.preset ?? 1);
  if (block.type === 'CTD') return (block.current ?? 0) <= 0;
  return rungPower;
}

function copyBlock(block: Block, prefix = 'copy'): Block {
  return { ...block, id: uid(prefix) };
}

function copyRung(rung: Rung): Rung {
  return {
    id: uid('rung'),
    series: rung.series.map((block) => copyBlock(block)),
    parallel: rung.parallel.map((block) => copyBlock(block)),
    coil: rung.coil ? copyBlock(rung.coil, 'output') : undefined,
  };
}

function advanceRuntimeBlocks(rungs: Rung[], state: PlcState) {
  const scan = evaluate(rungs, state);
  return cloneRungs(rungs).map((rung) => {
    const rungPower = Boolean(scan.activeRungs[rung.id]);
    const block = rung.coil;
    if (!block) return rung;
    if (block.type === 'TON') {
      block.current = rungPower ? Math.min(block.preset ?? 3000, (block.current ?? 0) + 250) : 0;
    } else if (block.type === 'TOF') {
      block.current = rungPower ? (block.preset ?? 3000) : Math.max(0, (block.current ?? 0) - 250);
    } else if (block.type === 'CTU') {
      block.current = rungPower ? Math.min(block.preset ?? 10, (block.current ?? 0) + 1) : block.current ?? 0;
    } else if (block.type === 'CTD') {
      block.current = rungPower ? Math.max(0, (block.current ?? block.preset ?? 10) - 1) : block.current ?? block.preset ?? 10;
    }
    return rung;
  });
}

function nextBlock(type: BlockType, rungs: Rung[]) {
  const used = new Set<string>();
  rungs.forEach((rung) => {
    rung.series.forEach((block) => used.add(block.address));
    rung.parallel.forEach((block) => used.add(block.address));
    if (rung.coil) used.add(rung.coil.address);
  });
  if (isOutputTool(type)) {
    return {
      id: uid('output'),
      type,
      address: type === 'COIL' ? outputs.find((item) => !used.has(item)) ?? 'Q0.0' : `${type}1`,
      preset: type === 'TON' || type === 'TOF' ? 3000 : 10,
      current: 0,
    };
  }
  return { id: uid('input'), type, address: type === 'CMP' ? 'N7:0 >= 10' : type === 'MATH' ? 'ADD N7:0' : inputs.find((item) => !used.has(item)) ?? 'I0.0' };
}

function findSelected(rungs: Rung[], selection: Selection | null): Block | null {
  if (!selection) return null;
  const rung = rungs.find((item) => item.id === selection.rungId);
  if (!rung) return null;
  if (selection.kind === 'series') return rung.series.find((block) => block.id === selection.blockId) ?? null;
  if (selection.kind === 'parallel') return rung.parallel.find((block) => block.id === selection.blockId) ?? null;
  return rung.coil?.id === selection.blockId ? rung.coil : null;
}

export function SimurelayStyleLadderScreenV10() {
  const [mode, setMode] = useState<Mode>('EDITOR');
  const [rungs, setRungs] = useState<Rung[]>(() => initialRungs());
  const [pastRungs, setPastRungs] = useState<Rung[][]>([]);
  const [futureRungs, setFutureRungs] = useState<Rung[][]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ioOpen, setIoOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<BlockType | null>(null);
  const [hotZone, setHotZone] = useState<Zone | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [quickEdit, setQuickEdit] = useState<QuickEditMode | null>(null);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('ladder');
  const [zoom, setZoom] = useState(0.9);
  const [mapVisible, setMapVisible] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [state, setState] = useState<PlcState>({
    'I0.0': true,
    'I0.1': false,
    'I0.2': true,
    'I0.3': true,
    'I0.4': true,
    'I0.5': false,
    'I0.6': false,
    'Q0.0': false,
    'Q0.1': false,
    'Q0.2': false,
    'Q0.3': false,
  });

  const scan = useMemo(() => evaluate(rungs, state), [rungs, state]);
  const simulating = mode === 'SIMULAR';
  const selectedBlock = findSelected(rungs, selection);
  const selectedRungIndex = selection ? rungs.findIndex((rung) => rung.id === selection.rungId) : -1;
  const canvasHeight = Math.max(920, rungTop + rungs.length * rungGap + 260);
  const addRungTop = rungTop + rungs.length * rungGap + 24;
  const scaledCanvasWidth = Math.round(workspaceWidth * zoom);
  const scaledCanvasHeight = Math.round(canvasHeight * zoom);

  useEffect(() => {
    if (!simulating) return undefined;
    const interval = setInterval(() => {
      setRungs((current) => advanceRuntimeBlocks(current, state));
      setScanCount((current) => current + 1);
    }, 250);
    return () => clearInterval(interval);
  }, [simulating, state]);

  function rememberRungs() {
    setPastRungs((current) => [...current.slice(-23), cloneRungs(rungs)]);
    setFutureRungs([]);
  }

  function undoRungs() {
    if (pastRungs.length === 0 || simulating) return;
    const previous = pastRungs[pastRungs.length - 1];
    if (!previous) return;
    setFutureRungs((current) => [cloneRungs(rungs), ...current.slice(0, 23)]);
    setPastRungs((current) => current.slice(0, -1));
    setRungs(cloneRungs(previous));
    setSelection(null);
    setQuickEdit(null);
  }

  function redoRungs() {
    if (futureRungs.length === 0 || simulating) return;
    const next = futureRungs[0];
    if (!next) return;
    setPastRungs((current) => [...current.slice(-23), cloneRungs(rungs)]);
    setFutureRungs((current) => current.slice(1));
    setRungs(cloneRungs(next));
    setSelection(null);
    setQuickEdit(null);
  }

  function chooseTool(type: BlockType) {
    setActiveTool(type);
    setDrawerOpen(false);
    setSelection(null);
    setMode('EDITOR');
  }

  function nudgeZoom(delta: number) {
    setZoom((current) => Math.min(maxZoom, Math.max(minZoom, Number((current + delta).toFixed(2)))));
    setMapVisible(true);
    setTimeout(() => setMapVisible(false), 1200);
  }

  function runSimulation() {
    setMode('SIMULAR');
    setDrawerOpen(false);
    setActiveTool(null);
    setSelection(null);
    setHotZone(null);
    setIoOpen(false);
    setState((current) => evaluate(rungs, current).state);
    setScanCount((current) => current + 1);
  }

  function stopSimulation() {
    setMode('EDITOR');
    setSelection(null);
    setHotZone(null);
  }

  function toggleInput(input: string) {
    const next = { ...state, [input]: !Boolean(state[input]) };
    setState(simulating ? evaluate(rungs, next).state : next);
    if (simulating) setScanCount((current) => current + 1);
  }

  function resetRuntime() {
    setScanCount(0);
    setRungs((current) => cloneRungs(current).map((rung) => ({
      ...rung,
      coil: rung.coil ? { ...rung.coil, current: rung.coil.type === 'CTD' ? rung.coil.preset ?? 10 : 0 } : undefined,
    })));
    setState((current) => ({ ...current, ...Object.fromEntries(outputs.map((output) => [output, false])) }));
  }

  function addRung() {
    rememberRungs();
    setSelection(null);
    setRungs((current) => {
      const next = cloneRungs(current);
      const coil = nextBlock('COIL', next);
      next.push({ id: uid('rung'), series: [nextBlock('NO', next)], parallel: [], coil });
      return next;
    });
  }

  function addBlock(zone: Zone) {
    if (!activeTool || simulating) return;
    rememberRungs();
    setHotZone(zone);
    setSelection(null);
    setQuickEdit(null);
    setRungs((current) => {
      const next = cloneRungs(current);
      const rung = next.find((item) => item.id === zone.rungId);
      if (!rung) return current;
      const outputTool = isOutputTool(activeTool);
      if (zone.kind === 'coil' && outputTool) {
        const block = nextBlock(activeTool, next);
        rung.coil = block;
        setSelection({ rungId: rung.id, blockId: block.id, kind: 'coil' });
      }
      if (zone.kind === 'parallel' && !outputTool) {
        const block = nextBlock(activeTool, next);
        rung.parallel.splice(zone.index, 0, block);
        setSelection({ rungId: rung.id, blockId: block.id, kind: 'parallel' });
      }
      if (zone.kind === 'series' && !outputTool) {
        const block = nextBlock(activeTool, next);
        rung.series.splice(zone.index, 0, block);
        setSelection({ rungId: rung.id, blockId: block.id, kind: 'series' });
      }
      return next;
    });
    setTimeout(() => setHotZone(null), 300);
    setActiveTool(null);
  }

  function invertSelected() {
    if (!selection || selection.kind === 'coil') return;
    rememberRungs();
    setRungs((current) => {
      const next = cloneRungs(current);
      next.forEach((rung) => {
        rung.series.forEach((block) => {
          if (block.id === selection.blockId) block.type = block.type === 'NO' ? 'NC' : 'NO';
        });
        rung.parallel.forEach((block) => {
          if (block.id === selection.blockId) block.type = block.type === 'NO' ? 'NC' : 'NO';
        });
      });
      return next;
    });
  }

  function duplicateSelected() {
    if (!selection || selection.kind === 'coil') return;
    rememberRungs();
    setRungs((current) => {
      const next = cloneRungs(current);
      const rung = next.find((item) => item.id === selection.rungId);
      if (!rung) return current;
      if (selection.kind === 'series') {
        const index = rung.series.findIndex((block) => block.id === selection.blockId);
        const block = rung.series[index];
        if (!block) return current;
        const copy = { ...block, id: uid('copy') };
        rung.series.splice(index + 1, 0, copy);
        setSelection({ rungId: rung.id, blockId: copy.id, kind: 'series' });
      }
      if (selection.kind === 'parallel') {
        const index = rung.parallel.findIndex((block) => block.id === selection.blockId);
        const block = rung.parallel[index];
        if (!block) return current;
        const copy = { ...block, id: uid('copy') };
        rung.parallel.splice(index + 1, 0, copy);
        setSelection({ rungId: rung.id, blockId: copy.id, kind: 'parallel' });
      }
      return next;
    });
  }

  function removeSelected() {
    if (!selection) return;
    rememberRungs();
    setRungs((current) => {
      const next = cloneRungs(current);
      next.forEach((rung) => {
        rung.series = rung.series.filter((block) => block.id !== selection.blockId);
        rung.parallel = rung.parallel.filter((block) => block.id !== selection.blockId);
        if (rung.coil?.id === selection.blockId) rung.coil = undefined;
      });
      return next;
    });
    setSelection(null);
    setQuickEdit(null);
  }

  function updateSelectedBlock(patch: Partial<Block>) {
    if (!selection) return;
    setRungs((current) => {
      const next = cloneRungs(current);
      next.forEach((rung) => {
        rung.series = rung.series.map((block) => block.id === selection.blockId ? { ...block, ...patch } : block);
        rung.parallel = rung.parallel.map((block) => block.id === selection.blockId ? { ...block, ...patch } : block);
        if (rung.coil?.id === selection.blockId) rung.coil = { ...rung.coil, ...patch };
      });
      return next;
    });
  }

  function createParallelFromSelected() {
    if (!selection || selection.kind === 'coil') return;
    const block = findSelected(rungs, selection);
    if (!block) return;
    rememberRungs();
    setRungs((current) => {
      const next = cloneRungs(current);
      const rung = next.find((item) => item.id === selection.rungId);
      if (!rung) return current;
      const parallel = { ...block, id: uid('parallel') };
      rung.parallel.push(parallel);
      setSelection({ rungId: rung.id, blockId: parallel.id, kind: 'parallel' });
      return next;
    });
  }

  function duplicateSelectedRung() {
    if (selectedRungIndex < 0) return;
    rememberRungs();
    setRungs((current) => {
      const rung = current[selectedRungIndex];
      if (!rung) return current;
      const next = cloneRungs(current);
      const copy = copyRung(rung);
      next.splice(selectedRungIndex + 1, 0, copy);
      if (copy.series[0]) setSelection({ rungId: copy.id, blockId: copy.series[0].id, kind: 'series' });
      else if (copy.coil) setSelection({ rungId: copy.id, blockId: copy.coil.id, kind: 'coil' });
      return next;
    });
  }

  function removeSelectedRung() {
    if (selectedRungIndex < 0 || rungs.length <= 1) return;
    rememberRungs();
    setRungs((current) => current.filter((_, index) => index !== selectedRungIndex));
    setSelection(null);
    setQuickEdit(null);
  }

  function moveSelectedRung(direction: -1 | 1) {
    if (selectedRungIndex < 0) return;
    const targetIndex = selectedRungIndex + direction;
    if (targetIndex < 0 || targetIndex >= rungs.length) return;
    rememberRungs();
    setRungs((current) => {
      const next = cloneRungs(current);
      const [item] = next.splice(selectedRungIndex, 1);
      if (!item) return current;
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function selectBlock(nextSelection: Selection) {
    if (simulating || activeTool) return;
    setQuickEdit(null);
    setSelection(nextSelection);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => setDrawerOpen((current) => !current)}>
            <Text style={styles.iconButtonText}>＋</Text>
          </Pressable>
          <View style={styles.titleBox}>
            <Text style={styles.title}>CLP Fácil</Text>
            <Text style={styles.subtitle}>{selectedBlock ? `${selectedBlock.address} selecionado` : activeTool ? `${activeTool} na mão · zonas magnéticas ativas` : simulating ? 'simulação viva' : 'workspace ladder'}</Text>
          </View>
          <Pressable style={[styles.simButton, simulating && styles.stopButton]} onPress={simulating ? stopSimulation : runSimulation}>
            <Text style={[styles.simIcon, simulating && styles.stopIcon]}>{simulating ? '■' : '▶'}</Text>
            <Text style={[styles.simText, simulating && styles.stopText]}>{simulating ? 'STOP' : 'SIMULAR'}</Text>
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setWorkspaceView((current) => current === 'ladder' ? 'list' : 'ladder')}>
            <Text style={styles.iconButtonText}>{workspaceView === 'ladder' ? '≡' : '⌁'}</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <Tab label="EDITOR" active={mode === 'EDITOR'} onPress={() => setMode('EDITOR')} />
          <Tab label="COMPONENTES" active={mode === 'COMPONENTES'} onPress={() => { setMode('COMPONENTES'); setDrawerOpen(true); setSelection(null); }} />
          <Tab label="SIMULAR" active={mode === 'SIMULAR'} onPress={runSimulation} />
        </View>

        <View style={styles.workspace}>
          <WorkbenchStatus mode={mode} scanCount={scanCount} rungCount={rungs.length} energizedCount={rungs.filter((rung) => scan.activeRungs[rung.id]).length} zoom={zoom} canUndo={pastRungs.length > 0 && !simulating} canRedo={futureRungs.length > 0 && !simulating} onUndo={undoRungs} onRedo={redoRungs} onReset={resetRuntime} />
          {activeTool && !simulating ? <ToolHint type={activeTool} /> : null}
          {workspaceView === 'list' ? (
            <ProgramList rungs={rungs} activeRungs={scan.activeRungs} activeBlocks={scan.activeBlocks} selection={selection} onSelect={selectBlock} onAddRung={addRung} canEdit={!simulating} />
          ) : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.canvasX, { minWidth: scaledCanvasWidth }]} onScrollBeginDrag={() => setMapVisible(true)} onScrollEndDrag={() => setMapVisible(false)}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.canvasY, { minHeight: scaledCanvasHeight }]} onScrollBeginDrag={() => setMapVisible(true)} onScrollEndDrag={() => setMapVisible(false)}>
              <Pressable style={[styles.canvasShell, { width: scaledCanvasWidth, height: scaledCanvasHeight }]} onPress={() => { setSelection(null); setQuickEdit(null); }}>
              <View style={[styles.canvas, { height: canvasHeight, transform: [{ scale: zoom }], transformOrigin: 'top left' }]}>
                <Grid />
                <View style={[styles.leftRail, { bottom: 100 }]} />
                <View style={[styles.rightRail, { bottom: 100 }]} />
                {rungs.map((rung, index) => (
                  <RungView
                    key={rung.id}
                    rung={rung}
                    index={index + 1}
                    top={rungTop + index * rungGap}
                    active={Boolean(scan.activeRungs[rung.id])}
                    activeBlocks={scan.activeBlocks}
                    outputActive={rung.coil ? blockOutputActive(rung.coil, Boolean(scan.activeRungs[rung.id])) : false}
                    showZones={Boolean(activeTool) && !simulating}
                    hotZone={hotZone}
                    selection={selection}
                    onDrop={addBlock}
                    onSelect={selectBlock}
                  />
                ))}
                {!simulating ? <Pressable style={[styles.addRung, { top: addRungTop }]} onPress={addRung}><Text style={styles.addRungText}>+ Rung</Text></Pressable> : null}
              </View>
              </Pressable>
            </ScrollView>
          </ScrollView>}

          {selectedBlock && !simulating ? <QuickEditPanel block={selectedBlock} mode={quickEdit} onClose={() => setQuickEdit(null)} onUpdate={updateSelectedBlock} /> : null}
          {selection && !simulating ? <RungActions canRemove={rungs.length > 1} canMoveUp={selectedRungIndex > 0} canMoveDown={selectedRungIndex >= 0 && selectedRungIndex < rungs.length - 1} onDuplicate={duplicateSelectedRung} onRemove={removeSelectedRung} onMoveUp={() => moveSelectedRung(-1)} onMoveDown={() => moveSelectedRung(1)} /> : null}
          {selectedBlock && !simulating ? <FloatingToolbar block={selectedBlock} onInvert={invertSelected} onDuplicate={duplicateSelected} onParallel={createParallelFromSelected} onEditTag={() => setQuickEdit('tag')} onEditPreset={() => setQuickEdit('preset')} onDelete={removeSelected} /> : null}
          {activeTool && !simulating ? <GhostPreview type={activeTool} onCancel={() => setActiveTool(null)} /> : null}
          {drawerOpen ? <Drawer onChoose={chooseTool} onClose={() => setDrawerOpen(false)} /> : null}
          <View style={styles.zoomHud}>
            <Pressable style={styles.zoomButton} onPress={() => nudgeZoom(-0.08)}><Text style={styles.zoomText}>−</Text></Pressable>
            <Pressable onPress={() => setZoom(0.9)}><Text style={styles.zoomValue}>{Math.round(zoom * 100)}%</Text></Pressable>
            <Pressable style={styles.zoomButton} onPress={() => nudgeZoom(0.08)}><Text style={styles.zoomText}>＋</Text></Pressable>
          </View>
          {workspaceView === 'ladder' && (mapVisible || zoom !== 0.9) ? <MiniMap rungs={rungs.length} activeIndex={selection ? rungs.findIndex((item) => item.id === selection.rungId) : 0} /> : null}
          {!simulating ? <Pressable style={styles.fab} onPress={() => { setDrawerOpen((current) => !current); setSelection(null); }}><Text style={styles.fabText}>＋</Text></Pressable> : null}
          {!simulating && !drawerOpen ? <QuickToolStrip activeTool={activeTool} onChoose={chooseTool} /> : null}
          <Pressable style={styles.ioHandle} onPress={() => setIoOpen((current) => !current)}><Text style={styles.ioHandleText}>{ioOpen ? '⌄' : '⌃'}</Text></Pressable>
        </View>

        {ioOpen ? <IOSheet state={state} scanState={scan.state} onToggle={toggleInput} /> : null}
        {simulating && !ioOpen ? <LiveIoDock state={state} scanState={scan.state} onToggle={toggleInput} /> : null}
      </View>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable style={styles.tab} onPress={onPress}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>{active ? <View style={styles.tabLine} /> : null}</Pressable>;
}

function WorkbenchStatus({ mode, scanCount, rungCount, energizedCount, zoom, canUndo, canRedo, onUndo, onRedo, onReset }: { mode: Mode; scanCount: number; rungCount: number; energizedCount: number; zoom: number; canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void; onReset: () => void }) {
  return (
    <View style={styles.workbenchStatus}>
      <Text style={[styles.statusChip, mode === 'SIMULAR' && styles.statusChipRun]}>{mode === 'SIMULAR' ? 'RUN' : 'EDIT'}</Text>
      <Text style={styles.statusMeta}>SCAN {scanCount}</Text>
      <Text style={styles.statusMeta}>{energizedCount}/{rungCount} ON</Text>
      <Text style={styles.statusMeta}>{Math.round(zoom * 100)}%</Text>
      <Pressable disabled={!canUndo} style={[styles.statusReset, !canUndo && styles.statusDisabled]} onPress={onUndo}><Text style={styles.statusResetText}>↶</Text></Pressable>
      <Pressable disabled={!canRedo} style={[styles.statusReset, !canRedo && styles.statusDisabled]} onPress={onRedo}><Text style={styles.statusResetText}>↷</Text></Pressable>
      <Pressable style={styles.statusReset} onPress={onReset}><Text style={styles.statusResetText}>RST</Text></Pressable>
    </View>
  );
}

function ToolHint({ type }: { type: BlockType }) {
  const output = isOutputTool(type);
  return (
    <View style={styles.toolHint}>
      <Text style={styles.toolHintTitle}>{type}</Text>
      <Text style={styles.toolHintText}>{output ? 'toque em + OUT' : 'toque em + serie ou paralelo'}</Text>
    </View>
  );
}

function Grid() {
  return <View style={styles.grid}>{Array.from({ length: 320 }).map((_, index) => <View key={index} style={styles.gridCell} />)}</View>;
}

function ZoneButton({ visible, hot, onPress }: { visible: boolean; hot: boolean; onPress: () => void }) {
  if (!visible) return <View style={styles.emptyZone} />;
  return <Pressable style={[styles.zone, hot && styles.zoneHot]} onPress={onPress}><Text style={[styles.zoneText, hot && styles.zoneTextHot]}>+</Text></Pressable>;
}

function RungView({ rung, index, top, active, activeBlocks, outputActive, showZones, hotZone, selection, onDrop, onSelect }: { rung: Rung; index: number; top: number; active: boolean; activeBlocks: Record<string, boolean>; outputActive: boolean; showZones: boolean; hotZone: Zone | null; selection: Selection | null; onDrop: (zone: Zone) => void; onSelect: (selection: Selection) => void }) {
  const isHot = (kind: Zone['kind'], zoneIndex: number) => hotZone?.rungId === rung.id && hotZone.kind === kind && hotZone.index === zoneIndex;
  const longestPath = Math.max(rung.series.length, rung.parallel.length);
  const spacing = longestPath >= 5 ? 12 : longestPath >= 4 ? 18 : 28;
  const compact = longestPath >= 5;
  const missingOutput = !rung.coil;
  return <View style={[styles.rung, { top }]}>
    <Text style={styles.rungIndex}>{index}</Text>
    <View style={[styles.rungWire, active && styles.wireLive]} />
    {active ? <View style={styles.energyPulse} /> : null}
    <View style={[styles.outputSummary, outputActive && styles.outputSummaryOn, missingOutput && styles.outputSummaryWarn]}>
      <Text style={[styles.outputSummaryTag, outputActive && styles.liveText]}>{rung.coil?.address ?? 'SEM SAIDA'}</Text>
      <Text style={[styles.outputSummaryState, outputActive && styles.outputSummaryStateOn, missingOutput && styles.outputSummaryWarnText]}>{missingOutput ? '!' : outputActive ? 'ON' : 'OFF'}</Text>
    </View>
    <View style={[styles.rungRow, { gap: spacing }]}>
      <ZoneButton visible={showZones} hot={isHot('series', 0)} onPress={() => onDrop({ rungId: rung.id, kind: 'series', index: 0 })} />
      {rung.series.map((block, blockIndex) => <View key={block.id} style={[styles.inline, { gap: spacing }]}><BlockView block={block} active={Boolean(activeBlocks[block.id])} selected={selection?.blockId === block.id} compact={compact} onPress={() => onSelect({ rungId: rung.id, blockId: block.id, kind: 'series' })} /><ZoneButton visible={showZones} hot={isHot('series', blockIndex + 1)} onPress={() => onDrop({ rungId: rung.id, kind: 'series', index: blockIndex + 1 })} /></View>)}
      <View style={[styles.fillWire, active && styles.wireLive]} />
      <ZoneButton visible={showZones} hot={isHot('coil', 0)} onPress={() => onDrop({ rungId: rung.id, kind: 'coil', index: 0 })} />
      {rung.coil ? (
        <BlockView block={rung.coil} active={Boolean(activeBlocks[rung.coil.id])} selected={selection?.blockId === rung.coil.id} compact={compact} onPress={() => onSelect({ rungId: rung.id, blockId: rung.coil?.id ?? '', kind: 'coil' })} />
      ) : (
        <Pressable style={styles.emptyOutputSlot} onPress={() => onDrop({ rungId: rung.id, kind: 'coil', index: 0 })}>
          <Text style={styles.emptyOutputText}>+ OUT</Text>
        </Pressable>
      )}
    </View>
    {showZones || rung.parallel.length > 0 ? <View style={styles.parallelRow}>
      <ZoneButton visible={showZones} hot={isHot('parallel', 0)} onPress={() => onDrop({ rungId: rung.id, kind: 'parallel', index: 0 })} />
      {rung.parallel.map((block, blockIndex) => (
        <View key={block.id} style={[styles.inline, { gap: spacing }]}>
          <BlockView block={block} active={Boolean(activeBlocks[block.id])} selected={selection?.blockId === block.id} compact={compact} onPress={() => onSelect({ rungId: rung.id, blockId: block.id, kind: 'parallel' })} />
          <ZoneButton visible={showZones} hot={isHot('parallel', blockIndex + 1)} onPress={() => onDrop({ rungId: rung.id, kind: 'parallel', index: blockIndex + 1 })} />
        </View>
      ))}
    </View> : null}
  </View>;
}

function ProgramList({ rungs, activeRungs, activeBlocks, selection, onSelect, onAddRung, canEdit }: { rungs: Rung[]; activeRungs: Record<string, boolean>; activeBlocks: Record<string, boolean>; selection: Selection | null; onSelect: (selection: Selection) => void; onAddRung: () => void; canEdit: boolean }) {
  return (
    <ScrollView style={styles.programList} contentContainerStyle={styles.programListContent} showsVerticalScrollIndicator={false}>
      {rungs.map((rung, rungIndex) => {
        const active = Boolean(activeRungs[rung.id]);
        const outputActive = rung.coil ? blockOutputActive(rung.coil, active) : false;
        return (
          <View key={rung.id} style={[styles.programRow, active && styles.programRowOn]}>
            <View style={styles.programRowHeader}>
              <Text style={styles.programRungIndex}>RUNG {rungIndex + 1}</Text>
              <Text style={[styles.programOutput, outputActive && styles.liveText, !rung.coil && styles.programOutputWarn]}>{rung.coil?.address ?? 'SEM SAIDA'} {rung.coil ? outputActive ? 'ON' : 'OFF' : '!'}</Text>
            </View>
            <View style={styles.programPath}>
              {rung.series.map((block) => (
                <ProgramBlock key={block.id} block={block} active={Boolean(activeBlocks[block.id])} selected={selection?.blockId === block.id} onPress={() => onSelect({ rungId: rung.id, blockId: block.id, kind: 'series' })} />
              ))}
              {rung.parallel.length > 0 ? <Text style={styles.programBranchLabel}>PAR</Text> : null}
              {rung.parallel.map((block) => (
                <ProgramBlock key={block.id} block={block} active={Boolean(activeBlocks[block.id])} selected={selection?.blockId === block.id} onPress={() => onSelect({ rungId: rung.id, blockId: block.id, kind: 'parallel' })} />
              ))}
              {rung.coil ? <ProgramBlock block={rung.coil} active={outputActive} selected={selection?.blockId === rung.coil.id} onPress={() => onSelect({ rungId: rung.id, blockId: rung.coil?.id ?? '', kind: 'coil' })} /> : null}
            </View>
          </View>
        );
      })}
      {canEdit ? <Pressable style={styles.programAddRung} onPress={onAddRung}><Text style={styles.programAddRungText}>+ RUNG</Text></Pressable> : null}
    </ScrollView>
  );
}

function ProgramBlock({ block, active, selected, onPress }: { block: Block; active: boolean; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.programBlock, active && styles.programBlockOn, selected && styles.programBlockSelected]} onPress={onPress}>
      <Text style={[styles.programBlockTag, active && styles.liveText]} numberOfLines={1}>{block.address}</Text>
      <Text style={styles.programBlockType}>{blockSymbol(block.type)}</Text>
    </Pressable>
  );
}

function blockSymbol(type: BlockType) {
  if (type === 'COIL') return '( )';
  if (type === 'NO') return '| |';
  if (type === 'NC') return '|/|';
  return type;
}

function BlockView({ block, active, selected, compact, onPress }: { block: Block; active: boolean; selected: boolean; compact?: boolean; onPress: () => void }) {
  const output = isOutputTool(block.type);
  const fill = block.preset ? Math.min(1, Math.max(0.12, active ? 0.72 : (block.current ?? 0) / block.preset)) : 0;
  const meta = block.type === 'TON' || block.type === 'TOF'
    ? `${Math.round((block.current ?? 0) / 1000)}/${Math.round((block.preset ?? 0) / 1000)}s`
    : block.type === 'CTU' || block.type === 'CTD'
      ? `${block.current ?? 0}/${block.preset ?? 0}`
      : '';
  return (
    <Pressable style={[styles.block, output && styles.outputBlock, compact && styles.blockCompact, selected && styles.blockSelected]} onPress={onPress}>
      <Text style={[styles.blockLabel, active && styles.liveText]} numberOfLines={1}>{block.address}</Text>
      <Text style={[styles.symbol, compact && styles.symbolCompact, active && styles.liveText]}>{blockSymbol(block.type)}</Text>
      {block.type !== 'NO' && block.type !== 'NC' && block.type !== 'COIL' ? (
        <>
          <View style={styles.microMeter}><View style={[styles.microMeterFill, active && styles.microMeterFillOn, { width: `${Math.round(fill * 100)}%` }]} /></View>
          <Text style={styles.blockMeta}>{meta}</Text>
        </>
      ) : null}
    </Pressable>
  );
}

function QuickEditPanel({ block, mode, onClose, onUpdate }: { block: Block; mode: QuickEditMode | null; onClose: () => void; onUpdate: (patch: Partial<Block>) => void }) {
  if (!mode) return null;
  const presetValue = String(block.preset ?? (block.type === 'TON' || block.type === 'TOF' ? 3000 : 10));
  const presetStep = block.type === 'TON' || block.type === 'TOF' ? 500 : 1;
  const presetUnit = block.type === 'TON' || block.type === 'TOF' ? 'ms' : 'cnt';
  const changePreset = (delta: number) => {
    const nextPreset = Math.max(0, (block.preset ?? 0) + delta);
    onUpdate({ preset: nextPreset, current: Math.min(block.current ?? 0, nextPreset) });
  };
  return (
    <View style={styles.quickEditPanel}>
      <Text style={styles.quickEditTitle}>{mode === 'tag' ? 'TAG' : 'PRESET'}</Text>
      {mode === 'tag' ? (
        <TextInput
          value={block.address}
          onChangeText={(address) => onUpdate({ address })}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.quickInput}
          placeholder="I0.0"
          placeholderTextColor="#52645E"
        />
      ) : (
        <>
          <Pressable style={styles.quickStep} onPress={() => changePreset(-presetStep)}><Text style={styles.quickStepText}>−</Text></Pressable>
          <TextInput
            value={presetValue}
            onChangeText={(value) => onUpdate({ preset: Number(value.replace(/[^0-9]/g, '')) || 0, current: 0 })}
            keyboardType="numeric"
            style={styles.quickInput}
            placeholder="3000"
            placeholderTextColor="#52645E"
          />
          <Text style={styles.quickUnit}>{presetUnit}</Text>
          <Pressable style={styles.quickStep} onPress={() => changePreset(presetStep)}><Text style={styles.quickStepText}>＋</Text></Pressable>
        </>
      )}
      <Pressable style={styles.quickDone} onPress={onClose}><Text style={styles.quickDoneText}>OK</Text></Pressable>
    </View>
  );
}

function RungActions({ canRemove, canMoveUp, canMoveDown, onDuplicate, onRemove, onMoveUp, onMoveDown }: { canRemove: boolean; canMoveUp: boolean; canMoveDown: boolean; onDuplicate: () => void; onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void }) {
  return (
    <View style={styles.rungActions}>
      <Pressable disabled={!canMoveUp} style={[styles.rungActionButton, !canMoveUp && styles.rungActionDisabled]} onPress={onMoveUp}><Text style={styles.rungActionText}>↑</Text></Pressable>
      <Pressable disabled={!canMoveDown} style={[styles.rungActionButton, !canMoveDown && styles.rungActionDisabled]} onPress={onMoveDown}><Text style={styles.rungActionText}>↓</Text></Pressable>
      <Pressable style={styles.rungActionButton} onPress={onDuplicate}><Text style={styles.rungActionText}>DUP</Text></Pressable>
      <Pressable disabled={!canRemove} style={[styles.rungActionDanger, !canRemove && styles.rungActionDisabled]} onPress={onRemove}><Text style={styles.rungActionDangerText}>DEL</Text></Pressable>
    </View>
  );
}

function FloatingToolbar({ block, onInvert, onDuplicate, onParallel, onEditTag, onEditPreset, onDelete }: { block: Block; onInvert: () => void; onDuplicate: () => void; onParallel: () => void; onEditTag: () => void; onEditPreset: () => void; onDelete: () => void }) {
  const contact = block.type === 'NO' || block.type === 'NC';
  return <View style={styles.toolbar}><Text style={styles.toolbarLabel}>{block.address}</Text>{contact ? <Pressable style={styles.toolbarButton} onPress={onInvert}><Text style={styles.toolbarText}>NA/NF</Text></Pressable> : null}<Pressable style={styles.toolbarButton} onPress={onDuplicate}><Text style={styles.toolbarText}>DUP</Text></Pressable>{contact ? <Pressable style={styles.toolbarButton} onPress={onParallel}><Text style={styles.toolbarText}>RAMO</Text></Pressable> : null}<Pressable style={styles.toolbarButton} onPress={onEditTag}><Text style={styles.toolbarText}>TAG</Text></Pressable>{block.type !== 'NO' && block.type !== 'NC' && block.type !== 'COIL' ? <Pressable style={styles.toolbarButton} onPress={onEditPreset}><Text style={styles.toolbarText}>PRE</Text></Pressable> : null}<Pressable style={styles.toolbarDanger} onPress={onDelete}><Text style={styles.toolbarDangerText}>DEL</Text></Pressable></View>;
}

function GhostPreview({ type, onCancel }: { type: BlockType; onCancel: () => void }) {
  return <View style={styles.ghost}><Pressable style={styles.ghostClose} onPress={onCancel}><Text style={styles.ghostCloseText}>×</Text></Pressable><Text style={styles.ghostLabel}>NA MÃO</Text><Text style={styles.ghostSymbol}>{blockSymbol(type)}</Text><Text style={styles.ghostHint}>solte no brilho</Text></View>;
}

function Drawer({ onChoose, onClose }: { onChoose: (type: BlockType) => void; onClose: () => void }) {
  return <View style={styles.drawer}><View style={styles.drawerHeader}><Text style={styles.drawerTitle}>COMPONENTES</Text><Pressable onPress={onClose}><Text style={styles.drawerClose}>×</Text></Pressable></View><View style={styles.drawerItems}><ToolCard label="NA" symbol="| |" onPress={() => onChoose('NO')} /><ToolCard label="NF" symbol="|/|" onPress={() => onChoose('NC')} /><ToolCard label="Coil" symbol="( )" onPress={() => onChoose('COIL')} /><ToolCard label="TON" symbol="TON" onPress={() => onChoose('TON')} /><ToolCard label="TOF" symbol="TOF" onPress={() => onChoose('TOF')} /><ToolCard label="CTU" symbol="CTU" onPress={() => onChoose('CTU')} /><ToolCard label="CTD" symbol="CTD" onPress={() => onChoose('CTD')} /><ToolCard label="CMP" symbol=">=" onPress={() => onChoose('CMP')} /><ToolCard label="MATH" symbol="fx" onPress={() => onChoose('MATH')} /></View><Text style={styles.drawerHint}>Toque no bloco e depois em uma zona luminosa. O painel fecha sozinho.</Text></View>;
}

function ToolCard({ label, symbol, onPress }: { label: string; symbol: string; onPress: () => void }) {
  return <Pressable style={styles.toolCard} onPress={onPress}><Text style={styles.toolSymbol}>{symbol}</Text><Text style={styles.toolLabel}>{label}</Text></Pressable>;
}

function QuickToolStrip({ activeTool, onChoose }: { activeTool: BlockType | null; onChoose: (type: BlockType) => void }) {
  const tools: { type: BlockType; label: string }[] = [
    { type: 'NO', label: 'NA' },
    { type: 'NC', label: 'NF' },
    { type: 'COIL', label: 'OUT' },
    { type: 'TON', label: 'TON' },
    { type: 'CTU', label: 'CTU' },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickToolStrip} contentContainerStyle={styles.quickToolContent}>
      {tools.map((tool) => (
        <Pressable key={tool.type} style={[styles.quickTool, activeTool === tool.type && styles.quickToolActive]} onPress={() => onChoose(tool.type)}>
          <Text style={[styles.quickToolText, activeTool === tool.type && styles.quickToolTextActive]}>{tool.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function IOSheet({ state, scanState, onToggle }: { state: PlcState; scanState: PlcState; onToggle: (input: string) => void }) {
  return <View style={styles.ioSheet}><View style={styles.sheetHandle} /><View style={styles.ioContent}><View style={styles.ioColumn}><Text style={styles.ioTitle}>ENTRADAS</Text>{inputs.slice(0, 4).map((input) => <Pressable key={input} style={styles.ioRow} onPress={() => onToggle(input)}><Text style={styles.ioLabel}>{input}</Text><View style={[styles.dot, state[input] && styles.dotOn]} /></Pressable>)}</View><View style={styles.ioColumn}><Text style={styles.ioTitle}>SAÍDAS</Text>{outputs.slice(0, 3).map((output) => <View key={output} style={styles.ioRow}><Text style={styles.ioLabel}>{output}</Text><View style={[styles.dot, scanState[output] && styles.dotOn]} /></View>)}</View></View></View>;
}

function LiveIoDock({ state, scanState, onToggle }: { state: PlcState; scanState: PlcState; onToggle: (input: string) => void }) {
  return (
    <View style={styles.liveDock}>
      {inputs.slice(0, 5).map((input) => (
        <Pressable key={input} style={[styles.liveIo, state[input] && styles.liveIoOn]} onPress={() => onToggle(input)}>
          <Text style={[styles.liveIoText, state[input] && styles.liveIoTextOn]}>{input}</Text>
        </Pressable>
      ))}
      {outputs.slice(0, 2).map((output) => (
        <View key={output} style={[styles.liveIo, styles.liveOutput, scanState[output] && styles.liveIoOn]}>
          <Text style={[styles.liveIoText, scanState[output] && styles.liveIoTextOn]}>{output}</Text>
        </View>
      ))}
    </View>
  );
}

function MiniMap({ rungs, activeIndex }: { rungs: number; activeIndex: number }) {
  return (
    <View style={styles.miniMap}>
      {Array.from({ length: Math.max(rungs, 1) }).map((_, index) => (
        <View key={index} style={[styles.miniRung, index === activeIndex && styles.miniRungActive]} />
      ))}
      <View style={styles.miniViewport} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050606' },
  root: { flex: 1, backgroundColor: '#050606' },
  header: { minHeight: 68, paddingHorizontal: 12, backgroundColor: '#080A0A', flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#151D1C' },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#111716', borderWidth: 1, borderColor: '#253230', alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { color: '#E7FFF0', fontSize: 21, fontWeight: '900' },
  titleBox: { flex: 1, minWidth: 0 },
  title: { color: '#F8FAFC', fontSize: 19, fontWeight: '900' },
  subtitle: { color: '#8EA39B', marginTop: 2, fontSize: 12, fontWeight: '700' },
  simButton: { minHeight: 42, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 1, borderColor: '#22C55E', flexDirection: 'row', alignItems: 'center', gap: 6 },
  stopButton: { backgroundColor: 'rgba(239,68,68,0.14)', borderColor: '#F87171' },
  simIcon: { color: '#4ADE80', fontSize: 18, fontWeight: '900' },
  stopIcon: { color: '#FCA5A5', fontSize: 14 },
  simText: { color: '#BBF7D0', fontWeight: '900', fontSize: 12 },
  stopText: { color: '#FCA5A5' },
  tabs: { height: 42, backgroundColor: '#080A0A', borderBottomWidth: 1, borderBottomColor: '#151D1C', flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: '#62736D', fontWeight: '900', letterSpacing: 0, fontSize: 11 },
  tabTextActive: { color: '#4ADE80' },
  tabLine: { position: 'absolute', left: 18, right: 18, bottom: 0, height: 2, borderRadius: 2, backgroundColor: '#4ADE80' },
  workspace: { flex: 1, backgroundColor: '#090B0B', overflow: 'hidden' },
  workbenchStatus: { position: 'absolute', left: 10, top: 10, minHeight: 34, borderRadius: 999, backgroundColor: 'rgba(8,10,10,0.9)', borderWidth: 1, borderColor: '#263330', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 8, zIndex: 4 },
  statusChip: { minWidth: 42, color: '#A7F3D0', backgroundColor: '#111716', borderRadius: 999, overflow: 'hidden', textAlign: 'center', paddingHorizontal: 7, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
  statusChipRun: { color: '#04110A', backgroundColor: '#4ADE80' },
  statusMeta: { color: '#8EA39B', fontSize: 10, fontWeight: '900' },
  statusReset: { minHeight: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: '#141C1A', borderWidth: 1, borderColor: '#263330', justifyContent: 'center' },
  statusResetText: { color: '#E7FFF0', fontSize: 10, fontWeight: '900' },
  statusDisabled: { opacity: 0.38 },
  toolHint: { position: 'absolute', left: 10, top: 50, minHeight: 36, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.14)', borderWidth: 1, borderColor: '#4ADE80', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, zIndex: 5 },
  toolHintTitle: { color: '#BBF7D0', fontSize: 11, fontWeight: '900' },
  toolHintText: { color: '#E7FFF0', fontSize: 11, fontWeight: '800' },
  canvasX: { flexGrow: 1 },
  canvasY: { flexGrow: 1 },
  canvasShell: { backgroundColor: '#090B0B', overflow: 'hidden' },
  canvas: { width: workspaceWidth, backgroundColor: '#090B0B', position: 'relative' },
  grid: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.46 },
  gridCell: { width: 46, height: 46, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#16201E' },
  leftRail: { position: 'absolute', left: 58, top: 50, width: 4, borderRadius: 3, backgroundColor: '#E6FFF1' },
  rightRail: { position: 'absolute', right: 58, top: 50, width: 4, borderRadius: 3, backgroundColor: '#E6FFF1' },
  rung: { position: 'absolute', left: 58, right: 58, height: 232 },
  rungIndex: { position: 'absolute', left: -38, top: 58, color: '#54615D', fontSize: 13, fontWeight: '900' },
  rungWire: { position: 'absolute', left: 0, right: 0, top: 70, height: 3, borderRadius: 3, backgroundColor: '#DDE7E2' },
  wireLive: { backgroundColor: '#4ADE80', shadowColor: '#4ADE80', shadowOpacity: 0.65, shadowRadius: 9, elevation: 4 },
  energyPulse: { position: 'absolute', left: 152, top: 63, width: 17, height: 17, borderRadius: 9, backgroundColor: '#86EFAC', shadowColor: '#4ADE80', shadowOpacity: 0.9, shadowRadius: 16, elevation: 7 },
  outputSummary: { position: 'absolute', right: -44, top: 122, minWidth: 92, minHeight: 38, borderRadius: 999, backgroundColor: 'rgba(8,10,10,0.9)', borderWidth: 1, borderColor: '#263330', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 10 },
  outputSummaryOn: { borderColor: '#4ADE80', backgroundColor: 'rgba(34,197,94,0.16)', shadowColor: '#4ADE80', shadowOpacity: 0.45, shadowRadius: 10, elevation: 5 },
  outputSummaryWarn: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.12)' },
  outputSummaryTag: { color: '#91A39C', fontSize: 11, fontWeight: '900' },
  outputSummaryState: { color: '#6B7A75', fontSize: 10, fontWeight: '900' },
  outputSummaryStateOn: { color: '#A7F3D0' },
  outputSummaryWarnText: { color: '#FBBF24' },
  rungRow: { position: 'absolute', left: 94, right: 92, top: 18, height: 108, flexDirection: 'row', alignItems: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center' },
  fillWire: { flex: 1, minWidth: 28, height: 3, borderRadius: 3, backgroundColor: '#DDE7E2' },
  parallelRow: { position: 'absolute', left: 238, right: 175, top: 122, height: 76, borderLeftWidth: 3, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#DDE7E2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26 },
  programList: { flex: 1, paddingTop: 54 },
  programListContent: { paddingHorizontal: 10, paddingBottom: 112, gap: 10 },
  programRow: { borderRadius: 12, borderWidth: 1, borderColor: '#1B2825', backgroundColor: '#0D1211', padding: 10, gap: 9 },
  programRowOn: { borderColor: '#31534B', backgroundColor: 'rgba(34,197,94,0.08)' },
  programRowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  programRungIndex: { color: '#86EFAC', fontSize: 11, fontWeight: '900' },
  programOutput: { color: '#8EA39B', fontSize: 11, fontWeight: '900' },
  programOutputWarn: { color: '#FBBF24' },
  programPath: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  programBranchLabel: { color: '#67E8F9', borderColor: '#164E63', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
  programBlock: { minWidth: 72, minHeight: 44, borderRadius: 9, borderWidth: 1, borderColor: '#263330', backgroundColor: '#111716', justifyContent: 'center', paddingHorizontal: 8 },
  programBlockOn: { borderColor: '#4ADE80', backgroundColor: 'rgba(34,197,94,0.14)' },
  programBlockSelected: { borderColor: '#67E8F9', shadowColor: '#67E8F9', shadowOpacity: 0.45, shadowRadius: 8, elevation: 4 },
  programBlockTag: { color: '#F8FAFC', fontSize: 11, fontWeight: '900', maxWidth: 88 },
  programBlockType: { color: '#8EA39B', fontSize: 10, fontWeight: '900', marginTop: 2 },
  programAddRung: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#31534B', backgroundColor: 'rgba(34,197,94,0.06)', alignItems: 'center', justifyContent: 'center' },
  programAddRungText: { color: '#86EFAC', fontSize: 12, fontWeight: '900' },
  block: { minWidth: 78, minHeight: 78, alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 5, backgroundColor: 'rgba(9,11,11,0.72)' },
  blockCompact: { minWidth: 66 },
  outputBlock: { minWidth: 90, borderWidth: 1, borderColor: '#23302D', backgroundColor: '#0E1312' },
  emptyOutputSlot: { minWidth: 90, minHeight: 58, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: '#31534B', backgroundColor: 'rgba(8,10,10,0.68)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  emptyOutputText: { color: '#6EE7B7', fontSize: 11, fontWeight: '900' },
  blockSelected: { backgroundColor: 'rgba(34,197,94,0.14)', borderWidth: 1, borderColor: '#4ADE80', shadowColor: '#4ADE80', shadowOpacity: 0.72, shadowRadius: 14, elevation: 6 },
  blockLabel: { color: '#51D96D', fontSize: 15, fontWeight: '900', marginBottom: 7, maxWidth: 88 },
  blockMeta: { color: '#8EA39B', fontSize: 9, fontWeight: '900', marginTop: 3 },
  liveText: { color: '#A7F3D0', textShadowColor: '#22C55E', textShadowRadius: 8 },
  symbol: { color: '#F8FAFC', fontSize: 38, lineHeight: 42, fontWeight: '300' },
  symbolCompact: { fontSize: 31, lineHeight: 35 },
  microMeter: { width: 58, height: 5, borderRadius: 999, backgroundColor: '#1F2A27', overflow: 'hidden', marginTop: 5 },
  microMeterFill: { height: 5, borderRadius: 999, backgroundColor: '#40534D' },
  microMeterFillOn: { backgroundColor: '#4ADE80' },
  zone: { width: 33, height: 33, borderRadius: 17, borderWidth: 1, borderColor: '#4ADE80', backgroundColor: 'rgba(34,197,94,0.13)', alignItems: 'center', justifyContent: 'center', shadowColor: '#4ADE80', shadowOpacity: 0.42, shadowRadius: 11, elevation: 4 },
  zoneHot: { transform: [{ scale: 1.2 }], backgroundColor: 'rgba(34,197,94,0.34)' },
  zoneText: { color: '#86EFAC', fontSize: 21, fontWeight: '900' },
  zoneTextHot: { color: '#FFFFFF' },
  emptyZone: { width: 0, height: 33 },
  toolbar: { position: 'absolute', left: 10, right: 10, bottom: 54, minHeight: 45, borderRadius: 999, backgroundColor: 'rgba(8,10,10,0.96)', borderWidth: 1, borderColor: '#263330', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, zIndex: 6 },
  toolbarLabel: { color: '#86EFAC', fontWeight: '900', marginRight: 2, fontSize: 11, maxWidth: 64 },
  toolbarButton: { minHeight: 31, paddingHorizontal: 8, borderRadius: 999, backgroundColor: '#141C1A', justifyContent: 'center', borderWidth: 1, borderColor: '#263330' },
  toolbarText: { color: '#F8FAFC', fontSize: 10, fontWeight: '900' },
  toolbarDanger: { minHeight: 31, paddingHorizontal: 8, borderRadius: 999, backgroundColor: '#2D1111', justifyContent: 'center', borderWidth: 1, borderColor: '#5F2020' },
  toolbarDangerText: { color: '#FCA5A5', fontSize: 10, fontWeight: '900' },
  quickEditPanel: { position: 'absolute', left: 18, right: 18, bottom: 108, minHeight: 54, borderRadius: 16, backgroundColor: 'rgba(8,10,10,0.98)', borderWidth: 1, borderColor: '#31534B', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, zIndex: 7 },
  quickEditTitle: { color: '#86EFAC', fontSize: 10, fontWeight: '900', width: 46 },
  quickInput: { flex: 1, minHeight: 38, borderRadius: 10, backgroundColor: '#111716', borderWidth: 1, borderColor: '#263330', color: '#F8FAFC', paddingHorizontal: 10, fontSize: 13, fontWeight: '900' },
  quickStep: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#141C1A', borderWidth: 1, borderColor: '#263330', alignItems: 'center', justifyContent: 'center' },
  quickStepText: { color: '#E7FFF0', fontSize: 16, fontWeight: '900' },
  quickUnit: { color: '#8EA39B', fontSize: 10, fontWeight: '900', width: 24 },
  quickDone: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  quickDoneText: { color: '#04110A', fontSize: 11, fontWeight: '900' },
  rungActions: { position: 'absolute', right: 12, top: 54, borderRadius: 999, backgroundColor: 'rgba(8,10,10,0.92)', borderWidth: 1, borderColor: '#263330', flexDirection: 'row', alignItems: 'center', gap: 5, padding: 5, zIndex: 5 },
  rungActionButton: { minWidth: 32, minHeight: 30, borderRadius: 999, backgroundColor: '#141C1A', borderWidth: 1, borderColor: '#263330', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 },
  rungActionText: { color: '#E7FFF0', fontSize: 10, fontWeight: '900' },
  rungActionDanger: { minWidth: 32, minHeight: 30, borderRadius: 999, backgroundColor: '#2D1111', borderWidth: 1, borderColor: '#5F2020', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 },
  rungActionDangerText: { color: '#FCA5A5', fontSize: 10, fontWeight: '900' },
  rungActionDisabled: { opacity: 0.38 },
  ghost: { position: 'absolute', right: 24, bottom: 140, width: 106, height: 98, borderRadius: 16, borderWidth: 1, borderColor: '#4ADE80', backgroundColor: 'rgba(34,197,94,0.16)', alignItems: 'center', justifyContent: 'center', shadowColor: '#4ADE80', shadowOpacity: 0.7, shadowRadius: 16, elevation: 8 },
  ghostClose: { position: 'absolute', right: 7, top: 7, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(8,10,10,0.76)', alignItems: 'center', justifyContent: 'center' },
  ghostCloseText: { color: '#E7FFF0', fontSize: 16, lineHeight: 18, fontWeight: '900' },
  ghostLabel: { color: '#BBF7D0', fontSize: 9, fontWeight: '900' },
  ghostSymbol: { color: '#F8FAFC', fontSize: 31, marginVertical: 4, fontWeight: '900' },
  ghostHint: { color: '#A7F3D0', fontSize: 9, fontWeight: '700' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 292, backgroundColor: 'rgba(12,16,15,0.98)', borderRightWidth: 1, borderColor: '#263330', zIndex: 5 },
  drawerHeader: { height: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerTitle: { color: '#E7FFF0', fontWeight: '900', letterSpacing: 0, fontSize: 12 },
  drawerClose: { color: '#E7FFF0', fontSize: 30 },
  drawerItems: { paddingHorizontal: 12, paddingTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  drawerHint: { color: '#91A39C', paddingHorizontal: 14, marginTop: 14, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  toolCard: { width: 80, height: 74, borderRadius: 8, backgroundColor: '#111716', borderWidth: 1, borderColor: '#263330', alignItems: 'center', justifyContent: 'center' },
  toolSymbol: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  toolLabel: { color: '#A7F3D0', marginTop: 6, fontSize: 11, fontWeight: '900' },
  quickToolStrip: { position: 'absolute', left: 10, right: 86, bottom: 54, minHeight: 42, zIndex: 4 },
  quickToolContent: { alignItems: 'center', gap: 7, paddingRight: 8 },
  quickTool: { minWidth: 50, minHeight: 34, borderRadius: 999, backgroundColor: 'rgba(8,10,10,0.92)', borderWidth: 1, borderColor: '#263330', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  quickToolActive: { borderColor: '#4ADE80', backgroundColor: 'rgba(34,197,94,0.18)', shadowColor: '#4ADE80', shadowOpacity: 0.42, shadowRadius: 9, elevation: 4 },
  quickToolText: { color: '#E7FFF0', fontSize: 11, fontWeight: '900' },
  quickToolTextActive: { color: '#BBF7D0' },
  fab: { position: 'absolute', right: 22, bottom: 58, width: 62, height: 62, borderRadius: 31, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#22C55E', shadowOpacity: 0.72, shadowRadius: 16 },
  fabText: { color: '#04110A', fontSize: 36, lineHeight: 40, fontWeight: '900' },
  zoomHud: { position: 'absolute', left: 14, bottom: 102, minHeight: 40, borderRadius: 999, backgroundColor: 'rgba(8,10,10,0.9)', borderWidth: 1, borderColor: '#263330', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  zoomButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#111716', alignItems: 'center', justifyContent: 'center' },
  zoomText: { color: '#E7FFF0', fontWeight: '900', fontSize: 16 },
  zoomValue: { color: '#A7F3D0', fontWeight: '900', fontSize: 11, width: 38, textAlign: 'center' },
  miniMap: { position: 'absolute', right: 18, bottom: 132, width: 64, minHeight: 96, borderRadius: 10, backgroundColor: 'rgba(8,10,10,0.82)', borderWidth: 1, borderColor: '#263330', padding: 8, gap: 7 },
  miniRung: { height: 4, borderRadius: 4, backgroundColor: '#5B6B65' },
  miniRungActive: { backgroundColor: '#4ADE80' },
  miniViewport: { position: 'absolute', left: 5, right: 5, top: 5, height: 42, borderWidth: 1, borderColor: '#67E8F9', borderRadius: 7 },
  ioHandle: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,10,10,0.94)', borderTopWidth: 1, borderTopColor: '#151D1C' },
  ioHandleText: { color: '#E7FFF0', fontSize: 26, fontWeight: '900' },
  liveDock: { position: 'absolute', left: 10, right: 10, bottom: 45, minHeight: 42, borderRadius: 999, backgroundColor: 'rgba(8,10,10,0.94)', borderWidth: 1, borderColor: '#263330', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 8, zIndex: 4 },
  liveIo: { minWidth: 44, height: 28, borderRadius: 999, backgroundColor: '#111716', borderWidth: 1, borderColor: '#263330', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 },
  liveOutput: { borderColor: '#31534B' },
  liveIoOn: { backgroundColor: 'rgba(34,197,94,0.18)', borderColor: '#4ADE80' },
  liveIoText: { color: '#8EA39B', fontSize: 10, fontWeight: '900' },
  liveIoTextOn: { color: '#BBF7D0' },
  addRung: { position: 'absolute', left: 170, right: 170, height: 44, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: '#22C55E', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.06)' },
  addRungText: { color: '#86EFAC', fontWeight: '900' },
  ioSheet: { backgroundColor: '#0D1211', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, borderColor: '#263330', paddingBottom: 16, paddingHorizontal: 18 },
  sheetHandle: { alignSelf: 'center', width: 62, height: 6, borderRadius: 999, backgroundColor: '#4B5B55', marginTop: 9, marginBottom: 14 },
  ioContent: { flexDirection: 'row', gap: 18, paddingBottom: 10 },
  ioColumn: { flex: 1 },
  ioTitle: { color: '#E7FFF0', fontSize: 13, fontWeight: '900', marginBottom: 10 },
  ioRow: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ioLabel: { color: '#F2F7F4', fontSize: 16, fontWeight: '800', width: 58 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#4B5B55' },
  dotOn: { backgroundColor: '#4ADE80', shadowColor: '#4ADE80', shadowOpacity: 0.7, shadowRadius: 8, elevation: 4 },
});
