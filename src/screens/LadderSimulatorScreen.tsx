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
  fromIndex: number;
  toIndex: number;
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
  | { type: 'series'; rungId: string; blockId: string }
  | { type: 'branch'; rungId: string; branchId: string; blockId?: string }
  | { type: 'coil'; rungId: string; blockId: string }
  | { type: 'rung'; rungId: string };

type InsertTarget =
  | { type: 'series'; rungId: string; index: number }
  | { type: 'branch'; rungId: string; branchId: string; index: number };

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
  const rungPower: Record<string, boolean> = {};

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

    const powered = seriesClosed || branchClosed;
    rungPower[rung.id] = powered;
    if (rung.coil) {
      nextState[rung.coil.address] = powered;
      energized[rung.coil.id] = powered;
    }
  }

  return { state: nextState, energized, rungPower };
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
      series: rung.series.map((block) => ({ ...block })),
      branches: rung.branches.map((branch) => ({ ...branch, blocks: branch.blocks.map((block) => ({ ...block })) })),
      coil: rung.coil ? { ...rung.coil } : null,
    })),
  };
}

function renumberRungs(project: LadderProject): LadderProject {
  return {
    ...project,
    rungs: project.rungs.map((rung, index) => ({ ...rung, label: `Linha ${index + 1}` })),
  };
}

