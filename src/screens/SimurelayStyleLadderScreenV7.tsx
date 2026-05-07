import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type Mode = 'EDITOR' | 'COMPONENTES' | 'SIMULAR';
type BlockType = 'NO' | 'NC' | 'COIL';
type Block = { id: string; type: BlockType; address: string };
type Rung = { id: string; series: Block[]; parallel?: Block; coil: Block };
type Zone = { rungId: string; index: number; kind: 'series' | 'coil' | 'parallel' };
type PlcState = Record<string, boolean>;

const inputs = ['I0.0', 'I0.1', 'I0.2', 'I0.3', 'I0.4', 'I0.5', 'I0.6'];
const outputs = ['Q0.0', 'Q0.1', 'Q0.2', 'Q0.3'];
const rungGap = 292;
const rungTop = 186;

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
      parallel: { id: 'i02', type: 'NO', address: 'I0.2' },
      coil: { id: 'q00', type: 'COIL', address: 'Q0.0' },
    },
    {
      id: 'rung-2',
      series: [
        { id: 'i03', type: 'NO', address: 'I0.3' },
        { id: 'i04', type: 'NO', address: 'I0.4' },
      ],
      coil: { id: 'q01', type: 'COIL', address: 'Q0.1' },
    },
  ];
}

function cloneRungs(rungs: Rung[]) {
  return rungs.map((rung) => ({
    ...rung,
    series: rung.series.map((block) => ({ ...block })),
    parallel: rung.parallel ? { ...rung.parallel } : undefined,
    coil: { ...rung.coil },
  }));
}

function isClosed(block: Block, state: PlcState) {
  if (block.type === 'NO') return Boolean(state[block.address]);
  if (block.type === 'NC') return !Boolean(state[block.address]);
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
    const parallelPower = rung.parallel ? isClosed(rung.parallel, next) : false;
    if (rung.parallel) activeBlocks[rung.parallel.id] = parallelPower;
    const rungPower = seriesPower || parallelPower;
    activeRungs[rung.id] = rungPower;
    activeBlocks[rung.coil.id] = rungPower;
    next[rung.coil.address] = rungPower;
  });

  return { state: next, activeBlocks, activeRungs };
}

function nextBlock(type: BlockType, rungs: Rung[]) {
  const used = new Set<string>();
  rungs.forEach((rung) => {
    rung.series.forEach((block) => used.add(block.address));
    if (rung.parallel) used.add(rung.parallel.address);
    used.add(rung.coil.address);
  });
  if (type === 'COIL') return { id: uid('coil'), type, address: outputs.find((item) => !used.has(item)) ?? 'Q0.0' };
  return { id: uid('input'), type, address: inputs.find((item) => !used.has(item)) ?? 'I0.0' };
}

