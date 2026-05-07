import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type ContactMode = 'NO' | 'NC';
type BlockKind = 'contact' | 'coil';

type LadderBlock = {
  id: string;
  kind: BlockKind;
  address: string;
  mode?: ContactMode;
};

type LadderBranch = {
  id: string;
  blocks: LadderBlock[];
};

type LadderRung = {
  id: string;
  label: string;
  series: LadderBlock[];
  branches: LadderBranch[];
  coil: LadderBlock | null;
};

type LadderProject = {
  rungs: LadderRung[];
};

type SelectedTarget =
  | { type: 'series'; rungId: string; blockId?: string }
  | { type: 'branch'; rungId: string; branchId: string; blockId?: string }
  | { type: 'coil'; rungId: string; blockId?: string }
  | { type: 'rung'; rungId: string };

type PlcState = Record<string, boolean>;

type EnergizedMap = Record<string, boolean>;

const INPUTS = ['I0.0', 'I0.1', 'I0.2'];
const OUTPUTS = ['Q0.0', 'Q0.1'];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function initialProject(): LadderProject {
  return {
    rungs: [
      {
        id: 'rung-1',
        label: 'Linha 1',
        series: [
          { id: 'start-contact', kind: 'contact', address: 'I0.0', mode: 'NO' },
          { id: 'stop-contact', kind: 'contact', address: 'I0.1', mode: 'NC' },
        ],
        branches: [],
        coil: { id: 'motor-coil', kind: 'coil', address: 'Q0.0' },
      },
    ],
  };
}

function initialState(): PlcState {
  return {
    'I0.0': false,
    'I0.1': false,
    'I0.2': false,
    'Q0.0': false,
    'Q0.1': false,
  };
}

function contactIsClosed(block: LadderBlock, state: PlcState) {
  const value = Boolean(state[block.address]);
  return block.mode === 'NC' ? !value : value;
}

function evaluateBranch(branch: LadderBranch, state: PlcState) {
  return branch.blocks.every((block) => contactIsClosed(block, state));
}

function evaluateProject(project: LadderProject, currentState: PlcState) {
  const nextState: PlcState = { ...currentState };
  const energized: EnergizedMap = {};

  for (const rung of project.rungs) {
    const seriesClosed = rung.series.every((block) => {
      const closed = contactIsClosed(block, nextState);
      energized[block.id] = closed;
      return closed;
    });

    const branchClosed = rung.branches.some((branch) => {
      const closed = evaluateBranch(branch, nextState);
      for (const block of branch.blocks) energized[block.id] = closed;
      return closed;
    });

    const rungPower = seriesClosed || branchClosed;
    if (rung.coil) {
      nextState[rung.coil.address] = rungPower;
      energized[rung.coil.id] = rungPower;
    }
  }

  return { state: nextState, energized };
}

function nextAddress(kind: BlockKind, project: LadderProject) {
  const used = new Set<string>();
  project.rungs.forEach((rung) => {
    rung.series.forEach((block) => used.add(block.address));
    rung.branches.forEach((branch) => branch.blocks.forEach((block) => used.add(block.address)));
    if (rung.coil) used.add(rung.coil.address);
  });

  const pool = kind === 'coil' ? OUTPUTS : INPUTS;
  return pool.find((address) => !used.has(address)) ?? pool[0];
}

function cloneProject(project: LadderProject): LadderProject {
  return {
    rungs: project.rungs.map((rung) => ({
      ...rung,
      series: [...rung.series],
      branches: rung.branches.map((branch) => ({ ...branch, blocks: [...branch.blocks] })),
      coil: rung.coil ? { ...rung.coil } : null,
    })),
  };
}

