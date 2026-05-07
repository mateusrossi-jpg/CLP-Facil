import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type Mode = 'EDITOR' | 'COMPONENTES' | 'SIMULAR';
type BlockType = 'NO' | 'NC' | 'COIL';
type Block = { id: string; type: BlockType; address: string };
type Branch = { id: string; blocks: Block[]; coil?: Block };
type Rung = { id: string; series: Block[]; branches: Branch[]; coil?: Block };
type PlcState = Record<string, boolean>;

const inputs = ['I0.0', 'I0.1', 'I0.2', 'I0.3', 'I0.4'];
const outputs = ['Q0.0', 'Q0.1', 'M0.0'];

function initialRungs(): Rung[] {
  return [
    {
      id: 'rung-1',
      series: [
        { id: 'i00', type: 'NO', address: 'I0.0' },
        { id: 'i01', type: 'NC', address: 'I0.1' },
      ],
      branches: [{ id: 'branch-1', blocks: [{ id: 'i02', type: 'NO', address: 'I0.2' }] }],
      coil: { id: 'q00', type: 'COIL', address: 'Q0.0' },
    },
    {
      id: 'rung-2',
      series: [
        { id: 'i03', type: 'NO', address: 'I0.3' },
        { id: 'i04', type: 'NO', address: 'I0.4' },
      ],
      branches: [{ id: 'branch-2', blocks: [], coil: { id: 'm00', type: 'COIL', address: 'M0.0' } }],
      coil: { id: 'q01', type: 'COIL', address: 'Q0.1' },
    },
  ];
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
      const powered = isClosed(block, next);
      activeBlocks[block.id] = powered;
      return powered;
    });

    const branchPower = rung.branches.some((branch) => {
      const branchClosed = branch.blocks.length ? branch.blocks.every((block) => isClosed(block, next)) : seriesPower;
      branch.blocks.forEach((block) => {
        activeBlocks[block.id] = branchClosed;
      });
      if (branch.coil) {
        next[branch.coil.address] = branchClosed;
        activeBlocks[branch.coil.id] = branchClosed;
      }
      return branchClosed;
    });

    const rungPower = seriesPower || branchPower;
    activeRungs[rung.id] = rungPower;
    if (rung.coil) {
      next[rung.coil.address] = rungPower;
      activeBlocks[rung.coil.id] = rungPower;
    }
  });

  return { state: next, activeBlocks, activeRungs };
}