export function SimurelayStyleLadderScreenV7() {
  const [mode, setMode] = useState<Mode>('EDITOR');
  const [rungs, setRungs] = useState<Rung[]>(() => initialRungs());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ioOpen, setIoOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<BlockType | null>(null);
  const [hotZone, setHotZone] = useState<Zone | null>(null);
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
  const canvasHeight = Math.max(920, rungTop + rungs.length * rungGap + 260);
  const addRungTop = rungTop + rungs.length * rungGap + 24;

  function chooseTool(type: BlockType) {
    setActiveTool(type);
    setDrawerOpen(false);
    setMode('EDITOR');
  }

  function runSimulation() {
    setMode('SIMULAR');
    setDrawerOpen(false);
    setActiveTool(null);
    setHotZone(null);
    setIoOpen(false);
    setState((current) => evaluate(rungs, current).state);
  }

  function toggleInput(input: string) {
    const next = { ...state, [input]: !Boolean(state[input]) };
    setState(simulating ? evaluate(rungs, next).state : next);
  }

  function addRung() {
    setRungs((current) => {
      const next = cloneRungs(current);
      const coil = nextBlock('COIL', next);
      next.push({ id: uid('rung'), series: [nextBlock('NO', next)], parallel: undefined, coil });
      return next;
    });
  }

  function addBlock(zone: Zone) {
    if (!activeTool || simulating) return;
    setHotZone(zone);
    setRungs((current) => {
      const next = cloneRungs(current);
      const rung = next.find((item) => item.id === zone.rungId);
      if (!rung) return current;
      if (zone.kind === 'coil') rung.coil = nextBlock('COIL', next);
      if (zone.kind === 'parallel' && activeTool !== 'COIL') rung.parallel = nextBlock(activeTool, next);
      if (zone.kind === 'series' && activeTool !== 'COIL') rung.series.splice(zone.index, 0, nextBlock(activeTool, next));
      return next;
    });
    setTimeout(() => setHotZone(null), 300);
    setActiveTool(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.menu}>☰</Text>
          <View style={styles.titleBox}>
            <Text style={styles.title}>CLP Fácil</Text>
            <Text style={styles.subtitle}>{activeTool ? `${activeTool} na mão · toque no +` : 'workspace ladder'}</Text>
          </View>
          <Pressable style={styles.simButton} onPress={runSimulation}>
            <Text style={styles.simIcon}>▶</Text>
            <Text style={styles.simText}>SIMULAR</Text>
          </Pressable>
          <Text style={styles.more}>⋮</Text>
        </View>

        <View style={styles.tabs}>
          <Tab label="EDITOR" active={mode === 'EDITOR'} onPress={() => setMode('EDITOR')} />
          <Tab label="COMPONENTES" active={mode === 'COMPONENTES'} onPress={() => { setMode('COMPONENTES'); setDrawerOpen(true); }} />
          <Tab label="SIMULAR" active={mode === 'SIMULAR'} onPress={runSimulation} />
        </View>

        <View style={styles.workspace}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.canvasX}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.canvasY, { minHeight: canvasHeight }]}>
              <View style={[styles.canvas, { height: canvasHeight }]}>
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
                    showZones={Boolean(activeTool) && !simulating}
                    hotZone={hotZone}
                    onDrop={addBlock}
                  />
                ))}
                {!simulating ? <Pressable style={[styles.addRung, { top: addRungTop }]} onPress={addRung}><Text style={styles.addRungText}>+ Rung</Text></Pressable> : null}
              </View>
            </ScrollView>
          </ScrollView>

          {activeTool && !simulating ? <GhostPreview type={activeTool} /> : null}
          {drawerOpen ? <Drawer onChoose={chooseTool} onClose={() => setDrawerOpen(false)} /> : null}
          {!simulating ? <Pressable style={styles.fab} onPress={() => setDrawerOpen((current) => !current)}><Text style={styles.fabText}>＋</Text></Pressable> : null}
          <Pressable style={styles.ioHandle} onPress={() => setIoOpen((current) => !current)}><Text style={styles.ioHandleText}>{ioOpen ? '⌄' : '⌃'}</Text></Pressable>
        </View>

        {ioOpen ? <IOSheet state={state} scanState={scan.state} onToggle={toggleInput} /> : null}
      </View>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable style={styles.tab} onPress={onPress}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>{active ? <View style={styles.tabLine} /> : null}</Pressable>;
}

function Grid() {
  return <View style={styles.grid}>{Array.from({ length: 320 }).map((_, index) => <View key={index} style={styles.gridCell} />)}</View>;
}

function ZoneButton({ visible, hot, onPress }: { visible: boolean; hot: boolean; onPress: () => void }) {
  if (!visible) return <View style={styles.emptyZone} />;
  return <Pressable style={[styles.zone, hot && styles.zoneHot]} onPress={onPress}><Text style={[styles.zoneText, hot && styles.zoneTextHot]}>+</Text></Pressable>;
}

function RungView({ rung, index, top, active, activeBlocks, showZones, hotZone, onDrop }: { rung: Rung; index: number; top: number; active: boolean; activeBlocks: Record<string, boolean>; showZones: boolean; hotZone: Zone | null; onDrop: (zone: Zone) => void }) {
  const isHot = (kind: Zone['kind'], zoneIndex: number) => hotZone?.rungId === rung.id && hotZone.kind === kind && hotZone.index === zoneIndex;
  const spacing = rung.series.length >= 4 ? 18 : 28;
  return <View style={[styles.rung, { top }]}>
    <Text style={styles.rungIndex}>{index}</Text>
    <View style={[styles.rungWire, active && styles.wireLive]} />
    {active ? <View style={styles.energyPulse} /> : null}
    <View style={[styles.rungRow, { gap: spacing }]}>
      <ZoneButton visible={showZones} hot={isHot('series', 0)} onPress={() => onDrop({ rungId: rung.id, kind: 'series', index: 0 })} />
      {rung.series.map((block, blockIndex) => <View key={block.id} style={[styles.inline, { gap: spacing }]}><BlockView block={block} active={Boolean(activeBlocks[block.id])} /><ZoneButton visible={showZones} hot={isHot('series', blockIndex + 1)} onPress={() => onDrop({ rungId: rung.id, kind: 'series', index: blockIndex + 1 })} /></View>)}
      <View style={[styles.fillWire, active && styles.wireLive]} />
      <BlockView block={rung.coil} active={Boolean(activeBlocks[rung.coil.id])} />
    </View>
    <View style={styles.parallelRow}>
      <ZoneButton visible={showZones} hot={isHot('parallel', 0)} onPress={() => onDrop({ rungId: rung.id, kind: 'parallel', index: 0 })} />
      {rung.parallel ? <BlockView block={rung.parallel} active={Boolean(activeBlocks[rung.parallel.id])} /> : null}
    </View>
  </View>;
}

