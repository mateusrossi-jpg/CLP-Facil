import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type Tool = 'NO' | 'NC' | 'COIL' | 'PARALLEL';
type Block = { id: string; type: Exclude<Tool, 'PARALLEL'>; address: string };
type Branch = { id: string; blocks: Block[] };
type Rung = { id: string; series: Block[]; branches: Branch[]; coil?: Block };
type Zone = { kind: 'series'; rungId: string; index: number } | { kind: 'branch'; rungId: string; branchId: string; index: number } | { kind: 'coil'; rungId: string };
type PlcState = Record<string, boolean>;

const inputs = ['I0.0', 'I0.1', 'I0.2', 'I0.3'];
const outputs = ['Q0.0', 'Q0.1', 'Q0.2'];
const tools: { type: Tool; label: string; icon: string }[] = [
  { type: 'NO', label: 'NA', icon: '| |' },
  { type: 'NC', label: 'NF', icon: '|/|' },
  { type: 'COIL', label: 'Coil', icon: '( )' },
  { type: 'PARALLEL', label: 'Ramo', icon: '+R' },
];

function uid(prefix: string) { return `${prefix}-${Date.now()}-${Math.round(Math.random() * 9999)}`; }
function initialRungs(): Rung[] { return [{ id: 'rung-1', series: [{ id: 'b1', type: 'NO', address: 'I0.0' }, { id: 'b2', type: 'NC', address: 'I0.1' }], branches: [{ id: 'br1', blocks: [{ id: 'b3', type: 'NO', address: 'I0.2' }] }], coil: { id: 'c1', type: 'COIL', address: 'Q0.0' } }]; }
function clone(rungs: Rung[]): Rung[] { return rungs.map((r) => ({ ...r, series: r.series.map((b) => ({ ...b })), branches: r.branches.map((br) => ({ ...br, blocks: br.blocks.map((b) => ({ ...b })) })), coil: r.coil ? { ...r.coil } : undefined })); }
function makeBlock(type: Exclude<Tool, 'PARALLEL'>, rungs: Rung[]): Block {
  const used = new Set<string>();
  rungs.forEach((r) => { r.series.forEach((b) => used.add(b.address)); r.branches.forEach((br) => br.blocks.forEach((b) => used.add(b.address))); if (r.coil) used.add(r.coil.address); });
  if (type === 'COIL') return { id: uid('coil'), type, address: outputs.find((o) => !used.has(o)) ?? 'Q0.0' };
  return { id: uid('contact'), type, address: inputs.find((i) => !used.has(i)) ?? 'I0.0' };
}
function isClosed(block: Block, state: PlcState) { if (block.type === 'NO') return Boolean(state[block.address]); if (block.type === 'NC') return !Boolean(state[block.address]); return Boolean(state[block.address]); }
function evaluate(rungs: Rung[], state: PlcState) {
  const next = { ...state }; const poweredBlocks: Record<string, boolean> = {}; const poweredRungs: Record<string, boolean> = {};
  rungs.forEach((r) => {
    const seriesPower = r.series.every((b) => { const p = isClosed(b, next); poweredBlocks[b.id] = p; return p; });
    const branchPower = r.branches.some((br) => { const p = br.blocks.every((b) => isClosed(b, next)); br.blocks.forEach((b) => { poweredBlocks[b.id] = p; }); return p; });
    const rungPower = seriesPower || branchPower; poweredRungs[r.id] = rungPower;
    if (r.coil) { next[r.coil.address] = rungPower; poweredBlocks[r.coil.id] = rungPower; }
  });
  return { state: next, poweredBlocks, poweredRungs };
}
function sameZone(a: Zone | null, b: Zone) { if (!a || a.kind !== b.kind || a.rungId !== b.rungId) return false; if (a.kind === 'coil' && b.kind === 'coil') return true; if (a.kind === 'series' && b.kind === 'series') return a.index === b.index; if (a.kind === 'branch' && b.kind === 'branch') return a.branchId === b.branchId && a.index === b.index; return false; }