export function SimurelayStyleLadderScreen() {
  const [mode, setMode] = useState<Mode>('EDITOR');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ioOpen, setIoOpen] = useState(false);
  const [state, setState] = useState<PlcState>({
    'I0.0': true,
    'I0.1': false,
    'I0.2': true,
    'I0.3': true,
    'I0.4': true,
    'Q0.0': false,
    'Q0.1': false,
    'M0.0': false,
  });
  const rungs = useMemo(() => initialRungs(), []);
  const scan = useMemo(() => evaluate(rungs, state), [rungs, state]);

  function toggleInput(address: string) {
    const next = { ...state, [address]: !Boolean(state[address]) };
    setState(mode === 'SIMULAR' ? evaluate(rungs, next).state : next);
  }

  function setSimulate() {
    setMode('SIMULAR');
    setDrawerOpen(false);
    setIoOpen(false);
    setState((current) => evaluate(rungs, current).state);
  }

  const live = mode === 'SIMULAR';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton}><Text style={styles.iconText}>☰</Text></Pressable>
          <View style={styles.titleBox}>
            <Text style={styles.title}>CLP Fácil</Text>
            <Text style={styles.subtitle}>untitled</Text>
          </View>
          <Pressable style={styles.iconButton}><Text style={styles.iconText}>▣</Text></Pressable>
          <Pressable style={styles.simulateButton} onPress={setSimulate}>
            <Text style={styles.simulateIcon}>▶</Text>
            <Text style={styles.simulateText}>SIMULAR</Text>
          </Pressable>
          <Pressable style={styles.iconButton}><Text style={styles.iconText}>⋮</Text></Pressable>
        </View>

        <View style={styles.tabs}>
          <TabButton label="EDITOR" active={mode === 'EDITOR'} onPress={() => setMode('EDITOR')} />
          <TabButton label="COMPONENTES" active={mode === 'COMPONENTES'} onPress={() => { setMode('COMPONENTES'); setDrawerOpen(true); }} />
          <TabButton label="SIMULAR" active={mode === 'SIMULAR'} onPress={setSimulate} />
        </View>

        <View style={styles.workspace}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.canvasX}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.canvasY}>
              <View style={styles.canvas}>
                <Grid />
                <View style={styles.leftRail} />
                <View style={styles.rightRail} />
                {rungs.map((rung, index) => (
                  <RungView
                    key={rung.id}
                    index={index + 1}
                    rung={rung}
                    active={Boolean(scan.activeRungs[rung.id])}
                    activeBlocks={scan.activeBlocks}
                  />
                ))}
              </View>
            </ScrollView>
          </ScrollView>

          {drawerOpen ? <ComponentDrawer onClose={() => setDrawerOpen(false)} /> : null}

          <Pressable style={styles.fab} onPress={() => setDrawerOpen((current) => !current)}>
            <Text style={styles.fabText}>＋</Text>
          </Pressable>

          <Pressable style={styles.bottomHandle} onPress={() => setIoOpen((current) => !current)}>
            <Text style={styles.bottomHandleText}>{ioOpen ? '⌄' : '⌃'}</Text>
          </Pressable>
        </View>

        {ioOpen ? (
          <View style={styles.ioSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTabs}>
              <Text style={styles.sheetTabActive}>I/O</Text>
              <Text style={styles.sheetTab}>ESTADO</Text>
              <Pressable onPress={() => setIoOpen(false)}><Text style={styles.sheetClose}>⌄</Text></Pressable>
            </View>
            <View style={styles.ioContent}>
              <View style={styles.ioColumn}>
                <Text style={styles.ioTitle}>ENTRADAS</Text>
                {inputs.slice(0, 4).map((input) => (
                  <Pressable key={input} style={styles.ioRow} onPress={() => toggleInput(input)}>
                    <Text style={styles.ioLabel}>{input}</Text>
                    <View style={[styles.dot, state[input] && styles.dotOn]} />
                    <View style={[styles.switchTrack, state[input] && styles.switchTrackOn]}>
                      <View style={[styles.switchThumb, state[input] && styles.switchThumbOn]} />
                    </View>
                  </Pressable>
                ))}
              </View>
              <View style={styles.ioDivider} />
              <View style={styles.ioColumn}>
                <Text style={styles.ioTitle}>SAÍDAS</Text>
                {outputs.slice(0, 2).map((output) => (
                  <View key={output} style={styles.ioRow}>
                    <Text style={styles.ioLabel}>{output}</Text>
                    <View style={[styles.dot, scan.state[output] && styles.dotOn]} />
                    <Text style={[styles.lamp, scan.state[output] && styles.lampOn]}>●</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {active ? <View style={styles.tabLine} /> : null}
    </Pressable>
  );
}

function Grid() {
  const cells = Array.from({ length: 160 });
  return <View style={styles.grid}>{cells.map((_, index) => <View key={index} style={styles.gridCell} />)}</View>;
}

function RungView({ index, rung, active, activeBlocks }: { index: number; rung: Rung; active: boolean; activeBlocks: Record<string, boolean> }) {
  return (
    <View style={[styles.rung, index === 2 && styles.rungSecond]}>
      <Text style={styles.rungNumber}>{index}</Text>
      <View style={[styles.rungWire, active && styles.wireLive]} />
      <View style={styles.rungRow}>
        {rung.series.map((block) => <BlockView key={block.id} block={block} active={Boolean(activeBlocks[block.id])} />)}
        <View style={[styles.fillWire, active && styles.wireLive]} />
        {rung.coil ? <BlockView block={rung.coil} active={Boolean(activeBlocks[rung.coil.id])} /> : null}
      </View>
      {rung.branches.map((branch) => (
        <View key={branch.id} style={index === 1 ? styles.branchOne : styles.branchTwo}>
          {branch.blocks.map((block) => <BlockView key={block.id} block={block} active={Boolean(activeBlocks[block.id])} />)}
          {branch.coil ? <BlockView block={branch.coil} active={Boolean(activeBlocks[branch.coil.id])} /> : null}
        </View>
      ))}
    </View>
  );
}

function BlockView({ block, active }: { block: Block; active: boolean }) {
  if (block.type === 'COIL') {
    return (
      <View style={styles.blockWrap}>
        <Text style={[styles.blockLabel, active && styles.liveText]}>{block.address}</Text>
        <Text style={[styles.coilSymbol, active && styles.liveText]}>( )</Text>
      </View>
    );
  }

  return (
    <View style={styles.blockWrap}>
      <Text style={[styles.blockLabel, active && styles.liveText]}>{block.address}</Text>
      <Text style={[styles.contactSymbol, active && styles.liveText]}>{block.type === 'NO' ? '| |' : '|/|'}</Text>
    </View>
  );
}

function ComponentDrawer({ onClose }: { onClose: () => void }) {
  const categories = ['All', 'Sources', 'Others', 'Coils', 'Auxiliaries', 'Switches', 'Loads', 'Contactors', 'Protections', 'Motors'];
  return (
    <View style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>COMPONENTES</Text>
        <Pressable onPress={onClose}><Text style={styles.drawerClose}>×</Text></Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((item, index) => (
          <View key={item} style={[styles.categoryRow, index === 0 && styles.categorySelected]}>
            <View style={[styles.categoryIcon, { borderColor: categoryColors[index % categoryColors.length] }]} />
            <Text style={styles.categoryText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.componentGrid}>
        <MiniComponent label="NA" icon="| |" />
        <MiniComponent label="NF" icon="|/|" />
        <MiniComponent label="Coil" icon="( )" />
      </View>
    </View>
  );
}

const categoryColors = ['#9a9a9a', '#4caf50', '#f0a33a', '#e6e521', '#2196f3', '#9c27b0', '#8d7c7c', '#26d9d1', '#ef4444', '#009688'];

function MiniComponent({ label, icon }: { label: string; icon: string }) {
  return (
    <View style={styles.miniComponent}>
      <Text style={styles.miniIcon}>{icon}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  root: { flex: 1, backgroundColor: '#111111' },
  header: { height: 88, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#111111' },
  iconButton: { minWidth: 34, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#f5f5f5', fontSize: 30, fontWeight: '800' },
  titleBox: { flex: 1 },
  title: { color: '#f8f8f8', fontSize: 20, fontWeight: '900' },
  subtitle: { color: '#cfcfcf', fontSize: 15, marginTop: 2 },
  simulateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, minHeight: 44 },
  simulateIcon: { color: '#18a34a', fontSize: 24, fontWeight: '900' },
  simulateText: { color: '#28a745', fontSize: 15, fontWeight: '900' },
  tabs: { height: 64, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2f2f2f', backgroundColor: '#111111' },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: '#9a9a9a', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  tabTextActive: { color: '#20b44b' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: '#20b44b' },
  workspace: { flex: 1, overflow: 'hidden', backgroundColor: '#121212' },
  canvasX: { minWidth: 780, flexGrow: 1 },
  canvasY: { minHeight: 1040, flexGrow: 1 },
  canvas: { width: 820, height: 1080, position: 'relative', backgroundColor: '#121212' },
  grid: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: 41, height: 41, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#242424' },
  leftRail: { position: 'absolute', left: 58, top: 90, bottom: 150, width: 3, backgroundColor: '#e9e9e9' },
  rightRail: { position: 'absolute', right: 58, top: 90, bottom: 150, width: 3, backgroundColor: '#e9e9e9' },
  rung: { position: 'absolute', left: 58, right: 58, top: 215, height: 240 },
  rungSecond: { top: 540 },
  rungNumber: { position: 'absolute', left: -36, top: 54, color: '#969696', fontSize: 17 },
  rungWire: { position: 'absolute', left: 0, right: 0, top: 68, height: 3, backgroundColor: '#e9e9e9' },
  wireLive: { backgroundColor: '#42c95b' },
  rungRow: { position: 'absolute', left: 115, right: 100, top: 16, height: 106, flexDirection: 'row', alignItems: 'center', gap: 80 },
  fillWire: { flex: 1, height: 3, minWidth: 20, backgroundColor: '#e9e9e9' },
  branchOne: { position: 'absolute', left: 250, right: 150, top: 118, height: 80, borderLeftWidth: 3, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#e9e9e9', alignItems: 'center', justifyContent: 'center' },
  branchTwo: { position: 'absolute', left: 385, right: 150, top: 70, height: 105, borderLeftWidth: 3, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#e9e9e9', alignItems: 'center', justifyContent: 'center' },
  blockWrap: { minWidth: 74, alignItems: 'center', justifyContent: 'center' },
  blockLabel: { color: '#27b34a', fontSize: 19, fontWeight: '900', marginBottom: 8 },
  liveText: { color: '#51dc69' },
  contactSymbol: { color: '#f2f2f2', fontSize: 45, fontWeight: '300', lineHeight: 50 },
  coilSymbol: { color: '#f2f2f2', fontSize: 48, fontWeight: '300', lineHeight: 50 },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 452, backgroundColor: '#151515', borderRightWidth: 1, borderColor: '#292929', zIndex: 5 },
  drawerHeader: { height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerTitle: { color: '#eeeeee', fontWeight: '900', letterSpacing: 1 },
  drawerClose: { color: '#eeeeee', fontSize: 32 },
  categoryRow: { height: 74, paddingHorizontal: 36, flexDirection: 'row', alignItems: 'center', gap: 20 },
  categorySelected: { backgroundColor: '#303030' },
  categoryIcon: { width: 35, height: 24, borderWidth: 3 },
  categoryText: { color: '#f5f5f5', fontSize: 22, fontWeight: '500' },
  componentGrid: { height: 150, borderTopWidth: 1, borderColor: '#333333', padding: 16, flexDirection: 'row', gap: 16 },
  miniComponent: { width: 96, height: 92, borderWidth: 1, borderColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  miniIcon: { color: '#f1f1f1', fontSize: 32 },
  miniLabel: { color: '#dddddd', fontSize: 12, marginTop: 8 },
  fab: { position: 'absolute', right: 30, bottom: 58, width: 76, height: 76, borderRadius: 38, backgroundColor: '#28a745', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  fabText: { color: '#ffffff', fontSize: 44, lineHeight: 50 },
  bottomHandle: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(17,17,17,0.92)' },
  bottomHandleText: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  ioSheet: { backgroundColor: '#171717', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: '#303030', paddingBottom: 18, paddingHorizontal: 24 },
  sheetHandle: { alignSelf: 'center', width: 72, height: 8, borderRadius: 999, backgroundColor: '#707070', marginTop: 10, marginBottom: 18 },
  sheetTabs: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 36 },
  sheetTabActive: { color: '#2ab84a', fontSize: 18, fontWeight: '900' },
  sheetTab: { color: '#8d8d8d', fontSize: 18, fontWeight: '900', flex: 1 },
  sheetClose: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  ioContent: { flexDirection: 'row', paddingTop: 20, minHeight: 210 },
  ioColumn: { flex: 1 },
  ioDivider: { width: 1, backgroundColor: '#343434', marginHorizontal: 24 },
  ioTitle: { color: '#ffffff', fontSize: 16, fontWeight: '900', marginBottom: 14 },
  ioRow: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 16 },
  ioLabel: { color: '#f2f2f2', fontSize: 19, fontWeight: '700', width: 52 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#666666' },
  dotOn: { backgroundColor: '#37bf4b' },
  switchTrack: { width: 62, height: 32, borderRadius: 999, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#626262', padding: 2, marginLeft: 'auto' },
  switchTrackOn: { backgroundColor: '#2aa846' },
  switchThumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#8d8d8d' },
  switchThumbOn: { backgroundColor: '#ffffff', transform: [{ translateX: 30 }] },
  lamp: { fontSize: 30, color: '#686868', marginLeft: 'auto' },
  lampOn: { color: '#37bf4b' },
});