function BlockView({ block, active }: { block: Block; active: boolean }) {
  const symbol = block.type === 'COIL' ? '( )' : block.type === 'NO' ? '| |' : '|/|';
  return <View style={styles.block}><Text style={[styles.blockLabel, active && styles.liveText]}>{block.address}</Text><Text style={[styles.symbol, active && styles.liveText]}>{symbol}</Text></View>;
}

function GhostPreview({ type }: { type: BlockType }) {
  const symbol = type === 'COIL' ? '( )' : type === 'NO' ? '| |' : '|/|';
  return <View style={styles.ghost}><Text style={styles.ghostLabel}>NA MÃO</Text><Text style={styles.ghostSymbol}>{symbol}</Text><Text style={styles.ghostHint}>zona acende e puxa</Text></View>;
}

function Drawer({ onChoose, onClose }: { onChoose: (type: BlockType) => void; onClose: () => void }) {
  return <View style={styles.drawer}><View style={styles.drawerHeader}><Text style={styles.drawerTitle}>COMPONENTES</Text><Pressable onPress={onClose}><Text style={styles.drawerClose}>×</Text></Pressable></View><View style={styles.drawerItems}><ToolCard label="NA" symbol="| |" onPress={() => onChoose('NO')} /><ToolCard label="NF" symbol="|/|" onPress={() => onChoose('NC')} /><ToolCard label="Coil" symbol="( )" onPress={() => onChoose('COIL')} /></View><Text style={styles.drawerHint}>Escolha um componente. Depois toque em uma zona +.</Text></View>;
}

function ToolCard({ label, symbol, onPress }: { label: string; symbol: string; onPress: () => void }) {
  return <Pressable style={styles.toolCard} onPress={onPress}><Text style={styles.toolSymbol}>{symbol}</Text><Text style={styles.toolLabel}>{label}</Text></Pressable>;
}