export function CompactMobileLadderScreenV2() {
  const [rungs, setRungs] = useState<Rung[]>(() => initialRungs());
  const [state, setState] = useState<PlcState>({ 'I0.0': true, 'I0.1': false, 'I0.2': true, 'I0.3': false, 'Q0.0': false, 'Q0.1': false, 'Q0.2': false });
  const [running, setRunning] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [selected, setSelected] = useState<Block | null>(null);
  const [ioOpen, setIoOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const result = useMemo(() => evaluate(rungs, state), [rungs, state]);

  function drop(target: Zone) {
    if (running) return;
    if (!tool) { setZone(target); return; }
    const next = clone(rungs); const rung = next.find((r) => r.id === target.rungId); if (!rung) return;
    if (tool === 'PARALLEL') { const branch = { id: uid('branch'), blocks: [makeBlock('NO', next)] }; rung.branches.push(branch); setRungs(next); setTool(null); setZone({ kind: 'branch', rungId: rung.id, branchId: branch.id, index: 1 }); return; }
    if (target.kind === 'coil') { rung.coil = makeBlock('COIL', next); setSelected(rung.coil); }
    else if (target.kind === 'series' && tool !== 'COIL') { const block = makeBlock(tool, next); rung.series.splice(target.index, 0, block); setSelected(block); }
    else if (target.kind === 'branch' && tool !== 'COIL') { const br = rung.branches.find((b) => b.id === target.branchId); if (br) { const block = makeBlock(tool, next); br.blocks.splice(target.index, 0, block); setSelected(block); } }
    setRungs(next); setZone(target); setTool(null);
  }
  function toggleInput(input: string) { const next = { ...state, [input]: !Boolean(state[input]) }; setState(running ? evaluate(rungs, next).state : next); }
  function scan() { setState(result.state); }
  function addRung() { if (running) return; const rung = { id: uid('rung'), series: [], branches: [] }; setRungs((current) => [...current, rung]); setZone({ kind: 'series', rungId: rung.id, index: 0 }); }
  function removeSelected() { if (!selected || running) return; const next = clone(rungs); next.forEach((r) => { r.series = r.series.filter((b) => b.id !== selected.id); r.branches = r.branches.map((br) => ({ ...br, blocks: br.blocks.filter((b) => b.id !== selected.id) })).filter((br) => br.blocks.length > 0); if (r.coil?.id === selected.id) r.coil = undefined; }); setRungs(next); setSelected(null); }
  function invertSelected() { if (!selected || running || selected.type === 'COIL') return; const next = clone(rungs); next.forEach((r) => [...r.series, ...r.branches.flatMap((br) => br.blocks)].forEach((b) => { if (b.id === selected.id) { b.type = b.type === 'NO' ? 'NC' : 'NO'; setSelected({ ...b }); } })); setRungs(next); }
  function setZoomStep(next: number) { setZoom(Math.min(1.18, Math.max(0.84, next))); }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.menu}>☰</Text>
          <View style={styles.titleBox}><Text style={styles.title}>CLP Fácil</Text><Text style={styles.subtitle}>{running ? 'RUN ativo' : tool ? `Inserindo ${tool}` : `Editor Ladder · ${Math.round(zoom * 100)}%`}</Text></View>
          <Pressable style={styles.smallButton} onPress={() => setRungs(initialRungs())}><Text style={styles.smallButtonText}>Novo</Text></Pressable>
          <Pressable style={[styles.runButton, running && styles.stopButton]} onPress={() => setRunning((c) => !c)}><Text style={styles.runText}>{running ? 'Stop' : 'Play'}</Text></Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.canvasX}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.canvasY}>
            <View style={[styles.canvas, { transform: [{ scale: zoom }] }]}>
              <View style={styles.leftRail} /><View style={styles.rightRail} />
              {rungs.map((rung, index) => (
                <View key={rung.id} style={[styles.rung, result.poweredRungs[rung.id] && styles.rungOn]}>
                  <Text style={styles.rungNumber}>{index + 1}</Text><View style={[styles.wire, result.poweredRungs[rung.id] && styles.wireOn]} />{result.poweredRungs[rung.id] ? <EnergyPulse /> : null}
                  <View style={styles.row}>
                    <Drop active={sameZone(zone, { kind: 'series', rungId: rung.id, index: 0 })} enabled={Boolean(tool)} onPress={() => drop({ kind: 'series', rungId: rung.id, index: 0 })} />
                    {rung.series.map((block, blockIndex) => <View key={block.id} style={styles.blockSlot}><LadderBlock block={block} powered={Boolean(result.poweredBlocks[block.id])} selected={selected?.id === block.id} onPress={() => setSelected(block)} /><Drop active={sameZone(zone, { kind: 'series', rungId: rung.id, index: blockIndex + 1 })} enabled={Boolean(tool)} onPress={() => drop({ kind: 'series', rungId: rung.id, index: blockIndex + 1 })} /></View>)}
                    <View style={[styles.flexWire, result.poweredRungs[rung.id] && styles.wireOn]} />
                    {rung.coil ? <LadderBlock block={rung.coil} powered={Boolean(result.poweredBlocks[rung.coil.id])} selected={selected?.id === rung.coil.id} onPress={() => setSelected(rung.coil ?? null)} /> : <Drop wide label="Coil" active={sameZone(zone, { kind: 'coil', rungId: rung.id })} enabled={Boolean(tool)} onPress={() => drop({ kind: 'coil', rungId: rung.id })} />}
                  </View>
                  {rung.branches.map((branch) => <View key={branch.id} style={styles.branch}><Drop active={sameZone(zone, { kind: 'branch', rungId: rung.id, branchId: branch.id, index: 0 })} enabled={Boolean(tool)} onPress={() => drop({ kind: 'branch', rungId: rung.id, branchId: branch.id, index: 0 })} />{branch.blocks.map((block, blockIndex) => <View key={block.id} style={styles.blockSlot}><LadderBlock block={block} powered={Boolean(result.poweredBlocks[block.id])} selected={selected?.id === block.id} onPress={() => setSelected(block)} /><Drop active={sameZone(zone, { kind: 'branch', rungId: rung.id, branchId: branch.id, index: blockIndex + 1 })} enabled={Boolean(tool)} onPress={() => drop({ kind: 'branch', rungId: rung.id, branchId: branch.id, index: blockIndex + 1 })} /></View>)}</View>)}
                </View>
              ))}
              <Pressable style={styles.addRung} onPress={addRung}><Text style={styles.addRungText}>+ Rung</Text></Pressable>
            </View>
          </ScrollView>
        </ScrollView>

        {ioOpen ? <View style={styles.ioPanel}>{[...inputs, ...outputs].map((item) => <Pressable key={item} style={[styles.ioChip, (state[item] || result.state[item]) && styles.ioChipOn]} onPress={() => inputs.includes(item) && toggleInput(item)}><Text style={[styles.ioText, (state[item] || result.state[item]) && styles.ioTextOn]}>{item}</Text></Pressable>)}</View> : null}
        {selected ? <View style={styles.contextDock}><Text style={styles.contextText}>{selected.type} {selected.address}</Text><Pressable style={styles.contextButton} onPress={invertSelected}><Text style={styles.contextButtonText}>NA/NF</Text></Pressable><Pressable style={styles.contextButtonDanger} onPress={removeSelected}><Text style={styles.contextButtonDangerText}>Excluir</Text></Pressable></View> : null}
        <View style={styles.dock}>{tools.map((item) => <Pressable key={item.type} style={[styles.tool, tool === item.type && styles.toolActive]} onPress={() => setTool(item.type)}><Text style={[styles.toolIcon, tool === item.type && styles.toolTextActive]}>{item.icon}</Text><Text style={[styles.toolLabel, tool === item.type && styles.toolTextActive]}>{item.label}</Text></Pressable>)}<Pressable style={styles.zoomButton} onPress={() => setZoomStep(zoom - 0.08)}><Text style={styles.zoomText}>-</Text></Pressable><Pressable style={styles.zoomButton} onPress={() => setZoomStep(1)}><Text style={styles.zoomText}>{Math.round(zoom * 100)}</Text></Pressable><Pressable style={styles.zoomButton} onPress={() => setZoomStep(zoom + 0.08)}><Text style={styles.zoomText}>+</Text></Pressable><Pressable style={styles.scanButton} onPress={scan}><Text style={styles.scanText}>Scan</Text></Pressable><Pressable style={styles.ioButton} onPress={() => setIoOpen((c) => !c)}><Text style={styles.ioButtonText}>I/O</Text></Pressable></View>
      </View>
    </SafeAreaView>
  );
}