export function LadderSimulatorScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const [project, setProject] = useState<LadderProject>(() => initialProject());
  const [state, setState] = useState<PlcState>(() => initialState());
  const [selected, setSelected] = useState<SelectedTarget>({ type: 'rung', rungId: 'rung-1' });
  const [insertTarget, setInsertTarget] = useState<InsertTarget>({ type: 'series', rungId: 'rung-1', index: 2 });
  const [running, setRunning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [scan, setScan] = useState(0);
  const [message, setMessage] = useState('Toque nos pontos + para escolher onde inserir. Use Play para simular.');

  const evaluation = useMemo(() => evaluateProject(project, state), [project, state]);

  useEffect(() => {
    if (!running || !autoScan) return undefined;
    const interval = setInterval(() => runScan(), 350);
    return () => clearInterval(interval);
  }, [running, autoScan, project, state]);

  function replaceProject(nextProject: LadderProject) {
    const normalized = renumberRungs(nextProject);
    setProject(normalized);
    if (running) {
      const result = evaluateProject(normalized, state);
      setState(result.state);
    }
  }

  function activeRungId() {
    return selected.rungId;
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
    setInsertTarget({ type: 'series', rungId: 'rung-1', index: 2 });
    setRunning(false);
    setAutoScan(false);
    setScan(0);
    setMessage('Projeto reiniciado com Start, Stop e bobina Q0.0.');
  }

  function toggleRun() {
    const nextRunning = !running;
    setRunning(nextRunning);
    setAutoScan(nextRunning);
    if (nextRunning) runScan();
    setMessage(nextRunning ? 'Modo RUN ativo. Toque nas entradas para simular.' : 'Modo EDIT ativo. Continue editando a rung.');
  }

  function addRung(position: 'above' | 'below' = 'below') {
    if (running) return;
    const next = cloneProject(project);
    const referenceIndex = Math.max(0, next.rungs.findIndex((rung) => rung.id === activeRungId()));
    const insertAt = position === 'above' ? referenceIndex : referenceIndex + 1;
    const rungId = makeId('rung');
    next.rungs.splice(insertAt, 0, {
      id: rungId,
      label: 'Linha',
      series: [],
      branches: [],
      coil: null,
    });
    replaceProject(next);
    setSelected({ type: 'rung', rungId });
    setInsertTarget({ type: 'series', rungId, index: 0 });
    setMessage(position === 'above' ? 'Nova linha adicionada acima.' : 'Nova linha adicionada abaixo.');
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
      setInsertTarget({ type: 'series', rungId: filtered[0].id, index: filtered[0].series.length });
      setMessage('Linha removida.');
      return;
    }

    const rung = next.rungs.find((item) => item.id === selected.rungId);
    if (!rung) return;

    if (selected.type === 'series') {
      const removedIndex = rung.series.findIndex((block) => block.id === selected.blockId);
      rung.series = rung.series.filter((block) => block.id !== selected.blockId);
      setInsertTarget({ type: 'series', rungId: rung.id, index: Math.max(0, removedIndex) });
    }

    if (selected.type === 'branch') {
      if (selected.blockId) {
        const branch = rung.branches.find((item) => item.id === selected.branchId);
        const removedIndex = branch?.blocks.findIndex((block) => block.id === selected.blockId) ?? 0;
        rung.branches = rung.branches
          .map((branchItem) => branchItem.id === selected.branchId
            ? { ...branchItem, blocks: branchItem.blocks.filter((block) => block.id !== selected.blockId) }
            : branchItem)
          .filter((branchItem) => branchItem.blocks.length > 0);
        setInsertTarget({ type: 'branch', rungId: rung.id, branchId: selected.branchId, index: Math.max(0, removedIndex) });
      } else {
        rung.branches = rung.branches.filter((branch) => branch.id !== selected.branchId);
        setInsertTarget({ type: 'series', rungId: rung.id, index: rung.series.length });
      }
    }

    if (selected.type === 'coil') {
      rung.coil = null;
      setInsertTarget({ type: 'series', rungId: rung.id, index: rung.series.length });
    }

    replaceProject(next);
    setSelected({ type: 'rung', rungId: rung.id });
    setMessage('Item removido.');
  }

  function makeContact(mode: ContactMode, next: LadderProject): LadderBlock {
    return {
      id: makeId('contact'),
      kind: 'contact',
      address: nextAddress('contact', next),
      mode,
    };
  }

  function addContact(mode: ContactMode) {
    if (running) return;
    const next = cloneProject(project);
    const target = insertTarget ?? { type: 'series', rungId: activeRungId(), index: 999 };
    const rung = next.rungs.find((item) => item.id === target.rungId) ?? next.rungs[0];
    const block = makeContact(mode, next);

    if (target.type === 'branch') {
      const branch = rung.branches.find((item) => item.id === target.branchId);
      if (branch) {
        const insertAt = Math.min(Math.max(target.index, 0), branch.blocks.length);
        branch.blocks.splice(insertAt, 0, block);
        setSelected({ type: 'branch', rungId: rung.id, branchId: branch.id, blockId: block.id });
        setInsertTarget({ type: 'branch', rungId: rung.id, branchId: branch.id, index: insertAt + 1 });
      }
    } else {
      const insertAt = Math.min(Math.max(target.index, 0), rung.series.length);
      rung.series.splice(insertAt, 0, block);
      setSelected({ type: 'series', rungId: rung.id, blockId: block.id });
      setInsertTarget({ type: 'series', rungId: rung.id, index: insertAt + 1 });
    }

    replaceProject(next);
    setMessage(`${mode === 'NO' ? 'Contato NA' : 'Contato NF'} inserido na posição selecionada.`);
  }

  function addCoil() {
    if (running) return;
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === activeRungId()) ?? next.rungs[0];
    rung.coil = { id: makeId('coil'), kind: 'coil', address: nextAddress('coil', next) };
    replaceProject(next);
    setSelected({ type: 'coil', rungId: rung.id, blockId: rung.coil.id });
    setMessage('Bobina inserida no fim da linha.');
  }

  function addParallelBranch() {
    if (running) return;
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === activeRungId()) ?? next.rungs[0];
    const selectedSeriesIndex = selected.type === 'series'
      ? Math.max(0, rung.series.findIndex((block) => block.id === selected.blockId))
      : Math.max(0, Math.min(insertTarget.type === 'series' ? insertTarget.index : 0, rung.series.length));
    const branch: LadderBranch = {
      id: makeId('branch'),
      fromIndex: selectedSeriesIndex,
      toIndex: Math.min(selectedSeriesIndex + 1, Math.max(rung.series.length, 1)),
      blocks: [makeContact('NO', next)],
    };
    rung.branches.push(branch);
    replaceProject(next);
    setSelected({ type: 'branch', rungId: rung.id, branchId: branch.id, blockId: branch.blocks[0].id });
    setInsertTarget({ type: 'branch', rungId: rung.id, branchId: branch.id, index: 1 });
    setMessage('Ramo paralelo criado no trecho selecionado.');
  }

  function moveSelectedBlock(direction: -1 | 1) {
    if (running) return;
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === selected.rungId);
    if (!rung) return;

    if (selected.type === 'series') {
      const index = rung.series.findIndex((block) => block.id === selected.blockId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= rung.series.length) return;
      const [block] = rung.series.splice(index, 1);
      rung.series.splice(nextIndex, 0, block);
      setInsertTarget({ type: 'series', rungId: rung.id, index: nextIndex + 1 });
      replaceProject(next);
      setMessage(direction < 0 ? 'Bloco movido para a esquerda.' : 'Bloco movido para a direita.');
      return;
    }

    if (selected.type === 'branch' && selected.blockId) {
      const branch = rung.branches.find((item) => item.id === selected.branchId);
      if (!branch) return;
      const index = branch.blocks.findIndex((block) => block.id === selected.blockId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= branch.blocks.length) return;
      const [block] = branch.blocks.splice(index, 1);
      branch.blocks.splice(nextIndex, 0, block);
      setInsertTarget({ type: 'branch', rungId: rung.id, branchId: branch.id, index: nextIndex + 1 });
      replaceProject(next);
      setMessage(direction < 0 ? 'Bloco do ramo movido para a esquerda.' : 'Bloco do ramo movido para a direita.');
    }
  }

  function duplicateSelectedBlock() {
    if (running) return;
    const active = selectedBlock();
    if (!active || active.kind === 'coil') return;
    addContact(active.mode ?? 'NO');
  }

  function invertSelectedContact() {
    if (running) return;
    const next = cloneProject(project);
    const rung = next.rungs.find((item) => item.id === selected.rungId);
    if (!rung) return;
    let block: LadderBlock | undefined;
    if (selected.type === 'series') block = rung.series.find((item) => item.id === selected.blockId);
    if (selected.type === 'branch' && selected.blockId) {
      const branch = rung.branches.find((item) => item.id === selected.branchId);
      block = branch?.blocks.find((item) => item.id === selected.blockId);
    }
    if (!block || block.kind !== 'contact') return;
    block.mode = block.mode === 'NC' ? 'NO' : 'NC';
    replaceProject(next);
    setMessage(block.mode === 'NC' ? 'Contato alterado para NF.' : 'Contato alterado para NA.');
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

    if (selected.type === 'branch' && selected.blockId) {
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
      return selected.blockId ? branch?.blocks.find((block) => block.id === selected.blockId) ?? null : null;
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

  function selectRung(rungId: string, index: number) {
    if (running) return;
    setSelected({ type: 'rung', rungId });
    setInsertTarget({ type: 'series', rungId, index });
  }

  function selectSeriesBlock(rungId: string, blockId: string, index: number) {
    if (running) return;
    setSelected({ type: 'series', rungId, blockId });
    setInsertTarget({ type: 'series', rungId, index: index + 1 });
  }

  function selectBranchBlock(rungId: string, branchId: string, blockId: string, index: number) {
    if (running) return;
    setSelected({ type: 'branch', rungId, branchId, blockId });
    setInsertTarget({ type: 'branch', rungId, branchId, index: index + 1 });
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
                      style={[styles.rung, selected.rungId === rung.id && styles.rungSelected, evaluation.rungPower[rung.id] && styles.rungPowered]}
                      onPress={() => selectRung(rung.id, rung.series.length)}
                    >
                      <Text style={styles.rungLabel}>{rung.label}</Text>
                      <View style={[styles.rungWire, evaluation.rungPower[rung.id] && styles.rungWirePowered]} />
                      <View style={styles.rungBody}>
                        <View style={styles.blockRow}>
                          <InsertPoint active={insertTarget.type === 'series' && insertTarget.rungId === rung.id && insertTarget.index === 0} onPress={() => !running && setInsertTarget({ type: 'series', rungId: rung.id, index: 0 })} />
                          {rung.series.map((block, index) => (
                            <View key={block.id} style={styles.blockWithInsert}>
                              <LadderBlockView
                                block={block}
                                selected={selected.type === 'series' && selected.blockId === block.id}
                                energized={Boolean(evaluation.energized[block.id])}
                                onPress={() => selectSeriesBlock(rung.id, block.id, index)}
                              />
                              <InsertPoint active={insertTarget.type === 'series' && insertTarget.rungId === rung.id && insertTarget.index === index + 1} onPress={() => !running && setInsertTarget({ type: 'series', rungId: rung.id, index: index + 1 })} />
                            </View>
                          ))}
                          <View style={[styles.flexWire, evaluation.rungPower[rung.id] && styles.rungWirePowered]} />
                          {rung.coil ? (
                            <LadderBlockView
                              block={rung.coil}
                              selected={selected.type === 'coil' && selected.blockId === rung.coil.id}
                              energized={Boolean(evaluation.energized[rung.coil.id])}
                              onPress={() => !running && setSelected({ type: 'coil', rungId: rung.id, blockId: rung.coil?.id ?? '' })}
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
                            <InsertPoint active={insertTarget.type === 'branch' && insertTarget.branchId === branch.id && insertTarget.index === 0} onPress={() => !running && setInsertTarget({ type: 'branch', rungId: rung.id, branchId: branch.id, index: 0 })} />
                            {branch.blocks.map((block, index) => (
                              <View key={block.id} style={styles.blockWithInsert}>
                                <LadderBlockView
                                  block={block}
                                  selected={selected.type === 'branch' && selected.blockId === block.id}
                                  energized={Boolean(evaluation.energized[block.id])}
                                  onPress={() => selectBranchBlock(rung.id, branch.id, block.id, index)}
                                />
                                <InsertPoint active={insertTarget.type === 'branch' && insertTarget.branchId === branch.id && insertTarget.index === index + 1} onPress={() => !running && setInsertTarget({ type: 'branch', rungId: rung.id, branchId: branch.id, index: index + 1 })} />
                              </View>
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
          <ToolbarButton label="Rung +" onPress={() => addRung('below')} disabled={running} />
          <ToolbarButton label="↑ Rung" onPress={() => addRung('above')} disabled={running} />
          <ToolbarButton label="←" onPress={() => moveSelectedBlock(-1)} disabled={running} />
          <ToolbarButton label="→" onPress={() => moveSelectedBlock(1)} disabled={running} />
          <ToolbarButton label="NA/NF" onPress={invertSelectedContact} disabled={running} />
          <ToolbarButton label="Duplicar" onPress={duplicateSelectedBlock} disabled={running} />
          <ToolbarButton label="Excluir" onPress={removeSelected} disabled={running} danger />
        </View>

        <View style={styles.editorPanel}>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
          {activeBlock ? (
            <View style={styles.addressEditor}>
              <Text style={styles.addressLabel}>Endereço</Text>
              <TextInput
                style={styles.addressInput}
                value={activeBlock.address}
                editable={!running}
                autoCapitalize="characters"
                onChangeText={updateSelectedAddress}
              />
            </View>
          ) : (
            <Text style={styles.noSelection}>Selecione um bloco ou um ponto +.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function InsertPoint({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.insertPoint, active && styles.insertPointActive]} onPress={onPress}>
      <Text style={[styles.insertPointText, active && styles.insertPointTextActive]}>+</Text>
    </Pressable>
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
  ladderScrollX: { minWidth: 720 },
  ladderScrollY: { padding: 16 },
  ladderCanvas: { minHeight: 420, minWidth: 700, paddingVertical: 18, paddingHorizontal: 42, position: 'relative' },
  leftRail: { position: 'absolute', left: 26, top: 16, bottom: 16, width: 5, borderRadius: 4, backgroundColor: '#1b2d3a' },
  rightRail: { position: 'absolute', right: 26, top: 16, bottom: 16, width: 5, borderRadius: 4, backgroundColor: '#1b2d3a' },
  rung: { minHeight: 112, justifyContent: 'center', marginBottom: 18, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  rungSelected: { borderColor: '#3b82f6', backgroundColor: '#f5f9ff' },
  rungPowered: { backgroundColor: '#f0fdf4' },
  rungLabel: { position: 'absolute', left: 4, top: 0, fontSize: 11, fontWeight: '900', color: '#627584' },
  rungWire: { position: 'absolute', left: -16, right: -16, top: 52, height: 4, borderRadius: 4, backgroundColor: '#293b48' },
  rungWirePowered: { backgroundColor: '#0a9f5a' },
  rungBody: { paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  blockRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockWithInsert: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flexWire: { flex: 1, minWidth: 40, height: 4, backgroundColor: '#293b48', borderRadius: 4 },
  insertPoint: { width: 32, height: 38, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#8aa0af', backgroundColor: '#f6fafc', alignItems: 'center', justifyContent: 'center' },
  insertPointActive: { backgroundColor: '#dbeafe', borderColor: '#2563eb', borderStyle: 'solid' },
  insertPointText: { fontSize: 18, fontWeight: '900', color: '#607381' },
  insertPointTextActive: { color: '#1d4ed8' },
  branchRow: {
    marginLeft: 38,
    marginRight: 112,
    minHeight: 64,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#293b48',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  toolButton: { minHeight: 46, minWidth: 70, borderRadius: 14, backgroundColor: '#eaf1f5', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  toolButtonText: { fontSize: 13, color: '#172b3a', fontWeight: '900' },
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