function IOSheet({ state, scanState, onToggle }: { state: PlcState; scanState: PlcState; onToggle: (input: string) => void }) {
  return <View style={styles.ioSheet}><View style={styles.sheetHandle} /><View style={styles.ioContent}><View style={styles.ioColumn}><Text style={styles.ioTitle}>ENTRADAS</Text>{inputs.slice(0, 4).map((input) => <Pressable key={input} style={styles.ioRow} onPress={() => onToggle(input)}><Text style={styles.ioLabel}>{input}</Text><View style={[styles.dot, state[input] && styles.dotOn]} /></Pressable>)}</View><View style={styles.ioColumn}><Text style={styles.ioTitle}>SAÍDAS</Text>{outputs.slice(0, 3).map((output) => <View key={output} style={styles.ioRow}><Text style={styles.ioLabel}>{output}</Text><View style={[styles.dot, scanState[output] && styles.dotOn]} /></View>)}</View></View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101010' }, root: { flex: 1, backgroundColor: '#101010' }, header: { height: 84, paddingHorizontal: 18, backgroundColor: '#101010', flexDirection: 'row', alignItems: 'center', gap: 14 }, menu: { color: '#f5f5f5', fontSize: 30, fontWeight: '900' }, titleBox: { flex: 1 }, title: { color: '#fff', fontSize: 21, fontWeight: '900' }, subtitle: { color: '#bdbdbd', marginTop: 2, fontSize: 14 }, simButton: { flexDirection: 'row', alignItems: 'center', gap: 7 }, simIcon: { color: '#2ecc58', fontSize: 23, fontWeight: '900' }, simText: { color: '#2ecc58', fontWeight: '900' }, more: { color: '#f5f5f5', fontSize: 28, fontWeight: '900' },
  tabs: { height: 58, backgroundColor: '#101010', borderBottomWidth: 1, borderBottomColor: '#2d2d2d', flexDirection: 'row' }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center' }, tabText: { color: '#868686', fontWeight: '900', letterSpacing: 1 }, tabTextActive: { color: '#2ecc58' }, tabLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: '#2ecc58' },
  workspace: { flex: 1, backgroundColor: '#121212', overflow: 'hidden' }, canvasX: { minWidth: 790, flexGrow: 1 }, canvasY: { flexGrow: 1 }, canvas: { width: 820, backgroundColor: '#121212', position: 'relative' }, grid: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap' }, gridCell: { width: 41, height: 41, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#242424' }, leftRail: { position: 'absolute', left: 58, top: 90, width: 3, backgroundColor: '#eee' }, rightRail: { position: 'absolute', right: 58, top: 90, width: 3, backgroundColor: '#eee' },
  rung: { position: 'absolute', left: 58, right: 58, height: 250 }, rungIndex: { position: 'absolute', left: -34, top: 56, color: '#888', fontSize: 16 }, rungWire: { position: 'absolute', left: 0, right: 0, top: 68, height: 3, backgroundColor: '#eee' }, wireLive: { backgroundColor: '#44d761' }, energyPulse: { position: 'absolute', left: 185, top: 61, width: 15, height: 15, borderRadius: 8, backgroundColor: '#44d761' }, rungRow: { position: 'absolute', left: 96, right: 92, top: 18, height: 105, flexDirection: 'row', alignItems: 'center' }, inline: { flexDirection: 'row', alignItems: 'center' }, fillWire: { flex: 1, minWidth: 20, height: 3, backgroundColor: '#eee' }, parallelRow: { position: 'absolute', left: 250, right: 175, top: 118, height: 78, borderLeftWidth: 3, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30 },
  block: { minWidth: 72, alignItems: 'center', justifyContent: 'center' }, blockLabel: { color: '#29bc4c', fontSize: 18, fontWeight: '900', marginBottom: 8 }, liveText: { color: '#58f073' }, symbol: { color: '#f2f2f2', fontSize: 45, lineHeight: 50, fontWeight: '300' }, zone: { width: 31, height: 31, borderRadius: 20, borderWidth: 1, borderColor: '#32d65a', backgroundColor: 'rgba(50,214,90,0.12)', alignItems: 'center', justifyContent: 'center' }, zoneHot: { transform: [{ scale: 1.25 }], backgroundColor: 'rgba(50,214,90,0.32)', shadowColor: '#32d65a', shadowOpacity: 0.85, shadowRadius: 14, elevation: 8 }, zoneText: { color: '#32d65a', fontSize: 22, fontWeight: '900' }, zoneTextHot: { color: '#fff' }, emptyZone: { width: 0, height: 31 },
  ghost: { position: 'absolute', right: 118, bottom: 150, width: 122, height: 112, borderRadius: 18, borderWidth: 1, borderColor: '#32d65a', backgroundColor: 'rgba(50,214,90,0.18)', alignItems: 'center', justifyContent: 'center', shadowColor: '#32d65a', shadowOpacity: 0.8, shadowRadius: 16, elevation: 9 }, ghostLabel: { color: '#baf7c6', fontSize: 10, fontWeight: '900' }, ghostSymbol: { color: '#fff', fontSize: 42, marginVertical: 4 }, ghostHint: { color: '#baf7c6', fontSize: 10, fontWeight: '700' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 350, backgroundColor: '#151515', borderRightWidth: 1, borderColor: '#303030', zIndex: 5 }, drawerHeader: { height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, drawerTitle: { color: '#eee', fontWeight: '900', letterSpacing: 1 }, drawerClose: { color: '#fff', fontSize: 32 }, drawerItems: { padding: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, drawerHint: { color: '#9d9d9d', paddingHorizontal: 20, fontSize: 13 }, toolCard: { width: 96, height: 92, backgroundColor: '#1f1f1f', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' }, toolSymbol: { color: '#f4f4f4', fontSize: 33 }, toolLabel: { color: '#ddd', marginTop: 8, fontSize: 12 },
  fab: { position: 'absolute', right: 30, bottom: 58, width: 76, height: 76, borderRadius: 38, backgroundColor: '#28a745', alignItems: 'center', justifyContent: 'center', elevation: 10 }, fabText: { color: '#fff', fontSize: 44, lineHeight: 50 }, ioHandle: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,17,17,0.92)' }, ioHandleText: { color: '#fff', fontSize: 28, fontWeight: '900' }, addRung: { position: 'absolute', left: 165, right: 165, height: 48, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: '#2e8b47', alignItems: 'center', justifyContent: 'center' }, addRungText: { color: '#37bf4b', fontWeight: '900' },
  ioSheet: { backgroundColor: '#171717', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: '#303030', paddingBottom: 18, paddingHorizontal: 24 }, sheetHandle: { alignSelf: 'center', width: 72, height: 8, borderRadius: 999, backgroundColor: '#707070', marginTop: 10, marginBottom: 18 }, ioContent: { flexDirection: 'row', gap: 30, paddingBottom: 16 }, ioColumn: { flex: 1 }, ioTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 14 }, ioRow: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 16 }, ioLabel: { color: '#f2f2f2', fontSize: 19, fontWeight: '700', width: 58 }, dot: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#666' }, dotOn: { backgroundColor: '#37bf4b' },
});
