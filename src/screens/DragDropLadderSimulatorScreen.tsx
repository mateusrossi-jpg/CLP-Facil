import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type BlockType = 'NO' | 'NC' | 'COIL' | 'TON' | 'PARALLEL';
type RunMode = 'EDIT' | 'RUN';

type LadderBlock = {
  id: string;
  type: Exclude<BlockType, 'PARALLEL'>;
  address: string;
  presetMs?: number;
};

type LadderBranch = {
  id: string;
  blocks: LadderBlock[];
};

type LadderRung = {
  id: string;
  series: LadderBlock[];
  branches: LadderBranch[];
  coil?: LadderBlock;
};

type DropZone =
  | { kind: 'series'; rungId: string; index: number }
  | { kind: 'branch'; rungId: string; branchId: string; index: number }
  | { kind: 'coil'; rungId: string };

type PlcState = Record<string, boolean>;

const INPUTS = ['I0.0', 'I0.1', 'I0.2', 'I0.3'];
const OUTPUTS = ['Q0.0', 'Q0.1', 'Q0.2'];

const TOOLBOX: { type: BlockType; label: string; symbol: string; hint: string }[] = [
  { type: 'NO', label: 'NA', symbol: '—| |—', hint: 'Contato normalmente aberto' },
  { type: 'NC', label: 'NF', symbol: '—|/|—', hint: 'Contato normalmente fechado' },
  { type: 'COIL', label: 'Bobina', symbol: '—( )—', hint: 'Saída no fim da linha' },
  { type: 'TON', label: 'TON', symbol: '⏱', hint: 'Temporizador simples' },
  { type: 'PARALLEL', label: 'Paralelo', symbol: '┬', hint: 'Cria um ramo paralelo' },
];

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 99999)}`;
}

function createBlock(type: Exclude<BlockType, 'PARALLEL'>, project: LadderRung[]): LadderBlock {
  const used = new Set<string>();
  project.forEach((rung) => {
    rung.series.forEach((block) => used.add(block.address));
    rung.branches.forEach((branch) => branch.blocks.forEach((block) => used.add(block.address)));
    if (rung.coil) used.add(rung.coil.address);
  });

  if (type === 'COIL') {
    return { id: id('coil'), type, address: OUTPUTS.find((address) => !used.has(address)) ?? 'Q0.0' };
  }

  if (type === 'TON') {
    return { id: id('ton'), type, address: 'T1', presetMs: 5000 };
  }

  return { id: id('contact'), type, address: INPUTS.find((address) => !used.has(address)) ?? 'I0.0' };
}

function initialRungs(): LadderRung[] {
  return [
    {
      id: 'rung-1',
      series: [
        { id: 'i00', type: 'NO', address: 'I0.0' },
        { id: 'i01', type: 'NC', address: 'I0.1' },
      ],
      branches: [
        {
          id: 'branch-1',
          blocks: [{ id: 'i02', type: 'NO', address: 'I0.2' }],
        },
      ],
      coil: { id: 'q00', type: 'COIL', address: 'Q0.0' },
    },
  ];
}

function contactPowered(block: LadderBlock, state: PlcState) {
  if (block.type === 'NO') return Boolean(state[block.address]);
  if (block.type === 'NC') return !Boolean(state[block.address]);
  if (block.type === 'TON') return true;
  return Boolean(state[block.address]);
}

function evaluate(rungs: LadderRung[], state: PlcState) {
  const next = { ...state };
  const energizedBlocks: Record<string, boolean> = {};
  const energizedRungs: Record<string, boolean> = {};

  rungs.forEach((rung) => {
    const seriesOk = rung.series.every((block) => {
      const powered = contactPowered(block, next);
      energizedBlocks[block.id] = powered;
      return powered;
    });

    const branchOk = rung.branches.some((branch) => {
      const powered = branch.blocks.every((block) => contactPowered(block, next));
      branch.blocks.forEach((block) => {
        energizedBlocks[block.id] = powered;
      });
      return powered;
    });

    const powered = seriesOk || branchOk;
    energizedRungs[rung.id] = powered;
    if (rung.coil) {
      next[rung.coil.address] = powered;
      energizedBlocks[rung.coil.id] = powered;
    }
  });

  return { state: next, energizedBlocks, energizedRungs };
}

function clone(rungs: LadderRung[]) {
  return rungs.map((rung) => ({
    ...rung,
    series: rung.series.map((block) => ({ ...block })),
    branches: rung.branches.map((branch) => ({ ...branch, blocks: branch.blocks.map((block) => ({ ...block })) })),
    coil: rung.coil ? { ...rung.coil } : undefined,
  }));
}

function sameZone(a: DropZone | null, b: DropZone) {
  if (!a || a.kind !== b.kind || a.rungId !== b.rungId) return false;
  if (a.kind === 'series' && b.kind === 'series') return a.index === b.index;
  if (a.kind === 'coil' && b.kind === 'coil') return true;
  if (a.kind === 'branch' && b.kind === 'branch') return a.branchId === b.branchId && a.index === b.index;
  return false;
}

export function DragDropLadderSimulatorScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const [rungs, setRungs] = useState<LadderRung[]>(() => initialRungs());
  const [plcState, setPlcState] = useState<PlcState>(() => ({
    'I0.0': true,
    'I0.1': false,
    'I0.2': true,
    'I0.3': false,
    'Q0.0': false,
    'Q0.1': false,
    'Q0.2': false,
  }));
  const [mode, setMode] = useState<RunMode>('EDIT');
  const [dragTool, setDragTool] = useState<BlockType | null>(null);
  const [hoverZone, setHoverZone] = useState<DropZone | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<LadderBlock | null>(null);
  const [message, setMessage] = useState('Segure/toque em um bloco da biblioteca e escolha uma zona + na rung.');

  const result = useMemo(() => evaluate(rungs, plcState), [rungs, plcState]);

  function startDrag(type: BlockType) {
    if (mode === 'RUN') return;
    setDragTool(type);
    setSelectedBlock(null);
    setMessage(type === 'PARALLEL'
      ? 'Modo paralelo: toque em uma zona + para criar um ramo paralelo nesse trecho.'
      : `Arrastando ${type}. Toque em uma zona + destacada para inserir.`);
  }

  function cancelDrag() {
    setDragTool(null);
    setHoverZone(null);
    setMessage('Inserção cancelada. Escolha outro bloco ou toque em Play para simular.');
  }

  function dropInto(zone: DropZone) {
    if (!dragTool || mode === 'RUN') {
      setHoverZone(zone);
      return;
    }

    const next = clone(rungs);
    const rung = next.find((item) => item.id === zone.rungId);
    if (!rung) return;

    if (dragTool === 'PARALLEL') {
      const newBranch: LadderBranch = {
        id: id('branch'),
        blocks: [createBlock('NO', next)],
      };
      rung.branches.push(newBranch);
      setRungs(next);
      setDragTool(null);
      setHoverZone({ kind: 'branch', rungId: rung.id, branchId: newBranch.id, index: 1 });
      setMessage('Ramo paralelo inserido. Agora arraste contatos para dentro dele.');
      return;
    }

    if (zone.kind === 'coil') {
      rung.coil = createBlock(dragTool === 'COIL' ? 'COIL' : 'COIL', next);
      setSelectedBlock(rung.coil);
    }

    if (zone.kind === 'series' && dragTool !== 'COIL') {
      const block = createBlock(dragTool, next);
      rung.series.splice(zone.index, 0, block);
      setSelectedBlock(block);
    }

    if (zone.kind === 'branch' && dragTool !== 'COIL') {
      const branch = rung.branches.find((item) => item.id === zone.branchId);
      if (branch) {
        const block = createBlock(dragTool, next);
        branch.blocks.splice(zone.index, 0, block);
        setSelectedBlock(block);
      }
    }

    setRungs(next);
    setDragTool(null);
    setHoverZone(zone);
    setMessage('Bloco encaixado na zona selecionada.');
  }

  function toggleInput(address: string) {
    const next = { ...plcState, [address]: !Boolean(plcState[address]) };
    setPlcState(mode === 'RUN' ? evaluate(rungs, next).state : next);
  }

  function runScan() {
    setPlcState(result.state);
    setMessage('Scan executado. Estados atualizados.');
  }

  function addRung() {
    if (mode === 'RUN') return;
    const rung: LadderRung = { id: id('rung'), series: [], branches: [], coil: undefined };
    setRungs((current) => [...current, rung]);
    setMessage('Nova rung adicionada. Arraste blocos para montar a lógica.');
  }

  function removeSelectedBlock() {
    if (!selectedBlock || mode === 'RUN') return;
    const next = clone(rungs);
    next.forEach((rung) => {
      rung.series = rung.series.filter((block) => block.id !== selectedBlock.id);
      rung.branches = rung.branches
        .map((branch) => ({ ...branch, blocks: branch.blocks.filter((block) => block.id !== selectedBlock.id) }))
        .filter((branch) => branch.blocks.length > 0);
      if (rung.coil?.id === selectedBlock.id) rung.coil = undefined;
    });
    setRungs(next);
    setSelectedBlock(null);
    setMessage('Bloco removido.');
  }

  function invertSelected() {
    if (!selectedBlock || mode === 'RUN') return;
    const next = clone(rungs);
    next.forEach((rung) => {
      [...rung.series, ...rung.branches.flatMap((branch) => branch.blocks)].forEach((block) => {
        if (block.id === selectedBlock.id && (block.type === 'NO' || block.type === 'NC')) {
          block.type = block.type === 'NO' ? 'NC' : 'NO';
          setSelectedBlock({ ...block });
        }
      });
    });
    setRungs(next);
    setMessage('Contato invertido entre NA/NF.');
  }

  const outputs = result.state;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.menu}>☰</Text>
          <Text style={styles.title}>CLP Fácil</Text>
          <Pressable style={styles.headerAction} onPress={() => setRungs(initialRungs())}><Text style={styles.headerActionText}>Novo</Text></Pressable>
          <Pressable style={styles.headerAction}><Text style={styles.headerActionText}>Salvar</Text></Pressable>
          <Pressable style={[styles.playButton, mode === 'RUN' && styles.stopButton]} onPress={() => setMode(mode === 'RUN' ? 'EDIT' : 'RUN')}>
            <Text style={styles.playText}>{mode === 'RUN' ? 'Stop' : 'Play'}</Text>
          </Pressable>
        </View>

        <View style={styles.statusLine}>
          <Text style={styles.statusText}>{mode === 'RUN' ? '● Executando' : '● Editando'}</Text>
          <Text style={styles.cycleText}>Ciclo: 12 ms</Text>
          <Text style={styles.modeText}>{dragTool ? `Arrastando: ${dragTool}` : 'Drag zones ativas'}</Text>
        </View>

        <View style={[styles.main, compact && styles.mainCompact]}>
          <View style={styles.editorCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.canvasWrap}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.canvasInner}>
                <View style={styles.canvas}>
                  <View style={styles.railLeft} />
                  <View style={styles.railRight} />
                  {rungs.map((rung, rungIndex) => (
                    <View key={rung.id} style={[styles.rung, result.energizedRungs[rung.id] && styles.rungActive]}>
                      <Text style={styles.rungNumber}>{rungIndex + 1}</Text>
                      <View style={[styles.rungLine, result.energizedRungs[rung.id] && styles.lineActive]} />
                      <View style={styles.rungContent}>
                        <DropTarget active={sameZone(hoverZone, { kind: 'series', rungId: rung.id, index: 0 })} enabled={Boolean(dragTool)} onDrop={() => dropInto({ kind: 'series', rungId: rung.id, index: 0 })} />
                        {rung.series.map((block, index) => (
                          <View key={block.id} style={styles.inlineBlockGroup}>
                            <LadderBlockView block={block} active={Boolean(result.energizedBlocks[block.id])} selected={selectedBlock?.id === block.id} onPress={() => setSelectedBlock(block)} />
                            <DropTarget active={sameZone(hoverZone, { kind: 'series', rungId: rung.id, index: index + 1 })} enabled={Boolean(dragTool)} onDrop={() => dropInto({ kind: 'series', rungId: rung.id, index: index + 1 })} />
                          </View>
                        ))}
                        <View style={[styles.flexWire, result.energizedRungs[rung.id] && styles.lineActive]} />
                        {rung.coil ? (
                          <LadderBlockView block={rung.coil} active={Boolean(result.energizedBlocks[rung.coil.id])} selected={selectedBlock?.id === rung.coil.id} onPress={() => setSelectedBlock(rung.coil ?? null)} />
                        ) : (
                          <DropTarget wide active={sameZone(hoverZone, { kind: 'coil', rungId: rung.id })} enabled={Boolean(dragTool)} onDrop={() => dropInto({ kind: 'coil', rungId: rung.id })} label="Bobina" />
                        )}
                      </View>

                      {rung.branches.map((branch) => (
                        <View key={branch.id} style={styles.branchBox}>
                          <DropTarget active={sameZone(hoverZone, { kind: 'branch', rungId: rung.id, branchId: branch.id, index: 0 })} enabled={Boolean(dragTool)} onDrop={() => dropInto({ kind: 'branch', rungId: rung.id, branchId: branch.id, index: 0 })} />
                          {branch.blocks.map((block, index) => (
                            <View key={block.id} style={styles.inlineBlockGroup}>
                              <LadderBlockView block={block} active={Boolean(result.energizedBlocks[block.id])} selected={selectedBlock?.id === block.id} onPress={() => setSelectedBlock(block)} />
                              <DropTarget active={sameZone(hoverZone, { kind: 'branch', rungId: rung.id, branchId: branch.id, index: index + 1 })} enabled={Boolean(dragTool)} onDrop={() => dropInto({ kind: 'branch', rungId: rung.id, branchId: branch.id, index: index + 1 })} />
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  ))}
                  <Pressable style={styles.addRungZone} onPress={addRung}>
                    <Text style={styles.addRungText}>＋ Adicionar Rung Abaixo</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </ScrollView>
          </View>

          <View style={styles.sidePanel}>
            <Text style={styles.panelTitle}>Entradas</Text>
            {INPUTS.map((input) => (
              <Pressable key={input} style={styles.ioRow} onPress={() => toggleInput(input)}>
                <Text style={styles.ioLabel}>{input}</Text>
                <View style={[styles.switchTrack, plcState[input] && styles.switchTrackOn]}><View style={[styles.switchThumb, plcState[input] && styles.switchThumbOn]} /></View>
              </Pressable>
            ))}
            <Text style={styles.panelTitle}>Saídas</Text>
            {OUTPUTS.map((output) => (
              <View key={output} style={styles.ioRow}>
                <Text style={styles.ioLabel}>{output}</Text>
                <View style={[styles.lamp, outputs[output] && styles.lampOn]} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.toolbox}>
          {TOOLBOX.map((tool) => (
            <Pressable key={tool.type} style={[styles.tool, dragTool === tool.type && styles.toolActive]} onPress={() => startDrag(tool.type)}>
              <Text style={[styles.toolSymbol, dragTool === tool.type && styles.toolTextActive]}>{tool.symbol}</Text>
              <Text style={[styles.toolLabel, dragTool === tool.type && styles.toolTextActive]}>{tool.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.contextBar}>
          <View style={styles.selectedBox}>
            <Text style={styles.selectedTitle}>Selecionado:</Text>
            <Text style={styles.selectedText}>{selectedBlock ? `${selectedBlock.type} (${selectedBlock.address})` : dragTool ? `Inserindo ${dragTool}` : 'Nenhum bloco'}</Text>
          </View>
          <ActionButton label="Cancelar" onPress={cancelDrag} disabled={!dragTool} />
          <ActionButton label="Inverter" onPress={invertSelected} disabled={!selectedBlock || selectedBlock.type === 'COIL'} />
          <ActionButton label="Excluir" onPress={removeSelectedBlock} danger disabled={!selectedBlock} />
          <ActionButton label="Scan" onPress={runScan} />
        </View>

        <View style={styles.messageBar}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DropTarget({ active, enabled, onDrop, label, wide }: { active: boolean; enabled: boolean; onDrop: () => void; label?: string; wide?: boolean }) {
  return (
    <Pressable style={[styles.dropZone, wide && styles.dropZoneWide, enabled && styles.dropZoneEnabled, active && styles.dropZoneActive]} onPress={onDrop}>
      <Text style={[styles.dropText, enabled && styles.dropTextEnabled]}>{label ?? '+'}</Text>
    </Pressable>
  );
}

function LadderBlockView({ block, active, selected, onPress }: { block: LadderBlock; active: boolean; selected: boolean; onPress: () => void }) {
  const symbol = block.type === 'NO' ? `| ${block.address} |` : block.type === 'NC' ? `|/${block.address}|` : block.type === 'TON' ? `TON\n${block.address}` : `( ${block.address} )`;
  return (
    <Pressable style={[styles.block, block.type === 'COIL' && styles.coil, block.type === 'TON' && styles.timer, active && styles.blockActive, selected && styles.blockSelected]} onPress={onPress}>
      <Text style={[styles.blockSymbol, active && styles.blockSymbolActive]}>{symbol}</Text>
      <Text style={styles.blockCaption}>{block.type === 'NO' ? 'Contato NA' : block.type === 'NC' ? 'Contato NF' : block.type === 'TON' ? 'Timer' : 'Bobina'}</Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress, disabled, danger }: { label: string; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <Pressable style={[styles.actionButton, danger && styles.actionDanger, disabled && styles.actionDisabled]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.actionText, danger && styles.actionDangerText, disabled && styles.actionDisabledText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#eef3f6' },
  root: { flex: 1, backgroundColor: '#eef3f6' },
  header: { minHeight: 74, backgroundColor: '#101820', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 14 },
  menu: { color: '#ffffff', fontSize: 26, fontWeight: '900' },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '900', flex: 1 },
  headerAction: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1f2a34' },
  headerActionText: { color: '#ffffff', fontWeight: '800' },
  playButton: { minHeight: 46, paddingHorizontal: 22, borderRadius: 12, backgroundColor: '#18a34a', alignItems: 'center', justifyContent: 'center' },
  stopButton: { backgroundColor: '#dc2626' },
  playText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  statusLine: { minHeight: 46, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dce5ea', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  statusText: { color: '#159447', fontWeight: '900' },
  cycleText: { color: '#647480', fontWeight: '800' },
  modeText: { color: '#159447', fontWeight: '900' },
  main: { flex: 1, flexDirection: 'row', gap: 10, padding: 10 },
  mainCompact: { flexDirection: 'column' },
  editorCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 18, borderWidth: 1, borderColor: '#d9e3e8', overflow: 'hidden' },
  canvasWrap: { minWidth: 760 },
  canvasInner: { padding: 18 },
  canvas: { minHeight: 440, minWidth: 730, position: 'relative', paddingLeft: 42, paddingRight: 42, paddingVertical: 24 },
  railLeft: { position: 'absolute', left: 26, top: 20, bottom: 20, width: 5, borderRadius: 3, backgroundColor: '#111827' },
  railRight: { position: 'absolute', right: 26, top: 20, bottom: 20, width: 5, borderRadius: 3, backgroundColor: '#111827' },
  rung: { minHeight: 126, marginBottom: 18, justifyContent: 'center', borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  rungActive: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  rungNumber: { position: 'absolute', left: -28, top: 48, fontSize: 18, color: '#111827', fontWeight: '900' },
  rungLine: { position: 'absolute', left: -10, right: -10, top: 59, height: 4, borderRadius: 3, backgroundColor: '#1f2937' },
  lineActive: { backgroundColor: '#16a34a' },
  rungContent: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 72, paddingHorizontal: 4 },
  inlineBlockGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flexWire: { flex: 1, minWidth: 50, height: 4, borderRadius: 3, backgroundColor: '#1f2937' },
  dropZone: { width: 34, height: 42, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#a8b6c0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fbfc' },
  dropZoneWide: { width: 98, borderRadius: 999 },
  dropZoneEnabled: { backgroundColor: '#eaf5ff', borderColor: '#2563eb' },
  dropZoneActive: { backgroundColor: '#dbeafe', borderColor: '#1d4ed8', borderStyle: 'solid', transform: [{ scale: 1.05 }] },
  dropText: { color: '#6b7c88', fontWeight: '900', fontSize: 18 },
  dropTextEnabled: { color: '#1d4ed8' },
  block: { minWidth: 112, minHeight: 62, borderRadius: 12, borderWidth: 2, borderColor: '#111827', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  coil: { borderRadius: 999 },
  timer: { minWidth: 86, backgroundColor: '#f8fafc' },
  blockActive: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  blockSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  blockSymbol: { color: '#111827', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  blockSymbolActive: { color: '#15803d' },
  blockCaption: { marginTop: 4, color: '#62727d', fontSize: 10, fontWeight: '800' },
  branchBox: { marginLeft: 92, marginRight: 118, minHeight: 70, borderLeftWidth: 4, borderRightWidth: 4, borderColor: '#111827', borderRadius: 14, backgroundColor: '#f8fbfc', padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addRungZone: { marginTop: 6, minHeight: 58, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#bcc9d2', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  addRungText: { color: '#667783', fontSize: 15, fontWeight: '900' },
  sidePanel: { width: 250, backgroundColor: '#ffffff', borderRadius: 18, borderWidth: 1, borderColor: '#d9e3e8', padding: 14, gap: 10 },
  panelTitle: { color: '#111827', fontSize: 16, fontWeight: '900', marginTop: 4 },
  ioRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ioLabel: { color: '#111827', fontWeight: '800', fontSize: 15 },
  switchTrack: { width: 50, height: 28, borderRadius: 999, backgroundColor: '#a7adb4', padding: 3 },
  switchTrackOn: { backgroundColor: '#16a34a' },
  switchThumb: { width: 22, height: 22, borderRadius: 999, backgroundColor: '#ffffff' },
  switchThumbOn: { transform: [{ translateX: 22 }] },
  lamp: { width: 18, height: 18, borderRadius: 999, backgroundColor: '#a7adb4' },
  lampOn: { backgroundColor: '#16a34a' },
  toolbox: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#d9e3e8', padding: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  tool: { minWidth: 88, minHeight: 70, borderRadius: 14, borderWidth: 1, borderColor: '#dbe3e8', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  toolActive: { backgroundColor: '#ecfdf5', borderColor: '#16a34a' },
  toolSymbol: { fontSize: 24, color: '#111827', fontWeight: '900' },
  toolLabel: { marginTop: 2, color: '#111827', fontSize: 13, fontWeight: '900' },
  toolTextActive: { color: '#15803d' },
  contextBar: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#d9e3e8', flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  selectedBox: { minWidth: 160, flex: 1 },
  selectedTitle: { color: '#111827', fontSize: 12, fontWeight: '900' },
  selectedText: { color: '#15803d', fontSize: 14, fontWeight: '900' },
  actionButton: { minHeight: 44, minWidth: 78, borderRadius: 12, backgroundColor: '#eef3f6', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  actionText: { color: '#111827', fontWeight: '900' },
  actionDanger: { backgroundColor: '#fee2e2' },
  actionDangerText: { color: '#dc2626' },
  actionDisabled: { opacity: 0.42 },
  actionDisabledText: { color: '#7f8b94' },
  messageBar: { backgroundColor: '#f8fbfc', paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#d9e3e8' },
  messageText: { color: '#60707a', fontWeight: '700', fontSize: 12 },
});