export function LadderSimulatorScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const [project, setProject] = useState<LadderProject>(() => initialProject());
  const [state, setState] = useState<PlcState>(() => initialState());
  const [selected, setSelected] = useState<SelectedTarget>({ type: 'rung', rungId: 'rung-1' });
  const [running, setRunning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [scan, setScan] = useState(0);
  const [message, setMessage] = useState('Toque em uma linha ou bloco, adicione contatos e pressione Play para simular.');

  const evaluation = useMemo(() => evaluateProject(project, state), [project, state]);

  useEffect(() => {
    if (!running || !autoScan) return undefined;
    const interval = setInterval(() => runScan(), 350);
    return () => clearInterval(interval);
  }, [running, autoScan, project, state]);

  function replaceProject(nextProject: LadderProject) {
    setProject(nextProject);
    if (running) {
      const result = evaluateProject(nextProject, state);
      setState(result.state);
    }
  }

  function runScan() {
    const result = evaluateProject(project, state);
    setState(result.state);
    setScan((current) => current + 1);
    setMessage('Scan executado. As saídas foram atualizadas conforme a lógica Ladder.');
  }

  function resetProject() {
    setProject(initialProject());
    setState(initialState());
    setSelected({ type: 'rung', rungId: 'rung-1' });
    setRunning(false);
    setAutoScan(false);
    setScan(0);
    setMessage('Projeto reiniciado com um circuito simples de Start, Stop e bobina Q0.0.');
  }

  function toggleRun() {
    const nextRunning = !running;
    setRunning(nextRunning);
    setAutoScan(nextRunning);
    if (nextRunning) runScan();
    setMessage(nextRunning ? 'Modo RUN ativo. Toque nas entradas para simular.' : 'Modo EDIT ativo. Agora você pode alterar a lógica.');
  }

  function addRung() {
    if (running) return;
    const rungId = makeId('rung');
    replaceProject({
      rungs: [
        ...project.rungs,
        {
          id: rungId,
          label: `Linha ${project.rungs.length + 1}`,
          series: [],
          branches: [],
          coil: null,
        },
      ],
    });
    setSelected({ type: 'rung', rungId });
    setMessage('Nova linha adicionada. Insira contatos e uma bobina.');
  }

  function removeSelected() {
    if (running) return;
    const next = cloneProject(project);

    if (selected.type === 'rung') {
      if (next.rungs.length <= 1) {
        setMessage('Mantenha pelo menos uma linha no projeto.');
        return;
      }
      const filtered = next.rungs.filter((rung) => rung.id !== selected.rungId);
      replaceProject({ rungs: filtered });
      setSelected({ type: 'rung', rungId: filtered[0].id });
      setMessage('Linha removida.');
      return;
    }

    const rung = next.rungs.find((item) => item.id === selected.rungId);
    if (!rung) return;

    if (selected.type === 'series' && selected.blockId) {
      rung.series = rung.series.filter((block) => block.id !== selected.blockId);
    }

    if (selected.type === 'branch') {
      if (selected.blockId) {
        rung.branches = rung.branches
          .map((branch) => branch.id === selected.branchId
            ? { ...branch, blocks: branch.blocks.filter((block) => block.id !== selected.blockId) }
            : branch)
          .filter((branch) => branch.blocks.length > 0);
      } else {
        rung.branches = rung.branches.filter((branch) => branch.id !== selected.branchId);
      }
    }

    if (selected.type === 'coil') rung.coil = null;

    replaceProject(next);
    setSelected({ type: 'rung', rungId: rung.id });
    setMessage('Item removido.');
  }

  function addContact(mode: ContactMode) {
    if (running) return;
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === selected.rungId) ?? next.rungs[0];
    const block: LadderBlock = {
      id: makeId('contact'),
      kind: 'contact',
      address: nextAddress('contact', next),
      mode,
    };

    if (selected.type === 'branch') {
      const branch = rung.branches.find((item) => item.id === selected.branchId);
      if (branch) branch.blocks.push(block);
      else rung.branches.push({ id: makeId('branch'), blocks: [block] });
      setSelected({ type: 'branch', rungId: rung.id, branchId: rung.branches[rung.branches.length - 1].id, blockId: block.id });
    } else {
      rung.series.push(block);
      setSelected({ type: 'series', rungId: rung.id, blockId: block.id });
    }

    replaceProject(next);
    setMessage(`${mode === 'NO' ? 'Contato NA' : 'Contato NF'} inserido.`);
  }

  function addCoil() {
    if (running) return;
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === selected.rungId) ?? next.rungs[0];
    rung.coil = { id: makeId('coil'), kind: 'coil', address: nextAddress('coil', next) };
    replaceProject(next);
    setSelected({ type: 'coil', rungId: rung.id, blockId: rung.coil.id });
    setMessage('Bobina inserida no fim da linha.');
  }

  function addParallelBranch() {
    if (running) return;
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === selected.rungId) ?? next.rungs[0];
    const branch: LadderBranch = {
      id: makeId('branch'),
      blocks: [{ id: makeId('contact'), kind: 'contact', address: nextAddress('contact', next), mode: 'NO' }],
    };
    rung.branches.push(branch);
    replaceProject(next);
    setSelected({ type: 'branch', rungId: rung.id, branchId: branch.id, blockId: branch.blocks[0].id });
    setMessage('Ramo paralelo simples inserido.');
  }

  function updateSelectedAddress(address: string) {
    if (running) return;
    const normalized = address.toUpperCase().replace(/\s/g, '');
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === selected.rungId);
    if (!rung) return;

    if (selected.type === 'series') {
      const block = rung.series.find((item) => item.id === selected.blockId);
      if (block) block.address = normalized;
    }

    if (selected.type === 'branch') {
      const branch = rung.branches.find((item) => item.id === selected.branchId);
      const block = branch?.blocks.find((item) => item.id === selected.blockId);
      if (block) block.address = normalized;
    }

    if (selected.type === 'coil' && rung.coil) rung.coil.address = normalized;

    replaceProject(next);
  }

  function selectedBlock() {
    const rung = project.rungs.find((item) => item.id === selected.rungId);
    if (!rung) return null;
    if (selected.type === 'series') return rung.series.find((block) => block.id === selected.blockId) ?? null;
    if (selected.type === 'branch') {
      const branch = rung.branches.find((item) => item.id === selected.branchId);
      return branch?.blocks.find((block) => block.id === selected.blockId) ?? null;
    }
    if (selected.type === 'coil') return rung.coil;
    return null;
  }

  function toggleInput(address: string) {
    const nextState = { ...state, [address]: !Boolean(state[address]) };
    const result = running ? evaluateProject(project, nextState) : { state: nextState };
    setState(result.state);
    if (running) setScan((current) => current + 1);
  }

  const activeBlock = selectedBlock();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <View style={styles.app}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CLP Fácil</Text>
            <Text style={styles.subtitle}>{running ? `RUN ativo • Scan #${scan}` : 'Editor Ladder mobile'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={resetProject}>
              <Text style={styles.headerButtonText}>Novo</Text>
            </Pressable>
            <Pressable style={styles.headerButton} onPress={() => setMessage('Salvar local será ligado na próxima etapa.')}>
              <Text style={styles.headerButtonText}>Salvar</Text>
            </Pressable>
            <Pressable style={[styles.runButton, running && styles.stopButton]} onPress={toggleRun}>
              <Text style={styles.runButtonText}>{running ? 'Stop' : 'Play'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.ladderPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ladderScrollX}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ladderScrollY}>
                <View style={styles.ladderCanvas}>
                  <View style={styles.leftRail} />
                  <View style={styles.rightRail} />
                  {project.rungs.map((rung) => (
                    <Pressable
                      key={rung.id}
                      style={[styles.rung, selected.rungId === rung.id && styles.rungSelected]}
                      onPress={() => !running && setSelected({ type: 'rung', rungId: rung.id })}
                    >
                      <Text style={styles.rungLabel}>{rung.label}</Text>
                      <View style={styles.rungWire} />
                      <View style={styles.rungBody}>
                        <View style={styles.blockRow}>
                          {rung.series.map((block) => (
                            <LadderBlockView
                              key={block.id}
                              block={block}
                              selected={selected.type === 'series' && selected.blockId === block.id}
                              energized={Boolean(evaluation.energized[block.id])}
                              onPress={() => !running && setSelected({ type: 'series', rungId: rung.id, blockId: block.id })}
                            />
                          ))}
                          <View style={styles.flexWire} />
                          {rung.coil ? (
                            <LadderBlockView
                              block={rung.coil}
                              selected={selected.type === 'coil' && selected.blockId === rung.coil.id}
                              energized={Boolean(evaluation.energized[rung.coil.id])}
                              onPress={() => !running && setSelected({ type: 'coil', rungId: rung.id, blockId: rung.coil?.id })}
                            />
                          ) : (
                            <Pressable style={styles.emptyCoil} onPress={addCoil}>
                              <Text style={styles.emptyText}>+ Bobina</Text>
                            </Pressable>
                          )}
                        </View>

                        {rung.branches.map((branch) => (
                          <Pressable
                            key={branch.id}
                            style={[styles.branchRow, selected.type === 'branch' && selected.branchId === branch.id && styles.branchSelected]}
                            onPress={() => !running && setSelected({ type: 'branch', rungId: rung.id, branchId: branch.id })}
                          >
                            <Text style={styles.branchLabel}>paralelo</Text>
                            {branch.blocks.map((block) => (
                              <LadderBlockView
                                key={block.id}
                                block={block}
                                selected={selected.type === 'branch' && selected.blockId === block.id}
                                energized={Boolean(evaluation.energized[block.id])}
                                onPress={() => !running && setSelected({ type: 'branch', rungId: rung.id, branchId: branch.id, blockId: block.id })}
                              />
                            ))}
                          </Pressable>
                        ))}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
          </View>

          <View style={styles.sidePanel}>
            <Text style={styles.panelTitle}>I/O</Text>
            <Text style={styles.sectionLabel}>Entradas</Text>
            <View style={styles.ioGrid}>
              {INPUTS.map((input) => (
                <Pressable key={input} style={[styles.ioButton, state[input] && styles.ioButtonActive]} onPress={() => toggleInput(input)}>
                  <Text style={[styles.ioButtonText, state[input] && styles.ioButtonTextActive]}>{input}</Text>
                  <Text style={styles.ioSmallText}>{state[input] ? 'ON' : 'OFF'}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Saídas</Text>
            <View style={styles.ioGrid}>
              {OUTPUTS.map((output) => (
                <View key={output} style={[styles.outputLamp, evaluation.state[output] && styles.outputLampActive]}>
                  <Text style={[styles.outputText, evaluation.state[output] && styles.outputTextActive]}>{output}</Text>
                  <Text style={styles.ioSmallText}>{evaluation.state[output] ? 'ENERGIZADA' : 'DESLIGADA'}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.scanButton} onPress={runScan}>
              <Text style={styles.scanButtonText}>Scan manual</Text>
            </Pressable>
            <Pressable style={[styles.autoButton, autoScan && styles.autoButtonActive]} onPress={() => setAutoScan((current) => !current)}>
              <Text style={[styles.autoButtonText, autoScan && styles.autoButtonTextActive]}>{autoScan ? 'Auto scan ON' : 'Auto scan OFF'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.toolbar}>
          <ToolbarButton label="NA" onPress={() => addContact('NO')} disabled={running} />
          <ToolbarButton label="NF" onPress={() => addContact('NC')} disabled={running} />
          <ToolbarButton label="Bobina" onPress={addCoil} disabled={running} />
          <ToolbarButton label="Paralelo" onPress={addParallelBranch} disabled={running} />
          <ToolbarButton label="Rung" onPress={addRung} disabled={running} />
          <ToolbarButton label="Excluir" onPress={removeSelected} disabled={running} danger />
        </View>

        <View style={styles.editorPanel}>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
          {activeBlock ? (
            <View style={styles.addressEditor}>
              <Text style={styles.addressLabel}>Endereço selecionado</Text>
              <TextInput
                style={styles.addressInput}
                value={activeBlock.address}
                editable={!running}
                autoCapitalize="characters"
                onChangeText={updateSelectedAddress}
              />
            </View>
          ) : (
            <Text style={styles.noSelection}>Selecione um bloco para alterar o endereço.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function ToolbarButton({ label, onPress, disabled, danger }: { label: string; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <Pressable style={[styles.toolButton, danger && styles.dangerButton, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.toolButtonText, danger && styles.dangerButtonText, disabled && styles.disabledText]}>{label}</Text>
    </Pressable>
  );
}

function LadderBlockView({ block, selected, energized, onPress }: { block: LadderBlock; selected: boolean; energized: boolean; onPress: () => void }) {
  const isCoil = block.kind === 'coil';
  return (
    <Pressable style={[styles.block, isCoil && styles.coilBlock, selected && styles.blockSelected, energized && styles.blockEnergized]} onPress={onPress}>
      <Text style={[styles.symbol, energized && styles.energizedText]}>{isCoil ? `( ${block.address} )` : block.mode === 'NC' ? `|/${block.address}|` : `| ${block.address} |`}</Text>
      <Text style={[styles.blockCaption, energized && styles.energizedText]}>{isCoil ? 'Bobina' : block.mode === 'NC' ? 'Contato NF' : 'Contato NA'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f6f8' },
  app: { flex: 1, backgroundColor: '#f3f6f8' },
  header: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#d7e0e7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#10202c' },
  subtitle: { marginTop: 2, fontSize: 12, color: '#536675', fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' },
  headerButton: { minHeight: 42, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#edf3f6', justifyContent: 'center' },
  headerButtonText: { color: '#172b3a', fontSize: 14, fontWeight: '800' },
  runButton: { minHeight: 46, paddingHorizontal: 22, borderRadius: 14, backgroundColor: '#10a85f', justifyContent: 'center' },
  stopButton: { backgroundColor: '#e33f3f' },
  runButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  content: { flex: 1, flexDirection: 'row', gap: 10, padding: 10 },
  contentCompact: { flexDirection: 'column' },
  ladderPanel: { flex: 1, backgroundColor: '#ffffff', borderRadius: 18, borderWidth: 1, borderColor: '#d7e0e7', overflow: 'hidden' },
  ladderScrollX: { minWidth: 680 },
  ladderScrollY: { padding: 16 },
  ladderCanvas: { minHeight: 420, minWidth: 650, paddingVertical: 18, paddingHorizontal: 42, position: 'relative' },
  leftRail: { position: 'absolute', left: 26, top: 16, bottom: 16, width: 5, borderRadius: 4, backgroundColor: '#1b2d3a' },
  rightRail: { position: 'absolute', right: 26, top: 16, bottom: 16, width: 5, borderRadius: 4, backgroundColor: '#1b2d3a' },
  rung: { minHeight: 104, justifyContent: 'center', marginBottom: 18, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  rungSelected: { borderColor: '#3b82f6', backgroundColor: '#f5f9ff' },
  rungLabel: { position: 'absolute', left: 4, top: 0, fontSize: 11, fontWeight: '900', color: '#627584' },
  rungWire: { position: 'absolute', left: -16, right: -16, top: 48, height: 4, borderRadius: 4, backgroundColor: '#293b48' },
  rungBody: { paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  blockRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 12 },
  flexWire: { flex: 1, minWidth: 40, height: 4, backgroundColor: '#293b48', borderRadius: 4 },
  branchRow: {
    marginLeft: 26,
    marginRight: 104,
    minHeight: 60,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#293b48',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    backgroundColor: '#eef5f8',
  },
  branchSelected: { borderColor: '#3b82f6', backgroundColor: '#e8f1ff' },
  branchLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: '900', color: '#6a7e8e' },
  block: {
    minWidth: 108,
    minHeight: 58,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#243746',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coilBlock: { borderRadius: 999 },
  blockSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  blockEnergized: { borderColor: '#0a9f5a', backgroundColor: '#ddfbea' },
  symbol: { fontSize: 15, fontWeight: '900', color: '#172b3a' },
  blockCaption: { marginTop: 4, fontSize: 10, fontWeight: '800', color: '#627584' },
  energizedText: { color: '#087343' },
  emptyCoil: { minWidth: 100, minHeight: 52, borderRadius: 999, borderWidth: 2, borderStyle: 'dashed', borderColor: '#8aa0af', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6fafc' },
  emptyText: { fontWeight: '900', color: '#536675' },
  sidePanel: { width: 260, maxWidth: '100%', backgroundColor: '#ffffff', borderRadius: 18, borderWidth: 1, borderColor: '#d7e0e7', padding: 12, gap: 10 },
  panelTitle: { fontSize: 18, fontWeight: '900', color: '#10202c' },
  sectionLabel: { marginTop: 4, fontSize: 12, fontWeight: '900', color: '#536675', textTransform: 'uppercase' },
  ioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ioButton: { minWidth: 76, minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: '#c9d5de', backgroundColor: '#f4f7f9', alignItems: 'center', justifyContent: 'center' },
  ioButtonActive: { backgroundColor: '#dcfce7', borderColor: '#0a9f5a' },
  ioButtonText: { fontSize: 14, fontWeight: '900', color: '#172b3a' },
  ioButtonTextActive: { color: '#087343' },
  ioSmallText: { marginTop: 2, fontSize: 10, color: '#627584', fontWeight: '800' },
  outputLamp: { minWidth: 92, minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: '#c9d5de', backgroundColor: '#f4f7f9', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  outputLampActive: { backgroundColor: '#bbf7d0', borderColor: '#0a9f5a' },
  outputText: { fontSize: 14, fontWeight: '900', color: '#172b3a' },
  outputTextActive: { color: '#087343' },
  scanButton: { minHeight: 44, borderRadius: 14, backgroundColor: '#172b3a', alignItems: 'center', justifyContent: 'center' },
  scanButtonText: { color: '#ffffff', fontWeight: '900' },
  autoButton: { minHeight: 42, borderRadius: 14, backgroundColor: '#edf3f6', alignItems: 'center', justifyContent: 'center' },
  autoButtonActive: { backgroundColor: '#dbeafe' },
  autoButtonText: { color: '#172b3a', fontWeight: '900' },
  autoButtonTextActive: { color: '#1d4ed8' },
  toolbar: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#d7e0e7', flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  toolButton: { minHeight: 48, minWidth: 82, borderRadius: 14, backgroundColor: '#eaf1f5', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  toolButtonText: { fontSize: 14, color: '#172b3a', fontWeight: '900' },
  dangerButton: { backgroundColor: '#fee2e2' },
  dangerButtonText: { color: '#b91c1c' },
  disabledButton: { opacity: 0.45 },
  disabledText: { color: '#7d8d99' },
  editorPanel: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#f8fbfc', borderTopWidth: 1, borderTopColor: '#d7e0e7', flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  messageBox: { flex: 1, minWidth: 220 },
  messageText: { fontSize: 12, fontWeight: '700', color: '#536675' },
  addressEditor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressLabel: { fontSize: 12, fontWeight: '900', color: '#536675' },
  addressInput: { minWidth: 92, minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: '#c9d5de', backgroundColor: '#ffffff', paddingHorizontal: 10, fontWeight: '900', color: '#172b3a' },
  noSelection: { fontSize: 12, fontWeight: '700', color: '#7d8d99' },
});