function EnergyPulse() { return <View style={styles.pulseWrap}><View style={styles.pulseDot} /><View style={[styles.pulseDot, styles.pulseDotMid]} /><View style={styles.pulseDot} /></View>; }
function Drop({ active, enabled, onPress, label, wide }: { active: boolean; enabled: boolean; onPress: () => void; label?: string; wide?: boolean }) { return <Pressable style={[styles.drop, wide && styles.dropWide, enabled && styles.dropEnabled, active && styles.dropActive]} onPress={onPress}><Text style={[styles.dropText, enabled && styles.dropTextEnabled]}>{label ?? '+'}</Text></Pressable>; }
function LadderBlock({ block, powered, selected, onPress }: { block: Block; powered: boolean; selected: boolean; onPress: () => void }) { const text = block.type === 'NO' ? `| ${block.address} |` : block.type === 'NC' ? `|/${block.address}|` : `( ${block.address} )`; return <Pressable style={[styles.block, block.type === 'COIL' && styles.coil, powered && styles.blockOn, selected && styles.blockSelected]} onPress={onPress}><Text style={[styles.blockText, powered && styles.blockTextOn]}>{text}</Text><Text style={styles.blockCaption}>{block.type}</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f8fa' }, root: { flex: 1, backgroundColor: '#f5f8fa' }, header: { minHeight: 62, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dce5eb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 }, menu: { fontSize: 24, fontWeight: '900', color: '#15232e' }, titleBox: { flex: 1 }, title: { fontSize: 20, fontWeight: '900', color: '#15232e' }, subtitle: { fontSize: 11, fontWeight: '800', color: '#697985' }, smallButton: { minHeight: 38, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#edf3f6', justifyContent: 'center' }, smallButtonText: { fontSize: 13, fontWeight: '900', color: '#15232e' }, runButton: { minHeight: 40, paddingHorizontal: 18, borderRadius: 13, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' }, stopButton: { backgroundColor: '#dc2626' }, runText: { color: '#fff', fontWeight: '900' },
  canvasX: { minWidth: 760, flexGrow: 1, padding: 6 }, canvasY: { flexGrow: 1 }, canvas: { minHeight: 560, minWidth: 740, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#dce5eb', paddingHorizontal: 46, paddingVertical: 24, position: 'relative' }, leftRail: { position: 'absolute', left: 28, top: 20, bottom: 20, width: 5, borderRadius: 4, backgroundColor: '#15232e' }, rightRail: { position: 'absolute', right: 28, top: 20, bottom: 20, width: 5, borderRadius: 4, backgroundColor: '#15232e' }, rung: { minHeight: 118, marginBottom: 18, justifyContent: 'center', borderWidth: 2, borderRadius: 16, borderColor: 'transparent' }, rungOn: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }, rungNumber: { position: 'absolute', left: -31, top: 48, color: '#15232e', fontWeight: '900' }, wire: { position: 'absolute', left: -12, right: -12, top: 57, height: 4, borderRadius: 4, backgroundColor: '#15232e' }, wireOn: { backgroundColor: '#16a34a' }, row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 8 }, blockSlot: { flexDirection: 'row', alignItems: 'center', gap: 8 }, flexWire: { flex: 1, minWidth: 48, height: 4, borderRadius: 4, backgroundColor: '#15232e' }, branch: { marginLeft: 84, marginRight: 120, minHeight: 66, padding: 8, borderLeftWidth: 4, borderRightWidth: 4, borderColor: '#15232e', borderRadius: 14, backgroundColor: '#f8fbfc', flexDirection: 'row', alignItems: 'center', gap: 8 }, pulseWrap: { position: 'absolute', left: 68, top: 48, flexDirection: 'row', gap: 70 }, pulseDot: { width: 11, height: 11, borderRadius: 999, backgroundColor: '#22c55e', opacity: 0.65 }, pulseDotMid: { opacity: 1, transform: [{ scale: 1.25 }] },
  drop: { width: 31, height: 40, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#a8b6c0', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, dropWide: { width: 92, borderRadius: 999 }, dropEnabled: { backgroundColor: '#eaf3ff', borderColor: '#2563eb' }, dropActive: { backgroundColor: '#dbeafe', borderColor: '#1d4ed8', borderStyle: 'solid', transform: [{ scale: 1.1 }] }, dropText: { fontSize: 18, fontWeight: '900', color: '#7c8a95' }, dropTextEnabled: { color: '#1d4ed8' }, block: { minWidth: 104, minHeight: 58, borderRadius: 13, borderWidth: 2, borderColor: '#15232e', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, coil: { borderRadius: 999 }, blockOn: { backgroundColor: '#dcfce7', borderColor: '#16a34a' }, blockSelected: { backgroundColor: '#eff6ff', borderColor: '#2563eb', transform: [{ scale: 1.04 }] }, blockText: { fontSize: 14, fontWeight: '900', color: '#15232e' }, blockTextOn: { color: '#15803d' }, blockCaption: { fontSize: 10, fontWeight: '900', color: '#7a8791' }, addRung: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#b8c5ce', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, addRungText: { fontWeight: '900', color: '#62727d' },
  ioPanel: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#dce5eb', padding: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, ioChip: { minHeight: 36, minWidth: 62, borderRadius: 999, backgroundColor: '#edf3f6', borderWidth: 1, borderColor: '#d7e2e9', alignItems: 'center', justifyContent: 'center' }, ioChipOn: { backgroundColor: '#dcfce7', borderColor: '#16a34a' }, ioText: { fontSize: 12, fontWeight: '900', color: '#15232e' }, ioTextOn: { color: '#15803d' }, contextDock: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#dce5eb', paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 7 }, contextText: { flex: 1, fontSize: 13, fontWeight: '900', color: '#15803d' }, contextButton: { minHeight: 38, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#edf3f6', justifyContent: 'center' }, contextButtonText: { fontSize: 12, fontWeight: '900', color: '#15232e' }, contextButtonDanger: { minHeight: 38, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#fee2e2', justifyContent: 'center' }, contextButtonDangerText: { fontSize: 12, fontWeight: '900', color: '#dc2626' },
  dock: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#dce5eb', paddingHorizontal: 6, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, tool: { minHeight: 48, minWidth: 54, borderRadius: 14, backgroundColor: '#f3f7f9', borderWidth: 1, borderColor: '#dce5eb', alignItems: 'center', justifyContent: 'center' }, toolActive: { backgroundColor: '#ecfdf5', borderColor: '#16a34a' }, toolIcon: { fontSize: 16, fontWeight: '900', color: '#15232e' }, toolLabel: { fontSize: 9, fontWeight: '900', color: '#62727d' }, toolTextActive: { color: '#15803d' }, zoomButton: { minHeight: 48, minWidth: 38, borderRadius: 14, backgroundColor: '#eef6ff', alignItems: 'center', justifyContent: 'center' }, zoomText: { color: '#1d4ed8', fontSize: 12, fontWeight: '900' }, scanButton: { minHeight: 48, minWidth: 56, borderRadius: 14, backgroundColor: '#15232e', alignItems: 'center', justifyContent: 'center' }, scanText: { color: '#fff', fontSize: 12, fontWeight: '900' }, ioButton: { minHeight: 48, minWidth: 46, borderRadius: 14, backgroundColor: '#eaf3ff', alignItems: 'center', justifyContent: 'center' }, ioButtonText: { color: '#1d4ed8', fontSize: 12, fontWeight: '900' },
});
